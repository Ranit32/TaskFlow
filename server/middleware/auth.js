const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Token invalid, user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please login again' });
    }
    return res.status(401).json({ message: 'Token invalid' });
  }
};

// Require global admin role (for system-level actions)
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin role required' });
  }
  next();
};

// Require project-level admin (owner or admin member)
const requireProjectAdmin = (project, userId) => {
  if (!project) return false;
  
  const ownerId = project.owner._id ? project.owner._id.toString() : project.owner.toString();
  if (ownerId === userId.toString()) return true;
  
  const member = project.members.find(m => {
    const mUserId = m.user._id ? m.user._id.toString() : m.user.toString();
    return mUserId === userId.toString();
  });
  
  return member && member.role === 'admin';
};

// Check if user is project member
const isProjectMember = (project, userId) => {
  if (!project) return false;
  
  const ownerId = project.owner._id ? project.owner._id.toString() : project.owner.toString();
  if (ownerId === userId.toString()) return true;
  
  return project.members.some(m => {
    const mUserId = m.user._id ? m.user._id.toString() : m.user.toString();
    return mUserId === userId.toString();
  });
};

module.exports = { authenticate, requireAdmin, requireProjectAdmin, isProjectMember };
