const express = require('express');
const router  = express.Router();
const {
  submitComplaint, listComplaints, getComplaint, editComplaint, rateComplaint,
} = require('../controllers/user/complaintController');
const {
  updateComplaintStatus, assignComplaint,
} = require('../controllers/admin/adminComplaintController');
const { verifyToken } = require('../middleware/authMiddleware');
const { adminOnly }   = require('../middleware/roleMiddleware');
const upload          = require('../middleware/uploadMiddleware');

// User + Admin shared
router.get('/',     verifyToken, listComplaints);
router.get('/:id',  verifyToken, getComplaint);

// User only
router.post('/',           verifyToken, upload.single('image'), submitComplaint);
router.put('/:id',         verifyToken, editComplaint);
router.post('/:id/rating', verifyToken, rateComplaint);

// Admin only
router.put('/:id/status',  verifyToken, adminOnly, updateComplaintStatus);
router.post('/:id/assign', verifyToken, adminOnly, assignComplaint);

module.exports = router;
