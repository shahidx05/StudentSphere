const { body } = require('express-validator');
const MarketplaceItem = require('../models/MarketplaceItem');

// @desc    Get all marketplace listings
// @route   GET /api/marketplace
exports.getListings = async (req, res, next) => {
  try {
    const { section, category, status, search, minPrice, maxPrice, page, limit, sortBy, order } = req.query;
    const filter = {};

    if (section) filter.section = section;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const sortField = sortBy || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;
    const total = await MarketplaceItem.countDocuments(filter);

    const items = await MarketplaceItem.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((p - 1) * l)
      .limit(l)
      .populate('seller', 'name profilePhoto');

    return res.json({
      success: true,
      data: items,
      pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create listing
// @route   POST /api/marketplace
exports.createListing = async (req, res, next) => {
  try {
    const { title, description, category, price, isFree, condition, section, shopAddress, contactInfo } = req.body;
    const images = req.files ? req.files.map((f) => f.path || `/uploads/${f.filename}`) : [];

    const item = await MarketplaceItem.create({
      title, description, category, price, isFree, condition, section,
      shopAddress, contactInfo, images,
      seller: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Listing created.', data: item });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single listing
// @route   GET /api/marketplace/:id
exports.getListing = async (req, res, next) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id).populate('seller', 'name profilePhoto email');
    if (!item) return res.status(404).json({ success: false, message: 'Listing not found.' });
    return res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// @desc    Update listing (only seller)
// @route   PUT /api/marketplace/:id
exports.updateListing = async (req, res, next) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Listing not found.' });

    if (item.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { title, description, category, price, isFree, condition, section, shopAddress, contactInfo } = req.body;
    Object.assign(item, { title, description, category, price, isFree, condition, section, shopAddress, contactInfo });

    if (req.files && req.files.length) {
      item.images = req.files.map((f) => f.path || `/uploads/${f.filename}`);
    }

    await item.save();
    return res.json({ success: true, message: 'Listing updated.', data: item });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete listing (seller or admin)
// @route   DELETE /api/marketplace/:id
exports.deleteListing = async (req, res, next) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Listing not found.' });

    if (item.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await item.deleteOne();
    return res.json({ success: true, message: 'Listing deleted.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Update listing status
// @route   PATCH /api/marketplace/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['available', 'sold', 'reserved'].includes(status)) {
      return res.status(422).json({ success: false, message: 'Invalid status.' });
    }

    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Listing not found.' });

    if (item.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    item.status = status;
    await item.save();

    return res.json({ success: true, message: 'Status updated.', data: item });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all listings by logged-in user
// @route   GET /api/marketplace/my-listings
exports.getMyListings = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;
    const total = await MarketplaceItem.countDocuments({ seller: req.user._id });

    const items = await MarketplaceItem.find({ seller: req.user._id })
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l);

    return res.json({
      success: true,
      data: items,
      pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    });
  } catch (err) {
    next(err);
  }
};

exports.marketplaceValidation = [
  body('title').notEmpty().withMessage('Title is required.'),
  body('category')
    .isIn(['book', 'calculator', 'electronics', 'hostel_item', 'project_component', 'other'])
    .withMessage('Invalid category.'),
  body('condition').isIn(['new', 'good', 'fair', 'poor']).withMessage('Invalid condition.'),
  body('section').isIn(['secondhand', 'local_shop']).withMessage('Invalid section.'),
];
