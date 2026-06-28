// server/routes/reportRoutes.js
const express = require('express');
const { getAssetSummary, getAssetsByCategory, getAssetsByStatus, getProcurementSpend, getBorrowingTrends } = require('../controllers/reportController');
const { protect }   = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();
router.use(protect);
router.use(roleCheck('Administrator', 'ResourceManager'));

router.get('/asset-summary',      getAssetSummary);
router.get('/assets-by-category', getAssetsByCategory);
router.get('/assets-by-status',   getAssetsByStatus);
router.get('/procurement-spend',  getProcurementSpend);
router.get('/borrowing-trends',   getBorrowingTrends);

module.exports = router;
