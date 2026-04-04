const express = require('express');
const router = express.Router();
const {
  getListings, createListing, getListing, updateListing, deleteListing,
  updateStatus, getMyListings, marketplaceValidation,
} = require('../controllers/marketplaceController');
const { protect } = require('../middleware/authMiddleware');
const { uploadMultiple } = require('../middleware/uploadMiddleware');
const { validate } = require('../middleware/validateMiddleware');

// Specific before /:id
router.get('/my-listings', protect, getMyListings);

router.get('/', getListings);
router.post('/', protect, uploadMultiple('images', 5), marketplaceValidation, validate, createListing);
router.get('/:id', getListing);
router.put('/:id', protect, uploadMultiple('images', 5), updateListing);
router.delete('/:id', protect, deleteListing);
router.patch('/:id/status', protect, updateStatus);

module.exports = router;
