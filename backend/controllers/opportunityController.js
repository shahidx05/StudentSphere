const { body } = require('express-validator');
const Opportunity = require('../models/Opportunity');

const attachDaysLeft = (op) => {
  const now = new Date();
  op.daysLeft = Math.ceil((new Date(op.lastDate) - now) / (1000 * 60 * 60 * 24));
  return op;
};

// @desc    Get all active opportunities
// @route   GET /api/opportunities
exports.getOpportunities = async (req, res, next) => {
  try {
    const { type, search, tags, sortBy, order, page, limit } = req.query;
    const filter = { isActive: true };

    if (type) filter.type = type;
    if (tags) filter.tags = { $in: tags.split(',').map((t) => t.trim()) };
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { organization: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const sortField = sortBy || 'lastDate';
    const sortOrder = order === 'desc' ? -1 : 1;

    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;
    const total = await Opportunity.countDocuments(filter);

    const opportunities = await Opportunity.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((p - 1) * l)
      .limit(l)
      .populate('postedBy', 'name')
      .lean();

    opportunities.forEach(attachDaysLeft);

    return res.json({
      success: true,
      data: opportunities,
      pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create opportunity (admin only)
// @route   POST /api/opportunities
exports.createOpportunity = async (req, res, next) => {
  try {
    const { title, description, type, organization, applyLink, startDate, lastDate, tags } = req.body;

    const opportunity = await Opportunity.create({
      title,
      description,
      type,
      organization,
      applyLink,
      startDate,
      lastDate,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      postedBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Opportunity created.', data: opportunity });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single opportunity
// @route   GET /api/opportunities/:id
exports.getOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('postedBy', 'name')
      .lean();
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found.' });

    attachDaysLeft(opportunity);
    return res.json({ success: true, data: opportunity });
  } catch (err) {
    next(err);
  }
};

// @desc    Update opportunity (admin only)
// @route   PUT /api/opportunities/:id
exports.updateOpportunity = async (req, res, next) => {
  try {
    const { title, description, type, organization, applyLink, startDate, lastDate, tags, isActive } = req.body;
    const opportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      { title, description, type, organization, applyLink, startDate, lastDate, isActive,
        tags: tags ? tags.split(',').map((t) => t.trim()) : undefined },
      { new: true, runValidators: true }
    );
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found.' });

    return res.json({ success: true, message: 'Opportunity updated.', data: opportunity });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete opportunity (admin only)
// @route   DELETE /api/opportunities/:id
exports.deleteOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found.' });

    return res.json({ success: true, message: 'Opportunity deleted.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Upcoming deadlines (nearest 5)
// @route   GET /api/opportunities/upcoming/deadlines
exports.getUpcomingDeadlines = async (req, res, next) => {
  try {
    const now = new Date();
    const opportunities = await Opportunity.find({ isActive: true, lastDate: { $gte: now } })
      .sort({ lastDate: 1 })
      .limit(5)
      .lean();

    opportunities.forEach(attachDaysLeft);
    return res.json({ success: true, data: opportunities });
  } catch (err) {
    next(err);
  }
};

exports.opportunityValidation = [
  body('title').notEmpty().withMessage('Title is required.'),
  body('type')
    .isIn(['internship', 'scholarship', 'hackathon', 'job', 'competition'])
    .withMessage('Invalid opportunity type.'),
  body('organization').notEmpty().withMessage('Organization is required.'),
  body('lastDate').isISO8601().withMessage('Valid lastDate is required.'),
];

// @desc    Toggle save/unsave an opportunity
// @route   POST /api/opportunities/:id/save
exports.toggleSaveOpportunity = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const oppId = req.params.id;

    const opportunity = await Opportunity.findById(oppId);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found.' });

    const user = await User.findById(req.user._id);
    const alreadySaved = user.savedOpportunities.some((id) => id.toString() === oppId);

    if (alreadySaved) {
      user.savedOpportunities = user.savedOpportunities.filter((id) => id.toString() !== oppId);
    } else {
      user.savedOpportunities.push(oppId);
    }

    await user.save();

    return res.json({
      success: true,
      message: alreadySaved ? 'Opportunity unsaved.' : 'Opportunity saved.',
      data: { saved: !alreadySaved },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get saved opportunities for logged-in user
// @route   GET /api/opportunities/saved/me
exports.getSavedOpportunities = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id).populate({
      path: 'savedOpportunities',
      populate: { path: 'postedBy', select: 'name' },
    });

    const now = new Date();
    const enriched = user.savedOpportunities.map((op) => {
      const obj = op.toObject();
      obj.daysLeft = Math.ceil((new Date(op.lastDate) - now) / (1000 * 60 * 60 * 24));
      return obj;
    });

    return res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
};
