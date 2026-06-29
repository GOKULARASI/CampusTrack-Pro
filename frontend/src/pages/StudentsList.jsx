import React, { useState, useEffect } from 'react';
import useProfileStore from '../store/profileStore';
import useDocumentStore from '../store/documentStore';
import useInternshipStore from '../store/internshipStore';
import usePlacementStore from '../store/placementStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, FileText, CheckCircle, XCircle, Search, Eye, Award, Briefcase,
  ChevronRight, X, ExternalLink, Download, Filter, RefreshCw, FileDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const PLACEMENT_STATUS_OPTIONS = ['ALL', 'NOT_APPLICABLE', 'PLACED', 'OFFER_ACCEPTED', 'PENDING_VERIFICATION'];
const STATUS_COLORS = {
  PLACED: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  OFFER_ACCEPTED: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
  PENDING_VERIFICATION: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  NOT_APPLICABLE: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' },
};

const StudentsList = () => {
  const { students, fetchStudents } = useProfileStore();
  const { verifyDocument } = useDocumentStore();
  const { verifyInternship } = useInternshipStore();
  const { verifyPlacementRecord } = usePlacementStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterBatch, setFilterBatch] = useState('ALL');
  const [filterPlacement, setFilterPlacement] = useState('ALL');
  const [filterMinCgpa, setFilterMinCgpa] = useState('');
  const [filterMaxArrears, setFilterMaxArrears] = useState('');

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  useEffect(() => {
    if (selectedStudent) {
      api.get(`/students/profile/${selectedStudent.user.id}`)
        .then(r => setSelectedStudentProfile(r.data))
        .catch(() => toast.error('Failed to load student details'));
    } else {
      setSelectedStudentProfile(null);
    }
  }, [selectedStudent]);

  // Derived filter options
  const departments = ['ALL', ...new Set(students.map(s => s.department?.name).filter(Boolean))];
  const batchYears = ['ALL', ...new Set(students.map(s => s.batchYear).filter(Boolean)).values()].sort();

  // Apply filters
  const filteredStudents = students.filter(s => {
    const fullName = `${s.user.firstName} ${s.user.lastName}`.toLowerCase();
    const email = s.user.email.toLowerCase();
    const roll = s.enrollmentNo.toLowerCase();
    const query = searchTerm.toLowerCase();
    const matchSearch = fullName.includes(query) || email.includes(query) || roll.includes(query);

    const matchDept = filterDept === 'ALL' || s.department?.name === filterDept;
    const matchBatch = filterBatch === 'ALL' || String(s.batchYear) === String(filterBatch);
    const placementStatus = s.placementRecord ? s.placementRecord.status : 'NOT_APPLICABLE';
    const matchPlacement = filterPlacement === 'ALL' || placementStatus === filterPlacement;
    const matchCgpa = !filterMinCgpa || (s.cgpa || 0) >= parseFloat(filterMinCgpa);
    const matchArrears = !filterMaxArrears || (s.arrears || 0) <= parseInt(filterMaxArrears);

    return matchSearch && matchDept && matchBatch && matchPlacement && matchCgpa && matchArrears;
  });

  const handleVerifyDoc = async (docId, status) => {
    const result = await verifyDocument(docId, status, remarks);
    if (result.success) {
      toast.success(`Document ${status.toLowerCase()}!`);
      setRemarks('');
      const r = await api.get(`/students/profile/${selectedStudent.user.id}`);
      setSelectedStudentProfile(r.data);
      fetchStudents();
    } else toast.error(result.error || 'Failed to update document status');
  };

  const handleVerifyIntern = async (internId, status) => {
    const result = await verifyInternship(internId, status, remarks);
    if (result.success) {
      toast.success(`Internship ${status.toLowerCase()}!`);
      setRemarks('');
      const r = await api.get(`/students/profile/${selectedStudent.user.id}`);
      setSelectedStudentProfile(r.data);
      fetchStudents();
    } else toast.error(result.error || 'Failed to update internship status');
  };

  const handleVerifyPlacement = async (recordId, isVerified) => {
    const result = await verifyPlacementRecord(recordId, isVerified, remarks);
    if (result.success) {
      toast.success(`Placement record ${isVerified ? 'verified' : 'rejected'}!`);
      setRemarks('');
      const r = await api.get(`/students/profile/${selectedStudent.user.id}`);
      setSelectedStudentProfile(r.data);
      fetchStudents();
    } else toast.error(result.error || 'Failed to update placement record');
  };

  const generateReport = () => {
    let csv = 'Name,Email,Enrollment No,Department,Batch Year,Semester,CGPA,Arrears,Career Path,Placement Status,Company,Package\n';
    filteredStudents.forEach(s => {
      const name = `${s.user.firstName} ${s.user.lastName}`;
      const dept = s.department?.name || 'N/A';
      const status = s.placementRecord ? s.placementRecord.status : 'NOT_APPLICABLE';
      const company = s.placementRecord ? s.placementRecord.companyName : 'N/A';
      const pkg = s.placementRecord ? s.placementRecord.package : 'N/A';
      csv += `"${name}","${s.user.email}","${s.enrollmentNo}","${dept}",${s.batchYear},${s.currentSemester},${s.cgpa || 0},${s.arrears || 0},"${s.careerPath}","${status}","${company}","${pkg}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredStudents.length} student records!`);
  };

  const resetFilters = () => {
    setFilterDept('ALL');
    setFilterBatch('ALL');
    setFilterPlacement('ALL');
    setFilterMinCgpa('');
    setFilterMaxArrears('');
    setSearchTerm('');
  };

  const activeFiltersCount = [
    filterDept !== 'ALL', filterBatch !== 'ALL', filterPlacement !== 'ALL',
    filterMinCgpa !== '', filterMaxArrears !== ''
  ].filter(Boolean).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div>
          <h1 className="dashboard-title">Student Profile Directory</h1>
          <p className="dashboard-subtitle">
            {filteredStudents.length} of {students.length} students · Search, filter, view profiles and download reports
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}
          >
            <Filter size={16} />
            Filters
            {activeFiltersCount > 0 && (
              <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: '-6px', right: '-6px' }}>
                {activeFiltersCount}
              </span>
            )}
          </button>
          <button className="btn btn-primary" onClick={generateReport} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileDown size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: 'var(--spacing-md)' }}>
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by name, roll number, or email…"
          style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem' }}
        />
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden', marginBottom: 'var(--spacing-md)' }}
          >
            <div className="dashboard-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', padding: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>DEPARTMENT</label>
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>BATCH YEAR</label>
                <select value={filterBatch} onChange={e => setFilterBatch(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}>
                  {batchYears.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>PLACEMENT STATUS</label>
                <select value={filterPlacement} onChange={e => setFilterPlacement(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}>
                  {PLACEMENT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>MIN CGPA</label>
                <input type="number" min="0" max="10" step="0.1" value={filterMinCgpa} onChange={e => setFilterMinCgpa(e.target.value)}
                  placeholder="e.g. 7.0"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>MAX ARREARS</label>
                <input type="number" min="0" value={filterMaxArrears} onChange={e => setFilterMaxArrears(e.target.value)}
                  placeholder="e.g. 0"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={resetFilters} className="btn btn-outline" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <RefreshCw size={14} /> Reset
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student Table */}
      <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
        {filteredStudents.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <div>No students match the current filters.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--surface-hover)' }}>
                {['Student', 'Roll No', 'Department', 'CGPA / Arrears', 'Status', 'Resume', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, idx) => {
                const defaultResume = student.resumes?.find(r => r.isDefault) || student.resumes?.[0];
                const placementStatus = student.placementRecord ? student.placementRecord.status : 'NOT_APPLICABLE';
                const statusStyle = STATUS_COLORS[placementStatus] || STATUS_COLORS.NOT_APPLICABLE;
                return (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    style={{ borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-primary)' }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                          {student.user.firstName.charAt(0)}{student.user.lastName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{student.user.firstName} {student.user.lastName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.85rem' }}>{student.enrollmentNo}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.85rem' }}>{student.department?.name || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Batch {student.batchYear}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{student.cgpa ? student.cgpa.toFixed(2) : '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: student.arrears > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                        {student.arrears || 0} arrear(s)
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700, background: statusStyle.bg, color: statusStyle.color }}>
                        {placementStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {defaultResume ? (
                        <a href={`http://localhost:5000${defaultResume.fileUrl}?token=${localStorage.getItem('token')}`} target="_blank" rel="noopener noreferrer"
                          className="btn btn-outline"
                          style={{ padding: '5px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <Download size={13} /> Resume
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        onClick={() => setSelectedStudent(student)}
                      >
                        View <ChevronRight size={14} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass"
              style={{ width: '860px', maxHeight: '92vh', overflowY: 'auto', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-xl)', position: 'relative' }}
            >
              <button onClick={() => setSelectedStudent(null)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--surface-hover)', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', borderRadius: '8px', padding: '6px', display: 'flex' }}>
                <X size={20} />
              </button>

              {/* Student Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-lg)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700 }}>
                  {selectedStudent.user.firstName.charAt(0)}{selectedStudent.user.lastName.charAt(0)}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {selectedStudent.user.firstName} {selectedStudent.user.lastName}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {selectedStudent.enrollmentNo} · {selectedStudent.user.email} · {selectedStudent.department?.name}
                  </p>
                </div>
              </div>

              {!selectedStudentProfile ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                  <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Remarks Input */}
                  <div className="glass" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px dashed var(--border)' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Audit Remarks (optional — applied to next action)
                    </label>
                    <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)}
                      placeholder="e.g. Certificate verified, Invalid file, Offer letter approved…"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.875rem' }} />
                  </div>

                  {/* Resumes */}
                  <Section title="Resumes" icon={<FileText size={18} color="var(--primary)" />}>
                    {selectedStudentProfile.resumes.length === 0 ? (
                      <Empty text="No resumes uploaded." />
                    ) : (
                      selectedStudentProfile.resumes.map(resume => (
                        <div key={resume.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--background)' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{resume.fileName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              v{resume.version} · Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                              {resume.isDefault && <span style={{ marginLeft: '8px', background: 'rgba(59,130,246,0.1)', color: 'var(--primary)', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700 }}>DEFAULT</span>}
                            </div>
                          </div>
                          <a href={`http://localhost:5000${resume.fileUrl}?token=${localStorage.getItem('token')}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <Download size={13} /> Download
                          </a>
                        </div>
                      ))
                    )}
                  </Section>

                  {/* Documents */}
                  <Section title="Documents" icon={<FileText size={18} color="var(--primary)" />}>
                    {selectedStudentProfile.documents.length === 0 ? (
                      <Empty text="No documents uploaded." />
                    ) : (
                      selectedStudentProfile.documents.map(doc => (
                        <DocItem key={doc.id} label={doc.type} sub={doc.fileName} status={doc.status} remarks={doc.remarks}>
                          <a href={`http://localhost:5000${doc.fileUrl}?token=${localStorage.getItem('token')}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '4px 8px' }}><ExternalLink size={12} /></a>
                          <ActionBtn onClick={() => handleVerifyDoc(doc.id, 'VERIFIED')} color="#10b981">✓</ActionBtn>
                          <ActionBtn onClick={() => handleVerifyDoc(doc.id, 'REJECTED')} color="#ef4444">✕</ActionBtn>
                        </DocItem>
                      ))
                    )}
                  </Section>

                  {/* Internships */}
                  <Section title="Internships" icon={<Briefcase size={18} color="var(--primary)" />}>
                    {selectedStudentProfile.internships.length === 0 ? (
                      <Empty text="No internship records." />
                    ) : (
                      selectedStudentProfile.internships.map(intern => (
                        <DocItem key={intern.id} label={`${intern.companyName} — ${intern.role}`} sub={`${intern.duration} · ${intern.skillsGained || 'N/A'}`} status={intern.status} remarks={intern.remarks}>
                          <ActionBtn onClick={() => handleVerifyIntern(intern.id, 'VERIFIED')} color="#10b981">✓</ActionBtn>
                          <ActionBtn onClick={() => handleVerifyIntern(intern.id, 'REJECTED')} color="#ef4444">✕</ActionBtn>
                        </DocItem>
                      ))
                    )}
                  </Section>

                  {/* Placement Record */}
                  <Section title="Placement Record" icon={<Award size={18} color="var(--primary)" />}>
                    {!selectedStudentProfile.placementRecord ? (
                      <Empty text="No placement record submitted." />
                    ) : (
                      <div style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--background)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedStudentProfile.placementRecord.companyName}</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              {selectedStudentProfile.placementRecord.role} · ₹{selectedStudentProfile.placementRecord.package} LPA
                            </div>
                            <span style={{ display: 'inline-block', marginTop: '6px', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, background: selectedStudentProfile.placementRecord.isVerified ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: selectedStudentProfile.placementRecord.isVerified ? '#10b981' : '#f59e0b' }}>
                              {selectedStudentProfile.placementRecord.isVerified ? 'VERIFIED' : 'PENDING'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                            {selectedStudentProfile.placementRecord.proofUrl && (
                              <a href={selectedStudentProfile.placementRecord.proofUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '5px 10px' }}><ExternalLink size={13} /></a>
                            )}
                            <ActionBtn onClick={() => handleVerifyPlacement(selectedStudentProfile.placementRecord.id, true)} color="#10b981">Verify</ActionBtn>
                            <ActionBtn onClick={() => handleVerifyPlacement(selectedStudentProfile.placementRecord.id, false)} color="#ef4444">Reject</ActionBtn>
                          </div>
                        </div>
                      </div>
                    )}
                  </Section>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
};

const Section = ({ title, icon, children }) => (
  <div>
    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      {icon} {title}
    </h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{children}</div>
  </div>
);

const Empty = ({ text }) => (
  <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', padding: '12px', background: 'var(--surface-hover)', borderRadius: '8px', textAlign: 'center' }}>{text}</div>
);

const DocItem = ({ label, sub, status, remarks, children }) => {
  const statusColor = status === 'VERIFIED' ? '#10b981' : status === 'REJECTED' ? '#ef4444' : '#f59e0b';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--background)', gap: '12px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '1px' }}>{sub}</div>
        <div style={{ fontSize: '0.73rem', color: statusColor, marginTop: '2px', fontWeight: 600 }}>
          {status}{remarks ? ` · ${remarks}` : ''}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>{children}</div>
    </div>
  );
};

const ActionBtn = ({ onClick, color, children }) => (
  <button onClick={onClick} style={{ padding: '5px 10px', borderRadius: '7px', border: `1px solid ${color}`, color, background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s' }}
    onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.color = 'white'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = color; }}>
    {children}
  </button>
);

export default StudentsList;
