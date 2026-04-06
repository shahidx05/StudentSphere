const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const { getFileUrl } = require('../middleware/uploadMiddleware');

// Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// @desc    Register a new student
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, department, branch, year, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password, department, branch, year, role: role === 'admin' ? 'student' : role });
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: { token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);
    return res.json({
      success: true,
      message: 'Login successful.',
      data: { token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/update-profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, department, branch, year, college, state, district, skills, interests } = req.body;

    const updateData = { name, bio, department, branch, year, college, state, district };

    // skills & interests can come as arrays or comma-separated strings
    if (skills !== undefined) {
      updateData.skills = Array.isArray(skills)
        ? skills
        : skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (interests !== undefined) {
      updateData.interests = Array.isArray(interests)
        ? interests
        : interests.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (year !== undefined) updateData.year = year ? Number(year) : undefined;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    return res.json({ success: true, message: 'Profile updated.', data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Update skills
// @route   PUT /api/auth/update-skills
exports.updateSkills = async (req, res, next) => {
  try {
    const { skills } = req.body;
    if (!Array.isArray(skills)) {
      return res.status(422).json({ success: false, message: 'Skills must be an array.' });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { skills },
      { new: true }
    ).select('-password');

    return res.json({ success: true, message: 'Skills updated.', data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(oldPassword))) {
      return res.status(400).json({ success: false, message: 'Old password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload profile photo
// @route   POST /api/auth/upload-photo
exports.uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const photoUrl = getFileUrl(req.file);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePhoto: photoUrl },
      { new: true }
    ).select('-password');

    return res.json({ success: true, message: 'Photo uploaded.', data: user });
  } catch (err) {
    next(err);
  }
};

// Validation rules
exports.registerValidation = [
  body('name').notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
];

exports.loginValidation = [
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];
