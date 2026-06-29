import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, GraduationCap, Building2, TrendingUp, Briefcase,
  BarChart3, Award, Loader2, ArrowRight, BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(err => console.error('Admin stats error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Loader2 size={36} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Students', value: stats?.totalStudents ?? 0, icon: <GraduationCap size={22} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { title: 'Faculty Members', value: stats?.totalFaculty ?? 0, icon: <Users size={22} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    { title: 'Departments', value: stats?.totalDepartments ?? 0, icon: <BookOpen size={22} />, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
    { title: 'Students Placed', value: stats?.totalPlaced ?? 0, icon: <Award size={22} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { title: 'Placement Rate', value: `${stats?.placementRate ?? 0}%`, icon: <TrendingUp size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { title: 'Active Internships', value: stats?.activeInternships ?? 0, icon: <Briefcase size={22} />, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    { title: 'Placement Drives', value: stats?.totalDrives ?? 0, icon: <BarChart3 size={22} />, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { title: 'Partner Companies', value: stats?.totalCompanies ?? 0, icon: <Building2 size={22} />, color: '#14b8a6', bg: 'rgba(20,184,166,0.1)' },
  ];

  const quickActions = [
    { label: 'Manage Departments', path: '/dashboard/departments', icon: <BookOpen size={18} />, desc: 'Add, edit or remove departments' },
    { label: 'Manage Faculty', path: '/dashboard/faculty-mgmt', icon: <Users size={18} />, desc: 'View faculty, toggle active status' },
    { label: 'Manage Students', path: '/dashboard/student-mgmt', icon: <GraduationCap size={18} />, desc: 'View all students, activate/deactivate' },
    { label: 'Student Directory', path: '/dashboard/students', icon: <Users size={18} />, desc: 'Search, filter and audit profiles' },
    { label: 'Companies', path: '/dashboard/companies', icon: <Building2 size={18} />, desc: 'Manage recruiting companies' },
    { label: 'Placement Drives', path: '/dashboard/drives', icon: <Briefcase size={18} />, desc: 'Create drives and track applications' },
  ];

  const maxStudents = Math.max(...(stats?.deptBreakdown?.map(d => d.studentCount) || [1]), 1);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Institution Administration</h1>
          <p className="dashboard-subtitle">Full institution-wide overview — students, faculty, placements, and more</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: 'var(--spacing-xl)' }}>
        {statCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -4 }}
            className="dashboard-card"
            style={{ display: 'flex', alignItems: 'center', gap: '14px' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, flexShrink: 0 }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{card.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>{card.title}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Department Breakdown */}
        <div className="dashboard-card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
            Department Breakdown
          </h2>
          {!stats?.deptBreakdown || stats.deptBreakdown.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No departments found</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {stats.deptBreakdown.map((dept, idx) => {
                const pct = Math.round((dept.studentCount / maxStudents) * 100);
                const colors = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#6366f1','#14b8a6'];
                const c = colors[idx % colors.length];
                return (
                  <div key={dept.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{dept.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({dept.code})</span></span>
                      <span style={{ color: 'var(--text-secondary)' }}>{dept.studentCount} students · {dept.facultyCount} faculty</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '99px', background: 'var(--surface-hover)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        style={{ height: '100%', borderRadius: '99px', background: c }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
            Quick Actions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {quickActions.map(action => (
              <Link
                key={action.path}
                to={action.path}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--surface-hover)', borderRadius: '10px', textDecoration: 'none', color: 'var(--text-primary)', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--border)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: 'var(--primary)' }}>{action.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{action.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{action.desc}</div>
                  </div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
