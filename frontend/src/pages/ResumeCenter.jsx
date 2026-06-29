import React, { useState, useEffect } from 'react';
import useDocumentStore from '../store/documentStore';
import { motion } from 'framer-motion';
import { FileText, Upload, CheckCircle, Trash2, Eye, ExternalLink, Loader2, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ResumeCenter = () => {
  const { documents, fetchMyDocuments, uploadDocument, deleteDocument, loading } = useDocumentStore();
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchMyDocuments();
  }, [fetchMyDocuments]);

  // Filter resumes only
  const resumesList = documents.filter(doc => doc.type === 'RESUME');
  const activeResume = resumesList[resumesList.length - 1]; // Latest one is active

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a resume file");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'RESUME');

    const result = await uploadDocument(formData);
    if (result.success) {
      toast.success("Resume uploaded successfully!");
      setFile(null);
      document.getElementById('resume-input').value = '';
      fetchMyDocuments();
    } else {
      toast.error(result.error || "Failed to upload resume");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      const result = await deleteDocument(id);
      if (result.success) {
        toast.success("Resume deleted");
        fetchMyDocuments();
      } else {
        toast.error(result.error || "Failed to delete resume");
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="dashboard-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h1 className="dashboard-title">Resume Center</h1>
        <p className="dashboard-subtitle">Upload and track versions of your resume for placement drives.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)', alignItems: 'start' }}>
        
        {/* Left Column: Active Resume & Upload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
          
          {/* Active Resume */}
          <div className="glass" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>Active Resume</h2>
            
            {activeResume ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', wordBreak: 'break-all' }}>{activeResume.fileName}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
                      Uploaded on: {new Date(activeResume.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '8px 12px', 
                  background: activeResume.status === 'VERIFIED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  borderRadius: '6px',
                  color: activeResume.status === 'VERIFIED' ? '#10b981' : '#f59e0b',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}>
                  {activeResume.status === 'VERIFIED' ? <CheckCircle size={16} /> : <Clock size={16} />}
                  Status: {activeResume.status}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <a 
                    href={`http://localhost:5000${activeResume.fileUrl}?token=${localStorage.getItem('token')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-primary"
                    style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}
                  >
                    <Eye size={16} /> View / Download
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active resume uploaded. Please upload a resume to apply for drives.
              </div>
            )}
          </div>

          {/* Upload Resume Form */}
          <div className="glass" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>Upload New Version</h2>
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={dropzoneStyle}>
                <Upload size={32} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                <input 
                  id="resume-input"
                  type="file" 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                  
                />
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => document.getElementById('resume-input').click()}
                  style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                >
                  Browse PDF/Word
                </button>
                {file && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '8px', wordBreak: 'break-all' }}>
                    {file.name}
                  </span>
                )}
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading || !file}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Upload Resume
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Upload History */}
        <div className="glass" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>Resume Version History</h2>

          {resumesList.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No history found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {resumesList.map((res, index) => (
                <div key={res.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--background)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '70%' }}>
                    <FileText size={20} color="var(--text-secondary)" />
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={res.fileName}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{res.fileName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ver {index + 1} • {new Date(res.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <a 
                      href={`http://localhost:5000${res.fileUrl}?token=${localStorage.getItem('token')}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-outline"
                      style={{ padding: '4px 8px' }}
                    >
                      <ExternalLink size={12} />
                    </a>
                    <button 
                      onClick={() => handleDelete(res.id)} 
                      className="btn btn-outline"
                      style={{ padding: '4px 8px', borderColor: '#f87171', color: '#f87171' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
};

const dropzoneStyle = {
  border: '2px dashed var(--border)',
  borderRadius: 'var(--radius-md)',
  padding: '20px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: 'rgba(255, 255, 255, 0.02)',
  cursor: 'pointer'
};

export default ResumeCenter;
