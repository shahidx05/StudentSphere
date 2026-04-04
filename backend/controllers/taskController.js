const Task = require('../models/Task');

// @desc    Get all tasks for logged-in user
// @route   GET /api/tasks
exports.getTasks = async (req, res, next) => {
  try {
    const { status, priority, subject, page, limit } = req.query;
    const filter = { userId: req.user._id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (subject) filter.subject = { $regex: subject, $options: 'i' };

    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 20;
    const total = await Task.countDocuments(filter);

    const tasks = await Task.find(filter)
      .sort({ deadline: 1, createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l);

    return res.json({
      success: true,
      data: tasks,
      pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get task stats for logged-in user
// @route   GET /api/tasks/stats
exports.getTaskStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [statusCounts, upcomingDeadlines] = await Promise.all([
      Task.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.find({
        userId,
        status: { $ne: 'completed' },
        deadline: { $gte: now, $lte: in7Days },
      })
        .sort({ deadline: 1 })
        .limit(5)
        .lean(),
    ]);

    const stats = { pending: 0, 'in-progress': 0, completed: 0 };
    statusCounts.forEach(({ _id, count }) => { stats[_id] = count; });

    return res.json({ success: true, data: { stats, upcomingDeadlines } });
  } catch (err) {
    next(err);
  }
};

// @desc    Create task
// @route   POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, subject, deadline, priority } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required.' });

    const task = await Task.create({
      userId: req.user._id,
      title,
      description,
      subject,
      deadline: deadline ? new Date(deadline) : undefined,
      priority,
    });

    return res.status(201).json({ success: true, message: 'Task created.', data: task });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    return res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// @desc    Update task
// @route   PATCH /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    return res.json({ success: true, message: 'Task updated.', data: task });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    return res.json({ success: true, message: 'Task deleted.' });
  } catch (err) {
    next(err);
  }
};
