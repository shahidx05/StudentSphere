const Opportunity = require('../models/Opportunity');
const ResourceItem = require('../models/ResourceItem');
const Transaction = require('../models/Transaction');
const MarketplaceItem = require('../models/MarketplaceItem');
const LostFoundItem = require('../models/LostFoundItem');
const CampusPost = require('../models/CampusPost');
const User = require('../models/User');

// @desc    Get dashboard overview for logged-in user
// @route   GET /api/dashboard/overview
exports.getOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Upcoming deadlines — nearest 5 active opportunities
    const upcomingDeadlines = await Opportunity.find({
      isActive: true,
      lastDate: { $gte: now },
    })
      .sort({ lastDate: 1 })
      .limit(5)
      .lean();

    // Attach daysLeft
    upcomingDeadlines.forEach((op) => {
      op.daysLeft = Math.ceil((new Date(op.lastDate) - now) / (1000 * 60 * 60 * 24));
    });

    // Recent notes — last 3 resources by this user
    const recentNotes = await ResourceItem.find({ uploadedBy: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    // Monthly expense summary
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthlySummaryAgg = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const expenseSummary = { income: 0, expense: 0, balance: 0 };
    monthlySummaryAgg.forEach((item) => {
      expenseSummary[item._id] = item.total;
    });
    expenseSummary.balance = expenseSummary.income - expenseSummary.expense;

    // Recent marketplace items — latest 3
    const recentMarketplaceItems = await MarketplaceItem.find({ status: 'available' })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('seller', 'name profilePhoto')
      .lean();

    // Recent lost & found — latest 3 unresolved
    const recentLostFound = await LostFoundItem.find({ isResolved: false })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('postedBy', 'name profilePhoto')
      .lean();

    // Campus announcements — latest 5 posts
    const campusAnnouncements = await CampusPost.find({ type: 'announcement' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('postedBy', 'name profilePhoto')
      .lean();

    // User notifications
    const user = await User.findById(userId).select('notifications');
    const notifications = (user.notifications || []).slice(-20).reverse();

    return res.json({
      success: true,
      data: {
        upcomingDeadlines,
        recentNotes,
        expenseSummary,
        recentMarketplaceItems,
        recentLostFound,
        campusAnnouncements,
        notifications,
      },
    });
  } catch (err) {
    next(err);
  }
};
