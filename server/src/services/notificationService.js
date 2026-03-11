const pool = require('../config/db');

/**
 * Create a notification in DB and optionally emit via socket
 * @param {{ userId, type, message, refId }} params
 */
const createNotification = async ({ userId, type, message, refId = null }) => {
  const [result] = await pool.query(
    'INSERT INTO notifications (user_id, type, message, ref_id) VALUES (?, ?, ?, ?)',
    [userId, type, message, refId]
  );

  // Try to emit via socket if initialized
  try {
    const { getIO } = require('../config/socket');
    const io = getIO();
    io.to(`user:${userId}`).emit('newNotification', { type, message, refId });
  } catch {
    // Socket not initialized yet — notification still saved in DB
  }

  return result.insertId;
};

/**
 * Get all notifications for a user
 */
const getUserNotifications = async (userId) => {
  const [rows] = await pool.query(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
    [userId]
  );
  return rows;
};

/**
 * Mark a single notification as read
 */
const markRead = async ({ notificationId, userId }) => {
  const [result] = await pool.query(
    'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
    [notificationId, userId]
  );
  if (result.affectedRows === 0) throw { status: 404, message: 'Notification not found.' };
  return { notificationId };
};

/**
 * Mark all notifications as read for a user
 */
const markAllRead = async (userId) => {
  await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
  return { message: 'All notifications marked as read.' };
};

/**
 * Notify all admins of a new complaint
 */
const notifyAdmins = async ({ complaintId, title, category }) => {
  const [admins] = await pool.query(
    `SELECT id FROM users WHERE role IN ('admin','super_admin') AND status = 'active'`
  );

  for (const admin of admins) {
    await createNotification({
      userId:  admin.id,
      type:   'new_complaint',
      message: `New complaint submitted: "${title}" (${category})`,
      refId:   complaintId,
    });
  }

  // Broadcast to admins socket room
  try {
    const { getIO } = require('../config/socket');
    const io = getIO();
    io.to('admins').emit('newComplaintSubmitted', { complaintId, title, category });
  } catch { /* socket not yet initialized */ }
};

module.exports = { createNotification, getUserNotifications, markRead, markAllRead, notifyAdmins };
