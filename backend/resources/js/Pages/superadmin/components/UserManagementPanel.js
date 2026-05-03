import React, { useMemo, useState } from 'react';
import { exportToCSV, filterUsers } from '../utils/userHelpers';
import UserEditModal from './UserManagementPanel/UserEditModal';
import UserFilters from './UserManagementPanel/UserFilters';
import UserList from './UserManagementPanel/UserList';
import UserSuspendModal from './UserManagementPanel/UserSuspendModal';

const mapSectionToRole = (section) => {
  const map = {
    students: 'student',
    examiners: 'examiner',
    coordinators: 'coordinator',
    companies: 'company',
    advisors: 'advisor',
  };
  return map[section] || '';
};

const UserManagementPanel = ({
  users,
  activeSection,
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

  const sectionRole = mapSectionToRole(activeSection);

  const effectiveRoleFilter = roleFilter || sectionRole;
  const filteredUsers = useMemo(
    () => filterUsers(users, searchTerm, effectiveRoleFilter, statusFilter),
    [users, searchTerm, effectiveRoleFilter, statusFilter]
  );

  const closeAll = () => {
    setShowEditModal(false);
    setShowSuspendModal(false);
    setSelectedUser(null);
  };

  return (
    <div className="user-management">
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
        onDelete={(user) => {
          if (window.confirm(`Delete ${user.name}? This cannot be undone.`)) {
            onDeleteUser(user);
          }
        }}
        onResetPassword={onResetPassword}
        onViewDetails={(user) => { setSelectedUser(user); setShowEditModal(true); }}
      />

      <UserEditModal
        user={selectedUser}
        isOpen={showEditModal}
        departments={departments}
        onClose={closeAll}
        onSave={(updatedUser) => { onUpdateUser(updatedUser); closeAll(); }}
      />

      <UserSuspendModal
        user={selectedUser}
        isOpen={showSuspendModal}
        onClose={closeAll}
        onConfirm={(user, duration, reason) => { onSuspendUser(user, duration, reason); closeAll(); }}
      />
    </div>
  );
};

export default UserManagementPanel;
