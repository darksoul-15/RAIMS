const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

// Shape a user document for client responses (never expose passwordHash)
const sanitize = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  borrowerId: user.borrowerId,
  project: user.project,
  phone: user.phone,
  createdAt: user.createdAt
});

const checkValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      data: null,
      message: errors.array()[0].msg,
      error: errors.array()
    });
    return false;
  }
  return true;
};

// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  if (!checkValidation(req, res)) return;
  try {
    const { name, email, password, role, project, phone } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Email already registered',
        error: null
      });
    }

    const user = new User({ name, email, role, project, phone });
    await user.setPassword(password);
    await user.save();

    return res.status(201).json({
      success: true,
      data: {
        user: sanitize(user),
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user)
      },
      message: 'Registration successful',
      error: null
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  if (!checkValidation(req, res)) return;
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid email or password',
        error: null
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: sanitize(user),
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user)
      },
      message: 'Login successful',
      error: null
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/v1/auth/refresh
// @access  Public (valid refresh token required)
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Refresh token required',
        error: null
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'User no longer exists',
        error: null
      });
    }

    return res.status(200).json({
      success: true,
      data: { accessToken: generateAccessToken(user) },
      message: 'Token refreshed',
      error: null
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: { user: sanitize(req.user) },
    message: 'Current user',
    error: null
  });
};

module.exports = { register, login, refresh, getMe };
