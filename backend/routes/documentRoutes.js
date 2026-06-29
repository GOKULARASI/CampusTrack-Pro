const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Upload a document (student only)
router.post('/upload', authenticate, authorize(['STUDENT']), documentController.upload.single('file'), documentController.uploadDocument);

// Get my documents (student only)
router.get('/my-documents', authenticate, authorize(['STUDENT']), documentController.getMyDocuments);

// Download / Preview a document file (everyone authenticated)
router.get('/download/:filename', authenticate, documentController.downloadFile);

// Delete a document (student deletes own, coordinator/admin deletes any)
router.delete('/:id', authenticate, documentController.deleteDocument);

// Verify a document (coordinator/faculty/HOD only)
router.put('/:id/verify', authenticate, authorize(['FACULTY', 'COORDINATOR', 'HOD']), documentController.verifyDocument);

module.exports = router;
