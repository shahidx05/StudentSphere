const express = require('express');
const router = express.Router();
const {
  getTransactions, createTransaction, updateTransaction, deleteTransaction,
  getDailySummary, getMonthlySummary, getYearlySummary, getCategoryBreakdown,
  transactionValidation,
} = require('../controllers/financeController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

// Summaries & analytics (specific routes before /:id)
router.get('/summary/daily', protect, getDailySummary);
router.get('/summary/monthly', protect, getMonthlySummary);
router.get('/summary/yearly', protect, getYearlySummary);
router.get('/analytics/category', protect, getCategoryBreakdown);

// Transactions CRUD
router.get('/transactions', protect, getTransactions);
router.post('/transactions', protect, transactionValidation, validate, createTransaction);
router.put('/transactions/:id', protect, updateTransaction);
router.delete('/transactions/:id', protect, deleteTransaction);

module.exports = router;
