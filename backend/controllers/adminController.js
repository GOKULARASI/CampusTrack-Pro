const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Institution-wide analytics for Admin
exports.getAdminStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalFaculty,
      totalDepartments,
      totalPlaced,
      activeInternships,
      totalDrives,
      totalCompanies,
      departments
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.facultyProfile.count(),
      prisma.department.count(),
      prisma.placementRecord.count({ where: { isVerified: true } }),
      prisma.internship.count({ where: { status: 'VERIFIED' } }),
      prisma.placementDrive.count(),
      prisma.company.count(),
      prisma.department.findMany({
        include: {
          studentProfiles: { select: { id: true } },
          facultyProfiles: { select: { id: true } }
        }
      })
    ]);

    const placementRate = totalStudents > 0
      ? Math.round((totalPlaced / totalStudents) * 100)
      : 0;

    const deptBreakdown = departments.map(d => ({
      name: d.name,
      code: d.code,
      studentCount: d.studentProfiles.length,
      facultyCount: d.facultyProfiles.length
    }));

    res.json({
      totalStudents,
      totalFaculty,
      totalDepartments,
      totalPlaced,
      activeInternships,
      totalDrives,
      totalCompanies,
      placementRate,
      deptBreakdown
    });
  } catch (err) {
    console.error('Admin Stats Error:', err);
    res.status(500).json({ error: 'Failed to fetch admin stats', details: err.message });
  }
};

// Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        studentProfiles: { select: { id: true } },
        facultyProfiles: { select: { id: true } }
      },
      orderBy: { name: 'asc' }
    });

    const result = departments.map(d => ({
      id: d.id,
      name: d.name,
      code: d.code,
      studentCount: d.studentProfiles.length,
      facultyCount: d.facultyProfiles.length
    }));
    res.json(result);
  } catch (err) {
    console.error('Get Departments Error:', err);
    res.status(500).json({ error: 'Failed to fetch departments', details: err.message });
  }
};

// Add a department
exports.addDepartment = async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ error: 'Name and code are required' });

    const dept = await prisma.department.create({ data: { name, code: code.toUpperCase() } });
    res.status(201).json(dept);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Department name or code already exists' });
    }
    console.error('Add Department Error:', err);
    res.status(500).json({ error: 'Failed to add department', details: err.message });
  }
};

// Delete a department
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.department.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Department deleted' });
  } catch (err) {
    console.error('Delete Department Error:', err);
    res.status(500).json({ error: 'Failed to delete department', details: err.message });
  }
};

// Get all faculty
exports.getAllFaculty = async (req, res) => {
  try {
    const faculty = await prisma.facultyProfile.findMany({
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true }
        },
        department: { select: { name: true, code: true } }
      },
      orderBy: { id: 'asc' }
    });
    res.json(faculty);
  } catch (err) {
    console.error('Get Faculty Error:', err);
    res.status(500).json({ error: 'Failed to fetch faculty', details: err.message });
  }
};

// Toggle user active status
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: !user.isActive },
      select: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true }
    });
    res.json(updated);
  } catch (err) {
    console.error('Toggle User Status Error:', err);
    res.status(500).json({ error: 'Failed to toggle user status', details: err.message });
  }
};

// Get all students (admin-level, with more details)
exports.getAllStudentsAdmin = async (req, res) => {
  try {
    const students = await prisma.studentProfile.findMany({
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, isActive: true }
        },
        department: { select: { name: true, code: true } },
        placementRecord: { select: { companyName: true, isVerified: true, status: true } }
      },
      orderBy: { enrollmentNo: 'asc' }
    });
    res.json(students);
  } catch (err) {
    console.error('Get All Students Admin Error:', err);
    res.status(500).json({ error: 'Failed to fetch students', details: err.message });
  }
};

// Delete a student (removes all related records manually in correct order)
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params; // studentProfile id

    const profile = await prisma.studentProfile.findUnique({
      where: { id: parseInt(id) },
      include: { user: { select: { id: true, firstName: true, lastName: true } } }
    });
    if (!profile) return res.status(404).json({ error: 'Student not found' });

    const profileId = profile.id;
    const userId = profile.user.id;

    // Delete in dependency order (children first)
    await prisma.placementApplication.deleteMany({ where: { studentProfileId: profileId } });
    await prisma.placementRecord.deleteMany({ where: { studentProfileId: profileId } });
    await prisma.document.deleteMany({ where: { studentProfileId: profileId } });
    await prisma.resume.deleteMany({ where: { studentProfileId: profileId } });
    await prisma.internship.deleteMany({ where: { studentProfileId: profileId } });
    await prisma.project.deleteMany({ where: { studentProfileId: profileId } });
    await prisma.certification.deleteMany({ where: { studentProfileId: profileId } });
    await prisma.skill.deleteMany({ where: { studentProfileId: profileId } });
    await prisma.academicRecord.deleteMany({ where: { studentProfileId: profileId } });

    // Now delete the profile and the user
    await prisma.studentProfile.delete({ where: { id: profileId } });
    await prisma.user.delete({ where: { id: userId } });

    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Delete Student Error:', err);
    res.status(500).json({ error: 'Failed to delete student', details: err.message });
  }
};


