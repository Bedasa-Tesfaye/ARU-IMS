import React, { useEffect, useMemo, useState } from 'react';
import UserDeleteConfirm from './UserDeleteConfirm';
import UserEditModal from './UserEditModal';
import UserFilters from './UserFilters';
import UserList from './UserList';
import UserSuspendModal from './UserSuspendModal';
import { exportToCSV, filterUsers } from '../utils/userHelpers';

const UserManagement = ({
  users,
  departments,
  onUpdateUser,
  onSuspendUser,
  onDeleteUser,
  onResetPassword,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredUsers = useMemo(
    () => filterUsers(users, searchTerm, roleFilter, statusFilter),
    [users, searchTerm, roleFilter, statusFilter]
  );

  const [stats, setStats] = useState({ total: 0, byRole: {} });

  useEffect(() => {
    const byRole = {};
    users.forEach((user) => {
      byRole[user.role] = (byRole[user.role] || 0) + 1;
    });
    setStats({ total: users.length, byRole });
  }, [users]);

  const roleStats = [
    { role: 'student', label: 'Students', icon: '🎓', color: '#28a745' },
    { role: 'examiner', label: 'Examiners', icon: '👨‍🏫', color: '#17a2b8' },
    { role: 'coordinator', label: 'Coordinators', icon: '📋', color: '#0d6efd' },
    { role: 'company', label: 'Companies', icon: '🏢', color: '#fd7e14' },
    { role: 'advisor', label: 'Advisors', icon: '👨‍💼', color: '#6f42c1' },
    { role: 'super_admin', label: 'Super Admins', icon: '👑', color: '#dc3545' },
  ];

  const closeAllModals = () => {
    setShowEditModal(false);
    setShowSuspendModal(false);
    setShowDeleteConfirm(false);
    setSelectedUser(null);
  };

  return (
    <div className="user-management">
      <div className="user-stats">
        <div className="total-users-card">
          <div className="total-icon">👥</div>
          <div className="total-info">
            <h2>{stats.total}</h2>
            <p>Total Users</p>
          </div>
        </div>

        {roleStats.map((stat) => (
          <div key={stat.role} className="role-stat-card" style={{ borderLeftColor: stat.color }}>
            <div className="role-stat-icon">{stat.icon}</div>
            <div className="role-stat-info">
              <div className="role-stat-count">{stats.byRole[stat.role] || 0}</div>
              <div className="role-stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onExport={() => exportToCSV(filteredUsers)}
      />

      <UserList
        users={filteredUsers}
        onEdit={(user) => { setSelectedUser(user); setShowEditModal(true); }}
        onSuspend={(user) => { setSelectedUser(user); setShowSuspendModal(true); }}
        onDelete={(user) => { setSelectedUser(user); setShowDeleteConfirm(true); }}
        onResetPassword={onResetPassword}
        onViewDetails={(user) => { setSelectedUser(user); setShowEditModal(true); }}
      />

      <UserEditModal
        user={selectedUser}
        isOpen={showEditModal}
        departments={departments}
        onClose={closeAllModals}
        onSave={(updatedUser) => {
          onUpdateUser(updatedUser);
          closeAllModals();
        }}
      />

      <UserSuspendModal
        user={selectedUser}
        isOpen={showSuspendModal}
        onClose={closeAllModals}
        onConfirm={(user, duration, reason) => {
          onSuspendUser(user, duration, reason);
          closeAllModals();
        }}
      />

      <UserDeleteConfirm
        user={selectedUser}
        isOpen={showDeleteConfirm}
        onClose={closeAllModals}
        onConfirm={(user) => {
          onDeleteUser(user);
          closeAllModals();
        }}
      />
    </div>
  );
};

export default UserManagement;
