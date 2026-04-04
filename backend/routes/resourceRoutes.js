const express = require('express');
const router = express.Router();
const {
  getResources, createResource, getResource, updateResource, deleteResource,
  incrementDownload, getLearningPaths, getLearningPath, resourceValidation,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const { validate } = require('../middleware/validateMiddleware');

// Learning paths (must come before /:id to avoid route conflicts)
router.get('/learning-paths', getLearningPaths);
router.get('/learning-paths/:slug', getLearningPath);

router.get('/', getResources);
router.post('/', protect, uploadSingle('file'), resourceValidation, validate, createResource);
router.get('/:id', getResource);
router.put('/:id', protect, updateResource);
router.delete('/:id', protect, deleteResource);
router.patch('/:id/download', incrementDownload);

module.exports = router;
