const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const coordRoles = ['COORDINATOR', 'ADMIN'];

// Get all companies
router.get('/', authenticate, companyController.getAllCompanies);

// Add company (Coordinator/Admin only)
router.post('/', authenticate, authorize(coordRoles), companyController.addCompany);

// Delete company (Coordinator/Admin only)
router.delete('/:id', authenticate, authorize(coordRoles), companyController.deleteCompany);

module.exports = router;
