const User = require('../models/User');

// @route   GET /api/v1/users?page&limit&role
// @access  Administrator
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('project', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: { users, total, page, pages: Math.ceil(total / limit) },
      message: 'Users fetched',
      error: null
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/users/:id
// @access  Administrator
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('project', 'name');
    if (!user) {
      return res.status(404).json({
        success: false, data: null, message: 'User not found', error: null
      });
    }
    return res.status(200).json({
      success: true, data: { user }, message: 'User fetched', error: null
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/v1/users/:id
// @access  Administrator
const updateUser = async (req, res, next) => {
  try {
    const { name, role, project, phone } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false, data: null, message: 'User not found', error: null
      });
    }

    if (name !== undefined) user.name = name;
    if (role !== undefined) user.role = role;
    if (project !== undefined) user.project = project;
    if (phone !== undefined) user.phone = phone;
    await user.save();

    return res.status(200).json({
      success: true, data: { user }, message: 'User updated', error: null
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/v1/users/:id
// @access  Administrator
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false, data: null, message: 'User not found', error: null
      });
    }
    return res.status(200).json({
      success: true, data: null, message: 'User deleted', error: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUser, updateUser, deleteUser };
