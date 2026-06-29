import React from 'react';

const Footer = () => {
  return (
    <footer style={{ 
      background: 'var(--surface)', 
      borderTop: '1px solid var(--border)',
      padding: 'var(--spacing-2xl) 0 var(--spacing-md) 0'
    }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-2xl)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--spacing-md)' }}>
            <div style={{ width: '24px', height: '24px', background: 'var(--primary)', borderRadius: '6px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>CT</div>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>CampusTrack Pro</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Empowering students, faculties, and placement cells with a unified platform for career growth.
          </p>
        </div>
        
        <div>
          <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>Modules</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 2 }}>
            <li>Student Dashboard</li>
            <li>Faculty Portal</li>
            <li>Placement Analytics</li>
            <li>AI Resume Analyzer</li>
          </ul>
        </div>

        <div>
          <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>Contact</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 2 }}>
            <li>support@campustrack.pro</li>
            <li>+1 (555) 123-4567</li>
            <li>123 Education Hub, Tech City</li>
          </ul>
        </div>
      </div>
      <div className="container" style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--spacing-md)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        © {new Date().getFullYear()} CampusTrack Pro. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
