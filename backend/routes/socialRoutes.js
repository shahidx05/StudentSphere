const express = require('express');
const router = express.Router();
const {
  getStudents, getStudent, sendRequest, acceptRequest, rejectRequest,
  removeConnection, getConnections, getPendingRequests,
} = require('../controllers/socialController');
const { protect } = require('../middleware/authMiddleware');

router.get('/students', protect, getStudents);
router.get('/students/:id', protect, getStudent);
router.post('/connect/:id', protect, sendRequest);
router.put('/connect/:id/accept', protect, acceptRequest);
router.put('/connect/:id/reject', protect, rejectRequest);
router.delete('/connect/:id', protect, removeConnection);
router.get('/connections', protect, getConnections);
router.get('/requests', protect, getPendingRequests);

module.exports = router;
