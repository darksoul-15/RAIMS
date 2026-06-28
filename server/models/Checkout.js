// server/models/Checkout.js
const mongoose = require('mongoose');

const checkoutSchema = new mongoose.Schema({
  request:             { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  asset:               { type: mongoose.Schema.Types.ObjectId, ref: 'Asset',   required: true },
  borrower:            { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  borrowerProjectId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  checkoutDate:        { type: Date, default: Date.now },
  expectedReturnDate:  { type: Date, required: true },
  actualReturnDate:    { type: Date },
  currentHolder:       { type: String, trim: true },
  conditionAtCheckout: { type: String, trim: true, default: 'Good' },
  conditionAtReturn:   { type: String, trim: true },
  status:              { type: String, enum: ['Active','Returned','Overdue'], default: 'Active', index: true },
  verifiedBy:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

checkoutSchema.index({ borrower: 1, status: 1 });
checkoutSchema.index({ asset: 1, status: 1 });

module.exports = mongoose.model('Checkout', checkoutSchema);
