import React, { useEffect, useState } from 'react';
import { formatDate, getRoleInfo, getStatusInfo } from '../../utils/userHelpers';
import './UserList.css';

const UserList = ({ users, onEdit, onSuspend, onDelete, onResetPassword, onViewDetails }) => {
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    setSelectedUsers(new Set());
    setSelectAll(false);
  }, [users]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers(new Set());
      setSelectAll(false);
      return;
    }
    setSelectedUsers(new Set(users.map((u) => u.id)));
    setSelectAll(true);
  };

  const handleSelectUser = (userId) => {
    const next = new Set(selectedUsers);
    if (next.has(userId)) next.delete(userId);
    else next.add(userId);
    setSelectedUsers(next);
    setSelectAll(next.size > 0 && next.size === users.length);
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.size === 0) return;
    if (!window.confirm(`Are you sure you want to ${action} ${selectedUsers.size} user(s)?`)) return;
    selectedUsers.forEach((userId) => {
      const user = users.find((u) => u.id === userId);
      if (!user) return;
      if (action === 'suspend') onSuspend(user);
      if (action === 'delete') onDelete(user);
    });
  };

  return (
    <div className="user-list-container">
      {selectedUsers.size > 0 && (
        <div className="bulk-actions-bar">
          <span>{selectedUsers.size} user(s) selected</span>
          <div className="bulk-buttons">
            <button type="button" className="bulk-suspend" onClick={() => handleBulkAction('suspend')}>⏸️ Suspend Selected</button>
            <button type="button" className="bulk-delete" onClick={() => handleBulkAction('delete')}>🗑️ Delete Selected</button>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="user-table">
          <thead>
            <tr>
              <th><input type="checkbox" checked={selectAll && users.length > 0} onChange={handleSelectAll} /></th>
              <th>User</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="7" className="empty-state"><div className="empty-icon">👥</div><p>No users found</p></td></tr>
            ) : users.map((user) => {
              const roleInfo = getRoleInfo(user.role);
              const statusInfo = getStatusInfo(user.status);
              return (
                <tr key={user.id} className="user-row">
                  <td><input type="checkbox" checked={selectedUsers.has(user.id)} onChange={() => handleSelectUser(user.id)} /></td>
                  <td className="user-cell">
                    <div className="user-avatar" style={{ background: roleInfo.bg }}>{roleInfo.icon}</div>
                    <div>
                      <div className="user-name">{user.name}</div>
                      <div className="user-id">{user.studentId || user.employeeId || user.companyName || `ID: ${user.id}`}</div>
                    </div>
                  </td>
                  <td><div className="user-email">{user.email}</div><div className="user-phone">{user.phone || '—'}</div></td>
                  <td><span className="role-badge" style={{ background: roleInfo.bg, color: roleInfo.color }}>{roleInfo.icon} {roleInfo.label}</span></td>
                  <td><span className="status-badge" style={{ background: statusInfo.bg, color: statusInfo.color }}>{statusInfo.icon} {statusInfo.label}</span></td>
                  <td className="last-login">{formatDate(user.lastLogin)}</td>
                  <td className="action-buttons">
                    <button type="button" className="action-btn view" onClick={() => onViewDetails(user)} title="View Details">👁️</button>
                    <button type="button" className="action-btn edit" onClick={() => onEdit(user)} title="Edit User">✏️</button>
                    <button type="button" className="action-btn reset" onClick={() => onResetPassword(user)} title="Reset Password">🔑</button>
                    <button type="button" className="action-btn suspend" onClick={() => onSuspend(user)} title="Suspend User">⏸️</button>
                    <button type="button" className="action-btn delete" onClick={() => onDelete(user)} title="Delete User">🗑️</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
