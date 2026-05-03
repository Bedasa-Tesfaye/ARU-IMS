import React, { useState } from 'react';

const UserSuspendModal = ({ user, isOpen, onClose, onConfirm }) => {
  const [duration, setDuration] = useState('7');
  const [reason, setReason] = useState('');

  if (!isOpen || !user) return null;

  const durations = [
    { value: '1', label: '1 day' },
    { value: '7', label: '7 days' },
    { value: '14', label: '14 days' },
    { value: '30', label: '30 days' },
    { value: '90', label: '3 months' },
    { value: '180', label: '6 months' },
    { value: '365', label: '1 year' },
    { value: 'permanent', label: 'Permanent' },
  ];

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
                {durations.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Reason for Suspension</label>
              <textarea
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for suspension..."
              />
            </div>
            <div className="warning-box">
              <span>⚠️</span>
              <div>
                <strong>Suspension Effects:</strong>
                <ul>
                  <li>User will not be able to login.</li>
                  <li>Pending tasks may be blocked based on role.</li>
                  <li>Action will be logged for audit review.</li>
                </ul>
              </div>
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
