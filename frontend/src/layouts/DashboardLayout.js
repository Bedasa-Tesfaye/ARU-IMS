import React, { useMemo } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './DashboardLayout.css';
import ChatBotWidget from '../components/ChatBotWidget';
import { useAuth } from '../contexts/AuthContext';

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function titleForRole(role) {
  switch (role) {
    case 'student':
      return 'Student';
    case 'company':
      return 'Company';
    case 'coordinator':
      return 'Department Admin';
    case 'examiner':
      return 'Examiner';
    case 'admin':
      return 'Admin';
    case 'super_admin':
      return 'Super Admin';
    case 'advisor':
      return 'Advisor';
    default:
      return 'User';
  }
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const user = getStoredUser();
  const role = user?.role || 'student';
  const isAdminWorkspace = role === 'admin' || role === 'super_admin';

  const navItems = useMemo(() => {
    const allItems = [
      { to: '/dashboard', label: 'Overview', icon: '🏠', end: true },
      { to: '/dashboard/coordinator', label: 'Department Admin Portal', icon: '🏛️', permission: 'users.viewAny' },
      { to: '/dashboard/internships', label: 'Internships', icon: '💼', permission: 'internships.viewAny' },
      { to: '/dashboard/applications', label: 'Applications', icon: '📋', permission: 'applications.viewAny' },
      { to: '/dashboard/reports', label: 'Reports', icon: '📄', permission: 'reports.viewAny' },
      { to: '/dashboard/evaluations', label: 'Evaluations', icon: '⭐', permission: 'evaluations.results.view' },
      { to: '/dashboard/profile', label: 'Profile', icon: '👤' },
    ];

    return allItems.filter((item) => !item.permission || hasPermission(item.permission));
  }, [hasPermission]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (isAdminWorkspace) {
    return (
      <div className="dash-admin-standalone">
        <Outlet />
        <ChatBotWidget context={`dashboard${role ? `-${role}` : ''}`} />
      </div>
    );
  }

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <div className="dash-brand-icon">🎓</div>
          <div className="dash-brand-text">
            <div className="dash-brand-title">ARU IMS</div>
            <div className="dash-brand-subtitle">{titleForRole(role)} Portal</div>
          </div>
        </div>

        <nav className="dash-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `dash-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="dash-nav-icon">{item.icon}</span>
              <span className="dash-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="dash-sidebar-footer">
          <div className="dash-user">
            <div className="dash-user-avatar">
              {(user?.name || user?.first_name || 'U').toString().trim().charAt(0).toUpperCase()}
            </div>
            <div className="dash-user-meta">
              <div className="dash-user-name">{user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User'}</div>
              <div className="dash-user-role">{titleForRole(role)}</div>
            </div>
          </div>
          <button className="dash-logout" onClick={handleLogout} type="button">
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="dash-main">
        <div className="dash-topbar">
          <div className="dash-topbar-left">
            <div className="dash-topbar-title">Internship Management System</div>
            <div className="dash-topbar-subtitle">Welcome back{user?.name ? `, ${user.name}` : ''}.</div>
          </div>
          <div className="dash-topbar-right">
            <button className="dash-topbar-btn" type="button" onClick={() => navigate('/dashboard/profile')}>
              👤 Profile
            </button>
          </div>
        </div>

        <div className="dash-content">
          <Outlet />
        </div>
      </main>

      <ChatBotWidget context={`dashboard${role ? `-${role}` : ''}`} />
    </div>
  );
}

