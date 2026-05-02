const express = require('express');
const { body } = require('express-validator');
const { createTask, getTasks, getTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required')
    .isLength({ min: 2, max: 150 }).withMessage('Title must be 2-150 characters'),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('dueDate').notEmpty().withMessage('Due date is required').isISO8601().withMessage('Invalid date'),
  body('project').notEmpty().withMessage('Project is required').isMongoId().withMessage('Invalid project ID'),
  body('assignedTo').notEmpty().withMessage('Assigned user is required').isMongoId().withMessage('Invalid user ID')
];

router.post('/', protect, adminOnly, taskValidation, validate, createTask);
router.get('/', protect, getTasks);
router.get('/:id', protect, getTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, adminOnly, deleteTask);

module.exports = router;
