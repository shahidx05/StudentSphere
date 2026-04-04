const User = require('../models/User');

// @desc    Search / list all students
// @route   GET /api/social/students
exports.getStudents = async (req, res, next) => {
  try {
    const { department, branch, state, district, skills, search, page, limit } = req.query;
    const filter = { role: 'student', _id: { $ne: req.user._id } };

    if (department) filter.department = department;
    if (branch) filter.branch = branch;
    if (state) filter.state = state;
    if (district) filter.district = district;
    if (skills) {
      const skillArray = skills.split(',').map((s) => s.trim());
      filter.skills = { $in: skillArray };
    }
    if (search) filter.name = { $regex: search, $options: 'i' };

    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;
    const total = await User.countDocuments(filter);

    const students = await User.find(filter)
      .select('name department branch skills profilePhoto bio state district')
      .sort({ name: 1 })
      .skip((p - 1) * l)
      .limit(l);

    return res.json({
      success: true,
      data: students,
      pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a student's public profile
// @route   GET /api/social/students/:id
exports.getStudent = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id)
      .select('name department branch skills profilePhoto bio state district year createdAt');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    return res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// @desc    Send connection request
// @route   POST /api/social/connect/:id
exports.sendRequest = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot connect to yourself.' });
    }

    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ success: false, message: 'User not found.' });

    // Check if already connected or pending on sender side
    const senderUser = await User.findById(req.user._id);
    const existing = senderUser.connections.find((c) => c.user.toString() === targetId);
    if (existing) {
      return res.status(409).json({ success: false, message: `Connection already ${existing.status}.` });
    }

    // Add pending to both
    senderUser.connections.push({ user: targetId, status: 'pending' });
    target.connections.push({ user: req.user._id, status: 'pending' });

    // Add notification to target
    target.notifications.push({ message: `${req.user.name} sent you a connection request.` });

    await senderUser.save();
    await target.save();

    return res.json({ success: true, message: 'Connection request sent.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Accept connection request
// @route   PUT /api/social/connect/:id/accept
exports.acceptRequest = async (req, res, next) => {
  try {
    const requesterId = req.params.id;

    const me = await User.findById(req.user._id);
    const requester = await User.findById(requesterId);

    if (!requester) return res.status(404).json({ success: false, message: 'User not found.' });

    // Update my side
    const myConn = me.connections.find((c) => c.user.toString() === requesterId);
    if (!myConn) return res.status(404).json({ success: false, message: 'No pending request from this user.' });
    myConn.status = 'accepted';

    // Update requester's side
    const theirConn = requester.connections.find((c) => c.user.toString() === req.user._id.toString());
    if (theirConn) theirConn.status = 'accepted';

    requester.notifications.push({ message: `${req.user.name} accepted your connection request.` });

    await me.save();
    await requester.save();

    return res.json({ success: true, message: 'Connection accepted.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject connection request
// @route   PUT /api/social/connect/:id/reject
exports.rejectRequest = async (req, res, next) => {
  try {
    const requesterId = req.params.id;

    const me = await User.findById(req.user._id);
    const requester = await User.findById(requesterId);

    // Update my side
    const myConn = me.connections.find((c) => c.user.toString() === requesterId);
    if (myConn) myConn.status = 'rejected';

    // Update requester's side
    if (requester) {
      const theirConn = requester.connections.find((c) => c.user.toString() === req.user._id.toString());
      if (theirConn) theirConn.status = 'rejected';
      await requester.save();
    }

    await me.save();

    return res.json({ success: true, message: 'Connection rejected.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove / disconnect from a student
// @route   DELETE /api/social/connect/:id
exports.removeConnection = async (req, res, next) => {
  try {
    const otherId = req.params.id;

    const me = await User.findById(req.user._id);
    const other = await User.findById(otherId);

    me.connections = me.connections.filter((c) => c.user.toString() !== otherId);
    if (other) {
      other.connections = other.connections.filter((c) => c.user.toString() !== req.user._id.toString());
      await other.save();
    }

    await me.save();

    return res.json({ success: true, message: 'Connection removed.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all accepted connections
// @route   GET /api/social/connections
exports.getConnections = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('connections.user', 'name profilePhoto department branch skills');

    const accepted = user.connections
      .filter((c) => c.status === 'accepted')
      .map((c) => c.user);

    return res.json({ success: true, data: accepted });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all pending incoming connection requests
// @route   GET /api/social/requests
exports.getPendingRequests = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('connections.user', 'name profilePhoto department branch');

    // Pending = people who sent me a request (I haven't accepted yet - my status is pending)
    const pending = user.connections
      .filter((c) => c.status === 'pending')
      .map((c) => ({ user: c.user, status: c.status }));

    return res.json({ success: true, data: pending });
  } catch (err) {
    next(err);
  }
};
