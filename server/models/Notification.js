// server/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['ApprovalRequest', 'CheckoutConfirmation', 'ReturnReminder', 'OverdueAlert', 'InventoryUpdate'],
    required: true
  },
  message:           { type: String, required: true, trim: true },
  relatedEntityType: { type: String, trim: true },
  relatedEntityId:   { type: mongoose.Schema.Types.ObjectId },
  channel:           { type: String, enum: ['Email', 'Dashboard'], default: 'Dashboard' },
  read:              { type: Boolean, default: false, index: true }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
