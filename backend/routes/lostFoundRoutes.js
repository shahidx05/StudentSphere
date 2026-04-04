const express = require('express');
const router = express.Router();
const {
  getItems, createItem, getItem, updateItem, deleteItem, resolveItem,
  lostFoundValidation,
} = require('../controllers/lostFoundController');
const { protect } = require('../middleware/authMiddleware');
const { uploadMultiple } = require('../middleware/uploadMiddleware');
const { validate } = require('../middleware/validateMiddleware');

router.get('/', getItems);
router.post('/', protect, uploadMultiple('images', 3), lostFoundValidation, validate, createItem);
router.get('/:id', getItem);
router.put('/:id', protect, uploadMultiple('images', 3), updateItem);
router.delete('/:id', protect, deleteItem);
router.patch('/:id/resolve', protect, resolveItem);

module.exports = router;
