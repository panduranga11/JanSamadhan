const express = require('express');
const router  = express.Router();
const { getDashboard, getAllComplaints } = require('../controllers/admin/adminComplaintController');
const { getAllUsers, toggleBan, getLogs } = require('../controllers/admin/adminUserController');
const { verifyToken } = require('../middleware/authMiddleware');
const { adminOnly }   = require('../middleware/roleMiddleware');

router.use(verifyToken, adminOnly); // All routes below require admin

router.get('/dashboard',      getDashboard);
router.get('/complaints',     getAllComplaints);
router.get('/users',          getAllUsers);
router.put('/users/:id/ban',  toggleBan);
router.get('/logs',           getLogs);

module.exports = router;
