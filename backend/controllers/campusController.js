const { body } = require('express-validator');
const Club = require('../models/Club');
const CampusPost = require('../models/CampusPost');
const { getFileUrl, getFilesUrls } = require('../middleware/uploadMiddleware');

// ─── CLUBS ──────────────────────────────────────────────────────────────────

// @desc    Get all clubs
// @route   GET /api/campus/clubs
exports.getClubs = async (req, res, next) => {
  try {
    const { category, recruitmentOpen, search, page, limit } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (recruitmentOpen !== undefined) filter.recruitmentOpen = recruitmentOpen === 'true';
    if (search) filter.name = { $regex: search, $options: 'i' };

    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;
    const total = await Club.countDocuments(filter);

    const clubs = await Club.find(filter)
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .populate('createdBy', 'name');

    return res.json({
      success: true,
      data: clubs,
      pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a club (admin only)
// @route   POST /api/campus/clubs
exports.createClub = async (req, res, next) => {
  try {
    const { name, description, category, contactEmail, recruitmentOpen, recruitmentStartDate, recruitmentEndDate } = req.body;
    const logo = getFileUrl(req.file) || '';

    const club = await Club.create({
      name, description, category, contactEmail,
      recruitmentOpen, recruitmentStartDate, recruitmentEndDate,
      logo, createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Club created.', data: club });
  } catch (err) {
    next(err);
  }
};

// @desc    Get club detail
// @route   GET /api/campus/clubs/:id
exports.getClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('members', 'name profilePhoto department')
      .populate('createdBy', 'name');
    if (!club) return res.status(404).json({ success: false, message: 'Club not found.' });

    const posts = await CampusPost.find({ club: club._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('postedBy', 'name profilePhoto');

    return res.json({ success: true, data: { club, recentPosts: posts } });
  } catch (err) {
    next(err);
  }
};

// @desc    Update club (admin)
// @route   PUT /api/campus/clubs/:id
exports.updateClub = async (req, res, next) => {
  try {
    const club = await Club.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!club) return res.status(404).json({ success: false, message: 'Club not found.' });
    return res.json({ success: true, message: 'Club updated.', data: club });
  } catch (err) {
    next(err);
  }
};

// @desc    Join a club
// @route   POST /api/campus/clubs/:id/join
exports.joinClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found.' });

    if (club.members.includes(req.user._id)) {
      return res.status(409).json({ success: false, message: 'Already a member.' });
    }

    club.members.push(req.user._id);
    await club.save();

    return res.json({ success: true, message: 'Joined club successfully.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Leave a club
// @route   POST /api/campus/clubs/:id/leave
exports.leaveClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found.' });

    club.members = club.members.filter((m) => m.toString() !== req.user._id.toString());
    await club.save();

    return res.json({ success: true, message: 'Left club.' });
  } catch (err) {
    next(err);
  }
};

// ─── POSTS ──────────────────────────────────────────────────────────────────

// @desc    Get all campus posts
// @route   GET /api/campus/posts
exports.getPosts = async (req, res, next) => {
  try {
    const { type, club, search, page, limit, sortBy, order } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (club) filter.club = club;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];

    const sortField = sortBy || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;
    const total = await CampusPost.countDocuments(filter);

    const posts = await CampusPost.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((p - 1) * l)
      .limit(l)
      .populate('postedBy', 'name profilePhoto')
      .populate('club', 'name logo');

    return res.json({
      success: true,
      data: posts,
      pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a campus post
// @route   POST /api/campus/posts
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, type, club, eventDate, eventVenue } = req.body;
    const images = getFilesUrls(req.files);

    const post = await CampusPost.create({
      title, content, type, club, eventDate, eventVenue, images,
      postedBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Post created.', data: post });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single post with comments
// @route   GET /api/campus/posts/:id
exports.getPost = async (req, res, next) => {
  try {
    const post = await CampusPost.findById(req.params.id)
      .populate('postedBy', 'name profilePhoto')
      .populate('club', 'name logo')
      .populate('comments.user', 'name profilePhoto')
      .populate('likes', 'name profilePhoto');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    return res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// @desc    Update post (only author)
// @route   PUT /api/campus/posts/:id
exports.updatePost = async (req, res, next) => {
  try {
    const post = await CampusPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    if (post.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { title, content, type, eventDate, eventVenue } = req.body;
    Object.assign(post, { title, content, type, eventDate, eventVenue });
    await post.save();

    return res.json({ success: true, message: 'Post updated.', data: post });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete post (author or admin)
// @route   DELETE /api/campus/posts/:id
exports.deletePost = async (req, res, next) => {
  try {
    const post = await CampusPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    if (post.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await post.deleteOne();
    return res.json({ success: true, message: 'Post deleted.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle like
// @route   POST /api/campus/posts/:id/like
exports.toggleLike = async (req, res, next) => {
  try {
    const post = await CampusPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const idx = post.likes.findIndex((u) => u.toString() === req.user._id.toString());
    if (idx === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(idx, 1);
    }

    await post.save();
    return res.json({ success: true, data: { likesCount: post.likes.length, liked: idx === -1 } });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment
// @route   POST /api/campus/posts/:id/comment
exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(422).json({ success: false, message: 'Comment text is required.' });

    const post = await CampusPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    post.comments.push({ user: req.user._id, text });
    await post.save();

    await post.populate('comments.user', 'name profilePhoto');
    return res.json({ success: true, message: 'Comment added.', data: post.comments });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete comment
// @route   DELETE /api/campus/posts/:id/comment/:cid
exports.deleteComment = async (req, res, next) => {
  try {
    const post = await CampusPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const comment = post.comments.id(req.params.cid);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    comment.deleteOne();
    await post.save();

    return res.json({ success: true, message: 'Comment deleted.' });
  } catch (err) {
    next(err);
  }
};

exports.postValidation = [
  body('title').notEmpty().withMessage('Title is required.'),
  body('content').notEmpty().withMessage('Content is required.'),
  body('type').isIn(['announcement', 'event', 'recruitment', 'general']).withMessage('Invalid type.'),
];

exports.clubValidation = [
  body('name').notEmpty().withMessage('Club name is required.'),
  body('category')
    .isIn(['technical', 'cultural', 'sports', 'social', 'other'])
    .withMessage('Invalid category.'),
];
