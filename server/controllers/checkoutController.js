// server/controllers/checkoutController.js
const Checkout           = require('../models/Checkout');
const Request            = require('../models/Request');
const Asset              = require('../models/Asset');
const createNotification = require('../utils/createNotification');

const populate = (q) =>
  q.populate('asset',   'name assetCode category')
   .populate('borrower','name borrowerId')
   .populate('borrowerProjectId', 'name')
   .populate('verifiedBy', 'name')
   .populate({ path: 'request', select: 'quantityRequested purpose expectedReturnDate status' });

const send = (res, status, success, data, message) =>
  res.status(status).json({ success, data, message, error: null });

// ── GET /api/v1/checkouts ──────────────────────────────────
const getCheckouts = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = {};
    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.borrower) filter.borrower = req.query.borrower;
    if (req.query.asset)    filter.asset    = req.query.asset;

    const [checkouts, total] = await Promise.all([
      populate(Checkout.find(filter)).sort({ checkoutDate: -1 }).skip((page - 1) * limit).limit(limit),
      Checkout.countDocuments(filter)
    ]);
    send(res, 200, true, { checkouts, total, page, pages: Math.ceil(total / limit) }, 'Checkouts fetched');
  } catch (e) { next(e); }
};

// ── GET /api/v1/checkouts/active ───────────────────────────
const getActiveCheckouts = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = { status: { $in: ['Active', 'Overdue'] } };
    // Researchers only see their own borrowings
    if (req.user.role === 'Researcher') filter.borrower = req.user._id;

    const [checkouts, total] = await Promise.all([
      populate(Checkout.find(filter)).sort({ checkoutDate: -1 }).skip((page - 1) * limit).limit(limit),
      Checkout.countDocuments(filter)
    ]);
    send(res, 200, true, { checkouts, total, page, pages: Math.ceil(total / limit) }, 'Active checkouts fetched');
  } catch (e) { next(e); }
};

// ── GET /api/v1/checkouts/overdue ──────────────────────────
const getOverdueCheckouts = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;

    const [checkouts, total] = await Promise.all([
      populate(Checkout.find({ status: 'Overdue' })).sort({ expectedReturnDate: 1 }).skip((page - 1) * limit).limit(limit),
      Checkout.countDocuments({ status: 'Overdue' })
    ]);
    send(res, 200, true, { checkouts, total, page, pages: Math.ceil(total / limit) }, 'Overdue checkouts fetched');
  } catch (e) { next(e); }
};

// ── GET /api/v1/checkouts/:id ──────────────────────────────
const getCheckout = async (req, res, next) => {
  try {
    const checkout = await populate(Checkout.findById(req.params.id));
    if (!checkout) return send(res, 404, false, null, 'Checkout not found');
    send(res, 200, true, { checkout }, 'Checkout fetched');
  } catch (e) { next(e); }
};

// ── PUT /api/v1/checkouts/:id/return ──────────────────────
const returnCheckout = async (req, res, next) => {
  try {
    const checkout = await Checkout.findById(req.params.id).populate('request');
    if (!checkout) return send(res, 404, false, null, 'Checkout not found');
    if (!['Active', 'Overdue'].includes(checkout.status))
      return send(res, 400, false, null, `Cannot return — checkout is already '${checkout.status}'`);

    const { condition = 'Good', notes = '' } = req.body;

    checkout.status            = 'Returned';
    checkout.actualReturnDate  = new Date();
    checkout.conditionAtReturn = condition;
    checkout.verifiedBy        = req.user._id;
    checkout.currentHolder     = null;
    await checkout.save();

    const request = await Request.findById(checkout.request);
    if (request && ['CheckedOut', 'Overdue'].includes(request.status)) {
      request.status = 'Returned';
      if (notes) request.notes = notes;
      await request.save();
      await Asset.findByIdAndUpdate(checkout.asset, { $inc: { quantityAvailable: request.quantityRequested } });
    }

    send(res, 200, true, { checkout: await populate(Checkout.findById(checkout._id)) }, 'Asset returned successfully');
  } catch (e) { next(e); }
};

// ── PUT /api/v1/checkouts/scan-overdue ────────────────────
// Promotes Active→Overdue where expectedReturnDate < now; bulk notifies borrowers
const scanOverdue = async (req, res, next) => {
  try {
    // Find affected checkouts before updating (need borrower IDs)
    const toMark = await Checkout.find({ status: 'Active', expectedReturnDate: { $lt: new Date() } })
      .populate('asset', 'name')
      .select('borrower asset request');

    await Checkout.updateMany(
      { status: 'Active', expectedReturnDate: { $lt: new Date() } },
      { $set: { status: 'Overdue' } }
    );

    const requestIds = toMark.map(c => c.request).filter(Boolean);
    await Request.updateMany({ _id: { $in: requestIds }, status: 'CheckedOut' }, { $set: { status: 'Overdue' } });

    // Notify each borrower (fire-and-forget, no await to avoid slowing response)
    for (const c of toMark) {
      createNotification({
        recipient: c.borrower,
        type: 'OverdueAlert',
        message: `OVERDUE: Your checkout of ${c.asset?.name || 'an asset'} is past the return date. Please return immediately.`,
        relatedEntityType: 'Checkout',
        relatedEntityId: c._id,
        sendEmail: true
      });
    }

    send(res, 200, true, { updated: toMark.length }, `${toMark.length} checkout(s) marked overdue`);
  } catch (e) { next(e); }
};

module.exports = { getCheckouts, getActiveCheckouts, getOverdueCheckouts, getCheckout, returnCheckout, scanOverdue };
