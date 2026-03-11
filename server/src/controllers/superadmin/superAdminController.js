const adminService = require('../../services/adminService');
const pool = require('../../config/db');
const { sendSuccess, sendError } = require('../../utils/responseHelper');

const createAdmin = async (req, res, next) => {
  try {
    const admin = await adminService.createAdmin(req.body);
    await adminService.logAction({
      adminId:     req.user.id,
      action:     'Created new admin account',
      target_type: 'user',
      target_id:   admin.id,
      meta:        { email: admin.email, department: admin.department },
    });
    return sendSuccess(res, admin, 'Admin created.', 201);
  } catch (err) {
    next(err);
  }
};

const listAdmins = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, full_name, email, role, department, status, created_at
       FROM users WHERE role = 'admin' ORDER BY created_at DESC`
    );
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};

const updateAdmin = async (req, res, next) => {
  try {
    const { department, status } = req.body;
    const [existing] = await pool.query(`SELECT id FROM users WHERE id = ? AND role = 'admin'`, [req.params.id]);
    if (!existing.length) return sendError(res, 'Admin not found.', 404);

    await pool.query(
      'UPDATE users SET department = ?, status = ? WHERE id = ?',
      [department, status, req.params.id]
    );

    await adminService.logAction({
      adminId:     req.user.id,
      action:     'Updated admin account',
      target_type: 'user',
      target_id:   req.params.id,
      meta:        { department, status },
    });

    return sendSuccess(res, null, 'Admin updated.');
  } catch (err) {
    next(err);
  }
};

const deleteAdmin = async (req, res, next) => {
  try {
    const [existing] = await pool.query(`SELECT id FROM users WHERE id = ? AND role = 'admin'`, [req.params.id]);
    if (!existing.length) return sendError(res, 'Admin not found.', 404);

    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    await adminService.logAction({
      adminId:     req.user.id,
      action:     'Deleted admin account',
      target_type: 'user',
      target_id:   req.params.id,
    });

    return sendSuccess(res, null, 'Admin deleted.');
  } catch (err) {
    next(err);
  }
};

const listCategories = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};

const addCategory = async (req, res, next) => {
  try {
    const { name, icon, department_id } = req.body;
    if (!name) return sendError(res, 'Category name is required.', 400);
    await pool.query(
      'INSERT INTO categories (name, icon, department_id) VALUES (?, ?, ?)',
      [name, icon || null, department_id || null]
    );
    return sendSuccess(res, null, 'Category added.', 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return sendError(res, 'Category already exists.', 409);
    next(err);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const result = await adminService.getAnalytics();
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

const getSuperAdminLogs = async (req, res, next) => {
  try {
    const result = await adminService.getLogs(req.query);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createAdmin, listAdmins, updateAdmin, deleteAdmin,
  listCategories, addCategory, getAnalytics, getSuperAdminLogs,
};
