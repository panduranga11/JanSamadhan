const adminService = require('../../services/adminService');
const { sendSuccess } = require('../../utils/responseHelper');

const getAllUsers = async (req, res, next) => {
  try {
    const result = await adminService.getAllUsers(req.query);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

const toggleBan = async (req, res, next) => {
  try {
    const result = await adminService.toggleBan({ targetId: req.params.id });

    await adminService.logAction({
      adminId:     req.user.id,
      action:      result.status === 'banned' ? 'Banned user' : 'Unbanned user',
      target_type: 'user',
      target_id:   req.params.id,
    });

    return sendSuccess(res, result, `User ${result.status === 'banned' ? 'banned' : 'unbanned'}.`);
  } catch (err) {
    next(err);
  }
};

const getLogs = async (req, res, next) => {
  try {
    const result = await adminService.getLogs(req.query);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, toggleBan, getLogs };
