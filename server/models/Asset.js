const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    assetCode: {
      type: String,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true
    },
    quantityTotal: {
      type: Number,
      default: 1,
      min: 0
    },
    quantityAvailable: {
      type: Number,
      default: 1,
      min: 0
    },
    images: [{ type: String }],
    purchaseDate: { type: Date },
    purchaseCost: { type: Number, min: 0 },
    vendor: {
      name: { type: String, trim: true },
      contact: { type: String, trim: true },
      details: { type: String, trim: true }
    },
    warranty: {
      period: { type: String, trim: true },
      expiryDate: { type: Date },
      details: { type: String, trim: true }
    },
    storageLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
    },
    status: {
      type: String,
      enum: ['Available', 'Borrowed', 'Reserved', 'UnderMaintenance', 'Lost', 'Retired'],
      default: 'Available',
      index: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Text index supports keyword search (Module 2)
assetSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Asset', assetSchema);
