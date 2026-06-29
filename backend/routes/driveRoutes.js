const express = require('express');
const router = express.Router();
const driveController = require('../controllers/driveController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const coordRoles = ['COORDINATOR', 'ADMIN'];
const staffRoles = ['COORDINATOR', 'ADMIN', 'FACULTY'];

// Get all drives (accessible to coordinators, faculty, students)
router.get('/', authenticate, driveController.getAllDrives);

// Create a drive (Coordinator/Admin)
router.post('/', authenticate, authorize(coordRoles), driveController.createDrive);

// Delete a drive (Coordinator/Admin)
router.delete('/:id', authenticate, authorize(coordRoles), driveController.deleteDrive);

// Get applications for a specific drive (Coordinator/Admin/Faculty)
router.get('/:id/applications', authenticate, authorize(staffRoles), driveController.getDriveApplications);

// Update an application's status (Coordinator/Admin)
router.patch('/:id/applications/:appId', authenticate, authorize(coordRoles), driveController.updateApplicationStatus);

// Student applies to a drive
router.post('/apply', authenticate, authorize(['STUDENT']), driveController.applyToDrive);

module.exports = router;
