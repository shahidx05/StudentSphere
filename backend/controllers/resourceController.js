const { body } = require('express-validator');
const ResourceItem = require('../models/ResourceItem');
const { getFileUrl } = require('../middleware/uploadMiddleware');

// Static learning paths data
const LEARNING_PATHS = [
  {
    slug: 'web-development',
    title: 'Web Development',
    description: 'Full-stack web development from HTML/CSS to React & Node.js',
    topics: ['HTML & CSS', 'JavaScript', 'React.js', 'Node.js', 'MongoDB', 'REST APIs'],
    platforms: [
      { name: 'freeCodeCamp', url: 'https://www.freecodecamp.org' },
      { name: 'The Odin Project', url: 'https://www.theodinproject.com' },
      { name: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
    ],
  },
  {
    slug: 'artificial-intelligence',
    title: 'Artificial Intelligence & ML',
    description: 'Machine learning, deep learning, and AI fundamentals',
    topics: ['Python', 'NumPy & Pandas', 'Scikit-Learn', 'TensorFlow', 'PyTorch', 'NLP'],
    platforms: [
      { name: 'Coursera – Andrew Ng', url: 'https://www.coursera.org/learn/machine-learning' },
      { name: 'fast.ai', url: 'https://www.fast.ai' },
      { name: 'Kaggle', url: 'https://www.kaggle.com' },
    ],
  },
  {
    slug: 'dsa',
    title: 'Data Structures & Algorithms',
    description: 'Complete DSA preparation for coding interviews',
    topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'DP', 'Sorting & Searching'],
    platforms: [
      { name: 'LeetCode', url: 'https://leetcode.com' },
      { name: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org' },
      { name: 'HackerRank', url: 'https://www.hackerrank.com' },
    ],
  },
  {
    slug: 'gate',
    title: 'GATE Exam Preparation',
    description: 'Comprehensive GATE CS preparation resources',
    topics: ['OS', 'DBMS', 'Computer Networks', 'Algorithms', 'TOC', 'Digital Logic'],
    platforms: [
      { name: 'NPTEL', url: 'https://nptel.ac.in' },
      { name: 'GeeksforGeeks GATE', url: 'https://www.geeksforgeeks.org/gate-cs-notes-gq/' },
      { name: 'Made Easy', url: 'https://www.madeeasy.in' },
    ],
  },
  {
    slug: 'cloud-devops',
    title: 'Cloud & DevOps',
    description: 'Cloud computing and DevOps practices',
    topics: ['Linux', 'Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform'],
    platforms: [
      { name: 'AWS Free Tier', url: 'https://aws.amazon.com/free' },
      { name: 'Play with Docker', url: 'https://labs.play-with-docker.com' },
      { name: 'Linux Foundation', url: 'https://training.linuxfoundation.org' },
    ],
  },
];

// Build pagination helper
const paginate = (query, page, limit) => {
  const p = parseInt(page) || 1;
  const l = parseInt(limit) || 10;
  return query.skip((p - 1) * l).limit(l);
};

// @desc    Get all resources (filtered + paginated)
// @route   GET /api/resources
exports.getResources = async (req, res, next) => {
  try {
    const { type, department, year, subject, tags, search, page, limit, sortBy, order } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (department) filter.department = department;
    if (year) filter.year = parseInt(year);
    if (subject) filter.subject = subject;
    if (tags) filter.tags = { $in: tags.split(',').map((t) => t.trim()) };
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
    ];

    const sortField = sortBy || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const total = await ResourceItem.countDocuments(filter);
    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;

    const resources = await ResourceItem.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((p - 1) * l)
      .limit(l)
      .populate('uploadedBy', 'name profilePhoto');

    return res.json({
      success: true,
      data: resources,
      pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload a new resource
// @route   POST /api/resources
exports.createResource = async (req, res, next) => {
  try {
    const { title, description, type, subject, department, year, tags } = req.body;
    const fileUrl = getFileUrl(req.file);

    const resource = await ResourceItem.create({
      title,
      description,
      type,
      subject,
      department,
      year,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      fileUrl,
      uploadedBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Resource uploaded.', data: resource });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
exports.getResource = async (req, res, next) => {
  try {
    const resource = await ResourceItem.findById(req.params.id).populate('uploadedBy', 'name profilePhoto');
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' });
    return res.json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
};

// @desc    Update resource (only uploader)
// @route   PUT /api/resources/:id
exports.updateResource = async (req, res, next) => {
  try {
    const resource = await ResourceItem.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' });

    if (resource.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this resource.' });
    }

    const { title, description, type, subject, department, year, tags } = req.body;
    Object.assign(resource, { title, description, type, subject, department, year });
    if (tags) resource.tags = tags.split(',').map((t) => t.trim());

    await resource.save();
    return res.json({ success: true, message: 'Resource updated.', data: resource });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete resource (uploader or admin)
// @route   DELETE /api/resources/:id
exports.deleteResource = async (req, res, next) => {
  try {
    const resource = await ResourceItem.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' });

    if (resource.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await resource.deleteOne();
    return res.json({ success: true, message: 'Resource deleted.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Increment download count
// @route   PATCH /api/resources/:id/download
exports.incrementDownload = async (req, res, next) => {
  try {
    const resource = await ResourceItem.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' });
    return res.json({ success: true, data: { downloadCount: resource.downloadCount } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all learning paths
// @route   GET /api/resources/learning-paths
exports.getLearningPaths = (req, res) => {
  return res.json({ success: true, data: LEARNING_PATHS });
};

// @desc    Get single learning path by slug
// @route   GET /api/resources/learning-paths/:slug
exports.getLearningPath = (req, res) => {
  const lp = LEARNING_PATHS.find((p) => p.slug === req.params.slug);
  if (!lp) return res.status(404).json({ success: false, message: 'Learning path not found.' });
  return res.json({ success: true, data: lp });
};

exports.resourceValidation = [
  body('title').notEmpty().withMessage('Title is required.'),
  body('type')
    .isIn(['notes', 'pyq', 'department_notes', 'gate', 'course_resource', 'learning_path'])
    .withMessage('Invalid resource type.'),
];

// @desc    Toggle bookmark/save a resource
// @route   POST /api/resources/:id/bookmark
exports.toggleBookmark = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const resourceId = req.params.id;

    const resource = await ResourceItem.findById(resourceId);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' });

    const user = await User.findById(req.user._id);
    const alreadySaved = user.savedResources.some((id) => id.toString() === resourceId);

    if (alreadySaved) {
      user.savedResources = user.savedResources.filter((id) => id.toString() !== resourceId);
    } else {
      user.savedResources.push(resourceId);
    }

    await user.save();

    return res.json({
      success: true,
      message: alreadySaved ? 'Bookmark removed.' : 'Resource bookmarked.',
      data: { bookmarked: !alreadySaved },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookmarked resources for logged-in user
// @route   GET /api/resources/bookmarks/me
exports.getBookmarkedResources = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id).populate({
      path: 'savedResources',
      populate: { path: 'uploadedBy', select: 'name profilePhoto' },
    });

    return res.json({ success: true, data: user.savedResources });
  } catch (err) {
    next(err);
  }
};
