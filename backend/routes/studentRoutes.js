const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Get profile
router.get('/profile', authenticate, studentController.getProfile);

// Get specific student profile (for coordinator/faculty)
router.get('/profile/:id', authenticate, authorize(['FACULTY', 'COORDINATOR', 'HOD']), studentController.getProfile);

// Update profile
router.put('/profile', authenticate, studentController.updateProfile);

// Update academic records
router.put('/academic', authenticate, studentController.updateAcademicRecords);

// Get all students (for Faculty / Coordinators)
router.get('/', authenticate, authorize(['FACULTY', 'COORDINATOR', 'HOD']), studentController.getAllStudents);

module.exports = router;
