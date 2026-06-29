const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create or update student placement record
exports.updatePlacementRecord = async (req, res) => {
  try {
    const userId = req.user.id;
    const { companyName, role, package: pkg, status, proofUrl } = req.body;

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (!studentProfile) return res.status(404).json({ error: "Student profile not found" });

    // Upsert the placement record
    const record = await prisma.placementRecord.upsert({
      where: { studentProfileId: studentProfile.id },
      update: {
        companyName,
        role,
        package: pkg,
        status,
        proofUrl,
        isVerified: false // Needs re-verification upon update
      },
      create: {
        studentProfileId: studentProfile.id,
        companyName,
        role,
        package: pkg,
        status,
        proofUrl,
        isVerified: false
      }
    });

    // Update placementStatus in StudentProfile
    await prisma.studentProfile.update({
      where: { id: studentProfile.id },
      data: { placementStatus: status }
    });

    res.json({ message: "Placement record updated successfully", record });
  } catch (err) {
    console.error("Update Placement Record Error:", err);
    res.status(500).json({ error: "Failed to update placement record", details: err.message });
  }
};

// Get placement record for a student
exports.getMyPlacementRecord = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId }
    });
    if (!studentProfile) return res.status(404).json({ error: "Student profile not found" });

    const record = await prisma.placementRecord.findUnique({
      where: { studentProfileId: studentProfile.id }
    });

    res.json(record);
  } catch (err) {
    console.error("Get My Placement Record Error:", err);
    res.status(500).json({ error: "Failed to load placement record" });
  }
};

// Verify placement record (Coordinator/Admin only)
exports.verifyPlacementRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified, remarks } = req.body;

    const record = await prisma.placementRecord.update({
      where: { id: parseInt(id) },
      data: {
        isVerified: Boolean(isVerified),
        remarks,
        verifiedBy: req.user.id
      }
    });

    res.json({ message: "Placement record verification updated", record });
  } catch (err) {
    console.error("Verify Placement Record Error:", err);
    res.status(500).json({ error: "Failed to verify placement record", details: err.message });
  }
};

// Get company-wise placement stats
exports.getPlacementStats = async (req, res) => {
  try {
    const records = await prisma.placementRecord.findMany({
      where: { isVerified: true }
    });

    const statsMap = {};
    records.forEach(r => {
      statsMap[r.companyName] = (statsMap[r.companyName] || 0) + 1;
    });

    const stats = Object.keys(statsMap).map(company => ({
      company,
      count: statsMap[company]
    }));

    res.json(stats);
  } catch (err) {
    console.error("Get Placement Stats Error:", err);
    res.status(500).json({ error: "Failed to fetch placement stats" });
  }
};
