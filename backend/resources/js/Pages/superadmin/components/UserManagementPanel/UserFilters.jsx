import React from 'react';
import './UserFilters.css';

const UserFilters = ({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  onExport,
}) => {
  const roles = [
    { value: '', label: 'All Roles', icon: '👥' },
    { value: 'super_admin', label: 'Super Admin', icon: '👑' },
    { value: 'coordinator', label: 'Coordinator', icon: '📋' },
    { value: 'examiner', label: 'Examiner', icon: '👨‍🏫' },
    { value: 'student', label: 'Student', icon: '🎓' },
    { value: 'company', label: 'Company', icon: '🏢' },
    { value: 'advisor', label: 'Advisor', icon: '👨‍💼' },
  ];

  const statuses = [
    { value: '', label: 'All Status', icon: '📊' },
    { value: 'active', label: 'Active', icon: '✅' },
    { value: 'suspended', label: 'Suspended', icon: '⛔' },
    { value: 'pending', label: 'Pending', icon: '⏳' },
    { value: 'inactive', label: 'Inactive', icon: '⚪' },
  ];

  return (
    <div className="user-filters">
      <div className="filters-row">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && <button type="button" className="clear-search" onClick={() => setSearchTerm('')}>✕</button>}
        </div>
        <div className="filter-group">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            {roles.map((role) => <option key={role.value || 'all'} value={role.value}>{role.icon} {role.label}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {statuses.map((status) => <option key={status.value || 'all'} value={status.value}>{status.icon} {status.label}</option>)}
          </select>
        </div>
        <button type="button" className="export-btn" onClick={onExport}>📥 Export CSV</button>
      </div>
    </div>
  );
};

export default UserFilters;
