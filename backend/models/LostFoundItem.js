const mongoose = require('mongoose');

const lostFoundItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['lost', 'found'], required: true },
    images: [{ type: String }],
    locationLost: { type: String, trim: true },
    contactInfo: { type: String, trim: true, required: true },
    externalLink: { type: String },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isResolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

lostFoundItemSchema.index({ title: 'text', description: 'text', locationLost: 'text' });

module.exports = mongoose.model('LostFoundItem', lostFoundItemSchema);
