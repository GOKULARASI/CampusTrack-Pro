import React from 'react';
import useAuthStore from '../store/authStore';
import StudentDashboard from './StudentDashboard';
import CoordinatorDashboard from './CoordinatorDashboard';
import FacultyDashboard from './FacultyDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuthStore();

  if (user?.role === 'STUDENT') {
    return <StudentDashboard />;
  }

  if (user?.role === 'ADMIN') {
    return <AdminDashboard />;
  }

  if (user?.role === 'COORDINATOR') {
    return <CoordinatorDashboard />;
  }

  if (user?.role === 'FACULTY') {
    return <FacultyDashboard />;
  }

  // Fallback
  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome {user?.firstName}</h1>
        <p className="dashboard-subtitle">Your dashboard is being customized.</p>
      </div>
    </div>
  );
};

export default Dashboard;
