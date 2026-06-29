const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const adminOnly = ['ADMIN'];

// Institution-wide analytics
router.get('/stats', authenticate, authorize(adminOnly), adminController.getAdminStats);

// Departments
router.get('/departments', authenticate, authorize(adminOnly), adminController.getDepartments);
router.post('/departments', authenticate, authorize(adminOnly), adminController.addDepartment);
router.delete('/departments/:id', authenticate, authorize(adminOnly), adminController.deleteDepartment);

// Faculty management
router.get('/faculty', authenticate, authorize(adminOnly), adminController.getAllFaculty);

// Toggle user active status
router.patch('/users/:id/toggle', authenticate, authorize(adminOnly), adminController.toggleUserStatus);

// All students (admin view)
router.get('/students', authenticate, authorize(adminOnly), adminController.getAllStudentsAdmin);
router.delete('/students/:id', authenticate, authorize(adminOnly), adminController.deleteStudent);

module.exports = router;
