const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc  Get dashboard stats
// @route GET /api/dashboard
const getDashboard = async (req, res) => {
  try {
    // Get all projects user is part of
    const projects = await Project.find({ 'members.user': req.user._id });
    const projectIds = projects.map(p => p._id);

    // Aggregate task stats
    const [totalTasks, todoTasks, inProgressTasks, doneTasks] = await Promise.all([
      Task.countDocuments({ project: { $in: projectIds } }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'todo' }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'in-progress' }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'done' })
    ]);

    // Overdue tasks (dueDate < now and not done)
    const overdueTasks = await Task.countDocuments({
      project: { $in: projectIds },
      status: { $ne: 'done' },
      dueDate: { $lt: new Date(), $ne: null }
    });

    // Tasks assigned to me
    const myTasks = await Task.find({
      assignedTo: req.user._id,
      status: { $ne: 'done' }
    })
      .populate('project', 'name color')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1, createdAt: -1 })
      .limit(10);

    // Recent tasks across all projects
    const recentTasks = await Task.find({ project: { $in: projectIds } })
      .populate('project', 'name color')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(8);

    // Priority breakdown
    const highPriority = await Task.countDocuments({
      project: { $in: projectIds },
      priority: 'high',
      status: { $ne: 'done' }
    });

    res.json({
      stats: {
        totalProjects: projects.length,
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        overdueTasks,
        highPriority
      },
      myTasks,
      recentTasks
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboard };
