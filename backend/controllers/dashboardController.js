const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Calculate Student Dashboard Stats
exports.getStudentDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        skills: true,
        academicRecords: true,
        documents: true,
        internships: true,
        placementRecord: true
      }
    });

    if (!studentProfile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Calculate completion percentage based on filled fields:
    // fields: phone, address, githubUrl, linkedinUrl, portfolioUrl, cgpa, skills (has at least 1), academicRecords (has at least 1), documents (has at least 1)
    const fields = [
      studentProfile.phone,
      studentProfile.address,
      studentProfile.githubUrl,
      studentProfile.linkedinUrl,
      studentProfile.portfolioUrl,
      studentProfile.cgpa ? true : null
    ];
    let filled = fields.filter(val => val !== null && val !== undefined && val !== "").length;
    
    if (studentProfile.skills.length > 0) filled += 1;
    if (studentProfile.academicRecords.length > 0) filled += 1;
    if (studentProfile.documents.length > 0) filled += 1;

    const totalFields = fields.length + 3; // 9 fields total
    const completionPercentage = Math.round((filled / totalFields) * 100);

    const certificateCount = studentProfile.documents.filter(d => d.type !== 'RESUME').length;

    // Fetch recent notifications (limit 5)
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      completionPercentage,
      internshipCount: studentProfile.internships.length,
      certificateCount,
      placementStatus: studentProfile.placementRecord ? studentProfile.placementRecord.status : 'NOT_APPLICABLE',
      placementRecord: studentProfile.placementRecord,
      recentNotifications: notifications
    });
  } catch (err) {
    console.error("Student Dashboard Stats Error:", err);
    res.status(500).json({ error: "Failed to calculate student dashboard stats" });
  }
};

// Calculate Coordinator/Faculty Dashboard Stats
exports.getCoordinatorDashboardStats = async (req, res) => {
  try {
    const totalStudents = await prisma.studentProfile.count();
    
    const documents = await prisma.document.findMany({
      select: { status: true }
    });
    const verifiedDocuments = documents.filter(d => d.status === 'VERIFIED').length;
    
    // Active internships: end date is null or >= today
    const today = new Date();
    const activeInternships = await prisma.internship.count({
      where: {
        OR: [
          { endDate: null },
          { endDate: { gte: today } }
        ]
      }
    });

    // Placement statistics: total placed, total pending
    const placementRecords = await prisma.placementRecord.findMany({
      select: { isVerified: true, status: true }
    });

    const totalPlaced = placementRecords.filter(p => p.status === 'PLACED' || p.status === 'OFFER_ACCEPTED').length;
    const pendingPlacements = placementRecords.filter(p => !p.isVerified).length;

    res.json({
      totalStudents,
      verifiedDocuments,
      totalDocuments: documents.length,
      activeInternships,
      totalPlaced,
      pendingPlacements
    });
  } catch (err) {
    console.error("Coordinator Dashboard Stats Error:", err);
    res.status(500).json({ error: "Failed to calculate coordinator stats" });
  }
};
