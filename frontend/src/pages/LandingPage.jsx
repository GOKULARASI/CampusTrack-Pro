import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Sparkles, GraduationCap, BarChart3, Bot,
  TrendingUp, Shield, Award, FileText, CheckCircle2,
  Users, Building2, Trophy, Rocket, Star, Zap,
  ChevronRight, Globe, Lock, LayoutDashboard, Target, Bell
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import dashboardImg from '../assets/dashboard_screenshot.png';
import studentImg from '../assets/student_dashboard.png';
import adminImg from '../assets/admin_dashboard.png';

/* ── Floating animated background orbs ── */
const FloatingOrb = ({ x, y, size, color, delay }) => (
  <motion.div
    style={{
      position: 'absolute', left: x, top: y,
      width: size, height: size, borderRadius: '50%',
      background: color, filter: 'blur(80px)', opacity: 0.18, pointerEvents: 'none',
    }}
    animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
    transition={{ duration: 8 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

/* ── Counter animation ── */
const Counter = ({ target, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const duration = 1800;
    const steps = 60;
    const step = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

/* ── Feature card ── */
const FeatureCard = ({ icon, title, desc, color, index }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '2rem', borderRadius: '20px',
        background: hovered ? `linear-gradient(135deg, var(--surface), ${color}10)` : 'var(--surface)',
        border: `1px solid ${hovered ? color + '40' : 'var(--border)'}`,
        boxShadow: hovered ? `0 20px 40px ${color}15` : 'var(--shadow-card)',
        transition: 'all 0.3s ease', cursor: 'default', position: 'relative', overflow: 'hidden'
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at top right, ${color}08, transparent 60%)`, opacity: hovered ? 1 : 0, transition: 'opacity 0.3s' }} />
      <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', transition: 'background 0.3s', ...(hovered && { background: color, color: '#fff' }) }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{desc}</p>
    </motion.div>
  );
};

/* ── Dashboard tab pill ── */
const TabPill = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    padding: '8px 20px', borderRadius: 99, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
    background: active ? 'var(--primary)' : 'var(--surface)', color: active ? '#fff' : 'var(--text-secondary)',
    transition: 'all 0.25s', boxShadow: active ? '0 4px 14px rgba(99,102,241,0.35)' : 'none'
  }}>
    {label}
  </button>
);

/* ── Main Landing Page ── */
const LandingPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);

  const tabs = [
    { label: '📊 Coordinator', img: dashboardImg },
    { label: '🎓 Student', img: studentImg },
    { label: '⚙️ Admin', img: adminImg },
  ];

  const features = [
    { icon: <LayoutDashboard size={24} />, title: 'Role-Based Dashboards', desc: 'Custom experience for Students, Faculty, Coordinators & HODs with personalized insights.', color: '#6366f1' },
    { icon: <BarChart3 size={24} />, title: 'Real-time Analytics', desc: 'Live placement funnel, drive status charts, and department-wise breakdowns.', color: '#10b981' },
    { icon: <Bot size={24} />, title: 'AI Career Intelligence', desc: 'Smart career path recommendations and placement eligibility scoring using AI.', color: '#f59e0b' },
    { icon: <Target size={24} />, title: 'Drive Management', desc: 'Create drives, set eligibility criteria, track applications and selection stages.', color: '#3b82f6' },
    { icon: <FileText size={24} />, title: 'Resume & Documents', desc: 'Students manage resumes, certificates, and documents with faculty verification.', color: '#8b5cf6' },
    { icon: <Bell size={24} />, title: 'Smart Notifications', desc: 'Instant alerts for upcoming drives, application status, and placement updates.', color: '#ef4444' },
    { icon: <Globe size={24} />, title: 'Institution-wide Reports', desc: 'Export CSVs, track placement rates, and generate department-level reports.', color: '#06b6d4' },
    { icon: <Lock size={24} />, title: 'Secure & Scalable', desc: 'JWT auth, role-based access control, and enterprise-grade data security.', color: '#84cc16' },
  ];

  const stats = [
    { icon: <Users size={28} />, value: 1200, suffix: '+', label: 'Students Managed', color: '#6366f1' },
    { icon: <Building2 size={28} />, value: 80, suffix: '+', label: 'Companies Onboarded', color: '#10b981' },
    { icon: <Trophy size={28} />, value: 73, suffix: '%', label: 'Avg Placement Rate', color: '#f59e0b' },
    { icon: <Rocket size={28} />, value: 342, suffix: '+', label: 'Applications Tracked', color: '#3b82f6' },
  ];

  const roles = [
    { icon: '🎓', title: 'Students', desc: 'Track drives, manage resumes, monitor placement progress and career path.', badge: 'Most Used' },
    { icon: '📋', title: 'Coordinator', desc: 'Create drives, define eligibility, manage company relationships.', badge: 'Power User' },
    { icon: '👨‍🏫', title: 'Faculty / HOD', desc: 'View department analytics, verify student documents, track cohort performance.', badge: 'Analytics' },
    { icon: '⚙️', title: 'Admin', desc: 'Institution-wide control — users, departments, system health and reports.', badge: 'Full Access' },
  ];

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingTop: '80px' }}>
        {/* Background orbs */}
        <FloatingOrb x="5%" y="10%" size={500} color="#6366f1" delay={0} />
        <FloatingOrb x="70%" y="5%" size={400} color="#3b82f6" delay={2} />
        <FloatingOrb x="40%" y="60%" size={350} color="#8b5cf6" delay={4} />

        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '60px 60px', opacity: 0.3 }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>

            {/* Left: Copy */}
            <motion.div style={{ y: heroY }}>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(59,130,246,0.1))', border: '1px solid rgba(99,102,241,0.3)', marginBottom: '1.5rem', color: '#818cf8', fontSize: '0.82rem', fontWeight: 700 }}
              >
                <Sparkles size={14} />
                <span>NEW MILESTONE UNLOCKED 🚀</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', color: 'var(--text-primary)' }}
              >
                Smarter{' '}
                <span style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Placements.
                </span>
                <br />
                Stronger{' '}
                <span style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Futures.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 480 }}
              >
                We're excited to share our journey of building{' '}
                <strong style={{ color: 'var(--text-primary)' }}>CampusTrack Pro</strong> —{' '}
                an <span style={{ color: '#818cf8', fontWeight: 600 }}>All-in-one AI-Powered Placement Management System.</span>
              </motion.p>

              {/* Feature pills */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '2.5rem' }}
              >
                {['Unified Placement Management', 'Real-time Analytics', 'AI Career Intelligence', 'Role-Based Dashboards'].map((f, i) => (
                  <motion.div key={f} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.08 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: 'var(--surface)', border: '1px solid var(--border)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={13} color="#10b981" />
                    {f}
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
              >
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 8px 30px rgba(99,102,241,0.4)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}
                  >
                    Get Started Free <ArrowRight size={18} />
                  </motion.button>
                </Link>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}
                  >
                    Live Demo <ChevronRight size={18} />
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right: Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
              style={{ position: 'relative' }}
            >
              {/* Glow behind */}
              <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.2) 0%, transparent 70%)', filter: 'blur(30px)', zIndex: 0 }} />

              {/* Main image */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'relative', zIndex: 1 }}
              >
                <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <img src={dashboardImg} alt="CampusTrack Pro Dashboard" style={{ width: '100%', display: 'block' }} />
                </div>
              </motion.div>

              {/* Floating stat badges */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }}
                style={{ position: 'absolute', top: -20, left: -30, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', padding: '10px 16px', borderRadius: 14, boxShadow: '0 8px 24px rgba(16,185,129,0.4)', zIndex: 2, fontSize: '0.8rem', fontWeight: 700 }}
              >
                <div style={{ fontSize: '1.3rem', fontWeight: 900 }}>73.33%</div>
                <div style={{ opacity: 0.9 }}>Placement Rate</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2 }}
                style={{ position: 'absolute', bottom: 30, right: -25, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', padding: '10px 16px', borderRadius: 14, boxShadow: '0 8px 24px rgba(99,102,241,0.4)', zIndex: 2, fontSize: '0.8rem', fontWeight: 700 }}
              >
                <div style={{ fontSize: '1.3rem', fontWeight: 900 }}>342</div>
                <div style={{ opacity: 0.9 }}>Applications</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section style={{ padding: '5rem 2rem', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                style={{ textAlign: 'center', padding: '2rem', borderRadius: 20, background: 'var(--background)', border: '1px solid var(--border)' }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: s.color }}>
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DASHBOARD SHOWCASE ── */}
      <section style={{ padding: '6rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <FloatingOrb x="80%" y="20%" size={400} color="#3b82f6" delay={1} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '3rem' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 99, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', fontSize: '0.78rem', fontWeight: 700, marginBottom: '1rem' }}>
              <Star size={13} /> One Platform. Every Placement. Infinite Impact.
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              A Dashboard for <span style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Every Role</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 560, margin: '0 auto' }}>
              Each role gets a tailor-made experience — from the student tracking drives to the admin running reports.
            </p>
          </motion.div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: '2.5rem' }}>
            {tabs.map((t, i) => (
              <TabPill key={i} label={t.label} active={activeTab === i} onClick={() => setActiveTab(i)} />
            ))}
          </div>

          {/* Dashboard image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <img src={tabs[activeTab].img} alt={tabs[activeTab].label} style={{ width: '100%', display: 'block' }} />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section style={{ padding: '6rem 2rem', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Key <span style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>UI/UX Features</span> Implemented
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 520, margin: '0 auto' }}>
              Thoughtfully designed for students, coordinators, faculty and administrators across every workflow.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {features.map((f, i) => <FeatureCard key={f.title} {...f} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── ROLES SECTION ── */}
      <section style={{ padding: '6rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <FloatingOrb x="10%" y="50%" size={400} color="#8b5cf6" delay={3} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '3.5rem' }}
          >
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Built for <span style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Every Stakeholder</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Four user roles, one unified platform.</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {roles.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                style={{ padding: '2rem', borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', transition: 'box-shadow 0.3s' }}
              >
                <div style={{ position: 'absolute', top: 16, right: 16, padding: '3px 10px', borderRadius: 99, background: 'rgba(99,102,241,0.12)', color: '#818cf8', fontSize: '0.68rem', fontWeight: 700 }}>
                  {r.badge}
                </div>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{r.icon}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{r.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF TICKER ── */}
      <section style={{ padding: '2rem 0', background: 'var(--surface)', overflow: 'hidden', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'flex', gap: '3rem', whiteSpace: 'nowrap', width: 'max-content' }}
        >
          {[...Array(2)].flatMap(() => [
            '#CampusTrackPro', '#PlacementManagement', '#EdTech', '#AlinEducation',
            '#SmarterPlacements', '#FutureReady', '#CareerGrowth', '#AIinHR',
          ]).map((tag, i) => (
            <span key={i} style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.5px' }}>{tag}</span>
          ))}
        </motion.div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{ padding: '8rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <FloatingOrb x="30%" y="10%" size={500} color="#6366f1" delay={0} />
        <FloatingOrb x="60%" y="50%" size={350} color="#10b981" delay={3} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', fontSize: '0.78rem', fontWeight: 700, marginBottom: '1.5rem' }}
          >
            <Zap size={13} /> The future of placements is here.
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.25rem', lineHeight: 1.15 }}
          >
            Empowering Institutions.{' '}
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Elevating Placements.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.7 }}
          >
            Let's build better futures together! Join thousands of students and institutions already using CampusTrack Pro.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(99,102,241,0.5)' }}
                whileTap={{ scale: 0.97 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '15px 32px', borderRadius: 14, background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}
              >
                Request a Demo <ArrowRight size={18} />
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.03 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '15px 32px', borderRadius: 14, background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}
              >
                Sign In <ChevronRight size={18} />
              </motion.button>
            </Link>
          </motion.div>

          {/* Mini stats row */}
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            style={{ display: 'flex', gap: '3rem', justifyContent: 'center', marginTop: '3.5rem', flexWrap: 'wrap' }}
          >
            {[{ n: '10+', l: 'Modules' }, { n: '4', l: 'User Roles' }, { n: '🔒', l: 'Secure' }, { n: '∞', l: 'Possibilities' }].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)' }}>{s.n}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
