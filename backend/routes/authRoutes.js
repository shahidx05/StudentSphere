const express = require('express');
const router = express.Router();
const {
  register, login, getMe, updateProfile, updateSkills,
  changePassword, uploadPhoto,
  registerValidation, loginValidation,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const { validate } = require('../middleware/validateMiddleware');

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/update-skills', protect, updateSkills);
router.put('/change-password', protect, changePassword);

// Upload photo — uploadSingle handles multer + Cloudinary + errors internally
router.post('/upload-photo', protect, uploadSingle('photo'), uploadPhoto);

module.exports = router;
