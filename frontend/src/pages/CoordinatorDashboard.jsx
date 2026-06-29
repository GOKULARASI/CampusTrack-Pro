import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, Briefcase, CheckCircle, IndianRupee, Calendar, Users, Loader2 } from 'lucide-react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="dashboard-card"
    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
  >
    <div className="flex-between">
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </span>
      <div className="icon-box" style={{ background: `var(--surface-hover)`, color: color || 'var(--primary)' }}>
        {icon}
      </div>
    </div>
    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
      {value}
    </div>
  </motion.div>
);

const CoordinatorDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    verifiedDocuments: 0,
    totalDocuments: 0,
    activeInternships: 0,
    totalPlaced: 0,
    pendingPlacements: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/coordinator');
        setStats(response.data);
      } catch (err) {
        console.error("Coordinator stats fetch error:", err);
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

  const docVerifyRate = stats.totalDocuments > 0 
    ? Math.round((stats.verifiedDocuments / stats.totalDocuments) * 100) 
    : 100;

  const placementPercent = stats.totalStudents > 0
    ? Math.round((stats.totalPlaced / stats.totalStudents) * 100)
    : 0;

  return (
    <div>
      <div className="dashboard-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div>
            <h1 className="dashboard-title">Placement Coordinator Console</h1>
            <p className="dashboard-subtitle">Manage student database, verify documents, and track placements/internships.</p>
          </div>
          <Link to="/dashboard/students" className="btn btn-primary">Audit Student Profiles</Link>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-lg)' }}>
        <StatCard title="TOTAL STUDENTS" value={stats.totalStudents.toString()} icon={<Users size={16} />} color="var(--info)" />
        <StatCard title="ACTIVE INTERNSHIPS" value={stats.activeInternships.toString()} icon={<Briefcase size={16} />} color="var(--success)" />
        <StatCard title="TOTAL PLACED" value={stats.totalPlaced.toString()} icon={<CheckCircle size={16} />} color="var(--success)" />
        <StatCard title="PLACEMENT RATE" value={`${placementPercent}%`} icon={<IndianRupee size={16} />} color="var(--warning)" />
        <StatCard title="VERIFIED DOCUMENTS" value={`${stats.verifiedDocuments}/${stats.totalDocuments}`} icon={<FileText size={16} />} color="var(--info)" />
        <StatCard title="DOCUMENT AUDIT RATE" value={`${docVerifyRate}%`} icon={<FileText size={16} />} color="var(--success)" />
        <StatCard title="PENDING AUDITS" value={stats.pendingPlacements.toString()} icon={<Clock size={16} />} color="var(--warning)" />
      </div>

      <div className="content-grid cols-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: 'var(--spacing-xl)' }}>
        
        {/* Quick Audits List Panel */}
        <div className="dashboard-card">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-lg)' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { to: '/dashboard/students', label: 'Student Directory', desc: 'Search, filter, audit profiles' },
              { to: '/dashboard/companies', label: 'Manage Companies', desc: 'Add or remove recruiting companies' },
              { to: '/dashboard/drives', label: 'Placement Drives', desc: 'Create drives, track applications' },
              { to: '/dashboard/notifications', label: 'Post Announcement', desc: 'Notify students of drives/events' },
            ].map(item => (
              <Link key={item.to} to={item.to} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 500, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--surface-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>{item.desc}</div>
                </div>
                <span style={{ color: 'var(--primary)' }}>→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Audit Guidance panel */}
        <div className="dashboard-card">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-lg)' }}>Audit System Status</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="flex-between" style={{ paddingBottom: '8px', borderBottom: '1px dashed var(--border)' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Registered Students</span>
              <span style={{ fontWeight: 600 }}>{stats.totalStudents}</span>
            </div>
            <div className="flex-between" style={{ paddingBottom: '8px', borderBottom: '1px dashed var(--border)' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Uploaded Documents</span>
              <span style={{ fontWeight: 600 }}>{stats.totalDocuments}</span>
            </div>
            <div className="flex-between">
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Pending Placements Audits</span>
              <span style={{ fontWeight: 600, color: stats.pendingPlacements > 0 ? '#f59e0b' : 'inherit' }}>{stats.pendingPlacements}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CoordinatorDashboard;
