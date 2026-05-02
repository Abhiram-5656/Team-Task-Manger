const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc  Get dashboard stats
// @route GET /api/dashboard
// @access Private
const getDashboardStats = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user._id;
    const now = new Date();

    let taskQuery = isAdmin ? {} : { assignedTo: userId };

    const [totalTasks, completedTasks, pendingTasks, inProgressTasks] = await Promise.all([
      Task.countDocuments(taskQuery),
      Task.countDocuments({ ...taskQuery, status: 'Completed' }),
      Task.countDocuments({ ...taskQuery, status: 'Pending' }),
      Task.countDocuments({ ...taskQuery, status: 'In Progress' }),
    ]);

    const overdueTasks = await Task.countDocuments({
      ...taskQuery,
      status: { $ne: 'Completed' },
      dueDate: { $lt: now }
    });

    // Project stats (admin gets all, member gets their projects)
    let projectQuery = isAdmin ? {} : { members: userId };
    const totalProjects = await Project.countDocuments(projectQuery);

    // Total users (admin only)
    const totalUsers = isAdmin ? await User.countDocuments() : null;

    // Recent tasks
    const recentTasks = await Task.find(taskQuery)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Tasks by project (for chart)
    const tasksByProject = await Task.aggregate([
      ...(isAdmin ? [] : [{ $match: { assignedTo: userId } }]),
      {
        $group: {
          _id: '$project',
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project'
        }
      },
      { $unwind: '$project' },
      { $project: { projectName: '$project.name', total: 1, completed: 1, pending: 1, inProgress: 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        totalProjects,
        totalUsers,
        recentTasks,
        tasksByProject
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats };
