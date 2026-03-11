const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token
 * @param {{ id: string, role: string, email: string }} payload
 * @returns {string} signed JWT
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = { generateToken };
