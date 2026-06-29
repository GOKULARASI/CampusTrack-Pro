const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all placement drives
exports.getAllDrives = async (req, res) => {
  try {
    const drives = await prisma.placementDrive.findMany({
      include: {
        company: true,
        applications: {
          include: {
            studentProfile: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
                department: { select: { name: true } }
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json(drives);
  } catch (err) {
    console.error('Get Drives Error:', err);
    res.status(500).json({ error: 'Failed to fetch placement drives', details: err.message });
  }
};

// Create a new placement drive
exports.createDrive = async (req, res) => {
  try {
    const { companyId, title, date, package: pkg, eligibilityCgpa, eligibilityArrears, description } = req.body;

    if (!companyId || !title || !date || !pkg) {
      return res.status(400).json({ error: 'Company, title, date, and package are required' });
    }

    const drive = await prisma.placementDrive.create({
      data: {
        companyId: parseInt(companyId),
        title,
        date: new Date(date),
        package: pkg,
        eligibilityCgpa: parseFloat(eligibilityCgpa) || 6.0,
        eligibilityArrears: parseInt(eligibilityArrears) || 0,
        description
      },
      include: { company: true }
    });
    res.status(201).json(drive);
  } catch (err) {
    console.error('Create Drive Error:', err);
    res.status(500).json({ error: 'Failed to create placement drive', details: err.message });
  }
};

// Delete a drive
exports.deleteDrive = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.placementDrive.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Drive deleted successfully' });
  } catch (err) {
    console.error('Delete Drive Error:', err);
    res.status(500).json({ error: 'Failed to delete drive', details: err.message });
  }
};

// Get applications for a specific drive
exports.getDriveApplications = async (req, res) => {
  try {
    const { id } = req.params;
    const applications = await prisma.placementApplication.findMany({
      where: { driveId: parseInt(id) },
      include: {
        studentProfile: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            department: { select: { name: true, code: true } }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });
    res.json(applications);
  } catch (err) {
    console.error('Get Drive Applications Error:', err);
    res.status(500).json({ error: 'Failed to fetch applications', details: err.message });
  }
};

// Update an application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { appId } = req.params;
    const { status } = req.body;

    const validStatuses = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updated = await prisma.placementApplication.update({
      where: { id: parseInt(appId) },
      data: { status }
    });
    res.json(updated);
  } catch (err) {
    console.error('Update Application Status Error:', err);
    res.status(500).json({ error: 'Failed to update status', details: err.message });
  }
};

// Student applies to a drive
exports.applyToDrive = async (req, res) => {
  try {
    const { driveId } = req.body;
    const userId = req.user.id;

    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'Student profile not found' });

    const drive = await prisma.placementDrive.findUnique({ where: { id: parseInt(driveId) } });
    if (!drive) return res.status(404).json({ error: 'Drive not found' });

    // Check eligibility
    if (profile.cgpa < drive.eligibilityCgpa) {
      return res.status(400).json({ error: `Minimum CGPA ${drive.eligibilityCgpa} required` });
    }
    if (profile.arrears > drive.eligibilityArrears) {
      return res.status(400).json({ error: `Maximum ${drive.eligibilityArrears} arrears allowed` });
    }

    // Check if already applied
    const existing = await prisma.placementApplication.findFirst({
      where: { studentProfileId: profile.id, driveId: parseInt(driveId) }
    });
    if (existing) return res.status(400).json({ error: 'Already applied to this drive' });

    const application = await prisma.placementApplication.create({
      data: {
        studentProfileId: profile.id,
        driveId: parseInt(driveId),
        status: 'APPLIED'
      }
    });
    res.status(201).json(application);
  } catch (err) {
    console.error('Apply to Drive Error:', err);
    res.status(500).json({ error: 'Failed to apply', details: err.message });
  }
};
