// server/app.js — Express app (no listen) so tests can import cleanly
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const compression  = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const errorHandler  = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const auditLog      = require('./middleware/auditLog');

const app = express();

// ── Security & performance ──────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// ── Logging ─────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// ── Body parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ── NoSQL injection sanitization ─────────────────────────────
app.use(mongoSanitize());

// ── Static uploads ───────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Audit logging (mutations only) ───────────────────────────
app.use('/api/v1', auditLog);

// ── Routes ───────────────────────────────────────────────────
app.use('/api/v1/auth',          authLimiter, require('./routes/authRoutes'));
app.use('/api/v1/users',         apiLimiter,  require('./routes/userRoutes'));
app.use('/api/v1/projects',      apiLimiter,  require('./routes/projectRoutes'));
app.use('/api/v1/locations',     apiLimiter,  require('./routes/locationRoutes'));
app.use('/api/v1/assets',        apiLimiter,  require('./routes/assetRoutes'));
app.use('/api/v1/requests',      apiLimiter,  require('./routes/requestRoutes'));
app.use('/api/v1/checkouts',     apiLimiter,  require('./routes/checkoutRoutes'));
app.use('/api/v1/procurements',  apiLimiter,  require('./routes/procurementRoutes'));
app.use('/api/v1/notifications', apiLimiter,  require('./routes/notificationRoutes'));
app.use('/api/v1/reports',       apiLimiter,  require('./routes/reportRoutes'));

app.use(errorHandler);

module.exports = app;
