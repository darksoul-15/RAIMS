const Location = require('../models/Location');
const Asset = require('../models/Asset');

// @route   GET /api/v1/locations
// @access  Private
const getLocations = async (req, res, next) => {
  try {
    const locations = await Location.find().sort({ name: 1 });
    return res.status(200).json({
      success: true, data: { locations }, message: 'Locations fetched', error: null
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/v1/locations
// @access  Administrator | ResourceManager
const createLocation = async (req, res, next) => {
  try {
    const { name, type, description } = req.body;
    const location = await Location.create({ name, type, description });
    return res.status(201).json({
      success: true, data: { location }, message: 'Location created', error: null
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/v1/locations/:id
// @access  Administrator | ResourceManager
const updateLocation = async (req, res, next) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!location) {
      return res.status(404).json({
        success: false, data: null, message: 'Location not found', error: null
      });
    }
    return res.status(200).json({
      success: true, data: { location }, message: 'Location updated', error: null
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/v1/locations/:id
// @access  Administrator
const deleteLocation = async (req, res, next) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) {
      return res.status(404).json({
        success: false, data: null, message: 'Location not found', error: null
      });
    }
    return res.status(200).json({
      success: true, data: null, message: 'Location deleted', error: null
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/locations/summaries
// @access  Private
const getLocationSummaries = async (req, res, next) => {
  try {
    const locations = await Location.find().sort({ name: 1 }).lean();
    const summaries = await Promise.all(
      locations.map(async (loc) => {
        const assets = await Asset.find({ storageLocation: loc._id }).lean();
        return {
          ...loc,
          assetCount: assets.length,
          totalItems: assets.reduce((s, a) => s + (a.quantityTotal || 0), 0),
          availableItems: assets.reduce((s, a) => s + (a.quantityAvailable || 0), 0),
          categories: [...new Set(assets.map((a) => a.category))]
        };
      })
    );
    return res.status(200).json({ success: true, data: { locations: summaries }, message: 'Location summaries fetched', error: null });
  } catch (error) { next(error); }
};

// @route   GET /api/v1/locations/:id/assets
// @access  Private
const getLocationWithAssets = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id).lean();
    if (!location) return res.status(404).json({ success: false, data: null, message: 'Location not found', error: null });
    const assets = await Asset.find({ storageLocation: req.params.id })
      .populate('project', 'name').sort({ name: 1 }).lean();
    return res.status(200).json({ success: true, data: { location: { ...location, assets } }, message: 'Location fetched', error: null });
  } catch (error) { next(error); }
};

module.exports = { getLocations, getLocationSummaries, getLocationWithAssets, createLocation, updateLocation, deleteLocation };
