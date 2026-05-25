const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');
const { v4: uuidv4 } = require('uuid');
const Joi     = require('joi');
const pool    = require('../config/db');
const { generateToken }        = require('../utils/generateToken');
const { sendPasswordResetEmail } = require('./emailService');

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
      message: 'This account was created with Google Sign-In. Use the "Continue with Google" button, or click "Forgot Password" to set a password.',
      hint: 'google_only',
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

// ── Token expiry ──────────────────────────────────────────
const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

/** Auto-create the reset-tokens table if it doesn't exist (idempotent) */
let _tableReady = false;
const ensureResetTable = async () => {
  if (_tableReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id     VARCHAR(36)  NOT NULL,
      token_hash  VARCHAR(64)  NOT NULL UNIQUE,
      expires_at  DATETIME     NOT NULL,
      created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  _tableReady = true;
};

/**
 * Forgot Password — generate a reset token and email it.
 * Always responds with 200 (never reveals whether email exists).
 */
const forgotPassword = async ({ email }) => {
  const { error } = Joi.string().email().required().validate(email);
  if (error) throw { status: 400, message: 'Please enter a valid email address.' };

  await ensureResetTable();

  const [rows] = await pool.query('SELECT id, full_name, email FROM users WHERE email = ?', [email]);

  // Silently succeed even if email not found (prevents user enumeration)
  if (!rows.length) return;

  const user = rows[0];

  // Generate a cryptographically secure random token
  const rawToken  = crypto.randomBytes(32).toString('hex');          // sent in email
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex'); // stored in DB
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  // Remove any prior tokens for this user, then insert new one
  await pool.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [user.id]);
  await pool.query(
    'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [user.id, tokenHash, expiresAt]
  );

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail({ to: user.email, name: user.full_name, resetUrl });
};

/**
 * Reset Password — validate token and set new password.
 */
const resetPassword = async ({ token, password }) => {
  const schema = Joi.object({
    token:    Joi.string().hex().length(64).required(),
    password: Joi.string().min(8).pattern(/^(?=.*[A-Z])(?=.*\d)/).required()
      .messages({ 'string.pattern.base': 'Password must have at least 1 uppercase letter and 1 number.' }),
  });
  const { error } = schema.validate({ token, password });
  if (error) throw { status: 400, message: error.details[0].message };

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const [rows] = await pool.query(
    'SELECT * FROM password_reset_tokens WHERE token_hash = ? AND expires_at > NOW()',
    [tokenHash]
  );

  if (!rows.length) {
    throw { status: 400, message: 'This reset link is invalid or has expired. Please request a new one.' };
  }

  const { user_id } = rows[0];
  const hashed = await bcrypt.hash(password, 12);

  // Update password and ensure auth_provider allows local login
  await pool.query(
    `UPDATE users
     SET    password = ?,
            auth_provider = CASE
              WHEN auth_provider = 'google' THEN 'both'
              ELSE auth_provider
            END
     WHERE  id = ?`,
    [hashed, user_id]
  );

  // Invalidate the used token
  await pool.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [user_id]);
};

module.exports = { register, login, handleGoogleUser, forgotPassword, resetPassword };
