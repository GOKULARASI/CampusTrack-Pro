import React, { useState, useEffect } from 'react';
import useDocumentStore from '../store/documentStore';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, Clock, XCircle, Trash2, Eye, Download, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const documentTypes = [
  { value: 'RESUME', label: 'Resume' },
  { value: 'SKILL_CERTIFICATE', label: 'Skill Certificate' },
  { value: 'INTERNSHIP_CERTIFICATE', label: 'Internship Certificate' },
  { value: 'PROJECT_CERTIFICATE', label: 'Project Certificate' },
  { value: 'PLACEMENT_DOCUMENT', label: 'Placement Document' },
  { value: 'GOVT_EXAM_CERTIFICATE', label: 'Government Exam Certificate' },
  { value: 'HIGHER_STUDIES_DOCUMENT', label: 'Higher Studies Document' }
];

const Certifications = () => {
  const { documents, fetchMyDocuments, uploadDocument, deleteDocument, loading } = useDocumentStore();
  const [selectedType, setSelectedType] = useState('SKILL_CERTIFICATE');
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchMyDocuments();
  }, [fetchMyDocuments]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', selectedType);

    const result = await uploadDocument(formData);
    if (result.success) {
      toast.success("Document uploaded successfully!");
      setFile(null);
      // Reset input element
      document.getElementById('file-input').value = '';
    } else {
      toast.error(result.error || "Failed to upload document");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      const result = await deleteDocument(id);
      if (result.success) {
        toast.success("Document deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete document");
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle size={16} color="#10b981" />;
      case 'REJECTED':
        return <XCircle size={16} color="#ef4444" />;
      default:
        return <Clock size={16} color="#f59e0b" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="dashboard-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h1 className="dashboard-title">Document & Certificates Vault</h1>
        <p className="dashboard-subtitle">Upload and manage your resumes, certificates, and academic documents for coordinator review.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-xl)', alignItems: 'start' }}>
        {/* Upload Form */}
        <div className="glass" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>Upload New Document</h2>
          
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div>
              <label style={labelStyle}>Document Type</label>
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)} 
                style={selectStyle}
              >
                {documentTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Select File</label>
              <div style={dropzoneStyle}>
                <Upload size={32} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                <input 
                  id="file-input"
                  type="file" 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                />
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => document.getElementById('file-input').click()}
                  style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                >
                  Browse Files
                </button>
                {file && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '8px', wordBreak: 'break-all' }}>
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
              </p>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading || !file}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Upload Document
            </button>
          </form>
        </div>

        {/* Uploaded Documents List */}
        <div className="glass" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>Your Uploaded Vault</h2>

          {documents.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <FileText size={48} opacity={0.3} />
              <span>No documents uploaded yet. Use the panel on the left to add documents.</span>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '12px 8px' }}>Type</th>
                    <th style={{ padding: '12px 8px' }}>File Name</th>
                    <th style={{ padding: '12px 8px' }}>Status</th>
                    <th style={{ padding: '12px 8px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 500 }}>
                        {documentTypes.find(t => t.value === doc.type)?.label || doc.type}
                      </td>
                      <td style={{ padding: '12px 8px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={doc.fileName}>
                        {doc.fileName}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                          {getStatusIcon(doc.status)}
                          <span style={{ 
                            textTransform: 'capitalize', 
                            color: doc.status === 'VERIFIED' ? '#10b981' : doc.status === 'REJECTED' ? '#ef4444' : '#f59e0b',
                            fontWeight: 600
                          }}>
                            {doc.status.toLowerCase()}
                          </span>
                        </div>
                        {doc.remarks && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Ref: {doc.remarks}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <a 
                            href={`http://localhost:5000${doc.fileUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-outline"
                            style={{ padding: '4px 8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Preview"
                          >
                            <Eye size={14} />
                          </a>
                          <button 
                            onClick={() => handleDelete(doc.id)} 
                            className="btn btn-outline"
                            style={{ padding: '4px 8px', borderColor: '#f87171', color: '#f87171' }}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const labelStyle = { display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' };

const selectStyle = {
  width: '100%',
  padding: '0.6rem 1rem',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)',
  background: 'var(--background)',
  color: 'var(--text-primary)',
  outline: 'none',
  fontSize: '0.95rem'
};

const dropzoneStyle = {
  border: '2px dashed var(--border)',
  borderRadius: 'var(--radius-md)',
  padding: '24px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: 'rgba(255, 255, 255, 0.02)',
  cursor: 'pointer'
};

export default Certifications;
