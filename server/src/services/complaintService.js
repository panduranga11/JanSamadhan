const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const Joi        = require('joi');
const pool       = require('../config/db');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Cloudinary Upload ─────────────────────────────────────
const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'jansamadhan/complaints' },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });

// ── Joi validation ────────────────────────────────────────
const complaintSchema = Joi.object({
  title:       Joi.string().max(200).required(),
  description: Joi.string().max(2000).required(),
  category_id: Joi.number().integer().positive().required(),
  location:    Joi.string().max(500).required(),
  latitude:    Joi.number().optional().allow('', null),
  longitude:   Joi.number().optional().allow('', null),
});

// ── Service Functions ─────────────────────────────────────

/**
 * Submit a new complaint (with optional image upload)
 */
const createComplaint = async ({ userId, body, file }) => {
  const { error } = complaintSchema.validate(body);
  if (error) throw { status: 400, message: error.details[0].message };

  const { title, description, category_id, location, latitude, longitude } = body;

  // Validate category exists
  const [cats] = await pool.query('SELECT id, department_id FROM categories WHERE id = ? AND is_active = 1', [category_id]);
  if (!cats.length) throw { status: 400, message: 'Invalid or inactive category.' };

  const department_id = cats[0].department_id || null;
  const id = uuidv4();

  await pool.query(
    `INSERT INTO complaints (id, title, description, category_id, department_id, location, latitude, longitude, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, title, description, category_id, department_id, location, latitude || null, longitude || null, userId]
  );

  // Upload image if provided
  if (file) {
    const imageUrl = await uploadToCloudinary(file.buffer);
    await pool.query(
      'INSERT INTO complaint_images (complaint_id, image_url) VALUES (?, ?)',
      [id, imageUrl]
    );
  }

  // Initial timeline entry
  await pool.query(
    `INSERT INTO complaint_timeline (complaint_id, status, note, changed_by)
     VALUES (?, 'Pending', 'Complaint submitted.', ?)`,
    [id, userId]
  );

  const [rows] = await pool.query('SELECT * FROM complaints WHERE id = ?', [id]);
  return rows[0];
};

/**
 * Get complaints list — users see own; admins see all
 */
const getComplaints = async ({ userId, role, query }) => {
  const { status, category_id, search, page = 1, limit = 10 } = query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [];
  let where = 'WHERE 1=1';

  if (role === 'user') {
    where += ' AND c.user_id = ?';
    params.push(userId);
  }
  if (status)      { where += ' AND c.status = ?';      params.push(status); }
  if (category_id) { where += ' AND c.category_id = ?'; params.push(category_id); }
  if (search)      { where += ' AND (c.title LIKE ? OR c.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  const [rows] = await pool.query(
    `SELECT c.*, cat.name as category_name, u.full_name as user_name
     FROM complaints c
     LEFT JOIN categories cat ON c.category_id = cat.id
     LEFT JOIN users u ON c.user_id = u.id
     ${where}
     ORDER BY c.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), offset]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) as total FROM complaints c ${where}`,
    params
  );

  return { complaints: rows, total, page: parseInt(page), limit: parseInt(limit) };
};

/**
 * Get a single complaint with timeline + images
 */
const getComplaintById = async ({ complaintId, userId, role }) => {
  const [rows] = await pool.query(
    `SELECT c.*, cat.name as category_name, u.full_name as user_name
     FROM complaints c
     LEFT JOIN categories cat ON c.category_id = cat.id
     LEFT JOIN users u ON c.user_id = u.id
     WHERE c.id = ?`,
    [complaintId]
  );

  if (!rows.length) throw { status: 404, message: 'Complaint not found.' };
  const complaint = rows[0];

  if (role === 'user' && complaint.user_id !== userId) {
    throw { status: 403, message: 'Access denied.' };
  }

  const [timeline] = await pool.query(
    `SELECT t.*, u.full_name as changed_by_name
     FROM complaint_timeline t
     LEFT JOIN users u ON t.changed_by = u.id
     WHERE t.complaint_id = ?
     ORDER BY t.created_at ASC`,
    [complaintId]
  );

  const [images] = await pool.query(
    'SELECT image_url FROM complaint_images WHERE complaint_id = ?',
    [complaintId]
  );

  const [rating] = await pool.query(
    'SELECT rating, feedback FROM complaint_ratings WHERE complaint_id = ?',
    [complaintId]
  );

  return { ...complaint, timeline, images, rating: rating[0] || null };
};

/**
 * Update complaint status (admin action)
 */
const updateComplaintStatus = async ({ complaintId, status, note, adminId }) => {
  const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
  if (!validStatuses.includes(status)) {
    throw { status: 400, message: `Status must be one of: ${validStatuses.join(', ')}` };
  }

  const [rows] = await pool.query('SELECT * FROM complaints WHERE id = ?', [complaintId]);
  if (!rows.length) throw { status: 404, message: 'Complaint not found.' };

  const rejectionNote = status === 'Rejected' ? (note || null) : null;

  await pool.query(
    'UPDATE complaints SET status = ?, rejection_note = ? WHERE id = ?',
    [status, rejectionNote, complaintId]
  );

  await pool.query(
    'INSERT INTO complaint_timeline (complaint_id, status, note, changed_by) VALUES (?, ?, ?, ?)',
    [complaintId, status, note || null, adminId]
  );

  return { complaintId, newStatus: status, note };
};

/**
 * Assign complaint to an admin
 */
const assignComplaint = async ({ complaintId, adminId, assignedTo }) => {
  const [adminRows] = await pool.query(
    `SELECT id FROM users WHERE id = ? AND role IN ('admin','super_admin')`,
    [assignedTo]
  );
  if (!adminRows.length) throw { status: 400, message: 'Invalid admin ID.' };

  await pool.query('UPDATE complaints SET assigned_admin = ? WHERE id = ?', [assignedTo, complaintId]);
  await pool.query(
    `INSERT INTO complaint_timeline (complaint_id, status, note, changed_by)
     SELECT ?, status, 'Complaint assigned to admin.', ? FROM complaints WHERE id = ?`,
    [complaintId, adminId, complaintId]
  );
};

/**
 * Submit rating (user, only for Resolved)
 */
const rateComplaint = async ({ complaintId, userId, rating, feedback }) => {
  const { error } = Joi.object({
    rating:   Joi.number().integer().min(1).max(5).required(),
    feedback: Joi.string().max(1000).optional().allow('', null),
  }).validate({ rating, feedback });
  if (error) throw { status: 400, message: error.details[0].message };

  const [rows] = await pool.query('SELECT * FROM complaints WHERE id = ? AND user_id = ?', [complaintId, userId]);
  if (!rows.length) throw { status: 404, message: 'Complaint not found.' };
  if (rows[0].status !== 'Resolved') throw { status: 400, message: 'You can only rate resolved complaints.' };

  await pool.query(
    `INSERT INTO complaint_ratings (complaint_id, user_id, rating, feedback)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating), feedback = VALUES(feedback)`,
    [complaintId, userId, rating, feedback || null]
  );

  return { message: 'Rating submitted.' };
};

/**
 * Edit a complaint (user, only if Pending)
 */
const editComplaint = async ({ complaintId, userId, body }) => {
  const [rows] = await pool.query('SELECT * FROM complaints WHERE id = ? AND user_id = ?', [complaintId, userId]);
  if (!rows.length) throw { status: 404, message: 'Complaint not found.' };
  if (rows[0].status !== 'Pending') throw { status: 400, message: 'Only pending complaints can be edited.' };

  const { title, description, location } = body;
  await pool.query(
    'UPDATE complaints SET title = ?, description = ?, location = ? WHERE id = ?',
    [title || rows[0].title, description || rows[0].description, location || rows[0].location, complaintId]
  );

  const [updated] = await pool.query('SELECT * FROM complaints WHERE id = ?', [complaintId]);
  return updated[0];
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  rateComplaint,
  editComplaint,
  uploadToCloudinary,
};
