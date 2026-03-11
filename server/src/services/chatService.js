const pool = require('../config/db');

/**
 * Get last 50 non-deleted chat messages
 */
const getMessages = async () => {
  const [rows] = await pool.query(
    `SELECT m.id, m.message, m.created_at,
            u.id as user_id, u.full_name as sender, u.role, u.avatar_url
     FROM chat_messages m
     JOIN users u ON m.user_id = u.id
     WHERE m.is_deleted = 0
     ORDER BY m.created_at DESC
     LIMIT 50`
  );
  return rows.reverse(); // chronological order for display
};

/**
 * Save a message to DB and return it with sender info
 */
const saveMessage = async ({ userId, message }) => {
  const [result] = await pool.query(
    'INSERT INTO chat_messages (user_id, message) VALUES (?, ?)',
    [userId, message]
  );
  const [rows] = await pool.query(
    `SELECT m.id, m.message, m.created_at,
            u.id as user_id, u.full_name as sender, u.role, u.avatar_url
     FROM chat_messages m
     JOIN users u ON m.user_id = u.id
     WHERE m.id = ?`,
    [result.insertId]
  );
  return rows[0];
};

/**
 * Soft-delete a message (admin only)
 */
const deleteMessage = async ({ messageId }) => {
  const [rows] = await pool.query('SELECT id FROM chat_messages WHERE id = ?', [messageId]);
  if (!rows.length) throw { status: 404, message: 'Message not found.' };
  await pool.query('UPDATE chat_messages SET is_deleted = 1 WHERE id = ?', [messageId]);
  return { messageId };
};

module.exports = { getMessages, saveMessage, deleteMessage };
