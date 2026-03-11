const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const { sendSuccess } = require('../utils/responseHelper');

// Public — used by the complaint submission dropdown
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, icon, department_id FROM categories WHERE is_active = 1 ORDER BY id ASC'
    );
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
