import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, ArrowRight, Loader2, GraduationCap,
  Users, Briefcase, ShieldCheck, Eye, EyeOff,
  Sparkles, CheckCircle2, Star, ChevronRight
} from 'lucide-react';
import useAuthStore from '../store/authStore';

/* ─── Role definitions ─── */
const ROLES = [
  {
    id: 'STUDENT',
    label: 'Student',
    emoji: '🎓',
    icon: <GraduationCap size={22} />,
    desc: 'Apply for drives, track applications & manage your career profile.',
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.25)',
    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    bg: 'linear-gradient(135deg, #0f0e2e 0%, #1a1560 50%, #0d0c2a 100%)',
    features: ['Apply to placement drives', 'Track application status', 'Manage resume & documents', 'AI career path guidance'],
  },
  {
    id: 'FACULTY',
    label: 'Faculty',
    emoji: '👨‍🏫',
    icon: <Users size={22} />,
    desc: 'View student profiles, verify documents & track department stats.',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.25)',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    bg: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #022c22 100%)',
    features: ['View student profiles', 'Verify documents', 'Department analytics', 'Download reports'],
  },
  {
    id: 'COORDINATOR',
    label: 'Coordinator',
    emoji: '📋',
    icon: <Briefcase size={22} />,
    desc: 'Create drives, manage companies & track the full placement cycle.',
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.25)',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    bg: 'linear-gradient(135deg, #1e0a3c 0%, #2d1170 50%, #1a0836 100%)',
    features: ['Create placement drives', 'Manage companies', 'Track applications', 'Generate statistics'],
  },
  {
    id: 'ADMIN',
    label: 'Admin',
    emoji: '⚙️',
    icon: <ShieldCheck size={22} />,
    desc: 'Full institutional control — users, departments & system health.',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.25)',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    bg: 'linear-gradient(135deg, #1c1203 0%, #3d2800 50%, #1c1203 100%)',
    features: ['Manage all users', 'Institution analytics', 'Department control', 'System-wide reports'],
  },
];

/* ─── Floating orb ─── */
const Orb = ({ style, color, delay = 0 }) => (
  <motion.div
    animate={{ y: [0, -25, 0], x: [0, 12, 0] }}
    transition={{ duration: 7 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    style={{
      position: 'absolute', borderRadius: '50%',
      background: color, filter: 'blur(70px)', opacity: 0.22, pointerEvents: 'none',
      ...style
    }}
  />
);

/* ─── Role picker card ─── */
const RoleCard = ({ role, selected, onClick }) => (
  <motion.button
    type="button"
    onClick={() => onClick(role.id)}
    whileHover={{ y: -4, scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    style={{
      position: 'relative', cursor: 'pointer', textAlign: 'left',
      padding: '16px', borderRadius: 16, border: 'none',
      background: selected
        ? `linear-gradient(135deg, ${role.color}20, ${role.color}08)`
        : 'rgba(255,255,255,0.04)',
      boxShadow: selected ? `0 0 0 2px ${role.color}` : '0 0 0 1px rgba(255,255,255,0.08)',
      transition: 'all 0.25s ease', overflow: 'hidden',
    }}
  >
    {/* Selected glow pulse */}
    {selected && (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at top left, ${role.color}15, transparent 60%)`, pointerEvents: 'none' }}
      />
    )}

    <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
      {/* Icon circle */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: selected ? role.gradient : 'rgba(255,255,255,0.08)',
        color: selected ? '#fff' : 'rgba(255,255,255,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.3s', boxShadow: selected ? `0 6px 20px ${role.glow}` : 'none'
      }}>
        {role.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: selected ? '#fff' : 'rgba(255,255,255,0.8)' }}>
            {role.emoji} {role.label}
          </span>
          {selected && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
              <CheckCircle2 size={14} color={role.color} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  </motion.button>
);

/* ─── Main Login component ─── */
const Login = () => {
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [step, setStep] = useState('role'); // 'role' | 'form'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const role = ROLES.find(r => r.id === selectedRole);

  useEffect(() => {
    const move = e => setMousePos({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#080a12', overflow: 'hidden', fontFamily: 'Inter, sans-serif', position: 'relative' }}>

      {/* ── LEFT PANEL ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedRole + '-panel'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            width: '48%', minHeight: '100vh', position: 'relative',
            background: role.bg, overflow: 'hidden',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 3.5rem',
          }}
          className="login-left"
        >
          {/* Background orbs */}
          <Orb style={{ width: 400, height: 400, top: '-10%', left: '-15%' }} color={role.color} delay={0} />
          <Orb style={{ width: 300, height: 300, bottom: '5%', right: '-10%' }} color={role.color} delay={3} />

          {/* Grid overlay */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '3rem' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: role.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px ${role.glow}` }}>
                <GraduationCap size={20} color="#fff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff', letterSpacing: '-0.5px' }}>CampusTrack <span style={{ color: role.color }}>Pro</span></span>
            </motion.div>

            {/* Badge */}
            <motion.div
              key={selectedRole + '-badge'}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 99, background: `${role.color}20`, border: `1px solid ${role.color}40`, color: role.color, fontSize: '0.75rem', fontWeight: 700, marginBottom: '1.25rem' }}
            >
              <Sparkles size={12} /> {role.label} Portal
            </motion.div>

            {/* Headline */}
            <motion.h1
              key={selectedRole + '-h1'}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: '1.25rem' }}
            >
              Welcome back<br />to{' '}
              <span style={{ background: role.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                CampusTrack Pro
              </span>
            </motion.h1>

            <motion.p
              key={selectedRole + '-p'}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 380 }}
            >
              {role.desc}
            </motion.p>

            {/* Feature list */}
            <motion.div
              key={selectedRole + '-features'}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              {role.features.map((f, i) => (
                <motion.div
                  key={f} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.08 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                >
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: `${role.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle2 size={13} color={role.color} />
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', fontWeight: 500 }}>{f}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              style={{ display: 'flex', gap: '2rem', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}
            >
              {[{ n: '1200+', l: 'Students' }, { n: '73%', l: 'Placed' }, { n: '80+', l: 'Companies' }].map(s => (
                <div key={s.l}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{s.n}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 1 }}>
        {/* Subtle parallax bg */}
        <motion.div
          animate={{ x: mousePos.x * -20, y: mousePos.y * -20 }}
          style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 40%, rgba(99,102,241,0.06), transparent 65%)', pointerEvents: 'none' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          style={{ width: '100%', maxWidth: 480, position: 'relative' }}
        >
          {/* Card */}
          <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', overflow: 'hidden' }}>

            {/* Top gradient bar */}
            <motion.div
              key={selectedRole + '-bar'}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ height: 4, background: role.gradient }}
            />

            <div style={{ padding: '2rem 2.5rem 2.5rem' }}>

              {/* Header */}
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>Sign In</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>Select your role and enter your credentials</p>
              </div>

              {/* ── ROLE SELECTOR ── */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '0.75rem' }}>
                  Select Your Role
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {ROLES.map(r => (
                    <RoleCard key={r.id} role={r} selected={selectedRole === r.id} onClick={setSelectedRole} />
                  ))}
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    style={{ padding: '10px 14px', marginBottom: '1.25rem', background: 'rgba(239,68,68,0.12)', color: '#fca5a5', borderRadius: 10, fontSize: '0.825rem', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── FORM ── */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Email */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '0.4rem' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', zIndex: 2 }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder={`${selectedRole.toLowerCase()}@campus.edu`}
                      style={{
                        width: '100%', padding: '11px 14px 11px 40px', borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none',
                        fontSize: '0.875rem', boxSizing: 'border-box',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={e => { e.target.style.borderColor = role.color; e.target.style.boxShadow = `0 0 0 3px ${role.glow}`; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Password</label>
                    <Link to="#" style={{ fontSize: '0.75rem', color: role.color, textDecoration: 'none', fontWeight: 600 }}>Forgot password?</Link>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', zIndex: 2 }} />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      style={{
                        width: '100%', padding: '11px 40px 11px 40px', borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none',
                        fontSize: '0.875rem', boxSizing: 'border-box',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={e => { e.target.style.borderColor = role.color; e.target.style.boxShadow = `0 0 0 3px ${role.glow}`; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0, display: 'flex' }}
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02, boxShadow: `0 12px 32px ${role.glow}` }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    marginTop: '0.5rem', height: 50, borderRadius: 12, border: 'none',
                    background: role.gradient, color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                    cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: `0 6px 24px ${role.glow}`,
                  }}
                >
                  {loading
                    ? <><Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Signing in…</>
                    : <>{role.emoji} Sign In as {role.label} <ArrowRight size={18} /></>
                  }
                </motion.button>
              </form>

              {/* Footer */}
              <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.83rem', color: 'rgba(255,255,255,0.35)' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: role.color, textDecoration: 'none', fontWeight: 700 }}>
                  Create account
                </Link>
              </div>
            </div>
          </div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: '1.5rem', flexWrap: 'wrap' }}
          >
            {['Secure Login', 'Role-Based Access', 'Enterprise Grade'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.3)', fontSize: '0.73rem', fontWeight: 600 }}>
                <Star size={11} fill="rgba(255,255,255,0.3)" /> {t}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 860px) {
          .login-left { display: none !important; }
        }
        input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>
    </div>
  );
};

export default Login;
