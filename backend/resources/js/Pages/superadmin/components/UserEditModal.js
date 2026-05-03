import React, { useEffect, useState } from 'react';

const UserEditModal = ({ user, isOpen, onClose, onSave, departments = [] }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!user) return;
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      department: user.department || '',
      studentId: user.studentId || '',
      employeeId: user.employeeId || '',
      companyName: user.companyName || '',
      status: user.status || 'active',
    });
  }, [user]);

  if (!isOpen || !user) return null;

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...user, ...formData });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>✏️ Edit User: {user.name}</h3>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" value={formData.name || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input name="phone" value={formData.phone || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select name="department" value={formData.department || ''} onChange={handleChange}>
                <option value="">Select Department</option>
                {departments.map((dep) => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
            </div>
            {user.role === 'student' && (
              <div className="form-group">
                <label>Student ID</label>
                <input name="studentId" value={formData.studentId || ''} onChange={handleChange} />
              </div>
            )}
            {(user.role === 'examiner' || user.role === 'coordinator' || user.role === 'advisor') && (
              <div className="form-group">
                <label>Employee ID</label>
                <input name="employeeId" value={formData.employeeId || ''} onChange={handleChange} />
              </div>
            )}
            {user.role === 'company' && (
              <div className="form-group">
                <label>Company Name</label>
                <input name="companyName" value={formData.companyName || ''} onChange={handleChange} />
              </div>
            )}
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status || 'active'} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;
