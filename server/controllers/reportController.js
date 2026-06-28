// server/controllers/reportController.js
const Asset       = require('../models/Asset');
const Checkout    = require('../models/Checkout');
const Procurement = require('../models/Procurement');

const send = (res, data, message) =>
  res.status(200).json({ success: true, data, message, error: null });

// ── GET /api/v1/reports/asset-summary ─────────────────────
// Mirrors Phase 1 getAssetSummary shape exactly
const getAssetSummary = async (req, res, next) => {
  try {
    const [totals, statusRows] = await Promise.all([
      Asset.aggregate([{ $group: { _id: null, totalAssets: { $sum: 1 }, totalItems: { $sum: '$quantityTotal' }, availableItems: { $sum: '$quantityAvailable' } } }]),
      Asset.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    ]);

    const t = totals[0] || { totalAssets: 0, totalItems: 0, availableItems: 0 };
    const statusBreakdown = Object.fromEntries(statusRows.map(r => [r._id, r.count]));

    send(res, {
      totalAssets:      t.totalAssets,
      totalItems:       t.totalItems,
      availableItems:   t.availableItems,
      borrowedItems:    t.totalItems - t.availableItems,
      maintenanceCount: statusBreakdown['UnderMaintenance'] || 0,
      statusBreakdown
    }, 'Asset summary fetched');
  } catch (e) { next(e); }
};

// ── GET /api/v1/reports/assets-by-category ────────────────
const getAssetsByCategory = async (req, res, next) => {
  try {
    const rows = await Asset.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalQty: { $sum: '$quantityTotal' }, availableQty: { $sum: '$quantityAvailable' } } },
      { $project: { _id: 0, category: '$_id', count: 1, totalQty: 1, availableQty: 1 } },
      { $sort: { totalQty: -1 } }
    ]);
    send(res, rows, 'Assets by category fetched');
  } catch (e) { next(e); }
};

// ── GET /api/v1/reports/assets-by-status ──────────────────
const getAssetsByStatus = async (req, res, next) => {
  try {
    const rows = await Asset.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } }
    ]);
    send(res, rows, 'Assets by status fetched');
  } catch (e) { next(e); }
};

// ── GET /api/v1/reports/procurement-spend ─────────────────
const getProcurementSpend = async (req, res, next) => {
  try {
    const rows = await Procurement.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$purchaseDate' } }, spend: { $sum: '$purchaseCost' }, count: { $sum: 1 } } },
      { $project: { _id: 0, month: '$_id', spend: 1, count: 1 } },
      { $sort: { month: 1 } }
    ]);
    send(res, rows, 'Procurement spend fetched');
  } catch (e) { next(e); }
};

// ── GET /api/v1/reports/borrowing-trends ──────────────────
const getBorrowingTrends = async (req, res, next) => {
  try {
    const rows = await Checkout.aggregate([
      { $group: {
          _id:       { $dateToString: { format: '%Y-%m', date: '$checkoutDate' } },
          checkouts: { $sum: 1 },
          returns:   { $sum: { $cond: [{ $ifNull: ['$actualReturnDate', false] }, 1, 0] } }
      }},
      { $project: { _id: 0, month: '$_id', checkouts: 1, returns: 1 } },
      { $sort: { month: 1 } }
    ]);
    send(res, rows, 'Borrowing trends fetched');
  } catch (e) { next(e); }
};

module.exports = { getAssetSummary, getAssetsByCategory, getAssetsByStatus, getProcurementSpend, getBorrowingTrends };
