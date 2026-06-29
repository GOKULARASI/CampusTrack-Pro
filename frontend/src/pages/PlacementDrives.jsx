import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Package, Users, Plus, X, Loader2, ChevronDown, ChevronUp,
  CheckCircle, Clock, XCircle, Briefcase, Star, ArrowRight, Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const STATUS_CONFIG = {
  APPLIED:     { label: 'Applied',     bg: 'rgba(148,163,184,0.15)', color: '#64748b' },
  SHORTLISTED: { label: 'Shortlisted', bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
  INTERVIEW:   { label: 'Interview',   bg: 'rgba(59,130,246,0.15)',  color: '#3b82f6' },
  SELECTED:    { label: 'Selected',    bg: 'rgba(16,185,129,0.15)',  color: '#10b981' },
  REJECTED:    { label: 'Rejected',    bg: 'rgba(239,68,68,0.15)',   color: '#ef4444' },
};

const PlacementDrives = () => {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expandedDrive, setExpandedDrive] = useState(null);
  const [saving, setSaving] = useState(false);
  const [updatingApp, setUpdatingApp] = useState(null);
  const [deletingConfirmId, setDeletingConfirmId] = useState(null);

  const [form, setForm] = useState({
    companyId: '', title: '', date: '', package: '',
    eligibilityCgpa: '6.0', eligibilityArrears: '0', description: ''
  });

  const fetchAll = async () => {
    try {
      const [drivesRes, companiesRes] = await Promise.all([
        api.get('/drives'),
        api.get('/companies')
      ]);
      setDrives(drivesRes.data);
      setCompanies(companiesRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    if (!form.companyId || !form.title || !form.date || !form.package) {
      return toast.error('Please fill all required fields');
    }
    setSaving(true);
    try {
      const res = await api.post('/drives', form);
      setDrives(prev => [res.data, ...prev]);
      toast.success('Placement drive created!');
      setForm({ companyId: '', title: '', date: '', package: '', eligibilityCgpa: '6.0', eligibilityArrears: '0', description: '' });
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create drive');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDrive = async (id, title) => {
    try {
      await api.delete(`/drives/${id}`);
      setDrives(prev => prev.filter(d => d.id !== id));
      if (expandedDrive === id) setExpandedDrive(null);
      toast.success('Drive deleted');
      setDeletingConfirmId(null);
    } catch {
      toast.error('Failed to delete drive');
    }
  };

  const handleUpdateStatus = async (driveId, appId, status) => {
    setUpdatingApp(appId);
    try {
      await api.patch(`/drives/${driveId}/applications/${appId}`, { status });
      setDrives(prev => prev.map(d => d.id === driveId ? {
        ...d,
        applications: d.applications.map(a => a.id === appId ? { ...a, status } : a)
      } : d));
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingApp(null);
    }
  };

  const totalApplicants = drives.reduce((a, d) => a + (d.applications?.length || 0), 0);
  const totalSelected = drives.reduce((a, d) => a + (d.applications?.filter(app => app.status === 'SELECTED').length || 0), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Placement Drives</h1>
          <p className="dashboard-subtitle">Create and manage recruitment drives, track student applications</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Create Drive
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: 'var(--spacing-xl)' }}>
        {[
          { label: 'Total Drives', value: drives.length, color: '#3b82f6', icon: <Briefcase size={20} /> },
          { label: 'Total Applicants', value: totalApplicants, color: '#8b5cf6', icon: <Users size={20} /> },
          { label: 'Students Selected', value: totalSelected, color: '#10b981', icon: <CheckCircle size={20} /> },
          { label: 'Selection Rate', value: totalApplicants > 0 ? `${Math.round(totalSelected / totalApplicants * 100)}%` : '—', color: '#f59e0b', icon: <Star size={20} /> },
        ].map(s => (
          <div key={s.label} className="dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Drives List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={32} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : drives.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <Briefcase size={48} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
          <p style={{ fontWeight: 500 }}>No placement drives yet</p>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Add a company first, then create a drive</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {drives.map((drive, idx) => {
            const isExpanded = expandedDrive === drive.id;
            const selected = drive.applications?.filter(a => a.status === 'SELECTED').length || 0;
            const total = drive.applications?.length || 0;
            return (
              <motion.div
                key={drive.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="dashboard-card"
                style={{ overflow: 'hidden', padding: 0 }}
              >
                {/* Drive Header Row */}
                <div
                  style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '16px' }}
                  onClick={() => setExpandedDrive(isExpanded ? null : drive.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                    {/* Company Logo */}
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}>
                      {drive.company?.name?.charAt(0) || '?'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{drive.title}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{drive.company?.name}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                    <InfoChip icon={<CalendarDays size={13} />} label={new Date(drive.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} />
                    <InfoChip icon={<Package size={13} />} label={`₹${drive.package} LPA`} />
                    <InfoChip icon={<Users size={13} />} label={`${total} applicant${total !== 1 ? 's' : ''}`} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                        {selected} selected
                      </span>
                      {deletingConfirmId === drive.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleDeleteDrive(drive.id, drive.title)}
                            disabled={deleting === drive.id}
                            className="btn btn-outline"
                            style={{ padding: '3px 8px', fontSize: '0.75rem', borderColor: '#ef4444', color: '#ef4444' }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeletingConfirmId(null)}
                            className="btn btn-outline"
                            style={{ padding: '3px 8px', fontSize: '0.75rem', borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={e => { e.stopPropagation(); setDeletingConfirmId(drive.id); }}
                          disabled={deleting === drive.id}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', padding: '4px 8px', borderRadius: '6px', opacity: deleting === drive.id ? 0.5 : 1 }}
                        >
                          <Trash2 size={15} /> Remove
                        </button>
                      )}
                      {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                    </div>
                  </div>
                </div>

                {/* Eligibility Strip */}
                <div style={{ padding: '8px 24px', background: 'var(--surface-hover)', display: 'flex', gap: '20px', borderTop: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <span>Min CGPA: <strong style={{ color: 'var(--text-primary)' }}>{drive.eligibilityCgpa}</strong></span>
                  <span>Max Arrears: <strong style={{ color: 'var(--text-primary)' }}>{drive.eligibilityArrears}</strong></span>
                  {drive.description && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{drive.description}</span>}
                </div>

                {/* Applications Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden', borderTop: '1px solid var(--border)' }}
                    >
                      <div style={{ padding: '20px 24px' }}>
                        <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '14px', color: 'var(--text-primary)' }}>
                          Student Applications ({drive.applications?.length || 0})
                        </h4>
                        {!drive.applications || drive.applications.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: 'var(--surface-hover)', borderRadius: '10px', fontSize: '0.85rem' }}>
                            No applications yet
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {drive.applications.map(app => {
                              const sc = STATUS_CONFIG[app.status] || STATUS_CONFIG.APPLIED;
                              return (
                                <div key={app.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--background)', borderRadius: '10px', border: '1px solid var(--border)', gap: '12px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                                      {app.studentProfile?.user?.firstName?.charAt(0)}{app.studentProfile?.user?.lastName?.charAt(0)}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                                        {app.studentProfile?.user?.firstName} {app.studentProfile?.user?.lastName}
                                      </div>
                                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {app.studentProfile?.user?.email} · {app.studentProfile?.department?.name}
                                      </div>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                    <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700, background: sc.bg, color: sc.color }}>
                                      {sc.label}
                                    </span>
                                    <select
                                      value={app.status}
                                      onChange={e => handleUpdateStatus(drive.id, app.id, e.target.value)}
                                      disabled={updatingApp === app.id}
                                      style={{ padding: '5px 8px', borderRadius: '7px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.78rem', outline: 'none', cursor: 'pointer' }}
                                    >
                                      {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                                        <option key={val} value={val}>{cfg.label}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Drive Modal */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass"
              style={{ width: '520px', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-xl)', position: 'relative', maxHeight: '92vh', overflowY: 'auto' }}
            >
              <button onClick={() => setShowModal(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--surface-hover)', border: 'none', cursor: 'pointer', borderRadius: '8px', padding: '6px', display: 'flex', color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
              <h2 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '4px' }}>Create Placement Drive</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>Set up a new recruitment drive with eligibility criteria</p>

              <form onSubmit={handleCreateDrive} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <FieldGroup label="Company *">
                  <select value={form.companyId} onChange={e => setForm(p => ({ ...p, companyId: e.target.value }))}
                    style={inputStyle}>
                    <option value="">Select a company…</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </FieldGroup>

                <FieldGroup label="Drive Title *">
                  <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Software Engineer Recruitment 2025" style={inputStyle} />
                </FieldGroup>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <FieldGroup label="Drive Date *">
                    <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
                  </FieldGroup>
                  <FieldGroup label="Package (LPA) *">
                    <input type="text" value={form.package} onChange={e => setForm(p => ({ ...p, package: e.target.value }))}
                      placeholder="e.g. 12 or 8–14" style={inputStyle} />
                  </FieldGroup>
                </div>

                <div style={{ background: 'var(--surface-hover)', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Eligibility Criteria</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <FieldGroup label="Minimum CGPA">
                      <input type="number" min="0" max="10" step="0.1" value={form.eligibilityCgpa}
                        onChange={e => setForm(p => ({ ...p, eligibilityCgpa: e.target.value }))} style={inputStyle} />
                    </FieldGroup>
                    <FieldGroup label="Max Arrears Allowed">
                      <input type="number" min="0" value={form.eligibilityArrears}
                        onChange={e => setForm(p => ({ ...p, eligibilityArrears: e.target.value }))} style={inputStyle} />
                    </FieldGroup>
                  </div>
                </div>

                <FieldGroup label="Description">
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Job description, roles & responsibilities, process details…"
                    rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                </FieldGroup>

                <button type="submit" disabled={saving} className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '0.9rem', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {saving ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Plus size={16} />}
                  {saving ? 'Creating…' : 'Create Drive'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
};

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: '9px',
  border: '1px solid var(--border)', background: 'var(--background)',
  color: 'var(--text-primary)', outline: 'none', fontSize: '0.875rem'
};

const FieldGroup = ({ label, children }) => (
  <div>
    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>{label}</label>
    {children}
  </div>
);

const InfoChip = ({ icon, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
    {icon} {label}
  </div>
);

export default PlacementDrives;
