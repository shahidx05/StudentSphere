const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const localServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['hostel', 'mess', 'pg', 'hardware', 'stationery', 'other'],
      required: true,
    },
    description: { type: String, trim: true },
    address: { type: String, required: true },
    cost: { type: String, trim: true },
    facilities: [{ type: String, trim: true }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    contactNumber: { type: String, trim: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
    photos: [{ type: String }],
    reviews: [reviewSchema],
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// 2dsphere index for geolocation queries
localServiceSchema.index({ location: '2dsphere' });
localServiceSchema.index({ name: 'text', description: 'text', address: 'text' });

module.exports = mongoose.model('LocalService', localServiceSchema);
