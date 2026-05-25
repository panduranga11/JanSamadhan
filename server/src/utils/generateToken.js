const jwt = require('jsonwebtoken');

/**
 * Token expiry based on role:
 *  - admin / super_admin → short-lived (1h) for security
 *  - user                → standard (7d) for convenience
 */
const EXPIRY_BY_ROLE = {
  super_admin: process.env.JWT_ADMIN_EXPIRES_IN || '1h',
  admin:       process.env.JWT_ADMIN_EXPIRES_IN || '1h',
  user:        process.env.JWT_EXPIRES_IN       || '7d',
};

/**
 * Generate a signed JWT token with role-based expiry
 * @param {{ id: string, role: string, email: string, department?: string }} payload
 * @returns {string} signed JWT
 */
const generateToken = (payload) => {
  const expiresIn = EXPIRY_BY_ROLE[payload.role] || '7d';
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

module.exports = { generateToken };
