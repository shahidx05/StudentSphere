const { body } = require('express-validator');
const Transaction = require('../models/Transaction');

// @desc    Get all transactions (filtered + paginated)
// @route   GET /api/finance/transactions
exports.getTransactions = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, page, limit, sortBy, order } = req.query;
    const filter = { user: req.user._id };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const sortField = sortBy || 'date';
    const sortOrder = order === 'asc' ? 1 : -1;

    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;
    const total = await Transaction.countDocuments(filter);

    const transactions = await Transaction.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((p - 1) * l)
      .limit(l);

    return res.json({
      success: true,
      data: transactions,
      pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add transaction
// @route   POST /api/finance/transactions
exports.createTransaction = async (req, res, next) => {
  try {
    const { type, amount, description, category, date } = req.body;
    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount,
      description,
      category,
      date: date || new Date(),
    });

    return res.status(201).json({ success: true, message: 'Transaction added.', data: transaction });
  } catch (err) {
    next(err);
  }
};

// @desc    Update transaction
// @route   PUT /api/finance/transactions/:id
exports.updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found.' });

    const { type, amount, description, category, date } = req.body;
    Object.assign(transaction, { type, amount, description, category, date });
    await transaction.save();

    return res.json({ success: true, message: 'Transaction updated.', data: transaction });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/finance/transactions/:id
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found.' });

    return res.json({ success: true, message: 'Transaction deleted.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Daily summary
// @route   GET /api/finance/summary/daily
exports.getDailySummary = async (req, res, next) => {
  try {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const result = await Transaction.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);

    const summary = { income: 0, expense: 0, balance: 0 };
    result.forEach((r) => (summary[r._id] = r.total));
    summary.balance = summary.income - summary.expense;

    return res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};

// @desc    Monthly summary grouped by date
// @route   GET /api/finance/summary/monthly
exports.getMonthlySummary = async (req, res, next) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const result = await Transaction.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { day: { $dayOfMonth: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.day': 1 } },
    ]);

    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// @desc    Yearly summary grouped by month
// @route   GET /api/finance/summary/yearly
exports.getYearlySummary = async (req, res, next) => {
  try {
    const matchStage = { user: req.user._id };

    // If year param given, filter to that year; otherwise return ALL transactions
    if (req.query.year) {
      const year = parseInt(req.query.year);
      matchStage.date = { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31, 23, 59, 59) };
    }

    const result = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { month: { $month: '$date' }, type: '$type', year: { $year: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};


// @desc    Category breakdown (for pie chart)
// @route   GET /api/finance/analytics/category
exports.getCategoryBreakdown = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const match = { user: req.user._id, type: 'expense' };

    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    const result = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.transactionValidation = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense.'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number.'),
];
