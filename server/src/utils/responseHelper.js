/**
 * Send a standardized success response
 * @param {import('express').Response} res
 * @param {*} data
 * @param {string} [message]
 * @param {number} [statusCode=200]
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send a standardized error response
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [statusCode=500]
 */
const sendError = (res, message = 'Internal Server Error', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = { sendSuccess, sendError };
