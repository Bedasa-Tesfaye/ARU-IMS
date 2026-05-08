import React from 'react';
import { formatDate, getRoleInfo, getStatusInfo } from '../../utils/userHelpers';
import './UserList.css';

const UserList = ({
  users,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onBulkSuspend,
  onBulkDelete,
  onEdit,
  onSuspend,
  onDelete,
  onResetPassword,
  onViewDetails,
}) => {
  const selectAll = users.length > 0 && users.every((u) => selectedIds.has(u.id));

  return (
    <div className="user-list-container">
      {selectedIds.size > 0 && (
        <div className="bulk-actions-bar">
          <span>{selectedIds.size} user(s) selected</span>
          <div className="bulk-buttons">
            <button type="button" className="bulk-suspend" onClick={onBulkSuspend}>⏸️ Suspend Selected</button>
            <button type="button" className="bulk-delete" onClick={onBulkDelete}>🗑️ Delete Selected</button>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="user-table">
          <thead>
            <tr>
              <th><input type="checkbox" checked={selectAll && users.length > 0} onChange={onToggleSelectAll} /></th>
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
                  <td><input type="checkbox" checked={selectedIds.has(user.id)} onChange={() => onToggleSelect(user.id)} /></td>
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
