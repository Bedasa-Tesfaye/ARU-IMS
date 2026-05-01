import React from 'react';

const UserDeleteConfirm = ({ user, isOpen, onClose, onConfirm }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header danger">
          <h3>🗑️ Delete User</h3>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p>
            Are you sure you want to permanently delete <strong>{user.name}</strong>?
          </p>
          <p className="warning-text">This action cannot be undone.</p>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-danger" onClick={() => onConfirm(user)}>Delete User</button>
        </div>
      </div>
    </div>
  );
};

export default UserDeleteConfirm;
