import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { 
  LayoutDashboard, Users, Briefcase, GraduationCap, 
  FileText, TrendingUp, Settings, FileBox, 
  Award, Layers, Bell, LogOut
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  
  let links = [];
  let roleLabel = '';

  if (user?.role === 'STUDENT') {
    roleLabel = 'Student';
    links = [
      { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'Profile', path: '/dashboard/profile', icon: <Users size={20} /> },
      { name: 'Academics', path: '/dashboard/academics', icon: <GraduationCap size={20} /> },
      { name: 'Skills', path: '/dashboard/skills', icon: <Layers size={20} /> },
      { name: 'Certifications', path: '/dashboard/certifications', icon: <Award size={20} /> },
      { name: 'Projects', path: '/dashboard/projects', icon: <FileBox size={20} /> },
      { name: 'Internships', path: '/dashboard/internships', icon: <Briefcase size={20} /> },
      { name: 'Resume Center', path: '/dashboard/resume', icon: <FileText size={20} /> },
      { name: 'Placements', path: '/dashboard/placements', icon: <Briefcase size={20} /> },
      { name: 'Career Path', path: '/dashboard/career', icon: <TrendingUp size={20} /> },
      { name: 'Notifications', path: '/dashboard/notifications', icon: <Bell size={20} /> },
    ];
  } else if (user?.role === 'FACULTY') {
    roleLabel = 'Faculty';
    links = [
      { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'Students', path: '/dashboard/students', icon: <Users size={20} /> },
      { name: 'Placements', path: '/dashboard/placements', icon: <Briefcase size={20} /> },
    ];
  } else if (user?.role === 'ADMIN') {
    roleLabel = 'Administrator';
    links = [
      { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'Departments', path: '/dashboard/departments', icon: <Layers size={20} /> },
      { name: 'Manage Faculty', path: '/dashboard/faculty-mgmt', icon: <Users size={20} /> },
      { name: 'Manage Students', path: '/dashboard/student-mgmt', icon: <GraduationCap size={20} /> },
      { name: 'Student Directory', path: '/dashboard/students', icon: <Users size={20} /> },
      { name: 'Companies', path: '/dashboard/companies', icon: <FileBox size={20} /> },
      { name: 'Placement Drives', path: '/dashboard/drives', icon: <Briefcase size={20} /> },
    ];
  } else if (user?.role === 'COORDINATOR') {
    roleLabel = 'Placement Coordinator';
    links = [
      { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'Students', path: '/dashboard/students', icon: <Users size={20} /> },
      { name: 'Drives', path: '/dashboard/drives', icon: <Briefcase size={20} /> },
      { name: 'Companies', path: '/dashboard/companies', icon: <FileBox size={20} /> },
    ];
  } else {
    // Default fallback
    roleLabel = 'User';
    links = [
      { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> }
    ];
  }

  return (
    <div style={{
      width: '260px',
      height: '100vh',
      background: 'var(--sidebar-bg)',
      color: 'var(--sidebar-text)',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50
    }}>
      <div style={{ padding: 'var(--spacing-lg) var(--spacing-xl)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            <GraduationCap size={20} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>
            CampusTrack
          </span>
        </Link>
      </div>

      <div style={{ padding: 'var(--spacing-lg) var(--spacing-xl) var(--spacing-sm)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', fontWeight: 600 }}>
        {roleLabel}
      </div>

      <nav style={{ flex: 1, overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {links.map((link, idx) => (
            <li key={idx}>
              <NavLink 
                to={link.path} 
                end={link.path === '/dashboard'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  padding: '12px var(--spacing-xl)',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                  borderRight: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  textDecoration: 'none',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s',
                  fontSize: '0.9rem'
                })}
              >
                <span style={{ color: 'inherit' }}>{link.icon}</span>
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div style={{ padding: 'var(--spacing-lg) var(--spacing-xl)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
              {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || ''}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'white', fontSize: '0.85rem' }}>{user?.firstName || 'User'}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{roleLabel}</div>
            </div>
          </div>
          <button 
            onClick={() => logout()} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
