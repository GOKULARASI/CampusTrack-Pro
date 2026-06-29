import React, { useState, useEffect } from 'react';
import useProfileStore from '../store/profileStore';
import { motion } from 'framer-motion';
import { Plus, X, Award, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Skills = () => {
  const { profile, fetchProfile, updateProfile, loading } = useProfileStore();
  const [newSkill, setNewSkill] = useState('');
  const [skillsList, setSkillsList] = useState([]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile && profile.skills) {
      setSkillsList(profile.skills.map(s => s.name));
    }
  }, [profile]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    const clean = newSkill.trim();
    if (!clean) return;
    if (skillsList.includes(clean)) {
      toast.error("Skill already added!");
      return;
    }
    setSkillsList([...skillsList, clean]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skillName) => {
    setSkillsList(skillsList.filter(s => s !== skillName));
  };

  const handleSave = async () => {
    // Send updated skill list to profile update api
    const result = await updateProfile({
      firstName: profile?.user?.firstName,
      lastName: profile?.user?.lastName,
      skills: skillsList
    });

    if (result.success) {
      toast.success("Skills updated successfully!");
      fetchProfile();
    } else {
      toast.error(result.error || "Failed to update skills");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="dashboard-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h1 className="dashboard-title">Skills Inventory</h1>
        <p className="dashboard-subtitle">Add technical, core, and soft skills to build up your digital resume.</p>
      </div>

      <div className="glass" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Add Technical Skill</h2>
          <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              value={newSkill} 
              onChange={(e) => setNewSkill(e.target.value)} 
              placeholder="e.g. React.js, Python, AWS Cloud" 
              style={inputStyle}
            />
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Add
            </button>
          </form>
        </div>

        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>Your Added Skills</h2>

          {skillsList.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No skills added yet. Type a skill above to get started.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {skillsList.map((skill, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}
                >
                  <Award size={14} color="var(--primary)" />
                  {skill}
                  <button 
                    onClick={() => handleRemoveSkill(skill)} 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <button onClick={handleSave} className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            Save Skills
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const inputStyle = {
  flex: 1,
  padding: '0.6rem 1rem',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)',
  background: 'var(--background)',
  color: 'var(--text-primary)',
  outline: 'none',
  fontSize: '0.95rem'
};

export default Skills;
