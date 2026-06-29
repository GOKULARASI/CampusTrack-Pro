import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import useProfileStore from '../store/profileStore';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Link as LinkIcon, Briefcase, Camera, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuthStore();
  const { profile, fetchProfile, updateProfile, loading } = useProfileStore();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    careerPath: 'UNDECIDED',
    cgpa: 0,
    arrears: 0,
    currentSemester: 1
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.user?.firstName || '',
        lastName: profile.user?.lastName || '',
        phone: profile.phone || '',
        address: profile.address || '',
        githubUrl: profile.githubUrl || '',
        linkedinUrl: profile.linkedinUrl || '',
        portfolioUrl: profile.portfolioUrl || '',
        careerPath: profile.careerPath || 'UNDECIDED',
        cgpa: profile.cgpa || 0,
        arrears: profile.arrears || 0,
        currentSemester: profile.currentSemester || 1
      });
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      }));
    }
  }, [profile, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // clear error for that field
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    
    // Optional phone validation (10 digits)
    if (formData.phone && !/^\+?[0-9]{10,12}$/.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = "Enter a valid 10-12 digit phone number";
    }

    // URL validations
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (formData.githubUrl && !urlPattern.test(formData.githubUrl)) {
      newErrors.githubUrl = "Enter a valid GitHub URL";
    }
    if (formData.linkedinUrl && !urlPattern.test(formData.linkedinUrl)) {
      newErrors.linkedinUrl = "Enter a valid LinkedIn URL";
    }
    if (formData.portfolioUrl && !urlPattern.test(formData.portfolioUrl)) {
      newErrors.portfolioUrl = "Enter a valid Portfolio URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix validation errors before saving.");
      return;
    }
    const result = await updateProfile(formData);
    if (result.success) {
      toast.success("Profile saved successfully!");
    } else {
      toast.error(result.error || "Failed to update profile.");
    }
  };

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h1 style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>My Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your personal details and public presence.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-2xl)' }}>
        {/* Left Column: Photo & Quick Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
          <div className="glass" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto var(--spacing-md) auto' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold' }}>
                {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
              </div>
            </div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{formData.firstName} {formData.lastName}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--spacing-md)' }}>
              {user.role} • {profile?.department?.name || 'CSE Department'}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ padding: '6px 12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                Enrollment: {profile?.enrollmentNo || 'Not Added'}
              </div>
              <div style={{ padding: '6px 12px', background: profile?.placementRecord?.isVerified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: profile?.placementRecord?.isVerified ? '#10b981' : '#f59e0b', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                Placement Status: {profile?.placementRecord ? profile.placementRecord.status : 'NOT_APPLICABLE'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="glass" style={{ padding: 'var(--spacing-2xl)', borderRadius: 'var(--radius-lg)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
            
            <section>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Personal Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={iconStyle} />
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} style={inputStyle} />
                  </div>
                  {errors.firstName && <span style={errorStyle}>{errors.firstName}</span>}
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={iconStyle} />
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} style={inputStyle} />
                  </div>
                  {errors.lastName && <span style={errorStyle}>{errors.lastName}</span>}
                </div>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={iconStyle} />
                    <input type="email" name="email" value={user.email} disabled style={{...inputStyle, opacity: 0.7, cursor: 'not-allowed'}} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={iconStyle} />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g. 9876543210" style={inputStyle} />
                  </div>
                  {errors.phone && <span style={errorStyle}>{errors.phone}</span>}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Current Address</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={18} style={iconStyle} />
                    <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="e.g. 123 Street Name, City" style={inputStyle} />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Academic Info</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div>
                  <label style={labelStyle}>CGPA</label>
                  <input type="number" step="0.01" name="cgpa" value={formData.cgpa} onChange={handleChange} style={inputStyleRaw} />
                </div>
                <div>
                  <label style={labelStyle}>Standing Arrears</label>
                  <input type="number" name="arrears" value={formData.arrears} onChange={handleChange} style={inputStyleRaw} />
                </div>
                <div>
                  <label style={labelStyle}>Current Semester</label>
                  <input type="number" name="currentSemester" value={formData.currentSemester} onChange={handleChange} style={inputStyleRaw} />
                </div>
              </div>
            </section>

            <section>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Career Details</h3>
              <div>
                <label style={labelStyle}>Career Goal / Path</label>
                <select name="careerPath" value={formData.careerPath} onChange={handleChange} style={selectStyle}>
                  <option value="UNDECIDED">Undecided</option>
                  <option value="PLACEMENT">Campus Placement</option>
                  <option value="HIGHER_STUDIES">Higher Studies (MS/MTech/MBA)</option>
                  <option value="ENTREPRENEURSHIP">Entrepreneurship / Startup</option>
                  <option value="GOVERNMENT_EXAMS">Government Exams (UPSC/GATE/etc.)</option>
                </select>
              </div>
            </section>

            <section>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Public Links</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div>
                  <label style={labelStyle}>GitHub Profile</label>
                  <div style={{ position: 'relative' }}>
                    <LinkIcon size={18} style={iconStyle} />
                    <input type="url" name="githubUrl" value={formData.githubUrl} onChange={handleChange} placeholder="https://github.com/username" style={inputStyle} />
                  </div>
                  {errors.githubUrl && <span style={errorStyle}>{errors.githubUrl}</span>}
                </div>
                <div>
                  <label style={labelStyle}>LinkedIn Profile</label>
                  <div style={{ position: 'relative' }}>
                    <LinkIcon size={18} style={iconStyle} />
                    <input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/username" style={inputStyle} />
                  </div>
                  {errors.linkedinUrl && <span style={errorStyle}>{errors.linkedinUrl}</span>}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Portfolio Website</label>
                  <div style={{ position: 'relative' }}>
                    <Briefcase size={18} style={iconStyle} />
                    <input type="url" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} placeholder="https://yourportfolio.com" style={inputStyle} />
                  </div>
                  {errors.portfolioUrl && <span style={errorStyle}>{errors.portfolioUrl}</span>}
                </div>
              </div>
            </section>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-md)' }}>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {loading && <Loader2 size={16} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

const labelStyle = { display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' };
const iconStyle = { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' };
const errorStyle = { color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' };

const inputStyle = {
  width: '100%',
  padding: '0.6rem 1rem 0.6rem 2.5rem',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)',
  background: 'var(--background)',
  color: 'var(--text-primary)',
  outline: 'none',
  transition: 'all 0.2s',
  fontSize: '0.95rem'
};

const inputStyleRaw = {
  width: '100%',
  padding: '0.6rem 1rem',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)',
  background: 'var(--background)',
  color: 'var(--text-primary)',
  outline: 'none',
  transition: 'all 0.2s',
  fontSize: '0.95rem'
};

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

export default Profile;
