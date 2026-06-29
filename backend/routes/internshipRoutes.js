const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internshipController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Get internships (student gets own, coordinator gets all)
router.get('/', authenticate, internshipController.getInternships);

// Add internship
router.post('/', authenticate, authorize(['STUDENT']), internshipController.createInternship);

// Edit internship
router.put('/:id', authenticate, internshipController.updateInternship);

// Delete internship
router.delete('/:id', authenticate, internshipController.deleteInternship);

// Verify internship (coordinator only)
router.put('/:id/verify', authenticate, authorize(['FACULTY', 'COORDINATOR', 'HOD']), internshipController.verifyInternship);

module.exports = router;
