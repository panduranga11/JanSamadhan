const authService = require('../../services/authService');
const { sendSuccess, sendError } = require('../../utils/responseHelper');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return sendSuccess(res, result, 'Registration successful.', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return sendSuccess(res, result, 'Login successful.');
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  // JWT is stateless — token invalidated client-side
  return sendSuccess(res, null, 'Logged out successfully.');
};

const googleCallback = (req, res) => {
  try {
    const token = authService.handleGoogleUser(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};

/**
 * POST /api/auth/forgot-password
 * Always responds 200 (prevents email enumeration).
 */
const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword({ email: req.body.email });
    return sendSuccess(
      res,
      null,
      'If an account with that email exists, a password reset link has been sent.'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/reset-password
 * Validates token + sets new password.
 */
const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword({ token: req.body.token, password: req.body.password });
    return sendSuccess(res, null, 'Password reset successfully. You can now log in.');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, googleCallback, forgotPassword, resetPassword };

