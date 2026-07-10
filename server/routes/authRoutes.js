const express = require('express');
const { body } = require('express-validator');
const { register, login, refresh, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { apiLimiter, authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/refresh', apiLimiter, refresh);
router.get('/me', apiLimiter, protect, getMe);

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['Administrator', 'ProjectLead', 'Researcher'])
      .withMessage('Invalid role')
  ],
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  login
);

module.exports = router;
