import React from 'react';

const Sidebar = ({ activeSection, setActiveSection, sidebarOpen, setSidebarOpen }) => {
  const menuItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📈',
      subItems: [
        { id: 'analytics-overview', label: 'Dashboard Analytics', icon: '📊' },
        { id: 'user-analytics', label: 'User Analytics', icon: '👥' },
        { id: 'system-health', label: 'System Health', icon: '💚' },
      ],
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
      id: 'notifications',
      label: 'Notifications',
      icon: '🔔',
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

  const [openMenus, setOpenMenus] = React.useState({ analytics: true, registrations: true, 'user-management': true });

  const toggleMenu = (menuId) => {
    setOpenMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const handleItemClick = (itemId) => {
    setActiveSection(itemId);
  };

  return (
    <div className={`sa-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sa-sidebar-header">
        <div className="sa-sidebar-logo">
          <span className="logo-icon">👑</span>
          <span className="logo-text">Super Admin</span>
        </div>
        <button
          className="sa-sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </div>

      <div className="sa-sidebar-content">
        <div className="sa-user-info">
          <div className="sa-user-avatar">👑</div>
          <div className="sa-user-details">
            <div className="sa-user-name">Super Admin</div>
            <div className="sa-user-role">Administrator</div>
          </div>
        </div>

        <nav className="sa-sidebar-nav">
          {menuItems.map((item) => (
            <div key={item.id} className="sa-nav-item">
              <div
                className={`sa-nav-link ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => {
                  if (item.subItems) {
                    toggleMenu(item.id);
                  } else {
                    handleItemClick(item.id);
                  }
                }}
              >
                <span className="sa-nav-icon">{item.icon}</span>
                <span className="sa-nav-label">{item.label}</span>
                {item.subItems && (
                  <span className="sa-nav-arrow">
                    {openMenus[item.id] ? '▼' : '▶'}
                  </span>
                )}
              </div>
              
              {item.subItems && openMenus[item.id] && (
                <div className="sa-submenu">
                  {item.subItems.map((subItem) => (
                    <div
                      key={subItem.id}
                      className={`sa-submenu-item ${activeSection === subItem.id ? 'active' : ''}`}
                      onClick={() => handleItemClick(subItem.id)}
                    >
                      <span className="sa-submenu-icon">{subItem.icon}</span>
                      <span className="sa-submenu-label">{subItem.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
