import React, { useState } from 'react';
import './UserSuspendModal.css';

const UserSuspendModal = ({ user, isOpen, onClose, onConfirm }) => {
  const [duration, setDuration] = useState('7');
  const [reason, setReason] = useState('');

  if (!isOpen || !user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please provide a reason for suspension');
      return;
    }
    onConfirm(user, duration, reason);
    setDuration('7');
    setReason('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header suspend">
          <h3>⏸️ Suspend User: {user.name}</h3>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Suspension Duration</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)}>
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
              <textarea rows="3" value={reason} onChange={(e) => setReason(e.target.value)} required />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-danger">Suspend User</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserSuspendModal;
