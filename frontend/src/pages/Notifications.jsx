import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import useNotificationStore from '../store/notificationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Briefcase, Award, GraduationCap, Plus, Trash2, Loader2, X, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

const notificationTypes = [
  { value: 'GENERAL', label: 'General Alert', icon: <Bell size={18} color="var(--primary)" /> },
  { value: 'INTERNSHIP', label: 'Internship Offer', icon: <Briefcase size={18} color="var(--success)" /> },
  { value: 'PLACEMENT', label: 'Placement Drive', icon: <Award size={18} color="var(--warning)" /> },
  { value: 'GOVT_EXAM', label: 'Government Exam / Prep', icon: <GraduationCap size={18} color="var(--info)" /> }
];

const Notifications = () => {
  const { user } = useAuthStore();
  const { notifications, fetchNotifications, postNotification, deleteNotification, loading } = useNotificationStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'GENERAL'
  });

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenAdd = () => {
    setFormData({ title: '', message: '', type: 'GENERAL' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Title and Message are required");
      return;
    }

    const result = await postNotification(formData);
    if (result.success) {
      toast.success("Notification posted successfully!");
      setIsModalOpen(false);
      fetchNotifications();
    } else {
      toast.error(result.error || "Failed to post notification");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      const result = await deleteNotification(id);
      if (result.success) {
        toast.success("Notification deleted");
      } else {
        toast.error(result.error || "Failed to delete notification");
      }
    }
  };

  const isStaff = user?.role === 'FACULTY' || user?.role === 'COORDINATOR' || user?.role === 'HOD';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="dashboard-header" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="dashboard-title">Notice Board</h1>
          <p className="dashboard-subtitle">Stay updated with the latest internship, placement, and academic notifications.</p>
        </div>
        {isStaff && (
          <button className="btn btn-primary" onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Post Notice
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="glass" style={{ padding: '4rem 2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--text-muted)' }}>
          No notifications posted yet. Check back later!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notifications.map((note) => {
            const typeInfo = notificationTypes.find(t => t.value === note.type) || notificationTypes[0];
            return (
              <motion.div 
                key={note.id} 
                layout 
                className="glass" 
                style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-lg)', borderLeft: `4px solid ${note.type === 'PLACEMENT' ? 'var(--warning)' : note.type === 'INTERNSHIP' ? 'var(--success)' : 'var(--primary)'}` }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ padding: '8px', background: 'var(--surface-hover)', borderRadius: '8px', display: 'flex', height: 'fit-content' }}>
                      {typeInfo.icon}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {note.title}
                      </h2>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Posted on: {new Date(note.createdAt).toLocaleString()} • Category: {typeInfo.label}
                      </span>
                    </div>
                  </div>
                  {isStaff && (
                    <button 
                      onClick={() => handleDelete(note.id)} 
                      className="btn btn-outline" 
                      style={{ padding: '6px', borderColor: '#f87171', color: '#f87171' }}
                      title="Delete Announcement"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                  {note.message}
                </div>
              </motion.div>
            );
          })}
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
                Post New Notice
              </h2>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <div>
                  <label style={labelStyle}>Announcement Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Google Summer of Code 2026 Registration" style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select name="type" value={formData.type} onChange={handleChange} style={selectStyle}>
                    {notificationTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Message Detail *</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} rows={5} placeholder="Write details here..." style={textareaStyle} required />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: 'var(--spacing-md)' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    Post Notice
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
const selectStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)',
  background: 'var(--background)',
  color: 'var(--text-primary)',
  outline: 'none',
  fontSize: '0.9rem'
};

export default Notifications;
