const express = require('express');
const router  = express.Router();
const { getProfile, updateProfile, uploadAvatar } = require('../controllers/user/profileController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload  = require('../middleware/uploadMiddleware');

router.get('/profile',          verifyToken, getProfile);
router.put('/profile',          verifyToken, updateProfile);
router.post('/avatar',          verifyToken, upload.single('avatar'), uploadAvatar);

module.exports = router;
