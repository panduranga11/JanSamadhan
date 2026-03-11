const express = require('express');
const router  = express.Router();
const {
  createAdmin, listAdmins, updateAdmin, deleteAdmin,
  listCategories, addCategory, getAnalytics, getSuperAdminLogs,
} = require('../controllers/superadmin/superAdminController');
const { verifyToken }      = require('../middleware/authMiddleware');
const { superAdminOnly }   = require('../middleware/roleMiddleware');

router.use(verifyToken, superAdminOnly); // All routes require super_admin

router.post('/admins',           createAdmin);
router.get('/admins',            listAdmins);
router.put('/admins/:id',        updateAdmin);
router.delete('/admins/:id',     deleteAdmin);

router.get('/categories',        listCategories);
router.post('/categories',       addCategory);

router.get('/analytics',         getAnalytics);
router.get('/logs',              getSuperAdminLogs);

module.exports = router;
