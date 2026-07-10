const Asset = require('../models/Asset');
const generateAssetCode = require('../utils/generateAssetCode');

// Local disk storage → return web path served by the /uploads static route
const fileUrl = (file) => `/uploads/${file.filename}`;

// Multipart sends nested objects as JSON strings — parse them back
const parseNested = (body, keys) => {
  const out = { ...body };
  for (const k of keys) {
    if (typeof out[k] === 'string') {
      try { out[k] = JSON.parse(out[k]); } catch (_) { /* leave as string */ }
    }
  }
  return out;
};

// @route   GET /api/v1/assets?page&limit&search&category&status&availability&project
// @access  Private (any authenticated user — also serves Module 2 search)
const getAssets = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const { search, category, status, availability, project } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (project) filter.project = project;
    if (availability === 'available') filter.quantityAvailable = { $gt: 0 };
    if (search) {
      const rx = new RegExp(search, 'i');
      filter.$or = [{ name: rx }, { assetCode: rx }, { description: rx }, { category: rx }];
    }

    const [assets, total] = await Promise.all([
      Asset.find(filter)
        .populate('storageLocation', 'name')
        .populate('project', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Asset.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: { assets, total, page, pages: Math.ceil(total / limit) },
      message: 'Assets fetched',
      error: null
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/assets/categories
// @access  Private
const getCategories = async (req, res, next) => {
  try {
    const categories = await Asset.distinct('category');
    return res.status(200).json({
      success: true,
      data: { categories: categories.sort() },
      message: 'Categories fetched',
      error: null
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/assets/:id
// @access  Private
const getAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('storageLocation', 'name')
      .populate('project', 'name')
      .populate('createdBy', 'name');
    if (!asset) {
      return res.status(404).json({
        success: false, data: null, message: 'Asset not found', error: null
      });
    }
    return res.status(200).json({
      success: true, data: { asset }, message: 'Asset fetched', error: null
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/v1/assets
// @access  Administrator | ProjectLead
const createAsset = async (req, res, next) => {
  try {
    const payload = { ...parseNested(req.body, ['vendor', 'warranty']), createdBy: req.user._id };
    payload.assetCode = await generateAssetCode();
    if (req.files && req.files.length) {
      payload.images = req.files.map(fileUrl);
    }
    // Default available to total if not provided
    if (payload.quantityTotal != null && payload.quantityAvailable == null) {
      payload.quantityAvailable = payload.quantityTotal;
    }

    const asset = await Asset.create(payload);
    return res.status(201).json({
      success: true, data: { asset }, message: 'Asset created', error: null
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/v1/assets/:id
// @access  Administrator | ProjectLead
const updateAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false, data: null, message: 'Asset not found', error: null
      });
    }

    const updates = parseNested(req.body, ['vendor', 'warranty']);
    if (req.files && req.files.length) {
      // Append newly uploaded images to existing ones
      updates.images = [...(asset.images || []), ...req.files.map(fileUrl)];
    }

    Object.assign(asset, updates);
    await asset.save();

    return res.status(200).json({
      success: true, data: { asset }, message: 'Asset updated', error: null
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/v1/assets/:id
// @access  Administrator
const deleteAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false, data: null, message: 'Asset not found', error: null
      });
    }
    return res.status(200).json({
      success: true, data: null, message: 'Asset deleted', error: null
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/assets/reuse?category
// @access  Private — Module 7 reuse recommendations
const getReuseSuggestions = async (req, res, next) => {
  try {
    const filter = { status: 'Available', quantityAvailable: { $gt: 0 } };
    if (req.query.category) filter.category = req.query.category;

    const assets = await Asset.find(filter)
      .populate('storageLocation', 'name')
      .populate('project', 'name')
      .lean();

    const suggestions = assets
      .filter((a) => a.quantityTotal > 0 && a.quantityAvailable / a.quantityTotal >= 0.6)
      .map((a) => ({
        _id: a._id,
        assetCode: a.assetCode,
        name: a.name,
        category: a.category,
        location: a.storageLocation?.name || '—',
        project: a.project?.name || null,
        quantityAvailable: a.quantityAvailable,
        quantityTotal: a.quantityTotal,
        utilizationPct: Math.round((1 - a.quantityAvailable / a.quantityTotal) * 100)
      }));

    return res.status(200).json({ success: true, data: { suggestions }, message: 'Reuse suggestions fetched', error: null });
  } catch (error) { next(error); }
};

module.exports = { getAssets, getCategories, getReuseSuggestions, getAsset, createAsset, updateAsset, deleteAsset };
