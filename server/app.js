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
// Removed: Cloudinary now handles file serving via HTTPS CDN URLs

// ── Audit logging (mutations only) ───────────────────────────
app.use('/api/v1', auditLog);

// ── Health check ─────────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', env: process.env.NODE_ENV, timestamp: new Date().toISOString() }, message: null, error: null });
});

// ── Routes ───────────────────────────────────────────────────
// authLimiter only on login/register; refresh + me use apiLimiter (set in authRoutes)
app.use('/api/v1/auth',          require('./routes/authRoutes'));
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

// ── Serve React build in production ─────────────────────────
if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.resolve(__dirname, '../client/dist');
  console.log(`📁 Serving static files from: ${clientBuild}`);
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

module.exports = app;
