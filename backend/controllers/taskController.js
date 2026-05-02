const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc  Create task
// @route POST /api/tasks
// @access Private/Admin
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, project, assignedTo } = req.body;

    // Verify project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) return res.status(404).json({ success: false, message: 'Project not found' });

    const task = await Task.create({
      title, description, status, priority, dueDate,
      project, assignedTo, createdBy: req.user._id
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('project', 'name');
    await task.populate('createdBy', 'name email');

    res.status(201).json({ success: true, message: 'Task created', task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all tasks (admin gets all, member gets assigned tasks)
// @route GET /api/tasks
// @access Private
const getTasks = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query = { assignedTo: req.user._id };
    }

    const { project, status, priority } = req.query;
    if (project) query.project = project;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('project', 'name status')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single task
// @route GET /api/tasks/:id
// @access Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('project', 'name status')
      .populate('createdBy', 'name email');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Members can only see their tasks
    if (req.user.role !== 'admin' && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update task (admin: all fields; member: status only)
// @route PUT /api/tasks/:id
// @access Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (req.user.role !== 'admin') {
      // Members can only update status of their tasks
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      const { status } = req.body;
      task.status = status || task.status;
    } else {
      // Admin can update all fields
      const { title, description, status, priority, dueDate, project, assignedTo } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate) task.dueDate = dueDate;
      if (project) task.project = project;
      if (assignedTo) task.assignedTo = assignedTo;
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('project', 'name');
    await task.populate('createdBy', 'name email');

    res.json({ success: true, message: 'Task updated', task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete task
// @route DELETE /api/tasks/:id
// @access Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };
