const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Get all notifications
router.get('/', authenticate, notificationController.getNotifications);

// Post notification (coordinator/faculty/HOD only)
router.post('/', authenticate, authorize(['FACULTY', 'COORDINATOR', 'HOD']), notificationController.createNotification);

// Delete notification (coordinator/faculty/HOD only)
router.delete('/:id', authenticate, authorize(['FACULTY', 'COORDINATOR', 'HOD']), notificationController.deleteNotification);

module.exports = router;
