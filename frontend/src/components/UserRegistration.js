import React, { useState, useEffect } from 'react';
import './UserRegistration.css';

const UserRegistration = ({ onLogout }) => {
  const [users, setUsers] = useState([]);
  const [registrationForm, setRegistrationForm] = useState({
    role: 'student',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    studentId: '',
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    specialization: '',
    title: ''
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    // Simulate API call to fetch users
    setTimeout(() => {
      setUsers([
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@aru.edu',
          role: 'student',
          status: 'active',
          createdAt: '2024-01-15',
          studentId: 'ARU2024001',
          department: 'Computer Science'
        },
        {
          id: 2,
          firstName: 'Dr. Birhanu',
          lastName: 'Tesfaye',
          email: 'birhanu@aru.edu',
          role: 'coordinator',
          status: 'active',
          createdAt: '2024-01-10',
          department: 'Computer Science',
          title: 'Department Head'
        },
        {
          id: 3,
          firstName: 'Ethio',
          lastName: 'Telecom',
          email: 'hr@ethiotelecom.com',
          role: 'company',
          status: 'active',
          createdAt: '2024-01-12',
          companyName: 'Ethio Telecom',
          companyAddress: 'Addis Ababa, Ethiopia',
          companyPhone: '+251116617777'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegistrationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulate API call to register user
    setTimeout(() => {
      const newUser = {
        id: users.length + 1,
        ...registrationForm,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      };

      if (editingUser) {
        setUsers(prev => prev.map(user => 
          user.id === editingUser.id ? { ...newUser, id: editingUser.id } : user
        ));
        showNotification('success', 'User updated successfully!');
      } else {
        setUsers(prev => [...prev, newUser]);
        showNotification('success', 'User registered successfully!');
      }

      resetForm();
    }, 500);
  };

  const resetForm = () => {
    setRegistrationForm({
      role: 'student',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      department: '',
      studentId: '',
      companyName: '',
      companyAddress: '',
      companyPhone: '',
      companyEmail: '',
      specialization: '',
      title: ''
    });
    setShowForm(false);
    setEditingUser(null);
  };

  const handleEdit = (user) => {
    setRegistrationForm({
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      department: user.department || '',
      studentId: user.studentId || '',
      companyName: user.companyName || '',
      companyAddress: user.companyAddress || '',
      companyPhone: user.companyPhone || '',
      companyEmail: user.companyEmail || '',
      specialization: user.specialization || '',
      title: user.title || ''
    });
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      showNotification('success', 'User deleted successfully!');
    }
  };

  const handleToggleStatus = (userId) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
    showNotification('success', 'User status updated!');
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const getRoleIcon = (role) => {
    const icons = {
      student: '🎓',
      coordinator: '👨‍🏫',
      company: '🏢',
      examiner: '👨‍⚕️',
      admin: '⚙️'
    };
    return icons[role] || '👤';
  };

  const getStatusColor = (status) => {
    return status === 'active' ? '#28a745' : '#dc3545';
  };

  if (loading) {
    return (
      <div className="registration-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading user registration system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-registration">
      <div className="registration-header">
        <h1>👥 User Registration Management</h1>
        <p>Register and manage system users - Super Coordinator Only</p>
      </div>

      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="registration-actions">
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          <span className="btn-icon">➕</span>
          Register New User
        </button>
        <button className="btn-secondary">
          <span className="btn-icon">📊</span>
          Export Users
        </button>
        <button className="btn-secondary">
          <span className="btn-icon">📧</span>
          Send Welcome Emails
        </button>
      </div>

      {showForm && (
        <div className="registration-form-overlay">
          <div className="registration-form">
            <div className="form-header">
              <h3>{editingUser ? 'Edit User' : 'Register New User'}</h3>
              <button className="close-btn" onClick={resetForm}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h4>Basic Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>User Role *</label>
                    <select 
                      name="role" 
                      value={registrationForm.role} 
                      onChange={handleInputChange}
                      required
                    >
                      <option value="student">Student</option>
                      <option value="company">Company</option>
                      <option value="coordinator">Coordinator</option>
                      <option value="examiner">Examiner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>First Name *</label>
                    <input 
                      type="text" 
                      name="firstName" 
                      value={registrationForm.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input 
                      type="text" 
                      name="lastName" 
                      value={registrationForm.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={registrationForm.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={registrationForm.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <input 
                      type="text" 
                      name="address" 
                      value={registrationForm.address}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {registrationForm.role === 'student' && (
                <div className="form-section">
                  <h4>Student Information</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Student ID *</label>
                      <input 
                        type="text" 
                        name="studentId" 
                        value={registrationForm.studentId}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Department *</label>
                      <input 
                        type="text" 
                        name="department" 
                        value={registrationForm.department}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {registrationForm.role === 'company' && (
                <div className="form-section">
                  <h4>Company Information</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Company Name *</label>
                      <input 
                        type="text" 
                        name="companyName" 
                        value={registrationForm.companyName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Company Address *</label>
                      <input 
                        type="text" 
                        name="companyAddress" 
                        value={registrationForm.companyAddress}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Company Phone</label>
                      <input 
                        type="tel" 
                        name="companyPhone" 
                        value={registrationForm.companyPhone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Company Email</label>
                      <input 
                        type="email" 
                        name="companyEmail" 
                        value={registrationForm.companyEmail}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {(registrationForm.role === 'coordinator' || registrationForm.role === 'examiner') && (
                <div className="form-section">
                  <h4>{registrationForm.role === 'coordinator' ? 'Coordinator' : 'Examiner'} Information</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Department *</label>
                      <input 
                        type="text" 
                        name="department" 
                        value={registrationForm.department}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Title</label>
                      <input 
                        type="text" 
                        name="title" 
                        value={registrationForm.title}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Specialization</label>
                      <input 
                        type="text" 
                        name="specialization" 
                        value={registrationForm.specialization}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Update User' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="users-list">
        <h2>📋 Registered Users</h2>
        <div className="users-grid">
          {users.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-header">
                <div className="user-info">
                  <span className="role-icon">{getRoleIcon(user.role)}</span>
                  <div className="user-details">
                    <h4>{user.firstName} {user.lastName}</h4>
                    <p>{user.email}</p>
                  </div>
                </div>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(user.status) }}
                >
                  {user.status.toUpperCase()}
                </span>
              </div>
              <div className="user-meta">
                <div className="meta-item">
                  <span className="meta-label">Role:</span>
                  <span className="meta-value">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Created:</span>
                  <span className="meta-value">{user.createdAt}</span>
                </div>
                {user.studentId && (
                  <div className="meta-item">
                    <span className="meta-label">Student ID:</span>
                    <span className="meta-value">{user.studentId}</span>
                  </div>
                )}
                {user.companyName && (
                  <div className="meta-item">
                    <span className="meta-label">Company:</span>
                    <span className="meta-value">{user.companyName}</span>
                  </div>
                )}
                {user.department && (
                  <div className="meta-item">
                    <span className="meta-label">Department:</span>
                    <span className="meta-value">{user.department}</span>
                  </div>
                )}
              </div>
              <div className="user-actions">
                <button 
                  className="action-btn edit"
                  onClick={() => handleEdit(user)}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="action-btn toggle"
                  onClick={() => handleToggleStatus(user.id)}
                >
                  {user.status === 'active' ? '🔒 Deactivate' : '🔓 Activate'}
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => handleDelete(user.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;
