const { sendError } = require('../utils/responseHelper');

/**
 * Allow admins and super_admins
 */
const adminOnly = (req, res, next) => {
  if (!req.user) return sendError(res, 'Unauthorized.', 401);
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    return next();
  }
  return sendError(res, 'Access denied. Admins only.', 403);
};

/**
 * Allow super_admin only
 */
const superAdminOnly = (req, res, next) => {
  if (!req.user) return sendError(res, 'Unauthorized.', 401);
  if (req.user.role === 'super_admin') {
    return next();
  }
  return sendError(res, 'Access denied. Super Admin only.', 403);
};

module.exports = { adminOnly, superAdminOnly };
