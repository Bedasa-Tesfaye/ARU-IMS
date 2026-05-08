import React, { useEffect, useMemo, useState } from 'react';
import { exportToCSV, exportToExcel, filterUsers } from '../utils/userHelpers';
import UserEditModal from './UserManagementPanel/UserEditModal';
import UserFilters from './UserManagementPanel/UserFilters';
import UserList from './UserManagementPanel/UserList';
import UserSuspendModal from './UserManagementPanel/UserSuspendModal';
import './UserManagementPanel.css';

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
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null); // { users: [] }
  const [bulkSuspendDialog, setBulkSuspendDialog] = useState(null); // { users: [] }
  const [bulkDuration, setBulkDuration] = useState('7');
  const [bulkReason, setBulkReason] = useState('');
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const sectionRole = mapSectionToRole(activeSection);

  const effectiveRoleFilter = roleFilter || sectionRole;
  const filteredUsers = useMemo(
    () => filterUsers(users, searchTerm, effectiveRoleFilter, statusFilter, departmentFilter),
    [users, searchTerm, effectiveRoleFilter, statusFilter, departmentFilter]
  );

  useEffect(() => {
    setSelectedIds(new Set());
  }, [filteredUsers]);

  const closeAll = () => {
    setShowEditModal(false);
    setShowSuspendModal(false);
    setSelectedUser(null);
    setDeleteDialog(null);
    setBulkSuspendDialog(null);
    setBulkDuration('7');
    setBulkReason('');
  };

  const selectedUsers = useMemo(
    () => filteredUsers.filter((u) => selectedIds.has(u.id)),
    [filteredUsers, selectedIds]
  );

  return (
    <div className="user-management">
      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        departments={departments}
        onExportCSV={() => exportToCSV(filteredUsers)}
        onExportExcel={() => exportToExcel(filteredUsers)}
      />

      <UserList
        users={filteredUsers}
        selectedIds={selectedIds}
        onToggleSelect={(id) =>
          setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          })
        }
        onToggleSelectAll={() =>
          setSelectedIds((prev) => {
            const allSelected = filteredUsers.length > 0 && filteredUsers.every((u) => prev.has(u.id));
            return allSelected ? new Set() : new Set(filteredUsers.map((u) => u.id));
          })
        }
        onBulkSuspend={() => {
          if (!selectedUsers.length) return;
          setBulkSuspendDialog({ users: selectedUsers });
        }}
        onBulkDelete={() => {
          if (!selectedUsers.length) return;
          setDeleteDialog({ users: selectedUsers });
        }}
        onEdit={(user) => { setSelectedUser(user); setShowEditModal(true); }}
        onSuspend={(user) => { setSelectedUser(user); setShowSuspendModal(true); }}
        onDelete={(user) => setDeleteDialog({ users: [user] })}
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

      {bulkSuspendDialog && (
        <div className="modal-overlay" onClick={closeAll}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header suspend">
              <h3>⏸️ Suspend {bulkSuspendDialog.users.length} Users</h3>
              <button type="button" className="modal-close" onClick={closeAll}>✕</button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const reason = bulkReason.trim();
                if (!reason) return;
                for (const u of bulkSuspendDialog.users) {
                  await onSuspendUser(u, bulkDuration, reason);
                }
                setSelectedIds(new Set());
                closeAll();
              }}
            >
              <div className="modal-body">
                <div className="form-group">
                  <label>Suspension Duration</label>
                  <select value={bulkDuration} onChange={(e) => setBulkDuration(e.target.value)}>
                    <option value="1">1 day</option>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="90">3 months</option>
                    <option value="180">6 months</option>
                    <option value="365">1 year</option>
                    <option value="permanent">Permanent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Reason for Suspension *</label>
                  <textarea rows="3" value={bulkReason} onChange={(e) => setBulkReason(e.target.value)} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeAll}>Cancel</button>
                <button type="submit" className="btn-danger">Suspend Users</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteDialog && (
        <div className="modal-overlay" onClick={closeAll}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header suspend">
              <h3>🗑️ Delete {deleteDialog.users.length === 1 ? 'User' : 'Users'}</h3>
              <button type="button" className="modal-close" onClick={closeAll}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ marginTop: 0, color: '#6c757d' }}>
                This action cannot be undone.
              </p>
              <div style={{ maxHeight: 160, overflow: 'auto', border: '1px solid #f0f0f0', borderRadius: 10, padding: '0.6rem 0.75rem' }}>
                {deleteDialog.users.slice(0, 12).map((u) => (
                  <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', padding: '0.25rem 0' }}>
                    <span>{u.name}</span>
                    <span style={{ color: '#6c757d' }}>{u.email}</span>
                  </div>
                ))}
                {deleteDialog.users.length > 12 && <div style={{ color: '#6c757d', paddingTop: '0.25rem' }}>…and {deleteDialog.users.length - 12} more</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closeAll}>Cancel</button>
              <button
                type="button"
                className="btn-danger"
                onClick={async () => {
                  for (const u of deleteDialog.users) {
                    await onDeleteUser(u);
                  }
                  setSelectedIds(new Set());
                  closeAll();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPanel;
