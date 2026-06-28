// server/models/AuditLog.js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userRole:   { type: String },
  method:     { type: String },
  url:        { type: String },
  resource:   { type: String },
  resourceId: { type: String },
  ip:         { type: String },
  statusCode: { type: Number }
}, { timestamps: true });

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
