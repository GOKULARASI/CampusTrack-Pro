import React, { useState, useEffect } from 'react';
import useProfileStore from '../store/profileStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Globe, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Projects = () => {
  const { profile, fetchProfile, updateProfile, loading } = useProfileStore();
  const [projectsList, setProjectsList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: ''
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile && profile.projects) {
      setProjectsList(profile.projects.map(p => ({
        title: p.title,
        description: p.description,
        url: p.url
      })));
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Title and Description are required");
      return;
    }
    setProjectsList([...projectsList, formData]);
    setFormData({ title: '', description: '', url: '' });
    setIsModalOpen(false);
  };

  const handleRemoveProject = (index) => {
    setProjectsList(projectsList.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const result = await updateProfile({
      firstName: profile?.user?.firstName,
      lastName: profile?.user?.lastName,
      projects: projectsList
    });

    if (result.success) {
      toast.success("Projects updated successfully!");
      fetchProfile();
    } else {
      toast.error(result.error || "Failed to update projects");
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
          <h1 className="dashboard-title">Academic & Personal Projects</h1>
          <p className="dashboard-subtitle">List the projects you have built, including GitHub repositories and deployed live links.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Add Project
        </button>
      </div>

      <div className="glass" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
        {projectsList.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No projects added yet. Click the button above to add a project.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {projectsList.map((proj, idx) => (
              <div 
                key={idx} 
                className="glass" 
                style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', position: 'relative' }}
              >
                <button 
                  onClick={() => handleRemoveProject(idx)}
                  style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#f87171' }}
                  title="Remove Project"
                >
                  <Trash2 size={16} />
                </button>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', paddingRight: '24px' }}>
                  {proj.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', minHeight: '40px' }}>
                  {proj.description}
                </p>

                {proj.url && (
                  <a 
                    href={proj.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}
                  >
                    <Globe size={14} /> Live / Repository Link
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '20px' }}>
          <button onClick={handleSave} className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            Save Projects
          </button>
        </div>
      </div>

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
                Add New Project
              </h2>

              <form onSubmit={handleAddProject} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <div>
                  <label style={labelStyle}>Project Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Portfolio Website" style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Project Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Describe what the project does..." style={textareaStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Repository / Live Link URL</label>
                  <input type="url" name="url" value={formData.url} onChange={handleChange} placeholder="https://github.com/..." style={inputStyle} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: 'var(--spacing-md)' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add to List</button>
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
const textareaStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)',
  background: 'var(--background)',
  color: 'var(--text-primary)',
  outline: 'none',
  fontSize: '0.9rem',
  resize: 'vertical'
};

export default Projects;
