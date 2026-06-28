// server/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const windowMs = 15 * 60 * 1000; // 15 min

// General API — 100 req / 15 min per IP
const apiLimiter = rateLimit({
  windowMs,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, data: null, message: 'Too many requests, please try again later.', error: null }
});

// Auth endpoints — tighter: 10 req / 15 min per IP
const authLimiter = rateLimit({
  windowMs,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, data: null, message: 'Too many auth attempts, please try again later.', error: null }
});

module.exports = { apiLimiter, authLimiter };
