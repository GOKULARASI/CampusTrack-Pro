import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Trash2, X, Users, GraduationCap, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', code: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deletingConfirmId, setDeletingConfirmId] = useState(null);

  const fetchDepts = async () => {
    try {
      const res = await api.get('/admin/departments');
      setDepartments(res.data);
    } catch {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepts(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) return toast.error('Name and code are required');
    setSaving(true);
    try {
      const res = await api.post('/admin/departments', form);
      setDepartments(prev => [...prev, { ...res.data, studentCount: 0, facultyCount: 0 }]);
      toast.success(`Department "${res.data.name}" added!`);
      setForm({ name: '', code: '' });
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add department');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    setDeleting(id);
    try {
      await api.delete(`/admin/departments/${id}`);
      setDepartments(prev => prev.filter(d => d.id !== id));
      toast.success(`${name} removed`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot delete — department may have active students');
    } finally {
      setDeleting(null);
    }
  };

  const totalStudents = departments.reduce((a, d) => a + d.studentCount, 0);
  const totalFaculty = departments.reduce((a, d) => a + d.facultyCount, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Manage Departments</h1>
          <p className="dashboard-subtitle">Add, view, and remove academic departments in the institution</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Add Department
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: 'var(--spacing-xl)' }}>
        {[
          { label: 'Total Departments', value: departments.length, icon: <BookOpen size={20} />, color: '#3b82f6' },
          { label: 'Total Students', value: totalStudents, icon: <GraduationCap size={20} />, color: '#10b981' },
          { label: 'Total Faculty', value: totalFaculty, icon: <Users size={20} />, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={32} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {departments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <BookOpen size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
              <p>No departments yet. Add one to get started.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-hover)', borderBottom: '2px solid var(--border)' }}>
                  {['Department Name', 'Code', 'Students', 'Faculty', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {departments.map((dept, idx) => (
                    <motion.tr
                      key={dept.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `hsl(${(idx * 47) % 360}, 70%, 95%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={16} color={`hsl(${(idx * 47) % 360}, 60%, 40%)`} />
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{dept.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '6px', background: 'var(--surface-hover)', fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {dept.code}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 600 }}>{dept.studentCount}</td>
                      <td style={{ padding: '16px 20px', fontWeight: 600 }}>{dept.facultyCount}</td>
                      <td style={{ padding: '16px 20px' }}>
                        {deletingConfirmId === dept.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => { handleDelete(dept.id, dept.name); setDeletingConfirmId(null); }}
                              disabled={deleting === dept.id}
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
                            onClick={() => setDeletingConfirmId(dept.id)}
                            disabled={deleting === dept.id}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #ef4444', color: '#ef4444', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', opacity: deleting === dept.id ? 0.5 : 1, fontWeight: 600 }}
                          >
                            <Trash2 size={13} />{' '}Delete
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass"
              style={{ width: '420px', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-xl)', position: 'relative' }}
            >
              <button onClick={() => setShowModal(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--surface-hover)', border: 'none', cursor: 'pointer', borderRadius: '8px', padding: '6px', display: 'flex', color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>Add Department</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>Enter the department name and its short code</p>
              <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Department Name *', key: 'name', placeholder: 'e.g. Computer Science and Engineering' },
                  { label: 'Department Code *', key: 'code', placeholder: 'e.g. CSE' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>{f.label}</label>
                    <input type="text" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.875rem' }} />
                  </div>
                ))}
                <button type="submit" disabled={saving} className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {saving ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Plus size={16} />}
                  {saving ? 'Adding…' : 'Add Department'}
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

export default ManageDepartments;
