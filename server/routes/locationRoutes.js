const express = require('express');
const {
  getLocations,
  getLocationSummaries,
  getLocationWithAssets,
  createLocation,
  updateLocation,
  deleteLocation
} = require('../controllers/locationController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect);

router.get('/', getLocations);
router.get('/summaries', getLocationSummaries);
router.get('/:id/assets', getLocationWithAssets);
router.post('/', roleCheck('Administrator'), createLocation);
router.put('/:id', roleCheck('Administrator'), updateLocation);
router.delete('/:id', roleCheck('Administrator'), deleteLocation);

module.exports = router;
