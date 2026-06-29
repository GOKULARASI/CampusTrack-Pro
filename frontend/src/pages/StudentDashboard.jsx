import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, Briefcase, FileText, GraduationCap, ArrowRight, Bell, Clock, Award, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, subtitle }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="dashboard-card"
    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
  >
    <div className="flex-between">
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </span>
      <div className="icon-box" style={{ background: 'var(--surface-hover)', color: 'var(--primary)' }}>
        {icon}
      </div>
    </div>
    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
      {value}
    </div>
    {subtitle && (
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        {subtitle}
      </div>
    )}
  </motion.div>
);

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    completionPercentage: 0,
    internshipCount: 0,
    certificateCount: 0,
    placementStatus: 'NOT_APPLICABLE',
    recentNotifications: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/student');
        setStats(response.data);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome back, {user?.firstName} 👋</h1>
          <p className="dashboard-subtitle">Here's a snapshot of your academic and career progress.</p>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard title="Profile Completion" value={`${stats.completionPercentage}%`} icon={<LayoutDashboard size={18} />} />
        <StatCard title="Semester" value={user?.semester || 'N/A'} icon={<BookOpen size={18} />} />
        <StatCard title="Placement Status" value={stats.placementStatus} icon={<Briefcase size={18} />} />
        <StatCard title="Internships" value={stats.internshipCount.toString()} icon={<Briefcase size={18} />} />
        <StatCard title="Certificates" value={stats.certificateCount.toString()} icon={<FileText size={18} />} />
      </div>

      <div className="content-grid cols-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Recent Notifications Board */}
        <div className="dashboard-card">
          <div className="flex-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} color="var(--primary)" /> Recent Notices
            </h2>
            <Link to="/dashboard/notifications" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>View All</Link>
          </div>
          
          {stats.recentNotifications.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No recent notifications.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.recentNotifications.map(note => (
                <div key={note.id} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--background)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{note.title}</span>
                    <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}>
                      {note.type}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {note.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="dashboard-card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-lg)' }}>Quick actions</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Complete profile', path: '/dashboard/profile' },
              { label: 'Upload resumes / certificates', path: '/dashboard/certifications' },
              { label: 'Add skills', path: '/dashboard/skills' },
              { label: 'Update placement status', path: '/dashboard/placements' }
            ].map((action, i) => (
              <Link 
                key={i}
                to={action.path}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'var(--surface)'}
              >
                {action.label}
                <ArrowRight size={16} color="var(--text-muted)" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
