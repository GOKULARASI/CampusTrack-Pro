import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, BookOpen, Briefcase, Lightbulb, ArrowRight,
  CheckCircle2, Circle, ChevronDown, ChevronUp, Star,
  TrendingUp, Zap, Award, Clock, Plus, Trash2, RotateCcw
} from 'lucide-react';

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const PATHS = {
  placement: {
    label: 'Placement / Corporate',
    icon: Briefcase,
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.12)',
    desc: 'Land your dream corporate job through campus placements.',
    tips: [
      'Focus on DSA — 2 problems/day minimum.',
      'Mock interviews help reduce anxiety significantly.',
      'Tailor your resume for each company.',
    ],
    steps: [
      { id: 's1', title: 'Polish Resume', desc: 'Make it ATS-friendly, 1 page, strong bullet points.', hours: 3 },
      { id: 's2', title: 'Aptitude Prep', desc: 'Quant + Logical Reasoning — 30 min/day for 3 weeks.', hours: 15 },
      { id: 's3', title: 'DSA Practice', desc: 'LeetCode Easy → Medium → Hard progression.', hours: 40 },
      { id: 's4', title: 'Core Subjects', desc: 'OS, DBMS, CN, OOP — revise fundamentals.', hours: 20 },
      { id: 's5', title: 'Mock Interviews', desc: 'Schedule 3+ mock interviews with peers or alumni.', hours: 6 },
      { id: 's6', title: 'Apply & Follow Up', desc: 'Apply to 10+ companies and track every application.', hours: 5 },
    ],
    skills: ['Data Structures', 'Algorithms', 'SQL', 'System Design', 'Communication', 'Problem Solving'],
  },
  higher: {
    label: 'Higher Studies',
    icon: BookOpen,
    color: '#0ea5e9',
    bg: 'rgba(14,165,233,0.12)',
    desc: 'Pursue GATE, GRE, or Masters programmes abroad.',
    tips: [
      'GATE: 6-month dedicated prep is optimal.',
      'GRE Verbal is often underestimated — start early.',
      'SOP quality matters more than GPA for top unis.',
    ],
    steps: [
      { id: 'h1', title: 'Choose Program', desc: 'Decide: GATE / GRE / GMAT / IELTS path.', hours: 2 },
      { id: 'h2', title: 'Study Plan', desc: 'Create a week-by-week syllabus breakdown.', hours: 2 },
      { id: 'h3', title: 'Core Subject Mastery', desc: 'Deep dive into relevant core subjects.', hours: 60 },
      { id: 'h4', title: 'Mock Tests', desc: 'Attempt full-length tests every weekend.', hours: 20 },
      { id: 'h5', title: 'SOP / LOR', desc: 'Draft Statement of Purpose and collect LORs.', hours: 10 },
      { id: 'h6', title: 'Apply to Colleges', desc: 'Submit applications before deadlines.', hours: 8 },
    ],
    skills: ['Mathematics', 'Research Writing', 'Critical Thinking', 'English Proficiency', 'Time Management'],
  },
  government: {
    label: 'Government Exams',
    icon: Target,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    desc: 'Crack UPSC, SSC, PSU or state-level competitive exams.',
    tips: [
      'Newspaper reading daily is non-negotiable for GK.',
      'Previous year papers are your best resource.',
      'Consistency beats intensity — study every day.',
    ],
    steps: [
      { id: 'g1', title: 'Exam Selection', desc: 'Identify the exam, syllabus, and exam pattern.', hours: 3 },
      { id: 'g2', title: 'Current Affairs', desc: 'Daily newspaper + monthly magazine habit.', hours: 30 },
      { id: 'g3', title: 'Subject Study', desc: 'Cover static GK, math, reasoning systematically.', hours: 50 },
      { id: 'g4', title: 'Previous Papers', desc: 'Solve last 10 years question papers.', hours: 20 },
      { id: 'g5', title: 'Test Series', desc: 'Join an online test series for timed practice.', hours: 15 },
      { id: 'g6', title: 'Revision Cycles', desc: 'Revise notes every 2 weeks systematically.', hours: 20 },
    ],
    skills: ['Current Affairs', 'Quantitative Aptitude', 'Reasoning', 'General Knowledge', 'Essay Writing'],
  },
  startup: {
    label: 'Startup & Entrepreneurship',
    icon: Lightbulb,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    desc: 'Build your own product, startup, or freelance business.',
    tips: [
      'Validate before you build — talk to 10 users first.',
      'Ship early, iterate fast.',
      'Networking opens doors that skills alone cannot.',
    ],
    steps: [
      { id: 'e1', title: 'Idea Validation', desc: 'Interview potential users. Find a real pain point.', hours: 5 },
      { id: 'e2', title: 'MVP Build', desc: 'Build the smallest viable version in 2-4 weeks.', hours: 40 },
      { id: 'e3', title: 'User Testing', desc: 'Get 10 beta users and collect honest feedback.', hours: 10 },
      { id: 'e4', title: 'Iteration', desc: 'Fix, improve, and ship v2 based on feedback.', hours: 20 },
      { id: 'e5', title: 'Marketing & Growth', desc: 'Social media, cold outreach, product communities.', hours: 15 },
      { id: 'e6', title: 'Monetisation', desc: 'Define your pricing model and first paying customer.', hours: 5 },
    ],
    skills: ['Product Thinking', 'Full-Stack Dev', 'Marketing', 'Financial Basics', 'Networking', 'Resilience'],
  },
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const pct = (done, total) => (total === 0 ? 0 : Math.round((done / total) * 100));

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
function PathCard({ id, data, selected, onClick }) {
  const Icon = data.icon;
  const isSelected = selected === id;
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick(id)}
      style={{
        background: isSelected ? data.color : 'var(--surface)',
        border: `2px solid ${isSelected ? data.color : 'var(--border)'}`,
        borderRadius: 16,
        padding: '20px 16px',
        cursor: 'pointer',
        textAlign: 'left',
        color: isSelected ? '#fff' : 'var(--text-primary)',
        boxShadow: isSelected ? `0 8px 30px ${data.color}55` : 'none',
        transition: 'all 0.2s',
        width: '100%',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: isSelected ? 'rgba(255,255,255,0.25)' : data.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 12,
      }}>
        <Icon size={22} color={isSelected ? '#fff' : data.color} />
      </div>
      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{data.label}</div>
      <div style={{ fontSize: '0.8rem', opacity: 0.8, lineHeight: 1.4 }}>{data.desc}</div>
    </motion.button>
  );
}

function StepRow({ step, done, onToggle, index, color }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      style={{
        background: done ? 'rgba(16,185,129,0.06)' : 'var(--surface)',
        border: `1px solid ${done ? '#10b98133' : 'var(--border)'}`,
        borderRadius: 12,
        marginBottom: 10,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
        onClick={() => setOpen(o => !o)}>
        {/* toggle checkbox */}
        <button
          onClick={e => { e.stopPropagation(); onToggle(step.id); }}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}
        >
          {done
            ? <CheckCircle2 size={22} color="#10b981" />
            : <Circle size={22} color="var(--text-secondary)" />}
        </button>

        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: 600, fontSize: '0.95rem',
            color: done ? 'var(--text-secondary)' : 'var(--text-primary)',
            textDecoration: done ? 'line-through' : 'none',
          }}>{step.title}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px',
            borderRadius: 20, background: `${color}22`, color,
          }}>{step.hours}h</span>
          {open ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 16px 14px 50px', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              {step.desc}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SkillBadge({ skill, checked, onToggle, color }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => onToggle(skill)}
      style={{
        padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
        cursor: 'pointer', border: `1.5px solid ${checked ? color : 'var(--border)'}`,
        background: checked ? `${color}22` : 'var(--surface)',
        color: checked ? color : 'var(--text-secondary)',
        display: 'flex', alignItems: 'center', gap: 6,
        transition: 'all 0.15s',
      }}
    >
      {checked && <CheckCircle2 size={13} />}
      {skill}
    </motion.button>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const CareerPath = () => {
  const [selectedPath, setSelectedPath] = useState('placement');
  const [completedSteps, setCompletedSteps] = useState({});   // { pathId: Set<stepId> }
  const [checkedSkills, setCheckedSkills] = useState({});     // { pathId: Set<skill> }
  const [notes, setNotes] = useState('');
  const [showTips, setShowTips] = useState(true);
  const [customTasks, setCustomTasks] = useState([]);         // { id, title, done }
  const [newTask, setNewTask] = useState('');

  const data = PATHS[selectedPath];
  const Icon = data.icon;

  /* step helpers */
  const doneSet = completedSteps[selectedPath] || new Set();
  const toggleStep = (stepId) => {
    setCompletedSteps(prev => {
      const set = new Set(prev[selectedPath] || []);
      set.has(stepId) ? set.delete(stepId) : set.add(stepId);
      return { ...prev, [selectedPath]: set };
    });
  };
  const totalSteps = data.steps.length + customTasks.length;
  const doneCt = doneSet.size + customTasks.filter(t => t.done).length;
  const progress = pct(doneCt, totalSteps);

  /* skill helpers */
  const skillSet = checkedSkills[selectedPath] || new Set();
  const toggleSkill = (skill) => {
    setCheckedSkills(prev => {
      const set = new Set(prev[selectedPath] || []);
      set.has(skill) ? set.delete(skill) : set.add(skill);
      return { ...prev, [selectedPath]: set };
    });
  };

  /* custom tasks */
  const addTask = () => {
    if (!newTask.trim()) return;
    setCustomTasks(prev => [...prev, { id: Date.now(), title: newTask.trim(), done: false }]);
    setNewTask('');
  };
  const toggleCustom = (id) => {
    setCustomTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };
  const deleteCustom = (id) => {
    setCustomTasks(prev => prev.filter(t => t.id !== id));
  };

  const resetProgress = () => {
    setCompletedSteps(prev => ({ ...prev, [selectedPath]: new Set() }));
    setCheckedSkills(prev => ({ ...prev, [selectedPath]: new Set() }));
    setCustomTasks([]);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: 'var(--text-primary)', marginBottom: 4, fontSize: '1.8rem' }}>Career Path Tracker</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Pick your goal — your personalised roadmap updates instantly.</p>
      </div>

      {/* Path selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
        {Object.entries(PATHS).map(([id, d]) => (
          <PathCard key={id} id={id} data={d} selected={selectedPath} onClick={setSelectedPath} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedPath}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >

          {/* Progress bar row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24,
            background: 'var(--surface)', borderRadius: 16, padding: '16px 20px',
            border: '1px solid var(--border)',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: data.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={22} color={data.color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{data.label}</span>
                <span style={{ color: data.color, fontWeight: 700 }}>{progress}%</span>
              </div>
              <div style={{ height: 8, background: 'var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{ height: '100%', background: data.color, borderRadius: 8 }}
                />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                {doneCt} of {totalSteps} tasks completed
              </div>
            </div>
            <button
              onClick={resetProgress}
              title="Reset progress"
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Two-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

            {/* LEFT — steps */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={18} color={data.color} /> Action Plan
                </h2>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Click a step to expand · checkbox to complete
                </span>
              </div>

              {data.steps.map((step, i) => (
                <StepRow
                  key={step.id}
                  step={step}
                  index={i}
                  done={doneSet.has(step.id)}
                  onToggle={toggleStep}
                  color={data.color}
                />
              ))}

              {/* Custom tasks */}
              {customTasks.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: t.done ? 'rgba(16,185,129,0.06)' : 'var(--surface)',
                    border: `1px solid ${t.done ? '#10b98133' : 'var(--border)'}`,
                    borderRadius: 12, padding: '12px 16px', marginBottom: 10,
                  }}
                >
                  <button onClick={() => toggleCustom(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {t.done ? <CheckCircle2 size={22} color="#10b981" /> : <Circle size={22} color="var(--text-secondary)" />}
                  </button>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: '0.95rem', color: t.done ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: t.done ? 'line-through' : 'none' }}>
                    {t.title}
                  </span>
                  <span style={{ fontSize: '0.72rem', background: `${data.color}22`, color: data.color, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>Custom</span>
                  <button onClick={() => deleteCustom(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0 }}>
                    <Trash2 size={15} />
                  </button>
                </motion.div>
              ))}

              {/* Add custom task */}
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <input
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                  placeholder="Add a custom task…"
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 10,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none',
                  }}
                />
                <button
                  onClick={addTask}
                  style={{
                    padding: '10px 14px', borderRadius: 10, border: 'none',
                    background: data.color, color: '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: '0.875rem',
                  }}
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              {/* Notes */}
              <div style={{ marginTop: 20 }}>
                <h2 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={17} color={data.color} /> My Notes
                </h2>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Jot down your study schedule, targets, or anything useful…"
                  rows={4}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: '0.875rem', resize: 'vertical',
                    lineHeight: 1.6, boxSizing: 'border-box', outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* RIGHT — skills + tips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Skills checklist */}
              <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 20, border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={17} color={data.color} /> Skills to Acquire
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {data.skills.map(skill => (
                    <SkillBadge key={skill} skill={skill} checked={skillSet.has(skill)} onToggle={toggleSkill} color={data.color} />
                  ))}
                </div>
                <div style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {skillSet.size}/{data.skills.length} skills acquired
                </div>
              </div>

              {/* Tips panel */}
              <div style={{ background: `${data.color}11`, borderRadius: 16, padding: 20, border: `1px solid ${data.color}33` }}>
                <button
                  onClick={() => setShowTips(p => !p)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showTips ? 14 : 0 }}
                >
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: data.color, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                    <Star size={17} /> AI Tips
                  </h3>
                  {showTips ? <ChevronUp size={16} color={data.color} /> : <ChevronDown size={16} color={data.color} />}
                </button>
                <AnimatePresence>
                  {showTips && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ margin: 0, padding: '0 0 0 18px', overflow: 'hidden' }}
                    >
                      {data.tips.map((tip, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: 6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          style={{ color: 'var(--text-primary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 8 }}
                        >
                          {tip}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              {/* Est. hours card */}
              <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 20, border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={16} color={data.color} /> Estimated Effort
                </h3>
                {data.steps.map(step => (
                  <div key={step.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.82rem', color: doneSet.has(step.id) ? '#10b981' : 'var(--text-secondary)', textDecoration: doneSet.has(step.id) ? 'line-through' : 'none' }}>
                      {step.title}
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: data.color }}>{step.hours}h</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Total</span>
                  <span style={{ fontSize: '0.85rem', color: data.color }}>{data.steps.reduce((a, s) => a + s.hours, 0)}h</span>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default CareerPath;
