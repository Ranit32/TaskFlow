import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { icon: '📊', label: 'Dashboard', to: '/' },
  { icon: '📁', label: 'Projects', to: '/projects' },
  { icon: '✅', label: 'My Tasks', to: '/my-tasks' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🚀</div>
        <h1>TaskFlow</h1>
      </div>

      <nav className="nav-section">
        <div className="nav-label">Navigation</div>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {user?.role === 'admin' && (
        <nav className="nav-section" style={{ marginTop: 12 }}>
          <div className="nav-label">Admin</div>
          <NavLink to="/projects/new" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span className="nav-icon">➕</span>New Project
          </NavLink>
        </nav>
      )}

      <div className="sidebar-bottom">
        <NavLink to="/profile" className="user-card" style={{ textDecoration: 'none' }}>
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="name">{user?.name}</div>
            <div className="role">{user?.role}</div>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>⚙️</span>
        </NavLink>
        <button className="nav-item" onClick={handleLogout} style={{ marginTop: 4, color: '#f87171' }}>
          <span className="nav-icon">🚪</span>Sign Out
        </button>
      </div>
    </aside>
  );
}
