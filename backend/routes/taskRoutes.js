const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
} = require('../controllers/taskController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected - require authentication
router.use(protect);

// Task CRUD routes
router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/stats')
  .get(getTaskStats);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;