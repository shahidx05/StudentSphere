const express = require('express');
const router = express.Router();
const {
  getItems, createItem, getItem, updateItem, deleteItem, resolveItem,
  lostFoundValidation, getStats,
} = require('../controllers/lostFoundController');
const { protect } = require('../middleware/authMiddleware');
const { uploadMultiple } = require('../middleware/uploadMiddleware');
const { validate } = require('../middleware/validateMiddleware');

// uploadMultiple now handles multer + Cloudinary upload + error handling internally
router.get('/stats', getStats);
router.get('/', getItems);
router.post('/', protect, uploadMultiple('images', 5), lostFoundValidation, validate, createItem);
router.get('/:id', getItem);
router.put('/:id', protect, uploadMultiple('images', 5), updateItem);
router.delete('/:id', protect, deleteItem);
router.patch('/:id/resolve', protect, resolveItem);

module.exports = router;
