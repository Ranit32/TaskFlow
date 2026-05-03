const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { requireProjectAdmin, isProjectMember } = require('../middleware/auth');

// @desc  Create task in project
// @route POST /api/projects/:id/tasks
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!requireProjectAdmin(project, req.user._id)) {
      return res.status(403).json({ message: 'Only project admins can create tasks' });
    }

    const { title, description, assignedTo, status, priority, dueDate } = req.body;

    // Validate assignedTo is a project member
    if (assignedTo) {
      const isMember = project.members.some(m => m.user.toString() === assignedTo);
      if (!isMember) {
        return res.status(400).json({ message: 'Assigned user is not a project member' });
      }
    }

    const task = await Task.create({
      title,
      description,
      project: project._id,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json({ message: 'Task created', task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Get tasks for project
// @route GET /api/projects/:id/tasks
const getProjectTasks = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, priority, assignedTo } = req.query;
    const filter = { project: project._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Update task
// @route PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const isAdmin = requireProjectAdmin(project, req.user._id);
    const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ message: 'Only admins or assignees can update tasks' });
    }

    const { title, description, assignedTo, status, priority, dueDate } = req.body;

    // Members can only update status
    if (!isAdmin) {
      if (status) task.status = status;
    } else {
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (assignedTo !== undefined) {
        if (assignedTo) {
          const isMember = project.members.some(m => m.user.toString() === assignedTo);
          if (!isMember) return res.status(400).json({ message: 'Assigned user is not a member' });
        }
        task.assignedTo = assignedTo || null;
      }
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.json({ message: 'Task updated', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Update task status only
// @route PATCH /api/tasks/:id/status
const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status } = req.body;
    if (!['todo', 'in-progress', 'done'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    task.status = status;
    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.json({ message: 'Status updated', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Delete task
// @route DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!requireProjectAdmin(project, req.user._id)) {
      return res.status(403).json({ message: 'Only admins can delete tasks' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createTask, getProjectTasks, updateTask, updateTaskStatus, deleteTask };
