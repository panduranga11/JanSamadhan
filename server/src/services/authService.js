const bcrypt  = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const Joi     = require('joi');
const pool    = require('../config/db');
const { generateToken } = require('../utils/generateToken');

// ── Joi Schemas ──────────────────────────────────────────
const registerSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).pattern(/^[a-zA-Z\s]+$/).required(),
  email:    Joi.string().email().max(150).required(),
  password: Joi.string().min(8).pattern(/^(?=.*[A-Z])(?=.*\d)/).required()
    .messages({
      'string.pattern.base': 'Password must have at least 1 uppercase letter and 1 number.',
    }),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

// ── Helpers ──────────────────────────────────────────────
const safeUser = (user) => {
  const { password, ...rest } = user;
  return rest;
};

// ── Service Functions ─────────────────────────────────────

/**
 * Register a new user with email + password
 */
const register = async ({ fullName, email, password }) => {
  const { error } = registerSchema.validate({ fullName, email, password });
  if (error) throw { status: 400, message: error.details[0].message };

  // Check duplicate email
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) throw { status: 409, message: 'Email already registered.' };

  const hashedPassword = await bcrypt.hash(password, 12);
  const id = uuidv4();

  await pool.query(
    `INSERT INTO users (id, full_name, email, password, auth_provider, role)
     VALUES (?, ?, ?, ?, 'local', 'user')`,
    [id, fullName, email, hashedPassword]
  );

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  const user = rows[0];
  const token = generateToken({ id: user.id, role: user.role, email: user.email, department: user.department || null });

  return { user: safeUser(user), token };
};

/**
 * Login with email + password
 */
const login = async ({ email, password }) => {
  const { error } = loginSchema.validate({ email, password });
  if (error) throw { status: 400, message: error.details[0].message };

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];

  if (!user) throw { status: 401, message: 'Invalid email or password.' };

  // Google-only account
  if (!user.password && user.auth_provider === 'google') {
    throw {
      status: 401,
      message: 'This account uses Google Sign-In. Use the Google button or set a password first.',
    };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { status: 401, message: 'Invalid email or password.' };

  if (user.status === 'banned') {
    throw { status: 403, message: 'Your account has been banned. Contact support.' };
  }
  if (user.status === 'inactive') {
    throw { status: 403, message: 'Your account is inactive.' };
  }

  const token = generateToken({ id: user.id, role: user.role, email: user.email, department: user.department || null });
  return { user: safeUser(user), token };
};

/**
 * Handle Google OAuth user (called after Passport verifies)
 */
const handleGoogleUser = (user) => {
  const token = generateToken({ id: user.id, role: user.role, email: user.email, department: user.department || null });
  return token;
};

/**
 * Set password for Google-only users (stub — full OTP flow requires email service)
 */
const setPassword = async ({ email, newPassword }) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];
  if (!user) throw { status: 404, message: 'User not found.' };
  if (user.auth_provider === 'local') throw { status: 400, message: 'Account already has a password.' };

  const schema = Joi.string().min(8).pattern(/^(?=.*[A-Z])(?=.*\d)/);
  const { error } = schema.validate(newPassword);
  if (error) throw { status: 400, message: 'Password must have at least 8 chars, 1 uppercase, 1 number.' };

  const hashed = await bcrypt.hash(newPassword, 12);
  await pool.query(
    `UPDATE users SET password = ?, auth_provider = 'both' WHERE email = ?`,
    [hashed, email]
  );

  return { message: 'Password set successfully. You can now log in with either method.' };
};

module.exports = { register, login, handleGoogleUser, setPassword };
