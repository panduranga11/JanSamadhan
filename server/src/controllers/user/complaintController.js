const complaintService = require('../../services/complaintService');
const notificationService = require('../../services/notificationService');
const { sendSuccess, sendError } = require('../../utils/responseHelper');
const { getIO } = require('../../config/socket');

const submitComplaint = async (req, res, next) => {
  try {
    const complaint = await complaintService.createComplaint({
      userId: req.user.id,
      body:   req.body,
      file:   req.file || null,
    });

    // Notify admins via DB + socket
    await notificationService.notifyAdmins({
      complaintId: complaint.id,
      title:       complaint.title,
      category:    req.body.category_id,
    });

    return sendSuccess(res, complaint, 'Complaint submitted successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const listComplaints = async (req, res, next) => {
  try {
    const result = await complaintService.getComplaints({
      userId: req.user.id,
      role:   req.user.role,
      query:  req.query,
    });
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

const getComplaint = async (req, res, next) => {
  try {
    const result = await complaintService.getComplaintById({
      complaintId: req.params.id,
      userId:      req.user.id,
      role:        req.user.role,
    });
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

const editComplaint = async (req, res, next) => {
  try {
    const result = await complaintService.editComplaint({
      complaintId: req.params.id,
      userId:      req.user.id,
      body:        req.body,
    });
    return sendSuccess(res, result, 'Complaint updated.');
  } catch (err) {
    next(err);
  }
};

const rateComplaint = async (req, res, next) => {
  try {
    const result = await complaintService.rateComplaint({
      complaintId: req.params.id,
      userId:      req.user.id,
      rating:      req.body.rating,
      feedback:    req.body.feedback,
    });
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { submitComplaint, listComplaints, getComplaint, editComplaint, rateComplaint };
