// server/models/Procurement.js
const mongoose = require('mongoose');

const procurementSchema = new mongoose.Schema({
  asset:            { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
  purchaseDate:     { type: Date, required: true },
  purchaseCost:     { type: Number, required: true, min: 0 },
  vendorName:       { type: String, required: true, trim: true },
  vendorContact:    { type: String, trim: true },
  invoiceFileUrl:   { type: String },
  warrantyPeriod:   { type: String, trim: true },
  purchaseOrderRef: { type: String, trim: true },
  category:         { type: String, required: true, trim: true, index: true },
  notes:            { type: String, trim: true },
  createdBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

procurementSchema.index({ vendorName: 1 });
procurementSchema.index({ purchaseDate: -1 });

module.exports = mongoose.model('Procurement', procurementSchema);
