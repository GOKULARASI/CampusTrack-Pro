import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Academics from './pages/Academics';
import ResumeCenter from './pages/ResumeCenter';
import PlacementStatus from './pages/PlacementStatus';
import CareerPath from './pages/CareerPath';
import Skills from './pages/Skills';
import Certifications from './pages/Certifications';
import Projects from './pages/Projects';
import Internships from './pages/Internships';
import Notifications from './pages/Notifications';
import StudentsList from './pages/StudentsList';
import Companies from './pages/Companies';
import PlacementDrives from './pages/PlacementDrives';
import ManageDepartments from './pages/ManageDepartments';
import ManageFaculty from './pages/ManageFaculty';
import ManageStudents from './pages/ManageStudents';
import { Toaster } from 'react-hot-toast';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="academics" element={<Academics />} />
          <Route path="resume" element={<ResumeCenter />} />
          <Route path="placements" element={<PlacementStatus />} />
          <Route path="career" element={<CareerPath />} />
          <Route path="skills" element={<Skills />} />
          <Route path="certifications" element={<Certifications />} />
          <Route path="projects" element={<Projects />} />
          <Route path="internships" element={<Internships />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="students" element={<StudentsList />} />
          <Route path="companies" element={<Companies />} />
          <Route path="drives" element={<PlacementDrives />} />
          <Route path="departments" element={<ManageDepartments />} />
          <Route path="faculty-mgmt" element={<ManageFaculty />} />
          <Route path="student-mgmt" element={<ManageStudents />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
