import React, { useState, useEffect } from 'react';
import './UserManagement.css';

const UserManagement = ({ onBack }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Simulate API call for users data
    setTimeout(() => {
      const mockUsers = generateMockUsers();
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const generateMockUsers = () => {
    return [
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@aru.edu.et',
        role: 'student',
        status: 'active',
        department: 'Computer Science',
        registrationDate: '2024-01-15',
        lastLogin: '2024-06-15 10:30 AM',
        profileImage: '👨‍🎓'
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@aru.edu.et',
        role: 'student',
        status: 'active',
        department: 'Information Technology',
        registrationDate: '2024-01-20',
        lastLogin: '2024-06-15 09:15 AM',
        profileImage: '👩‍🎓'
      },
      {
        id: 3,
        name: 'Ethiotelecom Company',
        email: 'hr@ethiotelecom.et',
        role: 'company',
        status: 'active',
        department: 'Technology',
        registrationDate: '2024-02-01',
        lastLogin: '2024-06-15 11:45 AM',
        profileImage: '🏢'
      },
      {
        id: 4,
        name: 'Dr. Ahmed Ali',
        email: 'ahmed.ali@aru.edu.et',
        role: 'coordinator',
        status: 'active',
        department: 'Computer Science',
        registrationDate: '2023-12-10',
        lastLogin: '2024-06-15 08:00 AM',
        profileImage: '👨‍🏫'
      },
      {
        id: 5,
        name: 'Prof. Sara Johnson',
        email: 'sara.johnson@aru.edu.et',
        role: 'examiner',
        status: 'active',
        department: 'Software Engineering',
        registrationDate: '2023-11-15',
        lastLogin: '2024-06-14 03:30 PM',
        profileImage: '👩‍🏫'
      },
      {
        id: 6,
        name: 'Commercial Bank',
        email: 'careers@combank.et',
        role: 'company',
        status: 'active',
        department: 'Banking',
        registrationDate: '2024-02-15',
        lastLogin: '2024-06-15 02:20 PM',
        profileImage: '🏦'
      },
      {
        id: 7,
        name: 'Michael Brown',
        email: 'michael.brown@aru.edu.et',
        role: 'student',
        status: 'inactive',
        department: 'Information Systems',
        registrationDate: '2024-01-25',
        lastLogin: '2024-05-20 04:45 PM',
        profileImage: '👨‍🎓'
      },
      {
        id: 8,
        name: 'Ethiopian Airlines',
        email: 'internship@ethiopianairlines.com',
        role: 'company',
        status: 'active',
        department: 'Aviation',
        registrationDate: '2024-03-01',
        lastLogin: '2024-06-15 12:00 PM',
        profileImage: '✈️'
      },
      {
        id: 9,
        name: 'Dr. Lemma Lemma',
        email: 'lemma.lemma@aru.edu.et',
        role: 'coordinator',
        status: 'active',
        department: 'Information Technology',
        registrationDate: '2023-10-20',
        lastLogin: '2024-06-15 07:30 AM',
        profileImage: '👨‍🏫'
      },
      {
        id: 10,
        name: 'Emily Davis',
        email: 'emily.davis@aru.edu.et',
        role: 'student',
        status: 'active',
        department: 'Software Engineering',
        registrationDate: '2024-02-10',
        lastLogin: '2024-06-15 01:15 PM',
        profileImage: '👩‍🎓'
      }
    ];
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = (userData) => {
    const newUser = {
      id: users.length + 1,
      ...userData,
      registrationDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      status: 'active'
    };
    setUsers([...users, newUser]);
    setShowAddUser(false);
    addNotification('User added successfully!', 'success');
  };

  const handleEditUser = (userData) => {
    setUsers(users.map(user => 
      user.id === userData.id ? { ...user, ...userData } : user
    ));
    setEditingUser(null);
    addNotification('User updated successfully!', 'success');
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
      addNotification('User deleted successfully!', 'info');
    }
  };

  const handleToggleStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
    addNotification('User status updated!', 'success');
  };

  const addNotification = (message, type) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const getRoleIcon = (role) => {
    const icons = {
      student: '👨‍🎓',
      company: '🏢',
      coordinator: '👨‍🏫',
      examiner: '👩‍🏫',
      admin: '👨‍💼'
    };
    return icons[role] || '👤';
  };

  const getStatusColor = (status) => {
    return status === 'active' ? '#43e97b' : '#dc3545';
  };

  if (loading) {
    return (
      <div className="user-management-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading user management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="management-header">
        <div className="header-content">
          <button className="back-btn" onClick={onBack}>
            <span>←</span> Back to Dashboard
          </button>
          <h1>👥 User Management</h1>
          <p>Manage system users, roles, and permissions</p>
        </div>
        <div className="header-actions">
          <button className="add-user-btn" onClick={() => setShowAddUser(true)}>
            <span>➕</span> Add New User
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{users.length}</p>
            <span className="stat-change">+2 this week</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <h3>Active Users</h3>
            <p className="stat-value">{users.filter(u => u.status === 'active').length}</p>
            <span className="stat-change">85% active</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-content">
            <h3>Students</h3>
            <p className="stat-value">{users.filter(u => u.role === 'student').length}</p>
            <span className="stat-change">+1 this month</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>Companies</h3>
            <p className="stat-value">{users.filter(u => u.role === 'company').length}</p>
            <span className="stat-change">+2 this month</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="filter-controls">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="company">Companies</option>
            <option value="coordinator">Coordinators</option>
            <option value="examiner">Examiners</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Registration Date</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="user-row">
                <td>
                  <div className="user-info">
                    <div className="user-avatar">{user.profileImage}</div>
                    <div className="user-details">
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="role-badge">
                    <span className="role-icon">{getRoleIcon(user.role)}</span>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td>{user.department}</td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(user.status) }}
                  >
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td>{user.registrationDate}</td>
                <td>{user.lastLogin}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-btn edit"
                      onClick={() => setEditingUser(user)}
                      title="Edit User"
                    >
                      ✏️
                    </button>
                    <button 
                      className="action-btn toggle"
                      onClick={() => handleToggleStatus(user.id)}
                      title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {user.status === 'active' ? '🔴' : '🟢'}
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Delete User"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onSave={handleAddUser}
        />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleEditUser}
        />
      )}

      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map(notification => (
          <div key={notification.id} className={`notification ${notification.type}`}>
            <span>{notification.message}</span>
            <button onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}>
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Add User Modal Component
const AddUserModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    department: '',
    profileImage: '👤'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const roleOptions = [
    { value: 'student', label: 'Student', icon: '👨‍🎓' },
    { value: 'company', label: 'Company', icon: '🏢' },
    { value: 'coordinator', label: 'Coordinator', icon: '👨‍🏫' },
    { value: 'examiner', label: 'Examiner', icon: '👩‍🏫' },
    { value: 'admin', label: 'Admin', icon: '👨‍💼' }
  ];

  const departmentOptions = [
    'Computer Science',
    'Information Technology',
    'Software Engineering',
    'Information Systems',
    'Computer Engineering',
    'Technology',
    'Banking',
    'Aviation',
    'Consulting'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>➕ Add New User</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Department</label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              >
                <option value="">Select Department</option>
                {departmentOptions.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </form>
        <div className="modal-footer">
          <button type="button" className="modal-btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="modal-btn primary" onClick={handleSubmit}>
            Add User
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit User Modal Component
const EditUserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    ...user
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const roleOptions = [
    { value: 'student', label: 'Student', icon: '👨‍🎓' },
    { value: 'company', label: 'Company', icon: '🏢' },
    { value: 'coordinator', label: 'Coordinator', icon: '👨‍🏫' },
    { value: 'examiner', label: 'Examiner', icon: '👩‍🏫' },
    { value: 'admin', label: 'Admin', icon: '👨‍💼' }
  ];

  const departmentOptions = [
    'Computer Science',
    'Information Technology',
    'Software Engineering',
    'Information Systems',
    'Computer Engineering',
    'Technology',
    'Banking',
    'Aviation',
    'Consulting'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>✏️ Edit User</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Department</label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              >
                {departmentOptions.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </form>
        <div className="modal-footer">
          <button type="button" className="modal-btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="modal-btn primary" onClick={handleSubmit}>
            Update User
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
