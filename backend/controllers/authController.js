const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, enrollmentNo, employeeId, departmentId } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role
      }
    });

    if (role === 'STUDENT' && enrollmentNo && departmentId) {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          departmentId: parseInt(departmentId),
          enrollmentNo,
          batchYear: new Date().getFullYear()
        }
      });
    }

    if ((role === 'FACULTY' || role === 'HOD') && employeeId && departmentId) {
      await prisma.facultyProfile.create({
        data: {
          userId: user.id,
          departmentId: parseInt(departmentId),
          employeeId
        }
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName } });
  } catch (err) {
    console.error("Registration Error:", err);
    if (err.code === 'P2002') {
      return res.status(400).json({ error: "This Enrollment Number or Email is already registered!" });
    }
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.isActive) return res.status(403).json({ error: "Account disabled" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName } });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, role: true, firstName: true, lastName: true, isActive: true }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Could not retrieve user" });
  }
};
