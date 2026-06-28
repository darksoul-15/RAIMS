// server/middleware/auditLog.js
// Fires after response is sent — zero latency impact on the request path.
const AuditLog = require('../models/AuditLog');

// Extract resource name and optional :id from URL path
const parseUrl = (url) => {
  const parts = url.replace(/\?.*$/, '').split('/').filter(Boolean);
  // e.g. ['api', 'v1', 'requests', 'abc123', 'approve']
  const resource   = parts[3] || '';
  const resourceId = parts[4] && !parts[4].includes('-') ? parts[4] : undefined;
  return { resource, resourceId };
};

const auditLog = (req, res, next) => {
  // Only log state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();

  res.on('finish', () => {
    const { resource, resourceId } = parseUrl(req.originalUrl);
    AuditLog.create({
      userId:     req.user?._id,
      userRole:   req.user?.role,
      method:     req.method,
      url:        req.originalUrl,
      resource,
      resourceId,
      ip:         req.ip || req.headers['x-forwarded-for'],
      statusCode: res.statusCode
    }).catch((err) => console.error('Audit log write failed:', err.message));
  });

  next();
};

module.exports = auditLog;
