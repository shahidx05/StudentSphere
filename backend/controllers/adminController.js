const User = require('../models/User');
const ResourceItem = require('../models/ResourceItem');
const MarketplaceItem = require('../models/MarketplaceItem');
const LostFoundItem = require('../models/LostFoundItem');
const Transaction = require('../models/Transaction');
const Opportunity = require('../models/Opportunity');
const CampusPost = require('../models/CampusPost');
const Club = require('../models/Club');

// @desc    Platform-wide stats
// @route   GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const [
      totalUsers, students, admins,
      resources, marketplace, lostfound,
      opportunities, posts, clubs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'admin' }),
      ResourceItem.countDocuments(),
      MarketplaceItem.countDocuments(),
      LostFoundItem.countDocuments(),
      Opportunity.countDocuments(),
      CampusPost.countDocuments(),
      Club.countDocuments(),
    ]);

    return res.json({
      success: true,
      data: { totalUsers, students, admins, resources, marketplace, lostfound, opportunities, posts, clubs },
    });
  } catch (err) { next(err); }
};

// @desc    List all users (paginated, searchable)
// @route   GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (role) filter.role = role;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('name email role department branch year createdAt profilePhoto')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.json({ success: true, data: users, pagination: { total, page: Number(page), totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// @desc    Change a user's role
// @route   PATCH /api/admin/users/:id/role
exports.changeRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['student', 'admin'].includes(role)) return res.status(400).json({ success: false, message: 'Invalid role.' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('name email role');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, message: `Role updated to ${role}.`, data: user });
  } catch (err) { next(err); }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, message: 'User deleted.' });
  } catch (err) { next(err); }
};

// @desc    List all resources (admin view)
// @route   GET /api/admin/resources
exports.getResources = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await ResourceItem.countDocuments();
    const items = await ResourceItem.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    return res.json({ success: true, data: items, pagination: { total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// @desc    Delete any resource
// @route   DELETE /api/admin/resources/:id
exports.deleteResource = async (req, res, next) => {
  try {
    await ResourceItem.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Resource deleted.' });
  } catch (err) { next(err); }
};

// @desc    List all marketplace items
// @route   GET /api/admin/marketplace
exports.getMarketplace = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await MarketplaceItem.countDocuments();
    const items = await MarketplaceItem.find()
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    return res.json({ success: true, data: items, pagination: { total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// @desc    Delete any marketplace item
// @route   DELETE /api/admin/marketplace/:id
exports.deleteMarketplaceItem = async (req, res, next) => {
  try {
    await MarketplaceItem.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Listing deleted.' });
  } catch (err) { next(err); }
};

// @desc    Recent activity feed
// @route   GET /api/admin/activity
exports.getActivity = async (req, res, next) => {
  try {
    const [recentUsers, recentResources, recentListings] = await Promise.all([
      User.find().select('name email createdAt role').sort({ createdAt: -1 }).limit(5),
      ResourceItem.find().populate('uploadedBy', 'name').select('title createdAt').sort({ createdAt: -1 }).limit(5),
      MarketplaceItem.find().populate('seller', 'name').select('title createdAt').sort({ createdAt: -1 }).limit(5),
    ]);
    return res.json({ success: true, data: { recentUsers, recentResources, recentListings } });
  } catch (err) { next(err); }
};
