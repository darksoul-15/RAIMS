const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';
const windowMs = 15 * 60 * 1000; // 15 min

// Skip rate limiting entirely in development
const skipInDev = () => isDev;

// General API — 100 req / 15 min per IP in production
const apiLimiter = rateLimit({
  windowMs,
  max: 100,
  skip: skipInDev,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, data: null, message: 'Too many requests, please try again later.', error: null }
});

// Auth endpoints — 10 req / 15 min in production
const authLimiter = rateLimit({
  windowMs,
  max: 10,
  skip: skipInDev,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, data: null, message: 'Too many auth attempts, please try again later.', error: null }
});

module.exports = { apiLimiter, authLimiter };
