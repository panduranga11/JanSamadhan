const rateLimit = require('express-rate-limit');

/** 5 login attempts per 15 minutes per IP */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts. Please try again in 15 minutes.' },
});

/** 10 register attempts per hour per IP */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many registration attempts. Please try again later.' },
});

/** 20 OAuth attempts per hour per IP */
const oauthLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many OAuth attempts. Please try again later.' },
});

/** 200 general API requests per 15 min per IP */
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please slow down.' },
});

module.exports = { loginLimiter, registerLimiter, oauthLimiter, generalLimiter };
