const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['technical', 'cultural', 'sports', 'social', 'other'],
      required: true,
    },
    logo: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    recruitmentOpen: { type: Boolean, default: false },
    recruitmentStartDate: { type: Date },
    recruitmentEndDate: { type: Date },
    contactEmail: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Club', clubSchema);
