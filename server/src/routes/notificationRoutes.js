const express = require('express');
const router  = express.Router();
const notificationService = require('../services/notificationService');
const { verifyToken } = require('../middleware/authMiddleware');
const { sendSuccess } = require('../utils/responseHelper');

router.use(verifyToken);

router.get('/', async (req, res, next) => {
  try {
    const data = await notificationService.getUserNotifications(req.user.id);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
});

router.put('/read-all', async (req, res, next) => {
  try {
    const result = await notificationService.markAllRead(req.user.id);
    return sendSuccess(res, result);
  } catch (err) { next(err); }
});

router.put('/:id/read', async (req, res, next) => {
  try {
    const result = await notificationService.markRead({
      notificationId: req.params.id,
      userId: req.user.id,
    });
    return sendSuccess(res, result);
  } catch (err) { next(err); }
});

module.exports = router;
