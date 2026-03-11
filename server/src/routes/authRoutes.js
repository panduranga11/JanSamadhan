const express  = require('express');
const router   = express.Router();
const passport = require('passport');
const jwt      = require('jsonwebtoken');

const {
  register, login, logout, googleCallback, setPassword,
} = require('../controllers/user/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { loginLimiter, registerLimiter, oauthLimiter } = require('../middleware/rateLimiter');

// Email + Password
router.post('/register', registerLimiter, register);
router.post('/login',    loginLimiter,    login);
router.post('/logout',   verifyToken,     logout);

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

// Set password (Google-only users)
router.post('/set-password', setPassword);

module.exports = router;
