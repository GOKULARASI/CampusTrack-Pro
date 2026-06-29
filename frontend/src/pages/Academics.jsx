import React, { useState, useEffect } from 'react';
import useProfileStore from '../store/profileStore';
import { motion } from 'framer-motion';
import { BookOpen, Award, AlertCircle, Plus, Trash2, Loader2, Save } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';

const Academics = () => {
  const { profile, fetchProfile, updateProfile, updateAcademicRecords, loading } = useProfileStore();
  
  const [cgpa, setCgpa] = useState(0);
  const [arrears, setArrears] = useState(0);
  const [semesterRecords, setSemesterRecords] = useState([]);
  
  // For adding new semester record
  const [newSem, setNewSem] = useState({
    semester: '',
    sgpa: '',
    attendancePercent: ''
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setCgpa(profile.cgpa || 0);
      setArrears(profile.arrears || 0);
      setSemesterRecords(profile.academicRecords || []);
    }
  }, [profile]);

  const handleBasicSave = async (e) => {
    e.preventDefault();
    const result = await updateProfile({
      firstName: profile?.user?.firstName,
      lastName: profile?.user?.lastName,
      cgpa: parseFloat(cgpa),
      arrears: parseInt(arrears)
    });

    if (result.success) {
      toast.success("CGPA and Arrears updated!");
      fetchProfile();
    } else {
      toast.error(result.error || "Failed to update details");
    }
  };

  const handleAddSemester = (e) => {
    e.preventDefault();
    const sem = parseInt(newSem.semester);
    const sgpaVal = parseFloat(newSem.sgpa);
    const attVal = parseFloat(newSem.attendancePercent);

    if (isNaN(sem) || isNaN(sgpaVal) || sem < 1 || sgpaVal < 0 || sgpaVal > 10) {
      toast.error("Please enter valid semester number and SGPA (0-10)");
      return;
    }

    if (semesterRecords.some(r => r.semester === sem)) {
      toast.error(`Record for Semester ${sem} already exists!`);
      return;
    }

    const updated = [
      ...semesterRecords,
      {
        semester: sem,
        sgpa: sgpaVal,
        attendancePercent: isNaN(attVal) ? null : attVal,
        arrearsInSem: 0
      }
    ].sort((a, b) => a.semester - b.semester);

    setSemesterRecords(updated);
    setNewSem({ semester: '', sgpa: '', attendancePercent: '' });
  };

  const handleRemoveSemester = (sem) => {
    setSemesterRecords(semesterRecords.filter(r => r.semester !== sem));
  };

  const handleSaveRecords = async () => {
    const result = await updateAcademicRecords(semesterRecords);
    if (result.success) {
      toast.success("Academic records saved to database!");
      fetchProfile();
    } else {
      toast.error(result.error || "Failed to save records");
    }
  };

  // Prepare chart data
  const chartData = semesterRecords.map(r => ({
    semester: `Sem ${r.semester}`,
    sgpa: r.sgpa
  }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h1 style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>Academic Records</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track your SGPA progress, overall CGPA, and standing arrears.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-2xl)' }}>
        <StatBox title="Current CGPA" value={cgpa.toFixed(2)} icon={<Award size={24} color="var(--primary)" />} />
        <StatBox title="Total Arrears" value={arrears.toString()} icon={<AlertCircle size={24} color={arrears > 0 ? '#ef4444' : '#10b981'} />} />
        <StatBox title="Total Semesters logged" value={semesterRecords.length.toString()} icon={<BookOpen size={24} color="#3b82f6" />} />
      </div>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-xl)', alignItems: 'start' }}>
        
        {/* Left column: Trend & basic form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
          
          {/* Performance Chart */}
          <div className="glass" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)', fontWeight: 600 }}>Performance Trend</h3>
            <div style={{ height: '260px' }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="semester" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 10]} stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="sgpa" stroke="var(--primary)" strokeWidth={3} name="SGPA" activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  Add semester details to see your graph trend.
                </div>
              )}
            </div>
          </div>

          {/* Update basic CGPA / Arrears */}
          <div className="glass" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)', fontWeight: 600 }}>Update Basic Metrics</h3>
            <form onSubmit={handleBasicSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
              <div>
                <label style={labelStyle}>Cumulative GPA (CGPA)</label>
                <input type="number" step="0.01" value={cgpa} onChange={(e) => setCgpa(e.target.value)} style={inputStyle} min="0" max="10" required />
              </div>
              <div>
                <label style={labelStyle}>Standing Arrears</label>
                <input type="number" value={arrears} onChange={(e) => setArrears(e.target.value)} style={inputStyle} min="0" required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>Save Metrics</button>
            </form>
          </div>

        </div>

        {/* Right column: Semester details list */}
        <div className="glass" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)', fontWeight: 600 }}>Semester SGPA Logs</h3>
          
          {/* Add semester record form */}
          <form onSubmit={handleAddSemester} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '8px' }}>
              <input 
                type="number" 
                placeholder="Sem #" 
                value={newSem.semester} 
                onChange={(e) => setNewSem({...newSem, semester: e.target.value})} 
                style={inputStyle} 
              />
              <input 
                type="number" 
                step="0.01" 
                placeholder="SGPA (0-10)" 
                value={newSem.sgpa} 
                onChange={(e) => setNewSem({...newSem, sgpa: e.target.value})} 
                style={inputStyle} 
              />
            </div>
            <button type="submit" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem', padding: '6px' }}>
              <Plus size={14} /> Add Semester
            </button>
          </form>

          {/* List semesters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {semesterRecords.map(rec => (
              <div key={rec.semester} style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--background)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Semester {rec.semester}</div>
                  {rec.attendancePercent && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Attendance: {rec.attendancePercent}%</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1rem' }}>
                    {rec.sgpa.toFixed(2)}
                  </span>
                  <button 
                    onClick={() => handleRemoveSemester(rec.semester)} 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#f87171', display: 'flex', padding: 0 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {semesterRecords.length > 0 && (
            <button 
              onClick={handleSaveRecords} 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Semester Details
            </button>
          )}
        </div>

      </div>
    </motion.div>
  );
};

const StatBox = ({ title, value, icon }) => (
  <div className="glass" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--background)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{title}</div>
      <div style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
    </div>
  </div>
);

const labelStyle = { display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' };

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

export default Academics;
