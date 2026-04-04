const { body } = require('express-validator');
const LostFoundItem = require('../models/LostFoundItem');

// @desc    Get all lost/found posts
// @route   GET /api/lostfound
exports.getItems = async (req, res, next) => {
  try {
    const { status, search, isResolved, page, limit, sortBy, order } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (isResolved !== undefined) filter.isResolved = isResolved === 'true';
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { locationLost: { $regex: search, $options: 'i' } },
    ];

    const sortField = sortBy || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;
    const total = await LostFoundItem.countDocuments(filter);

    const items = await LostFoundItem.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((p - 1) * l)
      .limit(l)
      .populate('postedBy', 'name profilePhoto');

    return res.json({
      success: true,
      data: items,
      pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create lost/found post
// @route   POST /api/lostfound
exports.createItem = async (req, res, next) => {
  try {
    const { title, description, status, locationLost, contactInfo, externalLink } = req.body;
    const images = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];

    const item = await LostFoundItem.create({
      title, description, status, locationLost, contactInfo, externalLink, images,
      postedBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Post created.', data: item });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single post
// @route   GET /api/lostfound/:id
exports.getItem = async (req, res, next) => {
  try {
    const item = await LostFoundItem.findById(req.params.id).populate('postedBy', 'name profilePhoto email');
    if (!item) return res.status(404).json({ success: false, message: 'Post not found.' });
    return res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// @desc    Update post (only poster)
// @route   PUT /api/lostfound/:id
exports.updateItem = async (req, res, next) => {
  try {
    const item = await LostFoundItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Post not found.' });

    if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { title, description, status, locationLost, contactInfo, externalLink } = req.body;
    Object.assign(item, { title, description, status, locationLost, contactInfo, externalLink });

    if (req.files && req.files.length) {
      item.images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    await item.save();
    return res.json({ success: true, message: 'Post updated.', data: item });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete post (poster or admin)
// @route   DELETE /api/lostfound/:id
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await LostFoundItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Post not found.' });

    if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await item.deleteOne();
    return res.json({ success: true, message: 'Post deleted.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark item as resolved
// @route   PATCH /api/lostfound/:id/resolve
exports.resolveItem = async (req, res, next) => {
  try {
    const item = await LostFoundItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Post not found.' });

    if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    item.isResolved = true;
    await item.save();

    return res.json({ success: true, message: 'Marked as resolved.', data: item });
  } catch (err) {
    next(err);
  }
};

exports.lostFoundValidation = [
  body('title').notEmpty().withMessage('Title is required.'),
  body('status').isIn(['lost', 'found']).withMessage('Status must be lost or found.'),
  body('contactInfo').notEmpty().withMessage('Contact info is required.'),
];

// @desc    Get lost/found stats
// @route   GET /api/lostfound/stats
exports.getStats = async (req, res, next) => {
  try {
    const [total, lost, found, resolved] = await Promise.all([
      LostFoundItem.countDocuments(),
      LostFoundItem.countDocuments({ status: 'lost' }),
      LostFoundItem.countDocuments({ status: 'found' }),
      LostFoundItem.countDocuments({ isResolved: true }),
    ]);
    return res.json({ success: true, data: { total, lost, found, resolved } });
  } catch (err) { next(err); }
};

