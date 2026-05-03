import React from 'react';

const OverviewStats = ({ stats }) => {
  const statCards = [
    { icon: '👥', label: 'Total Users', value: stats.totalUsers, color: '#667eea' },
    { icon: '🎓', label: 'Students', value: stats.totalStudents, color: '#28a745' },
    { icon: '👨‍🏫', label: 'Examiners', value: stats.totalExaminers, color: '#17a2b8' },
    { icon: '🏢', label: 'Companies', value: stats.totalCompanies, color: '#fd7e14' },
    { icon: '📋', label: 'Coordinators', value: stats.totalCoordinators, color: '#6f42c1' },
    { icon: '👨‍💼', label: 'Advisors', value: stats.totalAdvisors, color: '#20c997' },
  ];

  return (
    <div className="sa-stats-grid">
      {statCards.map((stat) => (
        <div key={stat.label} className="sa-stat-card" style={{ borderLeftColor: stat.color }}>
          <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
          <div className="stat-info">
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverviewStats;
