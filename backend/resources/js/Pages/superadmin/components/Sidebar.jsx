import React, { useState } from 'react';
import { router } from '@inertiajs/react';

const Sidebar = ({ activeSection, setActiveSection, sidebarOpen, setSidebarOpen, pendingApprovalsCount = 0 }) => {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const menuItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
    },
    {
      id: 'pending-approvals',
      label: 'Pending Approvals',
      icon: '⏳',
      badge: pendingApprovalsCount,
    },
    {
      id: 'assign',
      label: 'Assign',
      icon: '🧩',
    },
    {
      id: 'registrations',
      label: 'Registrations',
      icon: '➕',
      subItems: [
        { id: 'student', label: 'Student Registration', icon: '🎓' },
        { id: 'company', label: 'Company Registration', icon: '🏢' },
        { id: 'examiner', label: 'Examiner Registration', icon: '👨‍🏫' },
        { id: 'advisor', label: 'Advisor Registration', icon: '👨‍💼' },
      ],
    },
    {
      id: 'user-management',
      label: 'User Management',
      icon: '👥',
      subItems: [
        { id: 'all-users', label: 'All Users', icon: '👥' },
        { id: 'students', label: 'Students', icon: '🎓' },
        { id: 'examiners', label: 'Examiners', icon: '👨‍🏫' },
        { id: 'coordinators', label: 'Coordinators', icon: '📋' },
        { id: 'companies', label: 'Companies', icon: '🏢' },
        { id: 'advisors', label: 'Advisors', icon: '👨‍💼' },
      ],
    },
    {
      id: 'reports-analytics',
      label: 'Reports & Analytics',
      icon: '📈',
    },
    {
      id: 'ai-insights',
      label: 'AI Insights & Automation',
      icon: '🤖',
    },
    {
      id: 'audit-logs',
      label: 'Audit Logs',
      icon: '📋',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
    },
  ];

  const [openMenus, setOpenMenus] = React.useState({ registrations: true, 'user-management': true });

  const toggleMenu = (menuId) => {
    setOpenMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const handleLogout = () => {
    setLoggingOut(true);
    router.post('/logout', {}, {
      onFinish: () => {
        setLoggingOut(false);
        setLogoutOpen(false);
      },
    });
  };

  return (
    <div className={`sa-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sa-sidebar-header">
        <div className="sa-sidebar-logo">
          <span className="logo-icon">👑</span>
          {sidebarOpen && (
            <div className="logo-text">
              <h2>ARU IMS</h2>
              <p>Super Admin Portal</p>
            </div>
          )}
        </div>
        <button type="button" className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </div>

      <div className="sa-sidebar-user">
        <div className="user-avatar">SA</div>
        {sidebarOpen && (
          <div className="user-info">
            <h4>Super Admin</h4>
            <p>System Administrator</p>
          </div>
        )}
      </div>

      <nav className="sa-sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.id} className="sidebar-nav-item">
            {item.subItems ? (
              <>
                <div className={`nav-header ${openMenus[item.id] ? 'open' : ''}`} onClick={() => toggleMenu(item.id)}>
                  <span className="nav-icon">{item.icon}</span>
                  {sidebarOpen && (
                    <>
                      <span className="nav-label">{item.label}</span>
                      <span className="nav-arrow">{openMenus[item.id] ? '▼' : '▶'}</span>
                    </>
                  )}
                </div>
                {openMenus[item.id] && sidebarOpen && (
                  <div className="nav-submenu">
                    {item.subItems.map((sub) => (
                      <div
                        key={sub.id}
                        className={`nav-subitem ${activeSection === sub.id ? 'active' : ''}`}
                        onClick={() => setActiveSection(sub.id)}
                      >
                        <span className="sub-icon">{sub.icon}</span>
                        <span className="sub-label">{sub.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div
                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span className="nav-label">{item.label}</span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="sa-sidebar-footer">
        <button
          type="button"
          className="footer-item sa-logout-btn"
          onClick={() => setLogoutOpen(true)}
        >
          <span className="footer-icon">🚪</span>
          {sidebarOpen && <span className="footer-label">Logout</span>}
        </button>
      </div>

      {logoutOpen && (
        <div className="sa-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="logout-title">
          <div className="sa-modal sa-logout-modal">
            <div className="sa-modal-header">
              <h3 id="logout-title">🚪 Confirm logout</h3>
              <button type="button" className="sa-modal-close" onClick={() => setLogoutOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>
            <div className="sa-modal-body">
              <p>Are you sure you want to logout of the Super Admin portal?</p>
              <p className="sa-logout-warning">⚠️ Unsaved changes may be lost.</p>
            </div>
            <div className="sa-modal-footer">
              <button type="button" className="sa-btn-secondary" onClick={() => setLogoutOpen(false)} disabled={loggingOut}>
                Cancel
              </button>
              <button type="button" className="sa-btn-danger" onClick={handleLogout} disabled={loggingOut}>
                {loggingOut ? 'Logging out…' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
