const express = require('express');
const router = express.Router();
const {
  getLocalServices, createLocalService, getLocalService, updateLocalService,
  deleteLocalService, addReview, getNearbyServices, localValidation,
} = require('../controllers/localController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

// Specific before /:id
router.get('/nearby', protect, getNearbyServices);

router.get('/', getLocalServices);
router.post('/', protect, localValidation, validate, createLocalService);
router.get('/:id', getLocalService);
router.put('/:id', protect, updateLocalService);
router.delete('/:id', protect, deleteLocalService);
router.post('/:id/review', protect, addReview);

module.exports = router;
