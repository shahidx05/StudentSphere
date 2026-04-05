const express = require('express');
const router = express.Router();
const {
  getResources, createResource, getResource, updateResource, deleteResource,
  incrementDownload, getLearningPaths, getLearningPath, resourceValidation,
  toggleBookmark, getBookmarkedResources,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const { validate } = require('../middleware/validateMiddleware');

// Learning paths (must come before /:id to avoid route conflicts)
router.get('/learning-paths', getLearningPaths);
router.get('/learning-paths/:slug', getLearningPath);

// Bookmarks (must come before /:id to avoid route conflicts)
router.get('/bookmarks/me', protect, getBookmarkedResources);

// My resources (must come before /:id)
router.get('/mine', protect, async (req, res) => {
  try {
    const Resource = require('../models/Resource');
    const items = await Resource.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 })
      .select('title subject type downloads bookmarks createdAt fileUrl');
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/', getResources);
router.post('/', protect, uploadSingle('file'), resourceValidation, validate, createResource);
router.get('/:id', getResource);
router.put('/:id', protect, updateResource);
router.delete('/:id', protect, deleteResource);
router.patch('/:id/download', incrementDownload);
router.post('/:id/bookmark', protect, toggleBookmark);

module.exports = router;
