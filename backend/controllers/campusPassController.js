const QRCode = require('qrcode');
const CampusPass = require('../models/CampusPass');
const User = require('../models/User');

// @desc    Get current user's campus pass
// @route   GET /api/campus-pass/me
exports.getMyPass = async (req, res, next) => {
  try {
    const pass = await CampusPass.findOne({ userId: req.user._id });
    if (!pass) return res.status(404).json({ success: false, message: 'No campus pass found. Generate one.' });
    
    const user = await User.findById(req.user._id).select('name department branch year email');
    return res.json({ success: true, data: { pass, user } });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate or regenerate campus pass
// @route   POST /api/campus-pass/generate
exports.generatePass = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('name department branch year email');

    const qrPayload = JSON.stringify({
      id: user._id,
      name: user.name,
      department: user.department,
      year: user.year,
      email: user.email,
      college: 'StudentSphere University',
      generatedAt: new Date().toISOString(),
    });

    const qrData = await QRCode.toDataURL(qrPayload, {
      width: 300,
      margin: 2,
      color: { dark: '#0F62FE', light: '#FFFFFF' },
    });

    const pass = await CampusPass.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        qrData,
        college: 'StudentSphere University',
        isActive: true,
        generatedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({ success: true, message: 'Campus pass generated.', data: { pass, user } });
  } catch (err) {
    next(err);
  }
};
