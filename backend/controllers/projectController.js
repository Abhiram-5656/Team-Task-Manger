const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc  Create project
// @route POST /api/projects
// @access Private/Admin
const createProject = async (req, res) => {
  try {
    const { name, description, members, deadline, status } = req.body;
    const project = await Project.create({
      name,
      description,
      members: members || [],
      deadline,
      status,
      createdBy: req.user._id
    });

    await project.populate('createdBy', 'name email');
    await project.populate('members', 'name email role');

    res.status(201).json({ success: true, message: 'Project created', project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all projects (admin gets all, member gets own)
// @route GET /api/projects
// @access Private
const getProjects = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query = { members: req.user._id };
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: projects.length, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single project
// @route GET /api/projects/:id
// @access Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Members can only see their projects
    if (req.user.role !== 'admin' && !project.members.some(m => m._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update project
// @route PUT /api/projects/:id
// @access Private/Admin
const updateProject = async (req, res) => {
  try {
    const { name, description, members, deadline, status } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, members, deadline, status },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    res.json({ success: true, message: 'Project updated', project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete project (also deletes associated tasks)
// @route DELETE /api/projects/:id
// @access Private/Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Delete all tasks associated with the project
    await Task.deleteMany({ project: req.params.id });

    res.json({ success: true, message: 'Project and associated tasks deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createProject, getProjects, getProject, updateProject, deleteProject };
