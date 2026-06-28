// server/controllers/requestController.js
const Request            = require('../models/Request');
const Asset              = require('../models/Asset');
const Checkout           = require('../models/Checkout');
const User               = require('../models/User');
const createNotification = require('../utils/createNotification');

const populate = (q) =>
  q.populate('asset', 'name assetCode category quantityAvailable')
   .populate('requestedBy', 'name borrowerId')
   .populate('approvedBy', 'name')
   .populate('project', 'name');

const send = (res, status, success, data, message) =>
  res.status(status).json({ success, data, message, error: null });

const notFound = (res) => send(res, 404, false, null, 'Request not found');

const getAssetOrFail = async (assetId, qty, res) => {
  const asset = await Asset.findById(assetId);
  if (!asset) { send(res, 404, false, null, 'Asset not found'); return null; }
  if (asset.quantityAvailable < qty) {
    send(res, 409, false, null, `Only ${asset.quantityAvailable} unit(s) available`);
    return null;
  }
  return asset;
};

// Notify all Admin + ResourceManager users
const notifyApprovers = async (type, message, entityId) => {
  const approvers = await User.find({ role: { $in: ['Administrator', 'ResourceManager'] } }).select('_id');
  await Promise.all(approvers.map(u => createNotification({ recipient: u._id, type, message, relatedEntityType: 'Request', relatedEntityId: entityId, sendEmail: true })));
};

// ── GET /api/v1/requests ───────────────────────────────────
const getRequests = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.asset)  filter.asset  = req.query.asset;

    const [requests, total] = await Promise.all([
      populate(Request.find(filter)).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Request.countDocuments(filter)
    ]);
    send(res, 200, true, { requests, total, page, pages: Math.ceil(total / limit) }, 'Requests fetched');
  } catch (e) { next(e); }
};

// ── GET /api/v1/requests/my ────────────────────────────────
const getMyRequests = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = { requestedBy: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const [requests, total] = await Promise.all([
      populate(Request.find(filter)).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Request.countDocuments(filter)
    ]);
    send(res, 200, true, { requests, total, page, pages: Math.ceil(total / limit) }, 'My requests fetched');
  } catch (e) { next(e); }
};

// ── GET /api/v1/requests/approvals ────────────────────────
const getPendingApprovals = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const [requests, total] = await Promise.all([
      populate(Request.find({ status: 'Pending' })).sort({ createdAt: 1 }).skip((page - 1) * limit).limit(limit),
      Request.countDocuments({ status: 'Pending' })
    ]);
    send(res, 200, true, { requests, total, page, pages: Math.ceil(total / limit) }, 'Pending approvals fetched');
  } catch (e) { next(e); }
};

// ── GET /api/v1/requests/:id ───────────────────────────────
const getRequest = async (req, res, next) => {
  try {
    const request = await populate(Request.findById(req.params.id));
    if (!request) return notFound(res);
    send(res, 200, true, { request }, 'Request fetched');
  } catch (e) { next(e); }
};

// ── POST /api/v1/requests ──────────────────────────────────
const createRequest = async (req, res, next) => {
  try {
    const { asset: assetId, quantityRequested, purpose, expectedReturnDate, project } = req.body;
    const qty = parseInt(quantityRequested);

    const asset = await getAssetOrFail(assetId, qty, res);
    if (!asset) return;

    const request = await Request.create({
      asset: assetId, requestedBy: req.user._id,
      quantityRequested: qty, purpose, expectedReturnDate,
      project: project || null
    });

    // Notify all approvers
    await notifyApprovers('ApprovalRequest',
      `${req.user.name} requested ${qty}× ${asset.name}. Purpose: ${purpose || '—'}.`,
      request._id);

    send(res, 201, true, { request: await populate(Request.findById(request._id)) }, 'Request submitted');
  } catch (e) { next(e); }
};

// ── PUT /api/v1/requests/:id/approve ──────────────────────
const approveRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return notFound(res);
    if (request.status !== 'Pending')
      return send(res, 400, false, null, `Cannot approve a request in '${request.status}' status`);

    const asset = await getAssetOrFail(request.asset, request.quantityRequested, res);
    if (!asset) return;

    asset.quantityAvailable -= request.quantityRequested;
    await asset.save();

    request.status       = 'Approved';
    request.approvedBy   = req.user._id;
    request.approvalDate = new Date();
    if (req.body.notes) request.notes = req.body.notes;
    await request.save();

    const populated = await populate(Request.findById(request._id));
    await createNotification({ recipient: request.requestedBy, type: 'ApprovalRequest', message: `Your request for ${request.quantityRequested}× ${populated.asset?.name || 'asset'} has been approved.`, relatedEntityType: 'Request', relatedEntityId: request._id, sendEmail: true });

    send(res, 200, true, { request: populated }, 'Request approved');
  } catch (e) { next(e); }
};

// ── PUT /api/v1/requests/:id/reject ───────────────────────
const rejectRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return notFound(res);
    if (!['Pending', 'Approved'].includes(request.status))
      return send(res, 400, false, null, `Cannot reject a request in '${request.status}' status`);

    if (request.status === 'Approved') {
      await Asset.findByIdAndUpdate(request.asset, { $inc: { quantityAvailable: request.quantityRequested } });
    }

    request.status       = 'Rejected';
    request.approvedBy   = req.user._id;
    request.approvalDate = new Date();
    if (req.body.notes) request.notes = req.body.notes;
    await request.save();

    const populated = await populate(Request.findById(request._id));
    await createNotification({ recipient: request.requestedBy, type: 'ApprovalRequest', message: `Your request for ${request.quantityRequested}× ${populated.asset?.name || 'asset'} was rejected.${req.body.notes ? ` Reason: ${req.body.notes}` : ''}`, relatedEntityType: 'Request', relatedEntityId: request._id, sendEmail: true });

    send(res, 200, true, { request: populated }, 'Request rejected');
  } catch (e) { next(e); }
};

// ── PUT /api/v1/requests/:id/allocate ─────────────────────
const allocateRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id).populate('requestedBy', 'name borrowerId');
    if (!request) return notFound(res);
    if (request.status !== 'Approved')
      return send(res, 400, false, null, `Cannot allocate a request in '${request.status}' status`);

    request.status = 'Allocated';
    await request.save();

    await Checkout.create({
      request:            request._id,
      asset:              request.asset,
      borrower:           request.requestedBy._id,
      borrowerProjectId:  request.project,
      expectedReturnDate: request.expectedReturnDate,
      currentHolder:      request.requestedBy.name,
      status:             'Active'
    });

    const populated = await populate(Request.findById(request._id));
    await createNotification({ recipient: request.requestedBy._id, type: 'CheckoutConfirmation', message: `Your request for ${request.quantityRequested}× ${populated.asset?.name || 'asset'} has been allocated and is ready for pickup.`, relatedEntityType: 'Request', relatedEntityId: request._id, sendEmail: true });

    send(res, 200, true, { request: populated }, 'Request allocated — checkout created');
  } catch (e) { next(e); }
};

// ── PUT /api/v1/requests/:id/checkout ─────────────────────
const confirmCheckout = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return notFound(res);
    if (request.status !== 'Allocated')
      return send(res, 400, false, null, `Cannot confirm checkout for a request in '${request.status}' status`);

    request.status = 'CheckedOut';
    await request.save();

    const checkout = await Checkout.findOneAndUpdate(
      { request: request._id },
      { checkoutDate: new Date(), conditionAtCheckout: req.body.condition || 'Good' },
      { new: true }
    );

    const populated = await populate(Request.findById(request._id));
    await createNotification({ recipient: request.requestedBy, type: 'CheckoutConfirmation', message: `Your checkout of ${request.quantityRequested}× ${populated.asset?.name || 'asset'} is confirmed. Due back: ${request.expectedReturnDate ? new Date(request.expectedReturnDate).toDateString() : 'N/A'}.`, relatedEntityType: 'Checkout', relatedEntityId: checkout?._id, sendEmail: true });

    send(res, 200, true, { request: populated }, 'Checkout confirmed');
  } catch (e) { next(e); }
};

// ── PUT /api/v1/requests/:id/return ───────────────────────
const returnRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return notFound(res);
    if (!['CheckedOut', 'Overdue'].includes(request.status))
      return send(res, 400, false, null, `Cannot return a request in '${request.status}' status`);

    await Asset.findByIdAndUpdate(request.asset, { $inc: { quantityAvailable: request.quantityRequested } });

    request.status = 'Returned';
    request.notes  = req.body.notes || request.notes;
    await request.save();

    await Checkout.findOneAndUpdate(
      { request: request._id },
      { status: 'Returned', actualReturnDate: new Date(), conditionAtReturn: req.body.condition || 'Good', verifiedBy: req.user._id }
    );

    send(res, 200, true, { request: await populate(Request.findById(request._id)) }, 'Asset returned');
  } catch (e) { next(e); }
};

// ── PUT /api/v1/requests/:id/cancel ───────────────────────
const cancelRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return notFound(res);
    if (!['Pending', 'Approved'].includes(request.status))
      return send(res, 400, false, null, `Cannot cancel a request in '${request.status}' status`);

    if (request.status === 'Approved') {
      await Asset.findByIdAndUpdate(request.asset, { $inc: { quantityAvailable: request.quantityRequested } });
    }

    request.status = 'Cancelled';
    request.notes  = req.body.notes || 'Cancelled by requester';
    await request.save();

    send(res, 200, true, { request: await populate(Request.findById(request._id)) }, 'Request cancelled');
  } catch (e) { next(e); }
};

// ── PUT /api/v1/requests/:id/overdue ──────────────────────
const markOverdue = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return notFound(res);
    if (request.status !== 'CheckedOut')
      return send(res, 400, false, null, `Cannot mark overdue — status is '${request.status}'`);

    request.status = 'Overdue';
    await request.save();

    await Checkout.findOneAndUpdate({ request: request._id }, { status: 'Overdue' });

    const populated = await populate(Request.findById(request._id));
    await createNotification({ recipient: request.requestedBy, type: 'OverdueAlert', message: `OVERDUE: ${request.quantityRequested}× ${populated.asset?.name || 'asset'} was due back and has not been returned.`, relatedEntityType: 'Request', relatedEntityId: request._id, sendEmail: true });

    send(res, 200, true, { request: populated }, 'Request marked overdue');
  } catch (e) { next(e); }
};

module.exports = {
  getRequests, getMyRequests, getPendingApprovals, getRequest,
  createRequest, approveRequest, rejectRequest, allocateRequest,
  confirmCheckout, returnRequest, cancelRequest, markOverdue
};
