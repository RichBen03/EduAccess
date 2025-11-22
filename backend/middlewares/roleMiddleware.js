/**
 * Middleware to require specific roles
 */

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Specific role middleware
const requireAdmin = requireRole(['admin']);
const requireTeacher = requireRole(['teacher', 'admin']);
const requireStudent = requireRole(['student', 'teacher', 'admin', 'alumni']);

export {
  requireRole,
  requireAdmin,
  requireTeacher,
  requireStudent
};