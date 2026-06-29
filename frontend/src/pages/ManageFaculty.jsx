import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, ToggleLeft, ToggleRight, Search, Loader2, Shield, ShieldOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const ManageFaculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    api.get('/admin/faculty')
      .then(r => setFaculty(r.data))
      .catch(() => toast.error('Failed to load faculty'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (userId, name, currentStatus) => {
    setToggling(userId);
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle`);
      setFaculty(prev => prev.map(f =>
        f.user.id === userId ? { ...f, user: { ...f.user, isActive: res.data.isActive } } : f
      ));
      toast.success(`${name} has been ${res.data.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to toggle user status');
    } finally {
      setToggling(null);
    }
  };

  const filtered = faculty.filter(f => {
    const name = `${f.user.firstName} ${f.user.lastName}`.toLowerCase();
    const email = f.user.email.toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q) || f.employeeId?.toLowerCase().includes(q) || f.department?.name?.toLowerCase().includes(q);
  });

  const active = faculty.filter(f => f.user.isActive).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Manage Faculty</h1>
          <p className="dashboard-subtitle">View all faculty members and control their account access</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: 'var(--spacing-xl)' }}>
        {[
          { label: 'Total Faculty', value: faculty.length, color: '#3b82f6' },
          { label: 'Active Accounts', value: active, color: '#10b981' },
          { label: 'Inactive Accounts', value: faculty.length - active, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="dashboard-card" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 'var(--spacing-lg)' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, employee ID, or department…"
          style={{ width: '100%', padding: '11px 12px 11px 42px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.875rem' }} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={32} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
              <p>No faculty found</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-hover)', borderBottom: '2px solid var(--border)' }}>
                  {['Faculty', 'Employee ID', 'Department', 'Designation', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((f, idx) => (
                  <motion.tr
                    key={f.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-primary)', opacity: f.user.isActive ? 1 : 0.6 }}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: f.user.isActive ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'var(--surface-hover)', color: f.user.isActive ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                          {f.user.firstName?.charAt(0)}{f.user.lastName?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{f.user.firstName} {f.user.lastName}</div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{f.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{f.employeeId}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.85rem' }}>{f.department?.name || '—'} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({f.department?.code})</span></td>
                    <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{f.designation || 'Faculty'}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700, background: f.user.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: f.user.isActive ? '#10b981' : '#ef4444' }}>
                        {f.user.isActive ? <Shield size={11} /> : <ShieldOff size={11} />}
                        {f.user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <button
                        onClick={() => handleToggle(f.user.id, `${f.user.firstName} ${f.user.lastName}`, f.user.isActive)}
                        disabled={toggling === f.user.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', border: `1px solid ${f.user.isActive ? '#ef4444' : '#10b981'}`, color: f.user.isActive ? '#ef4444' : '#10b981', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, opacity: toggling === f.user.id ? 0.5 : 1 }}
                      >
                        {f.user.isActive ? <><ToggleRight size={14} /> Deactivate</> : <><ToggleLeft size={14} /> Activate</>}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
};

export default ManageFaculty;
