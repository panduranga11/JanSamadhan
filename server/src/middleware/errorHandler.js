const logger = require('../utils/logger');

/**
 * Centralized error handler — must be last middleware in app.js
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status  = err.status || 500;
  // In production, don't expose internal 500 error details
  const message = (status >= 500 && process.env.NODE_ENV === 'production')
    ? 'An internal server error occurred. Please try again later.'
    : err.message || 'Internal Server Error';

  logger.error(`${status} - ${err.message} - ${req.method} ${req.originalUrl}`);

  // Handle Multer errors specifically
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, error: 'File too large. Maximum is 5MB.' });
  }

  res.status(status).json({ success: false, error: message });
};

module.exports = errorHandler;
