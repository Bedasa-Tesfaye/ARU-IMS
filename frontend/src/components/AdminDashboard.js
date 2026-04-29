import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, activitiesRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/admin/activity-logs'),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data.data);
      setActivities(activitiesRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatus = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { is_active: isActive });
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: { bg: '#dc3545', icon: '👑' },
      coordinator: { bg: '#0d6efd', icon: '📋' },
      student: { bg: '#198754', icon: '🎓' },
      company: { bg: '#fd7e14', icon: '🏢' },
      examiner: { bg: '#0dcaf0', icon: '👨‍🏫' }
    };
    const roleConfig = colors[role] || { bg: '#6c757d', icon: '👤' };
    return (
      <Badge style={{ background: roleConfig.bg, padding: '6px 12px', borderRadius: '20px' }}>
        <span style={{ marginRight: '5px' }}>{roleConfig.icon}</span>
        {role}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: { bg: '#198754', text: 'Active' },
      pending: { bg: '#fd7e14', text: 'Pending' },
      approved: { bg: '#198754', text: 'Approved' },
      rejected: { bg: '#dc3545', text: 'Rejected' },
      submitted: { bg: '#0dcaf0', text: 'Submitted' },
      inactive: { bg: '#6c757d', text: 'Inactive' }
    };
    const statusConfig = colors[status] || { bg: '#6c757d', text: status };
    return (
      <Badge style={{ background: statusConfig.bg, padding: '4px 10px', borderRadius: '20px' }}>
        {statusConfig.text}
      </Badge>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Navigation Menu Items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊', color: '#667eea' },
    { id: 'manage-users', label: 'Manage Users', icon: '👥', color: '#0d6efd' },
    { id: 'register-user', label: 'Register User', icon: '➕', color: '#198754' },
    { id: 'approve-requests', label: 'Approve Requests', icon: '✅', color: '#fd7e14' },
    { id: 'view-analytics', label: 'View Analytics', icon: '📈', color: '#6f42c1' },
    { id: 'activity-logs', label: 'Activity Logs', icon: '📜', color: '#0dcaf0' },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="overview-section">
            <Row>
              <Col lg={8}>
                <div className="overview-card">
                  <h5 className="section-title">System Health</h5>
                  <Row className="g-3">
                    <Col sm={4}>
                      <div className="health-stat">
                        <div className="health-value">{stats?.active_internships || 0}</div>
                        <div className="health-label">Active Internships</div>
                      </div>
                    </Col>
                    <Col sm={4}>
                      <div className="health-stat">
                        <div className="health-value">{stats?.approved_applications || 0}</div>
                        <div className="health-label">Approved Applications</div>
                      </div>
                    </Col>
                    <Col sm={4}>
                      <div className="health-stat">
                        <div className="health-value">{stats?.total_coordinators || 0}</div>
                        <div className="health-label">Coordinators</div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>
              <Col lg={4}>
                <div className="overview-card">
                  <h5 className="section-title">Quick Stats</h5>
                  <div className="quick-stats">
                    <div className="quick-stat-item">
                      <span>Examiners</span>
                      <strong>{stats?.total_examiners || 0}</strong>
                    </div>
                    <div className="quick-stat-item">
                      <span>Departments</span>
                      <strong>{stats?.total_departments || 5}</strong>
                    </div>
                    <div className="quick-stat-item">
                      <span>Success Rate</span>
                      <strong>94%</strong>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        );

      case 'manage-users':
        return (
          <div className="users-section">
            <div className="users-filters">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <select 
                className="role-filter"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="examiner">Examiners</option>
                <option value="coordinator">Coordinators</option>
                <option value="company">Companies</option>
                <option value="admin">Admins</option>
               </select>
             </div>
             <div className="d-flex justify-content-between align-items-center mb-3">
                <Button variant="primary" onClick={() => setActiveTab('register-user')}>
                    <span>➕</span> Register User
                </Button>
             </div>
             <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="user-cell">
                          <div className="user-avatar">
                            {u.first_name?.charAt(0)}{u.last_name?.charAt(0)}
                          </div>
                          <div>
                            <div className="user-name">{u.first_name} {u.last_name}</div>
                            <div className="user-id">ID: {u.id}</div>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>{getRoleBadge(u.role)}</td>
                        <td>{getStatusBadge(u.is_active ? 'active' : 'inactive')}</td>
                        <td>
                          <button 
                            className={`action-btn ${u.is_active ? 'danger' : 'success'}`}
                            onClick={() => handleUserStatus(u.id, !u.is_active)}
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'register-user':
        return (
          <div className="register-section">
            <Card className="register-card">
              <Card.Body>
                <h4 className="register-title">➕ Register New User</h4>
                <p className="register-subtitle">Create a new user account in the system</p>
                <Form>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>First Name</Form.Label>
                        <Form.Control type="text" placeholder="Enter first name" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control type="text" placeholder="Enter last name" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control type="email" placeholder="Enter email" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Role</Form.Label>
                        <Form.Select>
                          <option>Select Role</option>
                          <option value="student">Student</option>
                          <option value="examiner">Examiner</option>
                          <option value="coordinator">Coordinator</option>
                          <option value="company">Company</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Student ID (if student)</Form.Label>
                        <Form.Control type="text" placeholder="Enter student ID" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Department</Form.Label>
                        <Form.Control type="text" placeholder="Enter department" />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Temporary Password</Form.Label>
                        <Form.Control type="password" placeholder="Enter temporary password" />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Button className="register-btn">
                        <span>➕</span> Register User
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </div>
        );

      case 'approve-requests':
        return (
          <div className="approve-section">
            <div className="section-header">
              <h4>✅ Pending Approval Requests</h4>
              <p>Review and approve internship applications, report submissions, and user requests</p>
            </div>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Request Type</th>
                    <th>Requested By</th>
                    <th>Details</th>
                    <th>Submitted Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><Badge bg="info">Internship Application</Badge></td>
                    <td>Bedasa Tesfaye</td>
                    <td>Application for Software Developer Internship</td>
                    <td>2024-04-24</td>
                    <td>{getStatusBadge('pending')}</td>
                    <td>
                      <button className="approve-btn">Approve</button>
                      <button className="reject-btn">Reject</button>
                    </td>
                  </tr>
                  <tr>
                    <td><Badge bg="warning">Report Submission</Badge></td>
                    <td>Edo Bariso</td>
                    <td>Weekly Progress Report - Week 3</td>
                    <td>2024-04-23</td>
                    <td>{getStatusBadge('pending')}</td>
                    <td>
                      <button className="approve-btn">Approve</button>
                      <button className="reject-btn">Reject</button>
                    </td>
                  </tr>
                  <tr>
                    <td><Badge bg="success">Company Registration</Badge></td>
                    <td>Ethio Telecom</td>
                    <td>New company registration request</td>
                    <td>2024-04-22</td>
                    <td>{getStatusBadge('pending')}</td>
                    <td>
                      <button className="approve-btn">Approve</button>
                      <button className="reject-btn">Reject</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'view-analytics':
        return (
          <div className="analytics-section">
            <div className="section-header">
              <h4>📈 System Analytics</h4>
              <p>Comprehensive insights and performance metrics</p>
            </div>
            <Row className="g-4">
              <Col md={6}>
                <Card className="analytics-card">
                  <Card.Body>
                    <h5>User Growth</h5>
                    <div className="analytics-chart-placeholder">
                      📊 User registration trend over time
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="analytics-card">
                  <Card.Body>
                    <h5>Internship Distribution</h5>
                    <div className="analytics-chart-placeholder">
                      🎯 Internships by department
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="analytics-card">
                  <Card.Body>
                    <h5>Applications Overview</h5>
                    <div className="analytics-stats">
                      <div className="analytics-stat">
                        <span>Total Applications</span>
                        <strong>{stats?.total_applications || 0}</strong>
                      </div>
                      <div className="analytics-stat">
                        <span>Approved</span>
                        <strong className="text-success">{stats?.approved_applications || 0}</strong>
                      </div>
                      <div className="analytics-stat">
                        <span>Pending</span>
                        <strong className="text-warning">{stats?.pending_applications || 0}</strong>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="analytics-card">
                  <Card.Body>
                    <h5>Success Metrics</h5>
                    <div className="analytics-stats">
                      <div className="analytics-stat">
                        <span>Placement Rate</span>
                        <strong>94%</strong>
                      </div>
                      <div className="analytics-stat">
                        <span>Satisfaction Rate</span>
                        <strong>4.8/5</strong>
                      </div>
                      <div className="analytics-stat">
                        <span>Report Completion</span>
                        <strong>92%</strong>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        );

      case 'activity-logs':
        return (
          <div className="activity-section">
            <div className="section-header">
              <h4>📜 Recent Activity Logs</h4>
              <p>Track all system activities and user actions</p>
            </div>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Action</th>
                    <th>User</th>
                    <th>Description</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.length > 0 ? (
                    activities.map((activity, index) => (
                      <tr key={index}>
                        <td>{getRoleBadge(activity.type)}</td>
                        <td><span className="action-badge">{activity.action}</span></td>
                        <td>{activity.user}</td>
                        <td>{activity.description}</td>
                        <td>{new Date(activity.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4">No activities found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return <div>Select a menu item</div>;
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className={`admin-dashboard ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar Navigation */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🎓</span>
            <h3>ARU IMS</h3>
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar-large">
            {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
          </div>
          <div className="user-info-sidebar">
            <h4>{user?.first_name} {user?.last_name}</h4>
            <p>Super Admin</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon" style={{ color: item.color }}>{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="admin-header">
          <div className="header-left">
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-subtitle">Welcome to ARU Internship Management System</p>
          </div>
          <div className="header-right">
            <div className="welcome-card">
              <span className="welcome-icon">👋</span>
              <div>
                <p className="welcome-text">Welcome back,</p>
                <h4 className="welcome-name">{user?.first_name} {user?.last_name}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Only show on Overview */}
        {activeTab === 'overview' && (
          <>
            <Row className="mb-4 g-4">
              <Col md={3} sm={6}>
                <div className="stat-card stat-card-primary">
                  <div className="stat-card-icon">👥</div>
                  <div className="stat-card-info">
                    <h3 className="stat-card-value">{stats?.total_users || 0}</h3>
                    <p className="stat-card-label">Total Users</p>
                  </div>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div className="stat-card stat-card-success">
                  <div className="stat-card-icon">🎓</div>
                  <div className="stat-card-info">
                    <h3 className="stat-card-value">{stats?.total_students || 0}</h3>
                    <p className="stat-card-label">Students</p>
                  </div>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div className="stat-card stat-card-warning">
                  <div className="stat-card-icon">🏢</div>
                  <div className="stat-card-info">
                    <h3 className="stat-card-value">{stats?.total_companies || 0}</h3>
                    <p className="stat-card-label">Companies</p>
                  </div>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div className="stat-card stat-card-info">
                  <div className="stat-card-icon">📋</div>
                  <div className="stat-card-info">
                    <h3 className="stat-card-value">{stats?.total_internships || 0}</h3>
                    <p className="stat-card-label">Internships</p>
                  </div>
                </div>
              </Col>
            </Row>

            <Row className="mb-4 g-4">
              <Col md={3} sm={6}>
                <div className="stat-card stat-card-secondary">
                  <div className="stat-card-icon">📝</div>
                  <div className="stat-card-info">
                    <h3 className="stat-card-value">{stats?.total_applications || 0}</h3>
                    <p className="stat-card-label">Applications</p>
                  </div>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div className="stat-card stat-card-warning">
                  <div className="stat-card-icon">⏳</div>
                  <div className="stat-card-info">
                    <h3 className="stat-card-value">{stats?.pending_applications || 0}</h3>
                    <p className="stat-card-label">Pending</p>
                  </div>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div className="stat-card stat-card-info">
                  <div className="stat-card-icon">📊</div>
                  <div className="stat-card-info">
                    <h3 className="stat-card-value">{stats?.total_reports || 0}</h3>
                    <p className="stat-card-label">Reports</p>
                  </div>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div className="stat-card stat-card-success">
                  <div className="stat-card-icon">✅</div>
                  <div className="stat-card-info">
                    <h3 className="stat-card-value">{stats?.total_evaluations || 0}</h3>
                    <p className="stat-card-label">Evaluations</p>
                  </div>
                </div>
              </Col>
            </Row>
          </>
        )}

        {/* Content Area */}
        <Card className="dashboard-card">
          <Card.Body className="dashboard-card-body">
            {renderContent()}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;