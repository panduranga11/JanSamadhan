const cloudinary = require('cloudinary').v2;
const pool = require('../../config/db');
const { sendSuccess, sendError } = require('../../utils/responseHelper');
const { uploadToCloudinary } = require('../../services/complaintService');

const getProfile = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, full_name, email, phone, address, role, department, status, avatar_url, auth_provider, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );
    if (!rows.length) return sendError(res, 'User not found.', 404);
    return sendSuccess(res, rows[0]);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { fullName, full_name, phone, address } = req.body;
    const name = fullName || full_name; // frontend sends full_name
    if (!name) return sendError(res, 'Full name is required.', 400);
    await pool.query(
      'UPDATE users SET full_name = ?, phone = ?, address = ? WHERE id = ?',
      [name, phone || null, address || null, req.user.id]
    );
    const [rows] = await pool.query(
      `SELECT id, full_name, email, phone, address, role, department, status, avatar_url FROM users WHERE id = ?`,
      [req.user.id]
    );
    return sendSuccess(res, rows[0], 'Profile updated.');
  } catch (err) {
    next(err);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 'No file uploaded.', 400);
    const avatarUrl = await uploadToCloudinary(req.file.buffer);
    await pool.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, req.user.id]);
    return sendSuccess(res, { avatarUrl }, 'Avatar updated.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, uploadAvatar };
