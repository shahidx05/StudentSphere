const mongoose = require('mongoose');

const marketplaceItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['book', 'calculator', 'electronics', 'hostel_item', 'project_component', 'other'],
      required: true,
    },
    price: { type: Number, default: 0, min: 0 },
    isFree: { type: Boolean, default: false },
    condition: {
      type: String,
      enum: ['new', 'good', 'fair', 'poor'],
      required: true,
    },
    images: [{ type: String }],
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['available', 'sold', 'reserved'],
      default: 'available',
    },
    section: {
      type: String,
      enum: ['secondhand', 'local_shop'],
      required: true,
    },
    shopAddress: { type: String, trim: true },
    contactInfo: { type: String, trim: true },
  },
  { timestamps: true }
);

marketplaceItemSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('MarketplaceItem', marketplaceItemSchema);
