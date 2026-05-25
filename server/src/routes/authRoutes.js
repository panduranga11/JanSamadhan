const express  = require('express');
const router   = express.Router();
const passport = require('passport');

const {
  register, login, logout, googleCallback, forgotPassword, resetPassword,
} = require('../controllers/user/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { loginLimiter, registerLimiter, oauthLimiter, forgotLimiter } = require('../middleware/rateLimiter');

// Email + Password
router.post('/register', registerLimiter, register);
router.post('/login',    loginLimiter,    login);
router.post('/logout',   verifyToken,     logout);

// Forgot / Reset Password (public, rate-limited)
router.post('/forgot-password', forgotLimiter, forgotPassword);
router.post('/reset-password',  forgotLimiter, resetPassword);

// Google OAuth
router.get('/google',
  oauthLimiter,
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
    session: false,
  }),
  googleCallback
);

module.exports = router;
