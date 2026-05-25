const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');
const { sendError } = require('../utils/responseHelper');

/**
 * Middleware: verify JWT from Authorization: Bearer header
 * Attaches decoded payload to req.user
 * Re-validates user status from DB to catch banned/inactive users
 * even if their token hasn't expired yet.
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Access denied. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Re-check user status in DB — catches banned/deleted users mid-session
    const [rows] = await pool.query(
      'SELECT id, role, status, department FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!rows.length) {
      return sendError(res, 'Account no longer exists.', 401);
    }

    const user = rows[0];

    if (user.status === 'banned') {
      return sendError(res, 'Your account has been banned. Contact support.', 403);
    }
    if (user.status === 'inactive') {
      return sendError(res, 'Your account is inactive.', 403);
    }

    // Use fresh DB values for role & department (in case they changed after token was issued)
    req.user = {
      ...decoded,
      role:       user.role,
      department: user.department,
      status:     user.status,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired. Please login again.', 401);
    }
    return sendError(res, 'Invalid token.', 401);
  }
};

module.exports = { verifyToken };
