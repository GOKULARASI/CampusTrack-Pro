const express = require('express');
const router = express.Router();
const placementController = require('../controllers/placementController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Get my placement record
router.get('/my', authenticate, authorize(['STUDENT']), placementController.getMyPlacementRecord);

// Update my placement record
router.put('/my', authenticate, authorize(['STUDENT']), placementController.updatePlacementRecord);

// Verify placement record (coordinator only)
router.put('/:id/verify', authenticate, authorize(['FACULTY', 'COORDINATOR', 'HOD']), placementController.verifyPlacementRecord);

// Get placement statistics (company-wise count)
router.get('/stats', authenticate, placementController.getPlacementStats);

module.exports = router;
