// server/controllers/procurementController.js
const Procurement = require('../models/Procurement');

const fileUrl = (file) => `/uploads/${file.filename}`;

const populate = (q) =>
  q.populate('asset', 'name assetCode category')
   .populate('createdBy', 'name');

const send = (res, status, success, data, message) =>
  res.status(status).json({ success, data, message, error: null });

// ── GET /api/v1/procurements ───────────────────────────────
const getProcurements = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = {};

    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      const rx = new RegExp(req.query.search, 'i');
      filter.$or = [{ vendorName: rx }, { purchaseOrderRef: rx }, { notes: rx }];
    }

    const [procurements, total] = await Promise.all([
      populate(Procurement.find(filter)).sort({ purchaseDate: -1 }).skip((page - 1) * limit).limit(limit),
      Procurement.countDocuments(filter)
    ]);
    send(res, 200, true, { procurements, total, page, pages: Math.ceil(total / limit) }, 'Procurements fetched');
  } catch (e) { next(e); }
};

// ── GET /api/v1/procurements/categories ───────────────────
const getCategories = async (req, res, next) => {
  try {
    const categories = await Procurement.distinct('category');
    send(res, 200, true, { categories: categories.sort() }, 'Categories fetched');
  } catch (e) { next(e); }
};

// ── GET /api/v1/procurements/:id ──────────────────────────
const getProcurement = async (req, res, next) => {
  try {
    const procurement = await populate(Procurement.findById(req.params.id));
    if (!procurement) return send(res, 404, false, null, 'Procurement not found');
    send(res, 200, true, { procurement }, 'Procurement fetched');
  } catch (e) { next(e); }
};

// ── POST /api/v1/procurements ──────────────────────────────
const createProcurement = async (req, res, next) => {
  try {
    const payload = { ...req.body, createdBy: req.user._id };
    if (!payload.asset) delete payload.asset;
    if (req.file) payload.invoiceFileUrl = fileUrl(req.file);

    const procurement = await Procurement.create(payload);
    send(res, 201, true, { procurement: await populate(Procurement.findById(procurement._id)) }, 'Procurement created');
  } catch (e) { next(e); }
};

// ── PUT /api/v1/procurements/:id ──────────────────────────
const updateProcurement = async (req, res, next) => {
  try {
    const procurement = await Procurement.findById(req.params.id);
    if (!procurement) return send(res, 404, false, null, 'Procurement not found');

    const updates = { ...req.body };
    if (!updates.asset) delete updates.asset;
    if (req.file) updates.invoiceFileUrl = fileUrl(req.file);

    Object.assign(procurement, updates);
    await procurement.save();

    send(res, 200, true, { procurement: await populate(Procurement.findById(procurement._id)) }, 'Procurement updated');
  } catch (e) { next(e); }
};

// ── DELETE /api/v1/procurements/:id ───────────────────────
const deleteProcurement = async (req, res, next) => {
  try {
    const procurement = await Procurement.findByIdAndDelete(req.params.id);
    if (!procurement) return send(res, 404, false, null, 'Procurement not found');
    send(res, 200, true, null, 'Procurement deleted');
  } catch (e) { next(e); }
};

module.exports = { getProcurements, getCategories, getProcurement, createProcurement, updateProcurement, deleteProcurement };
