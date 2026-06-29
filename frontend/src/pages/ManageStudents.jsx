import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Search, Loader2, ToggleLeft, ToggleRight, Shield, ShieldOff, FileDown, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const STATUS_COLORS = {
  PLACED:                { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
  OFFER_ACCEPTED:        { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
  PENDING_VERIFICATION:  { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  NOT_APPLICABLE:        { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8' },
};

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletingConfirmId, setDeletingConfirmId] = useState(null);

  useEffect(() => {
    api.get('/admin/students')
      .then(r => setStudents(r.data))
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (userId, name, currentStatus) => {
    setToggling(userId);
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle`);
      setStudents(prev => prev.map(s =>
        s.user.id === userId ? { ...s, user: { ...s.user, isActive: res.data.isActive } } : s
      ));
      toast.success(`${name} ${res.data.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (studentId, name) => {
    setDeleting(studentId);
    setDeletingConfirmId(null);
    try {
      await api.delete(`/admin/students/${studentId}`);
      setStudents(prev => prev.filter(s => s.id !== studentId));
      toast.success(`${name} deleted successfully`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete student');
    } finally {
      setDeleting(null);
    }
  };

  const exportCSV = () => {
    let csv = 'Name,Email,Enrollment No,Department,Batch,CGPA,Arrears,Placement Status,Company,Account Status\n';
    filtered.forEach(s => {
      const name = `${s.user.firstName} ${s.user.lastName}`;
      const status = s.placementRecord?.status || 'NOT_APPLICABLE';
      csv += `"${name}","${s.user.email}","${s.enrollmentNo}","${s.department?.name}",${s.batchYear},${s.cgpa || 0},${s.arrears || 0},"${status}","${s.placementRecord?.companyName || 'N/A'}","${s.user.isActive ? 'Active' : 'Inactive'}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'all_students.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported student data');
  };

  const filtered = students.filter(s => {
    const name = `${s.user.firstName} ${s.user.lastName}`.toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || s.user.email.toLowerCase().includes(q) || s.enrollmentNo.toLowerCase().includes(q) || s.department?.name?.toLowerCase().includes(q);
  });

  const activeCount = students.filter(s => s.user.isActive).length;
  const placedCount = students.filter(s => s.placementRecord?.isVerified).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Manage Students</h1>
          <p className="dashboard-subtitle">Full admin view of all registered students with account control</p>
        </div>
        <button onClick={exportCSV} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileDown size={16} /> Export All
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: 'var(--spacing-xl)' }}>
        {[
          { label: 'Total Students', value: students.length, color: '#3b82f6' },
          { label: 'Active Accounts', value: activeCount, color: '#10b981' },
          { label: 'Inactive Accounts', value: students.length - activeCount, color: '#ef4444' },
          { label: 'Students Placed', value: placedCount, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="dashboard-card" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 'var(--spacing-lg)' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, enrollment number, or department…"
          style={{ width: '100%', padding: '11px 12px 11px 42px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.875rem' }} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={32} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <GraduationCap size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
              <p>No students found</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-hover)', borderBottom: '2px solid var(--border)' }}>
                  {['Student', 'Roll No', 'Department', 'CGPA', 'Placement', 'Account', 'Toggle', 'Delete'].map(h => (
                    <th key={h} style={{ padding: '13px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, idx) => {
                  const placementStatus = s.placementRecord?.status || 'NOT_APPLICABLE';
                  const sc = STATUS_COLORS[placementStatus] || STATUS_COLORS.NOT_APPLICABLE;
                  return (
                    <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.015 }}
                      style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-primary)', opacity: s.user.isActive ? 1 : 0.55 }}>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: s.user.isActive ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'var(--surface-hover)', color: s.user.isActive ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                            {s.user.firstName?.charAt(0)}{s.user.lastName?.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.user.firstName} {s.user.lastName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{s.enrollmentNo}</td>
                      <td style={{ padding: '13px 16px', fontSize: '0.82rem' }}>{s.department?.name || '—'}</td>
                      <td style={{ padding: '13px 16px', fontSize: '0.85rem', fontWeight: 600 }}>{s.cgpa?.toFixed(2) || '—'}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '99px', fontSize: '0.68rem', fontWeight: 700, background: sc.bg, color: sc.color, whiteSpace: 'nowrap' }}>
                          {placementStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '99px', fontSize: '0.68rem', fontWeight: 700, background: s.user.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: s.user.isActive ? '#10b981' : '#ef4444' }}>
                          {s.user.isActive ? <Shield size={10} /> : <ShieldOff size={10} />}
                          {s.user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <button
                          onClick={() => handleToggle(s.user.id, `${s.user.firstName} ${s.user.lastName}`, s.user.isActive)}
                          disabled={toggling === s.user.id}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 11px', borderRadius: '7px', border: `1px solid ${s.user.isActive ? '#ef4444' : '#10b981'}`, color: s.user.isActive ? '#ef4444' : '#10b981', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, opacity: toggling === s.user.id ? 0.5 : 1, whiteSpace: 'nowrap' }}>
                          {s.user.isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                          {s.user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        {deletingConfirmId === s.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => handleDelete(s.id, `${s.user.firstName} ${s.user.lastName}`)}
                              disabled={deleting === s.id}
                              style={{ padding: '3px 9px', borderRadius: '6px', border: '1px solid #ef4444', color: '#ef4444', background: 'transparent', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap', opacity: deleting === s.id ? 0.5 : 1 }}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeletingConfirmId(null)}
                              style={{ padding: '3px 9px', borderRadius: '6px', border: '1px solid var(--text-muted)', color: 'var(--text-muted)', background: 'transparent', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingConfirmId(s.id)}
                            disabled={deleting === s.id}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '7px', border: '1px solid #ef4444', color: '#ef4444', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, opacity: deleting === s.id ? 0.5 : 1 }}
                          >
                            <Trash2 size={12} />{' '}Delete
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
};

export default ManageStudents;
