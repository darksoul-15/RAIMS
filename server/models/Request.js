// server/models/Request.js
const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  asset:               { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  requestedBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  project:             { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  quantityRequested:   { type: Number, required: true, min: 1 },
  purpose:             { type: String, required: true, trim: true },
  requestDate:         { type: Date, default: Date.now },
  expectedReturnDate:  { type: Date, required: true },
  status: {
    type: String,
    enum: ['Pending','Approved','Rejected','Allocated','CheckedOut','Returned','Overdue','Cancelled'],
    default: 'Pending',
    index: true
  },
  approvedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvalDate:  { type: Date },
  notes:         { type: String, trim: true }
}, { timestamps: true });

requestSchema.index({ requestedBy: 1, status: 1 });
requestSchema.index({ asset: 1, status: 1 });

module.exports = mongoose.model('Request', requestSchema);
