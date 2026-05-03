const express = require('express');
const { body } = require('express-validator');
const {
  createTask, getProjectTasks,
  updateTask, updateTaskStatus, deleteTask
} = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(authenticate);

// Project-scoped task routes (mounted at /api/projects/:id/tasks)
router.post('/', [
  body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 200 })
], createTask);

router.get('/', getProjectTasks);

module.exports = router;
