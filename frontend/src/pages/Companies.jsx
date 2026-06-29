import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Globe, Plus, Trash2, X, Briefcase, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const INDUSTRY_OPTIONS = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Manufacturing', 'Consulting',
  'E-Commerce', 'Automotive', 'Telecommunications', 'Education', 'Government', 'Other'
];

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({ name: '', industry: '', website: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [deletingConfirmId, setDeletingConfirmId] = useState(null);

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies');
      setCompanies(res.data);
    } catch {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Company name is required');
    setSaving(true);
    try {
      const res = await api.post('/companies', form);
      setCompanies(prev => [...prev, { ...res.data, drives: [] }]);
      toast.success(`${res.data.name} added successfully!`);
      setForm({ name: '', industry: '', website: '', description: '' });
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add company');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    setDeleting(id);
    try {
      await api.delete(`/companies/${id}`);
      setCompanies(prev => prev.filter(c => c.id !== id));
      toast.success(`${name} removed.`);
      setDeletingConfirmId(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete company');
    } finally {
      setDeleting(null);
    }
  };

  const industryColor = (industry) => {
    const map = {
      'Technology': '#3b82f6', 'Finance & Banking': '#10b981', 'Healthcare': '#ec4899',
      'Manufacturing': '#f59e0b', 'Consulting': '#8b5cf6', 'E-Commerce': '#06b6d4',
      'Automotive': '#ef4444', 'Telecommunications': '#14b8a6', 'Education': '#f97316',
      'Government': '#6366f1', 'Other': '#94a3b8'
    };
    return map[industry] || '#94a3b8';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Companies</h1>
          <p className="dashboard-subtitle">Manage recruiting companies for placement drives</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Add Company
        </button>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: 'var(--spacing-xl)' }}>
        {[
          { label: 'Total Companies', value: companies.length, color: 'var(--primary)' },
          { label: 'Total Drives Posted', value: companies.reduce((a, c) => a + (c.drives?.length || 0), 0), color: '#10b981' },
          { label: 'Industries Covered', value: new Set(companies.map(c => c.industry).filter(Boolean)).size, color: '#8b5cf6' },
        ].map(stat => (
          <div key={stat.label} className="dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${stat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={22} color={stat.color} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={32} className="animate-spin" color="var(--primary)" />
        </div>
      ) : companies.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <Building2 size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
          <p style={{ fontSize: '1rem', fontWeight: 500 }}>No companies added yet</p>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Click "Add Company" to get started</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          <AnimatePresence>
            {companies.map((company, idx) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.04 }}
                whileHover={{ y: -4 }}
                className="dashboard-card"
                style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                {/* Industry badge */}
                {company.industry && (
                  <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '0.68rem', fontWeight: 700, background: `${industryColor(company.industry)}18`, color: industryColor(company.industry) }}>
                      {company.industry}
                    </span>
                  </div>
                )}

                {/* Logo placeholder */}
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `linear-gradient(135deg, ${industryColor(company.industry)}, ${industryColor(company.industry)}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.1rem', fontWeight: 800 }}>
                  {company.name.charAt(0)}
                </div>

                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{company.name}</h3>
                  {company.description && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {company.description}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>
                      <Globe size={13} /> {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Briefcase size={13} />
                    {company.drives?.length || 0} placement drive{(company.drives?.length || 0) !== 1 ? 's' : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                  {deletingConfirmId === company.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Are you sure?</span>
                      <button
                        onClick={() => handleDelete(company.id, company.name)}
                        disabled={deleting === company.id}
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
                      onClick={() => setDeletingConfirmId(company.id)}
                      disabled={deleting === company.id}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', padding: '4px 8px', borderRadius: '6px', opacity: deleting === company.id ? 0.5 : 1 }}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Company Modal */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass"
              style={{ width: '480px', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-xl)', position: 'relative' }}
            >
              <button onClick={() => setShowModal(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--surface-hover)', border: 'none', cursor: 'pointer', borderRadius: '8px', padding: '6px', display: 'flex', color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>Add New Company</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>Fill in company details to add to the recruiter list</p>

              <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Company Name *', key: 'name', placeholder: 'e.g. Infosys Technologies' },
                  { label: 'Website', key: 'website', placeholder: 'https://www.company.com' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>{field.label}</label>
                    <input
                      type={field.key === 'website' ? 'url' : 'text'}
                      value={form[field.key]}
                      onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.875rem' }}
                    />
                  </div>
                ))}

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Industry</label>
                  <select value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.875rem' }}>
                    <option value="">Select industry…</option>
                    {INDUSTRY_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Brief description of what the company does…"
                    rows={3}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.875rem', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.9rem', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {saving ? 'Adding…' : 'Add Company'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Companies;
