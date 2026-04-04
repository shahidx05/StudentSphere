const mongoose = require('mongoose');

const campusPassSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    qrData: { type: String, required: true }, // Base64 QR code image
    college: { type: String, default: 'StudentSphere University' },
    isActive: { type: Boolean, default: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CampusPass', campusPassSchema);
