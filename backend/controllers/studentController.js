const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get the logged in student's profile details or a specific student's profile by ID
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.role === 'STUDENT' ? req.user.id : parseInt(req.query.studentUserId || req.params.id);
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        department: true,
        academicRecords: true,
        skills: true,
        certifications: true,
        projects: true,
        internships: true,
        resumes: true,
        documents: true,
        placementRecord: true
      }
    });

    if (!studentProfile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    res.json(studentProfile);
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ error: "Failed to load student profile", details: err.message });
  }
};

// Get all student profiles (for Coordinator / Faculty)
exports.getAllStudents = async (req, res) => {
  try {
    const students = await prisma.studentProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        department: true,
        documents: true,
        internships: true,
        placementRecord: true
      }
    });
    res.json(students);
  } catch (err) {
    console.error("Get All Students Error:", err);
    res.status(500).json({ error: "Failed to load students", details: err.message });
  }
};

// Update student profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      phone,
      address,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      careerPath,
      cgpa,
      arrears,
      currentSemester,
      skills, // Array of skill names e.g., ["React", "Node"]
      projects // Array of projects e.g., [{ title, description, url }]
    } = req.body;

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (!studentProfile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // 1. Update user fields (firstName, lastName)
    await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName }
    });

    // 2. Update basic profile fields
    const updatedProfile = await prisma.studentProfile.update({
      where: { userId },
      data: {
        phone,
        address,
        githubUrl,
        linkedinUrl,
        portfolioUrl,
        careerPath,
        currentSemester: currentSemester ? parseInt(currentSemester) : undefined,
        cgpa: cgpa !== undefined ? parseFloat(cgpa) : undefined,
        arrears: arrears !== undefined ? parseInt(arrears) : undefined
      }
    });

    // 3. Update Skills (Delete existing and recreate)
    if (skills && Array.isArray(skills)) {
      await prisma.skill.deleteMany({
        where: { studentProfileId: studentProfile.id }
      });
      if (skills.length > 0) {
        await prisma.skill.createMany({
          data: skills.map(skillName => ({
            name: skillName,
            studentProfileId: studentProfile.id
          }))
        });
      }
    }

    // 4. Update Projects (Delete existing and recreate)
    if (projects && Array.isArray(projects)) {
      await prisma.project.deleteMany({
        where: { studentProfileId: studentProfile.id }
      });
      if (projects.length > 0) {
        await prisma.project.createMany({
          data: projects.map(proj => ({
            title: proj.title,
            description: proj.description || '',
            url: proj.url || '',
            studentProfileId: studentProfile.id
          }))
        });
      }
    }

    res.json({ message: "Profile updated successfully", profile: updatedProfile });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ error: "Failed to update profile", details: err.message });
  }
};

// Update student academic semester records
exports.updateAcademicRecords = async (req, res) => {
  try {
    const userId = req.user.id;
    const { semesterRecords } = req.body; // Array of { semester, sgpa, totalMarks, attendancePercent, arrearsInSem }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (!profile) return res.status(404).json({ error: "Student profile not found" });

    // Delete existing and update
    await prisma.academicRecord.deleteMany({
      where: { studentProfileId: profile.id }
    });

    if (semesterRecords && Array.isArray(semesterRecords)) {
      await prisma.academicRecord.createMany({
        data: semesterRecords.map(rec => ({
          studentProfileId: profile.id,
          semester: parseInt(rec.semester),
          sgpa: parseFloat(rec.sgpa),
          totalMarks: rec.totalMarks ? parseFloat(rec.totalMarks) : null,
          attendancePercent: rec.attendancePercent ? parseFloat(rec.attendancePercent) : null,
          arrearsInSem: rec.arrearsInSem ? parseInt(rec.arrearsInSem) : 0
        }))
      });
    }

    res.json({ message: "Academic records updated successfully" });
  } catch (err) {
    console.error("Update Academic Records Error:", err);
    res.status(500).json({ error: "Failed to update academic records", details: err.message });
  }
};
