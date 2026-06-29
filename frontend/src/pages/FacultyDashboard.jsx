import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Building, Briefcase, GraduationCap, Rocket, Loader2, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="dashboard-card"
    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
  >
    <div className="flex-between">
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </span>
      <div className="icon-box" style={{ background: 'var(--surface-hover)', color: color || 'var(--primary)' }}>
        {icon}
      </div>
    </div>
    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
      {value}
    </div>
    {subtitle && (
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {subtitle}
      </div>
    )}
  </motion.div>
);

const FacultyDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalPlaced: 0,
    activeInternships: 0,
    totalDocuments: 0,
    verifiedDocuments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/coordinator');
        setStats(response.data);
      } catch (err) {
        console.error("Faculty dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Loader2 size={32} className="animate-spin" color="var(--primary)" />
      </div>
    );
  }

  const placementPercent = stats.totalStudents > 0
    ? Math.round((stats.totalPlaced / stats.totalStudents) * 100)
    : 0;

  return (
    <div>
      <div className="dashboard-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div>
            <h1 className="dashboard-title">Faculty Dashboard</h1>
            <p className="dashboard-subtitle">Institution-wide academic and placement snapshot.</p>
          </div>
          <Link to="/dashboard/students" className="btn btn-primary">Browse student directory</Link>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-md)' }}>
        <StatCard title="TOTAL STUDENTS" value={stats.totalStudents.toString()} icon={<Users size={18} />} color="var(--primary)" />
        <StatCard title="PLACED" value={stats.totalPlaced.toString()} subtitle={`${placementPercent}% rate`} icon={<Building size={18} />} color="var(--success)" />
        <StatCard title="ACTIVE INTERNSHIPS" value={stats.activeInternships.toString()} icon={<Briefcase size={18} />} color="var(--info)" />
        <StatCard title="VERIFIED DOCUMENTS" value={`${stats.verifiedDocuments}/${stats.totalDocuments}`} icon={<GraduationCap size={18} />} color="var(--warning)" />
      </div>

      <div className="content-grid cols-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: 'var(--spacing-xl)' }}>
        
        {/* Navigation actions */}
        <div className="dashboard-card">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-lg)' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { to: '/dashboard/students', label: 'View Student Profiles', desc: 'Browse, search & filter student directory' },
              { to: '/dashboard/students', label: 'Generate & Export Report', desc: 'Download placement CSV with filters applied' },
              { to: '/dashboard/placements', label: 'Placement Overview', desc: 'View current placement statistics' },
              { to: '/dashboard/notifications', label: 'Announcements', desc: 'View recent notices and alerts' },
            ].map(item => (
              <Link key={`${item.to}${item.label}`} to={item.to} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 500, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--surface-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>{item.desc}</div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </div>

        {/* Info panel */}
        <div className="dashboard-card">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-lg)' }}>Overview Statistics</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="flex-between" style={{ paddingBottom: '8px', borderBottom: '1px dashed var(--border)' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Registered Students</span>
              <span style={{ fontWeight: 600 }}>{stats.totalStudents}</span>
            </div>
            <div className="flex-between" style={{ paddingBottom: '8px', borderBottom: '1px dashed var(--border)' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Placement Count</span>
              <span style={{ fontWeight: 600 }}>{stats.totalPlaced}</span>
            </div>
            <div className="flex-between">
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Verified Documents</span>
              <span style={{ fontWeight: 600 }}>{stats.verifiedDocuments}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FacultyDashboard;
