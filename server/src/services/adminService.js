const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const Joi    = require('joi');
const pool   = require('../config/db');

/**
 * Get admin dashboard stats — scoped to department if provided
 */
const getDashboardStats = async ({ department } = {}) => {
  const deptFilter = department ? 'WHERE cat.name = ?' : '';
  const deptParams = department ? [department] : [];

  const [[counts]] = await pool.query(
    `SELECT
       COUNT(*)                                                  AS totalComplaints,
       SUM(c.status = 'Pending')                                AS pending,
       SUM(c.status = 'In Progress')                            AS inProgress,
       SUM(c.status = 'Resolved')                               AS resolved,
       SUM(c.status = 'Rejected')                               AS rejected
     FROM complaints c
     LEFT JOIN categories cat ON c.category_id = cat.id
     ${department ? 'WHERE cat.name = ?' : ''}`,
    deptParams
  );

  const [[userCount]] = await pool.query(
    `SELECT COUNT(*) AS totalUsers FROM users WHERE role = 'user'`
  );

  const [recentActivity] = await pool.query(
    `SELECT al.action, al.created_at AS timestamp,
            u.full_name AS adminName,
            c.title AS complaintTitle
     FROM admin_logs al
     LEFT JOIN users u ON al.admin_id = u.id
     LEFT JOIN complaints c ON al.target_id = c.id AND al.target_type = 'complaint'
     LEFT JOIN categories cat ON c.category_id = cat.id
     ${department ? 'WHERE al.target_type != "complaint" OR cat.name = ?' : ''}
     ORDER BY al.created_at DESC
     LIMIT 10`,
    department ? [department] : []
  );

  return { ...counts, totalUsers: userCount.totalUsers, recentActivity, department: department || null };
};

/**
 * Get complaints for admin view — scoped to department if provided
 */
const getAllComplaints = async (query, { department } = {}) => {
  const { status, category_id, search, page = 1, limit = 10 } = query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [];
  let where = 'WHERE 1=1';

  // Department-scope: filter via category->department name match
  if (department) {
    where += ' AND cat.name = ?';
    params.push(department);
  }
  if (status)      { where += ' AND c.status = ?';      params.push(status); }
  if (category_id) { where += ' AND c.category_id = ?'; params.push(category_id); }
  if (search)      {
    where += ' AND (c.title LIKE ? OR c.description LIKE ? OR u.full_name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const [rows] = await pool.query(
    `SELECT c.*, cat.name as category_name, u.full_name as user_name, u.email as user_email
     FROM complaints c
     LEFT JOIN categories cat ON c.category_id = cat.id
     LEFT JOIN users u ON c.user_id = u.id
     ${where}
     ORDER BY c.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), offset]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) as total FROM complaints c
     LEFT JOIN categories cat ON c.category_id = cat.id
     LEFT JOIN users u ON c.user_id = u.id ${where}`,
    params
  );

  return { complaints: rows, total, page: parseInt(page), limit: parseInt(limit) };
};

/**
 * Get all users (admin view)
 */
const getAllUsers = async (query) => {
  const { role, status, page = 1, limit = 10 } = query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [];
  let where = "WHERE role = 'user'";

  if (role)   { where += ' AND role = ?';   params.push(role); }
  if (status) { where += ' AND status = ?'; params.push(status); }

  const [rows] = await pool.query(
    `SELECT id, full_name, email, phone, role, department, status, auth_provider, created_at
     FROM users ${where}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), offset]
  );

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM users ${where}`, params);
  return { users: rows, total, page: parseInt(page), limit: parseInt(limit) };
};

/**
 * Toggle ban/unban a user
 */
const toggleBan = async ({ targetId }) => {
  const [rows] = await pool.query('SELECT id, status, role FROM users WHERE id = ?', [targetId]);
  if (!rows.length) throw { status: 404, message: 'User not found.' };
  if (rows[0].role !== 'user') throw { status: 400, message: 'Can only ban regular users.' };

  const newStatus = rows[0].status === 'banned' ? 'active' : 'banned';
  await pool.query('UPDATE users SET status = ? WHERE id = ?', [newStatus, targetId]);
  return { userId: targetId, status: newStatus };
};

/**
 * Get admin audit logs
 */
const getLogs = async ({ page = 1, limit = 20 }) => {
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const [rows] = await pool.query(
    `SELECT al.*, u.full_name as admin_name, u.email as admin_email
     FROM admin_logs al
     LEFT JOIN users u ON al.admin_id = u.id
     ORDER BY al.created_at DESC
     LIMIT ? OFFSET ?`,
    [parseInt(limit), offset]
  );
  const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM admin_logs');
  return { logs: rows, total, page: parseInt(page), limit: parseInt(limit) };
};

/**
 * Log an admin action
 */
const logAction = async ({ adminId, action, target_type, target_id, meta }) => {
  await pool.query(
    'INSERT INTO admin_logs (admin_id, action, target_type, target_id, meta) VALUES (?, ?, ?, ?, ?)',
    [adminId, action, target_type || null, target_id || null, meta ? JSON.stringify(meta) : null]
  );
};

/**
 * Create a new admin (super_admin only)
 */
const createAdmin = async ({ fullName, email, password, department }) => {
  const schema = Joi.object({
    fullName:   Joi.string().min(2).max(100).required(),
    email:      Joi.string().email().required(),
    password:   Joi.string().min(8).pattern(/^(?=.*[A-Z])(?=.*\d)/).required(),
    department: Joi.string().max(100).required(),
  });
  const { error } = schema.validate({ fullName, email, password, department });
  if (error) throw { status: 400, message: error.details[0].message };

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length) throw { status: 409, message: 'Email already in use.' };

  const hashed = await bcrypt.hash(password, 12);
  const id = uuidv4();
  await pool.query(
    `INSERT INTO users (id, full_name, email, password, role, department, auth_provider)
     VALUES (?, ?, ?, ?, 'admin', ?, 'local')`,
    [id, fullName, email, hashed, department]
  );

  const [rows] = await pool.query(
    'SELECT id, full_name, email, role, department, status FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
};

/**
 * Get analytics (super_admin)
 */
const getAnalytics = async () => {
  const [[complaints]] = await pool.query(
    `SELECT COUNT(*) AS total,
       SUM(status='Pending')     AS pending,
       SUM(status='In Progress') AS inProgress,
       SUM(status='Resolved')    AS resolved,
       SUM(status='Rejected')    AS rejected
     FROM complaints`
  );

  const [[users]] = await pool.query(
    `SELECT COUNT(*) AS total,
       SUM(role='user')        AS users,
       SUM(role='admin')       AS admins,
       SUM(status='banned')    AS banned
     FROM users`
  );

  const [byCategory] = await pool.query(
    `SELECT cat.name as category, COUNT(c.id) as count
     FROM complaints c
     LEFT JOIN categories cat ON c.category_id = cat.id
     GROUP BY c.category_id`
  );

  const [byStatus] = await pool.query(
    `SELECT status, COUNT(*) as count FROM complaints GROUP BY status`
  );

  return { complaints, users, byCategory, byStatus };
};

module.exports = {
  getDashboardStats,
  getAllComplaints,
  getAllUsers,
  toggleBan,
  getLogs,
  logAction,
  createAdmin,
  getAnalytics,
};
