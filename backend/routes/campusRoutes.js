const express = require('express');
const router = express.Router();
const {
  getClubs, createClub, getClub, updateClub, joinClub, leaveClub,
  getPosts, createPost, getPost, updatePost, deletePost,
  toggleLike, addComment, deleteComment,
  postValidation, clubValidation,
} = require('../controllers/campusController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');
const { uploadSingle, uploadMultiple } = require('../middleware/uploadMiddleware');
const { validate } = require('../middleware/validateMiddleware');

// Clubs
router.get('/clubs', getClubs);
router.post('/clubs', protect, isAdmin, uploadSingle('logo'), clubValidation, validate, createClub);
router.get('/clubs/:id', getClub);
router.put('/clubs/:id', protect, isAdmin, updateClub);
router.post('/clubs/:id/join', protect, joinClub);
router.post('/clubs/:id/leave', protect, leaveClub);

// Posts
router.get('/posts', getPosts);
router.post('/posts', protect, uploadMultiple('images', 5), postValidation, validate, createPost);
router.get('/posts/:id', getPost);
router.put('/posts/:id', protect, updatePost);
router.delete('/posts/:id', protect, deletePost);
router.post('/posts/:id/like', protect, toggleLike);
router.post('/posts/:id/comment', protect, addComment);
router.delete('/posts/:id/comment/:cid', protect, deleteComment);

module.exports = router;
