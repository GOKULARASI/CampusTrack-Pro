import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Loader2, Building, Hash } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STUDENT',
    enrollmentNo: '',
    employeeId: '',
    departmentId: '1'
  });
  
  const { register, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--background)' }}>
      {/* Right side - Decorative (flipped from login) */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '4rem',
          background: 'linear-gradient(135deg, #8b5cf6 0%, var(--primary) 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          order: 2
        }}
        className="login-sidebar"
      >
        <div style={{ position: 'relative', zIndex: 10 }}>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '1.5rem' }}
          >
            Start Your Journey<br/>With Us
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '400px', lineHeight: 1.6 }}
          >
            Join thousands of students and faculties collaborating for a better future.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}
          >
            {[1,2,3].map((i) => (
              <div key={i} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', marginLeft: i > 1 ? '-15px' : '0' }}></div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '10px', fontSize: '0.9rem', fontWeight: 500 }}>
              Join 15k+ users
            </div>
          </motion.div>
        </div>
        
        {/* Decorative Grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </motion.div>

      {/* Left side - Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyItems: 'center', padding: '2rem', overflowY: 'auto', order: 1 }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ width: '100%', maxWidth: '450px', margin: 'auto' }}
        >
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Create Account</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Get started with CampusTrack Pro today.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>First Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={iconStyle} />
                  <motion.input whileFocus={focusStyle} type="text" name="firstName" value={formData.firstName} onChange={handleChange} required style={inputStyle} placeholder="John" />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Last Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={iconStyle} />
                  <motion.input whileFocus={focusStyle} type="text" name="lastName" value={formData.lastName} onChange={handleChange} required style={inputStyle} placeholder="Doe" />
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={iconStyle} />
                <motion.input whileFocus={focusStyle} type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} placeholder="john@example.com" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={iconStyle} />
                <motion.input whileFocus={focusStyle} type="password" name="password" value={formData.password} onChange={handleChange} required style={inputStyle} placeholder="••••••••" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>I am a...</label>
                <div style={{ position: 'relative' }}>
                  <Building size={18} style={iconStyle} />
                  <motion.select whileFocus={focusStyle} name="role" value={formData.role} onChange={handleChange} style={inputStyle}>
                    <option value="STUDENT">Student</option>
                    <option value="FACULTY">Faculty</option>
                    <option value="COORDINATOR">Placement Coordinator</option>
                    <option value="ADMIN">Admin</option>
                  </motion.select>
                </div>
              </div>
              
              {formData.role === 'STUDENT' && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ flex: 1 }}>
                  <label style={labelStyle}>Enrollment No.</label>
                  <div style={{ position: 'relative' }}>
                    <Hash size={18} style={iconStyle} />
                    <motion.input whileFocus={focusStyle} type="text" name="enrollmentNo" value={formData.enrollmentNo} onChange={handleChange} required style={inputStyle} placeholder="EN123456" />
                  </div>
                </motion.div>
              )}

              {formData.role === 'FACULTY' && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ flex: 1 }}>
                  <label style={labelStyle}>Employee ID</label>
                  <div style={{ position: 'relative' }}>
                    <Hash size={18} style={iconStyle} />
                    <motion.input whileFocus={focusStyle} type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} required style={inputStyle} placeholder="EMP12345" />
                  </div>
                </motion.div>
              )}
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="btn btn-primary" 
              disabled={loading} 
              style={{ 
                marginTop: '1rem', 
                height: '50px', 
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? <Loader2 className="spin" size={20} /> : 'Create Account'}
              {!loading && <ArrowRight size={20} />}
            </motion.button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
          </div>
        </motion.div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .login-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' };
const iconStyle = { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' };
const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem 0.75rem 2.75rem',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text-primary)',
  outline: 'none',
  transition: 'all 0.2s',
  fontSize: '0.95rem'
};
const focusStyle = { scale: 1.01, borderColor: 'var(--primary)', boxShadow: '0 0 0 4px rgba(79, 70, 229, 0.1)' };

export default Register;
