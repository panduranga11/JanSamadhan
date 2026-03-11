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

const setPassword = async (req, res, next) => {
  try {
    const result = await authService.setPassword(req.body);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, googleCallback, setPassword };
