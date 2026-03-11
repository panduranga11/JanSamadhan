const express = require('express');
const router  = express.Router();
const { getOnlineCount, getMessages, sendMessage, deleteMessage } = require('../controllers/user/chatController');
const { verifyToken } = require('../middleware/authMiddleware');
const { adminOnly }   = require('../middleware/roleMiddleware');

// Public route for online count
router.get('/online-count', getOnlineCount);

router.use(verifyToken);

router.get('/',        getMessages);
router.post('/',       sendMessage);
router.delete('/:id',  adminOnly, deleteMessage);

module.exports = router;
