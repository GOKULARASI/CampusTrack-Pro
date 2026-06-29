import React, { useState, useEffect } from 'react';
import useInternshipStore from '../store/internshipStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, ExternalLink, Calendar, BookOpen, Clock, Loader2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Internships = () => {
  const { internships, fetchInternships, addInternship, updateInternship, deleteInternship, loading } = useInternshipStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    duration: '',
    startDate: '',
    endDate: '',
    skillsGained: '',
    certificateUrl: ''
  });

  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);

  const handleOpenAdd = () => {
    setFormData({
      companyName: '',
      role: '',
      duration: '',
      startDate: '',
      endDate: '',
      skillsGained: '',
      certificateUrl: ''
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setFormData({
      companyName: item.companyName,
      role: item.role,
      duration: item.duration,
      startDate: item.startDate ? item.startDate.split('T')[0] : '',
      endDate: item.endDate ? item.endDate.split('T')[0] : '',
      skillsGained: item.skillsGained || '',
      certificateUrl: item.certificateUrl || ''
    });
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.role.trim() || !formData.duration.trim()) {
      toast.error("Company Name, Role and Duration are required fields");
      return;
    }

    let result;
    if (editingId) {
      result = await updateInternship(editingId, formData);
    } else {
      result = await addInternship(formData);
    }

    if (result.success) {
      toast.success(editingId ? "Internship updated successfully" : "Internship added successfully");
      setIsModalOpen(false);
      fetchInternships();
    } else {
      toast.error(result.error || "Failed to save internship");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this internship record?")) {
      const result = await deleteInternship(id);
      if (result.success) {
        toast.success("Internship record deleted");
      } else {
        toast.error(result.error || "Failed to delete internship record");
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="dashboard-header" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="dashboard-title">Internship Management</h1>
          <p className="dashboard-subtitle">List and manage your technical work-experience, internships and certificates.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Add Internship
        </button>
      </div>

      {internships.length === 0 ? (
        <div className="glass" style={{ padding: '4rem 2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--text-muted)' }}>
          No internship details found. Click the button above to add your first internship details.
        </div>
      ) : (
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-lg)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px' }}>Company</th>
                <th style={{ padding: '12px' }}>Role</th>
                <th style={{ padding: '12px' }}>Duration</th>
                <th style={{ padding: '12px' }}>Skills Gained</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {internships.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{item.companyName}</td>
                  <td style={{ padding: '12px' }}>{item.role}</td>
                  <td style={{ padding: '12px' }}>{item.duration}</td>
                  <td style={{ padding: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.skillsGained || '—'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      background: item.status === 'VERIFIED' ? 'rgba(16, 185, 129, 0.1)' : item.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: item.status === 'VERIFIED' ? '#10b981' : item.status === 'REJECTED' ? '#ef4444' : '#f59e0b'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={() => handleOpenEdit(item)}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-outline" style={{ padding: '4px 8px', borderColor: '#f87171', color: '#f87171' }} onClick={() => handleDelete(item.id)}>
                        <Trash2 size={14} />
                      </button>
                      {item.certificateUrl && (
                        <a href={item.certificateUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '4px 8px' }}>
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass" 
              style={{ width: '500px', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', position: 'relative' }}
            >
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-lg)' }}>
                {editingId ? 'Edit Internship Record' : 'Add Internship Record'}
              </h2>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <div>
                  <label style={labelStyle}>Company Name *</label>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Role / Title *</label>
                  <input type="text" name="role" value={formData.role} onChange={handleChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Duration (e.g. 3 Months, 6 Weeks) *</label>
                  <input type="text" name="duration" value={formData.duration} onChange={handleChange} style={inputStyle} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Start Date</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>End Date</label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Skills Gained (Comma separated)</label>
                  <input type="text" name="skillsGained" value={formData.skillsGained} onChange={handleChange} placeholder="e.g. React, Node.js, Project Management" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Certificate URL / Link</label>
                  <input type="url" name="certificateUrl" value={formData.certificateUrl} onChange={handleChange} placeholder="https://drive.google.com/..." style={inputStyle} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: 'var(--spacing-md)' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    Save Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const labelStyle = { display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' };
const inputStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)',
  background: 'var(--background)',
  color: 'var(--text-primary)',
  outline: 'none',
  fontSize: '0.9rem'
};

export default Internships;
