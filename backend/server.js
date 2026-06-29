const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/internships', require('./routes/internshipRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/placements', require('./routes/placementRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/drives', require('./routes/driveRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/uploads', express.static('uploads'));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'CampusTrack Pro API is running.' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
