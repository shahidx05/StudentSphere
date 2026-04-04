const express = require('express');
const router = express.Router();
const {
  getTasks, getTaskStats, createTask, getTask, updateTask, deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getTaskStats); // must come BEFORE /:id
router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
