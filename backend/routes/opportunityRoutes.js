const express = require('express');
const router = express.Router();
const {
  getOpportunities, createOpportunity, getOpportunity, updateOpportunity,
  deleteOpportunity, getUpcomingDeadlines, opportunityValidation,
  toggleSaveOpportunity, getSavedOpportunities,
} = require('../controllers/opportunityController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');

// Specific before /:id
router.get('/upcoming/deadlines', protect, getUpcomingDeadlines);
router.get('/saved/me', protect, getSavedOpportunities);

router.get('/', getOpportunities);
router.post('/', protect, isAdmin, opportunityValidation, validate, createOpportunity);
router.get('/:id', getOpportunity);
router.put('/:id', protect, isAdmin, updateOpportunity);
router.delete('/:id', protect, isAdmin, deleteOpportunity);
router.post('/:id/save', protect, toggleSaveOpportunity);

module.exports = router;
