const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  cb(null, true);
};

exports.upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload document
exports.uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (!studentProfile) {
      // Remove uploaded file if profile not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Relative url to download/preview
    const fileUrl = `/api/documents/download/${req.file.filename}`;

    const document = await prisma.document.create({
      data: {
        studentProfileId: studentProfile.id,
        type, // e.g. "RESUME", "SKILL_CERTIFICATE" etc.
        fileName: req.file.originalname,
        fileUrl: fileUrl,
        status: "PENDING"
      }
    });

    res.status(201).json({ message: "Document uploaded successfully", document });
  } catch (err) {
    console.error("Upload Document Error:", err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Failed to upload document", details: err.message });
  }
};

// Download / preview document file
exports.downloadFile = (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    res.sendFile(filePath);
  } catch (err) {
    console.error("Download File Error:", err);
    res.status(500).json({ error: "Failed to fetch file" });
  }
};

// Get all documents for a student
exports.getMyDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (!studentProfile) return res.status(404).json({ error: "Student profile not found" });

    const documents = await prisma.document.findMany({
      where: { studentProfileId: studentProfile.id }
    });

    res.json(documents);
  } catch (err) {
    console.error("Get My Documents Error:", err);
    res.status(500).json({ error: "Failed to retrieve documents" });
  }
};

// Delete a document
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const doc = await prisma.document.findUnique({
      where: { id: parseInt(id) },
      include: { studentProfile: true }
    });

    if (!doc) return res.status(404).json({ error: "Document not found" });

    // Allow student to delete their own, or Admin/Coordinator to delete
    if (req.user.role === 'STUDENT' && doc.studentProfile.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized to delete this document" });
    }

    // Delete file from disk
    const filename = path.basename(doc.fileUrl);
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete record from DB
    await prisma.document.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error("Delete Document Error:", err);
    res.status(500).json({ error: "Failed to delete document", details: err.message });
  }
};

// Verify document (Coordinator/Admin only)
exports.verifyDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body; // status: "VERIFIED" or "REJECTED"

    if (!["VERIFIED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const doc = await prisma.document.update({
      where: { id: parseInt(id) },
      data: {
        status,
        remarks,
        verifiedBy: req.user.id,
        verificationDate: new Date()
      }
    });

    res.json({ message: `Document successfully ${status.toLowerCase()}`, document: doc });
  } catch (err) {
    console.error("Verify Document Error:", err);
    res.status(500).json({ error: "Failed to verify document", details: err.message });
  }
};
