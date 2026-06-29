const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Get student dashboard stats
router.get('/student', authenticate, authorize(['STUDENT']), dashboardController.getStudentDashboardStats);

// Get coordinator dashboard stats
router.get('/coordinator', authenticate, authorize(['FACULTY', 'COORDINATOR', 'HOD']), dashboardController.getCoordinatorDashboardStats);

module.exports = router;
