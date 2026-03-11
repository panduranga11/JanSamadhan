const adminService = require('../../services/adminService');
const complaintService = require('../../services/complaintService');
const notificationService = require('../../services/notificationService');
const { sendSuccess, sendError } = require('../../utils/responseHelper');

const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const result = await complaintService.updateComplaintStatus({
      complaintId: req.params.id,
      status,
      note,
      adminId: req.user.id,
    });

    // Get complaint owner to notify
    const complaint = await complaintService.getComplaintById({
      complaintId: req.params.id,
      userId: req.user.id,
      role: req.user.role,
    });

    await notificationService.createNotification({
      userId:  complaint.user_id,
      type:   'status_update',
      message: `Your complaint "${complaint.title}" has been updated to: ${status}`,
      refId:   req.params.id,
    });

    // Emit socket event
    try {
      const { getIO } = require('../../config/socket');
      getIO().to(`user:${complaint.user_id}`).emit('complaintStatusUpdated', result);
    } catch { /* socket not active */ }

    // Log admin action
    await adminService.logAction({
      adminId:     req.user.id,
      action:     `Updated complaint status to "${status}"`,
      target_type: 'complaint',
      target_id:   req.params.id,
      meta:        { note },
    });

    return sendSuccess(res, result, 'Status updated.');
  } catch (err) {
    next(err);
  }
};

const assignComplaint = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    await complaintService.assignComplaint({
      complaintId: req.params.id,
      adminId:     req.user.id,
      assignedTo,
    });

    await adminService.logAction({
      adminId:     req.user.id,
      action:     'Assigned complaint to admin',
      target_type: 'complaint',
      target_id:   req.params.id,
      meta:        { assignedTo },
    });

    return sendSuccess(res, null, 'Complaint assigned.');
  } catch (err) {
    next(err);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    // super_admin sees all; admin sees only their department
    const department = req.user.role === 'super_admin' ? null : req.user.department;
    const stats = await adminService.getDashboardStats({ department });
    return sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
};

const getAllComplaints = async (req, res, next) => {
  try {
    // super_admin sees all; admin sees only their department
    const department = req.user.role === 'super_admin' ? null : req.user.department;
    const result = await adminService.getAllComplaints(req.query, { department });
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { updateComplaintStatus, assignComplaint, getDashboard, getAllComplaints };
