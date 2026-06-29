const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create new internship record
exports.createInternship = async (req, res) => {
  try {
    const userId = req.user.id;
    const { companyName, role, duration, startDate, endDate, skillsGained, certificateUrl } = req.body;

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (!studentProfile) return res.status(404).json({ error: "Student profile not found" });

    const internship = await prisma.internship.create({
      data: {
        studentProfileId: studentProfile.id,
        companyName,
        role,
        duration,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        skillsGained,
        certificateUrl,
        status: "PENDING"
      }
    });

    res.status(201).json({ message: "Internship added successfully", internship });
  } catch (err) {
    console.error("Create Internship Error:", err);
    res.status(500).json({ error: "Failed to create internship", details: err.message });
  }
};

// Get all internships (for Coordinator or current student)
exports.getInternships = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    if (role === 'STUDENT') {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId }
      });
      if (!studentProfile) return res.status(404).json({ error: "Student profile not found" });

      const internships = await prisma.internship.findMany({
        where: { studentProfileId: studentProfile.id }
      });
      return res.json(internships);
    }

    // Faculty Coordinator / Admin can view all
    const internships = await prisma.internship.findMany({
      include: {
        studentProfile: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            department: true
          }
        }
      }
    });
    res.json(internships);
  } catch (err) {
    console.error("Get Internships Error:", err);
    res.status(500).json({ error: "Failed to fetch internships", details: err.message });
  }
};

// Update internship record
exports.updateInternship = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { companyName, role, duration, startDate, endDate, skillsGained, certificateUrl } = req.body;

    const internship = await prisma.internship.findUnique({
      where: { id: parseInt(id) },
      include: { studentProfile: true }
    });

    if (!internship) return res.status(404).json({ error: "Internship record not found" });

    // Verify ownership if STUDENT
    if (req.user.role === 'STUDENT' && internship.studentProfile.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized to update this internship record" });
    }

    const updatedInternship = await prisma.internship.update({
      where: { id: parseInt(id) },
      data: {
        companyName,
        role,
        duration,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        skillsGained,
        certificateUrl,
        status: req.user.role === 'STUDENT' ? "PENDING" : undefined // Reset status to PENDING if student edits
      }
    });

    res.json({ message: "Internship updated successfully", internship: updatedInternship });
  } catch (err) {
    console.error("Update Internship Error:", err);
    res.status(500).json({ error: "Failed to update internship", details: err.message });
  }
};

// Delete internship record
exports.deleteInternship = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const internship = await prisma.internship.findUnique({
      where: { id: parseInt(id) },
      include: { studentProfile: true }
    });

    if (!internship) return res.status(404).json({ error: "Internship record not found" });

    // Verify ownership if STUDENT
    if (req.user.role === 'STUDENT' && internship.studentProfile.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized to delete this internship record" });
    }

    await prisma.internship.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "Internship deleted successfully" });
  } catch (err) {
    console.error("Delete Internship Error:", err);
    res.status(500).json({ error: "Failed to delete internship", details: err.message });
  }
};

// Verify/approve internship (Coordinator/Admin only)
exports.verifyInternship = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!["VERIFIED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const internship = await prisma.internship.update({
      where: { id: parseInt(id) },
      data: {
        status,
        remarks
      }
    });

    res.json({ message: `Internship successfully ${status.toLowerCase()}`, internship });
  } catch (err) {
    console.error("Verify Internship Error:", err);
    res.status(500).json({ error: "Failed to verify internship", details: err.message });
  }
};
