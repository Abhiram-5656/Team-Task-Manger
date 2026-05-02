const express = require('express');
const { body } = require('express-validator');
const { createProject, getProjects, getProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

const projectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description max 500 chars'),
  body('status').optional().isIn(['active', 'completed', 'on-hold']).withMessage('Invalid status')
];

router.post('/', protect, adminOnly, projectValidation, validate, createProject);
router.get('/', protect, getProjects);
router.get('/:id', protect, getProject);
router.put('/:id', protect, adminOnly, projectValidation, validate, updateProject);
router.delete('/:id', protect, adminOnly, deleteProject);

module.exports = router;
