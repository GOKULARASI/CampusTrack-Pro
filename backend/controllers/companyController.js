const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all companies
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        drives: {
          select: { id: true, title: true, date: true, package: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(companies);
  } catch (err) {
    console.error('Get Companies Error:', err);
    res.status(500).json({ error: 'Failed to fetch companies', details: err.message });
  }
};

// Add a new company
exports.addCompany = async (req, res) => {
  try {
    const { name, industry, website, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Company name is required' });

    const company = await prisma.company.create({
      data: { name, industry, website, description }
    });
    res.status(201).json(company);
  } catch (err) {
    console.error('Add Company Error:', err);
    res.status(500).json({ error: 'Failed to add company', details: err.message });
  }
};

// Delete a company
exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.company.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Company deleted successfully' });
  } catch (err) {
    console.error('Delete Company Error:', err);
    res.status(500).json({ error: 'Failed to delete company', details: err.message });
  }
};
