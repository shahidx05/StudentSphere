const express = require('express');
const router = express.Router();
const { getMyPass, generatePass } = require('../controllers/campusPassController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/me', getMyPass);
router.post('/generate', generatePass);

module.exports = router;
