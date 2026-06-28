const express = require('express');
const {
  getAssets,
  getCategories,
  getReuseSuggestions,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset
} = require('../controllers/assetController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.use(protect);

// Browse / search (Module 1 list + Module 2 search) — any authenticated user
router.get('/', getAssets);
router.get('/categories', getCategories);
router.get('/reuse', getReuseSuggestions);
router.get('/:id', getAsset);

// Manage — Administrators and Project Leads
router.post('/', roleCheck('Administrator', 'ProjectLead'), upload.array('images', 5), createAsset);
router.put('/:id', roleCheck('Administrator', 'ProjectLead'), upload.array('images', 5), updateAsset);

// Delete — Administrators only
router.delete('/:id', roleCheck('Administrator'), deleteAsset);

module.exports = router;
