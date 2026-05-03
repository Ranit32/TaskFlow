const express = require('express');
const { authenticate } = require('../middleware/auth');
const { updateTask, updateTaskStatus, deleteTask } = require('../controllers/taskController');

const router = express.Router();
router.use(authenticate);

router.put('/:id', updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', deleteTask);

module.exports = router;
