import React from 'react';

const Header = ({ activeSection, currentTime }) => {
  const getSectionTitle = () => {
    const titles = {
      overview: 'Dashboard Overview',
      student: 'Student Registration',
      company: 'Company Registration',
      examiner: 'Examiner Registration',
      advisor: 'Advisor Registration',
      'all-users': 'All Users Management',
      students: 'Student Management',
      examiners: 'Examiner Management',
      coordinators: 'Coordinator Management',
      companies: 'Company Management',
      advisors: 'Advisor Management',
      settings: 'System Settings',
    };
    return titles[activeSection] || 'Super Admin Dashboard';
  };

  const getSectionIcon = () => {
    const icons = {
      overview: '📊',
      student: '🎓',
      company: '🏢',
      examiner: '👨‍🏫',
      advisor: '👨‍💼',
      'all-users': '👥',
      students: '🎓',
      examiners: '👨‍🏫',
      coordinators: '📋',
      companies: '🏢',
      advisors: '👨‍💼',
      settings: '⚙️',
    };
    return icons[activeSection] || '👑';
  };

  return (
    <div className="sa-header">
      <div className="header-title">
        <div className="title-icon">{getSectionIcon()}</div>
        <div>
          <h1>{getSectionTitle()}</h1>
          <p>Manage and monitor your internship ecosystem</p>
        </div>
      </div>
      <div className="header-stats">
        <div className="header-stat">
          <span className="stat-value">{currentTime.toLocaleTimeString()}</span>
          <span className="stat-label">{currentTime.toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
