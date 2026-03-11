const chatService = require('../../services/chatService');
const { sendSuccess, sendError } = require('../../utils/responseHelper');

const getMessages = async (req, res, next) => {
  try {
    const messages = await chatService.getMessages();
    return sendSuccess(res, messages);
  } catch (err) {
    next(err);
  }
};

const getOnlineCount = async (req, res, next) => {
  try {
    const { getIO } = require('../../config/socket');
    const io = getIO();
    const count = io.sockets.adapter.rooms.get('public_chat')?.size || 0;
    return sendSuccess(res, { count });
  } catch (err) {
    // If socket isn't initialized yet, return 0
    return sendSuccess(res, { count: 0 });
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) return sendError(res, 'Message cannot be empty.', 400);
    const saved = await chatService.saveMessage({ userId: req.user.id, message: message.trim() });
    return sendSuccess(res, saved, 'Message sent.', 201);
  } catch (err) {
    next(err);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const result = await chatService.deleteMessage({ messageId: req.params.id });

    // Notify all in chat room via socket
    try {
      const { getIO } = require('../../config/socket');
      getIO().to('public_chat').emit('deleteMessage', { messageId: result.messageId });
    } catch { /* socket not active */ }

    return sendSuccess(res, result, 'Message deleted.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getOnlineCount, getMessages, sendMessage, deleteMessage };
