import React, { useMemo, useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Alert, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import '../components/AdminDashboard.css';
import AIInsights from '../components/AIInsights';
import AIInsightsChartsSimple from '../components/AIInsightsChartsSimple';

const AdminDashboard = ({ initialTab }) => {
  const { user, hasPermission } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [createUserForm, setCreateUserForm] = useState({
    name: '',
    email: '',
    role: 'student',
    verification_confirmed: false,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState({ type: '', message: '' });

  useEffect(() => {
    if (!initialTab) return;
    setActiveTab(initialTab);
  }, [initialTab]);

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
      // Set fallback data for development
      setStats({
        total_users: 150,
        total_students: 80,
        total_companies: 25,
        total_internships: 45,
        total_applications: 120,
        pending_applications: 15,
        total_reports: 85,
        total_evaluations: 60,
        active_internships: 30,
        approved_applications: 95,
        total_coordinators: 8,
        total_examiners: 12,
        total_departments: 5
      });
      setUsers([
        { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com', role: 'student', is_active: true },
        { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', role: 'company', is_active: true },
        { id: 3, first_name: 'Bob', last_name: 'Johnson', email: 'bob@example.com', role: 'coordinator', is_active: false }
      ]);
      setActivities([
        { type: 'student', action: 'login', user: 'John Doe', description: 'Student logged in', created_at: new Date().toISOString() },
        { type: 'admin', action: 'create', user: 'Admin', description: 'Created new user', created_at: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatus = async (userId, isActive) => {
    try {
      setActionLoading(true);
      await api.put(`/admin/users/${userId}/status`, { is_active: isActive });
      fetchDashboardData();
      setNotice({ type: 'success', message: `User ${isActive ? 'activated' : 'deactivated'} successfully.` });
    } catch (error) {
      console.error('Error updating user status:', error);
      setNotice({ type: 'danger', message: 'Failed to update user status.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user profile permanently?')) return;
    try {
      setActionLoading(true);
      await api.delete(`/admin/users/${userId}`);
      await fetchDashboardData();
      setNotice({ type: 'success', message: 'User deleted successfully.' });
    } catch (error) {
      console.error('Error deleting user:', error);
      setNotice({ type: 'danger', message: error?.response?.data?.message || 'Failed to delete user.' });
    } finally {
      setActionLoading(false);
    }
  };

  const pendingUsers = useMemo(() => users.filter((u) => !u.is_active), [users]);
  const canViewUsers = hasPermission('users.viewAny');
  const canCreateUser = hasPermission('users.create');
  const canEditUser = hasPermission('users.edit');
  const canSuspendUser = hasPermission('users.suspend');
  const canDeleteUser = hasPermission('users.delete');
  const canViewActivity = hasPermission('audit.activityLogs.view');

  useEffect(() => {
    const tabPermissionMap = {
      users: canViewUsers,
      'register-user': canCreateUser,
      requests: canEditUser,
      activity: canViewActivity,
      overview: true,
      ai: true,
    };
    if (!tabPermissionMap[activeTab]) {
      setActiveTab('overview');
    }
  }, [activeTab, canViewUsers, canCreateUser, canEditUser, canViewActivity]);

  const resetCreateUserForm = () => {
    setCreateUserForm({
      name: '',
      email: '',
      role: 'student',
      verification_confirmed: false,
    });
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setNotice({ type: '', message: '' });

    try {
      setActionLoading(true);
      await api.post('/admin/users', createUserForm);
      resetCreateUserForm();
      await fetchDashboardData();
      setNotice({ type: 'success', message: 'User registered successfully.' });
      setActiveTab('users');
    } catch (error) {
      console.error('Error creating user:', error);
      setNotice({ type: 'danger', message: error?.response?.data?.message || 'Failed to create user.' });
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      super_admin: { bg: '#6f42c1', icon: '🛡️' },
      admin: { bg: '#dc3545', icon: '👑' },
      coordinator: { bg: '#0d6efd', icon: '📋' },
      student: { bg: '#198754', icon: '🎓' },
      company: { bg: '#fd7e14', icon: '🏢' },
      examiner: { bg: '#0dcaf0', icon: '👨‍🏫' },
      advisor: { bg: '#20c997', icon: '👨‍💼' }
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

  const usersTotal = stats?.total_users || 0;
  const activeUsers = users.filter((u) => u.is_active).length;
  const activeUsersRate = usersTotal > 0 ? Math.round((activeUsers / usersTotal) * 100) : 0;
  const approvalRate = (stats?.total_applications || 0) > 0
    ? Math.round(((stats?.approved_applications || 0) / (stats?.total_applications || 1)) * 100)
    : 0;
  const internshipUtilization = (stats?.total_internships || 0) > 0
    ? Math.round(((stats?.active_internships || 0) / (stats?.total_internships || 1)) * 100)
    : 0;

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Container fluid className="py-4">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-subtitle">Manage and monitor your internship ecosystem</p>
            <div className="header-metrics">
              <span className="header-metric-chip">Active: {stats?.active_internships || 0}</span>
              <span className="header-metric-chip warning">Pending: {stats?.pending_applications || 0}</span>
            </div>
          </div>
          <div className="header-right">
            <div className="top-nav-links">
              <button type="button" onClick={() => setActiveTab('overview')}>HOME</button>
              {canViewUsers && <button type="button" onClick={() => setActiveTab('users')}>USERS</button>}
              {canCreateUser && <button type="button" onClick={() => setActiveTab('register-user')}>REGISTER</button>}
              {canEditUser && <button type="button" onClick={() => setActiveTab('requests')}>REQUESTS</button>}
              <button type="button" onClick={() => setActiveTab('ai')}>AI</button>
            </div>
            <div className="welcome-card">
              <span className="welcome-icon">👋</span>
              <div>
                <p className="welcome-text">Welcome back,</p>
                <h4 className="welcome-name">{user?.first_name} {user?.last_name}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4 g-4">
          <Col md={3} sm={6}>
            <div className="stat-card stat-card-primary">
              <div className="stat-card-icon">👥</div>
              <div className="stat-card-info">
                <h3 className="stat-card-value">{stats?.total_users || 0}</h3>
                <p className="stat-card-label">Total Users</p>
                <span className="stat-card-trend">+12% this month</span>
              </div>
            </div>
          </Col>
          <Col md={3} sm={6}>
            <div className="stat-card stat-card-success">
              <div className="stat-card-icon">🎓</div>
              <div className="stat-card-info">
                <h3 className="stat-card-value">{stats?.total_students || 0}</h3>
                <p className="stat-card-label">Students</p>
                <span className="stat-card-trend">Active learners</span>
              </div>
            </div>
          </Col>
          <Col md={3} sm={6}>
            <div className="stat-card stat-card-warning">
              <div className="stat-card-icon">🏢</div>
              <div className="stat-card-info">
                <h3 className="stat-card-value">{stats?.total_companies || 0}</h3>
                <p className="stat-card-label">Companies</p>
                <span className="stat-card-trend">Partner organizations</span>
              </div>
            </div>
          </Col>
          <Col md={3} sm={6}>
            <div className="stat-card stat-card-info">
              <div className="stat-card-icon">📋</div>
              <div className="stat-card-info">
                <h3 className="stat-card-value">{stats?.total_internships || 0}</h3>
                <p className="stat-card-label">Internships</p>
                <span className="stat-card-trend">Active opportunities</span>
              </div>
            </div>
          </Col>
        </Row>

        {/* Second Row Stats */}
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

        {/* Custom Tabs */}
        <Card className="dashboard-card">
          <Card.Header className="dashboard-card-header">
            <div className="dashboard-tabs">
              <button 
                className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <span className="tab-icon">📊</span>
                Overview
              </button>
              {canViewUsers && (
                <button 
                  className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  <span className="tab-icon">👥</span>
                  Users
                </button>
              )}
              {canCreateUser && (
                <button 
                  className={`tab-button ${activeTab === 'register-user' ? 'active' : ''}`}
                  onClick={() => setActiveTab('register-user')}
                >
                  <span className="tab-icon">➕</span>
                  Register Users
                </button>
              )}
              {canEditUser && (
                <button 
                  className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
                  onClick={() => setActiveTab('requests')}
                >
                  <span className="tab-icon">✅</span>
                  Requests
                  {pendingUsers.length > 0 ? <span className="ms-2 badge bg-danger">{pendingUsers.length}</span> : null}
                </button>
              )}
              {canViewActivity && (
                <button 
                  className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
                  onClick={() => setActiveTab('activity')}
                >
                  <span className="tab-icon">📜</span>
                  Activity Logs
                </button>
              )}
              <button 
                className={`tab-button ${activeTab === 'ai' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai')}
              >
                <span className="tab-icon">🤖</span>
                AI Insights
              </button>
            </div>
          </Card.Header>
          <Card.Body className="dashboard-card-body">
            {notice.message ? <Alert variant={notice.type || 'info'}>{notice.message}</Alert> : null}

            {activeTab === 'overview' && (
              <div className="overview-section">
                <Card className="mb-4 border-0 shadow-sm overview-welcome-card">
                  <Card.Body className="py-4 px-4">
                    <Row className="align-items-center g-3">
                      <Col lg={8}>
                        <h4 className="mb-1 welcome-heading">Welcome, {user?.first_name || 'Admin'}.</h4>
                        <p className="welcome-subcopy mb-0">
                          Monitor internship operations, review AI-assisted insights, and track system performance from one place.
                        </p>
                      </Col>
                      <Col lg={4} className="d-flex gap-2 justify-content-lg-end flex-wrap">
                        {canViewUsers && <Button className="overview-cta-btn" variant="primary" onClick={() => setActiveTab('users')}>Manage Users</Button>}
                        {canEditUser && (
                          <Button className="overview-outline-btn" variant="outline-primary" onClick={() => setActiveTab('requests')}>
                            Approvals {pendingUsers.length > 0 ? `(${pendingUsers.length})` : ''}
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Row className="g-4 mb-4">
                  <Col md={6} xl={3}>
                    <Card className="h-100 border-0 shadow-sm overview-kpi-card">
                      <Card.Body>
                        <div className="overview-kpi-label">Active Users Rate</div>
                        <h3 className="mb-1 overview-kpi-value">{activeUsersRate}%</h3>
                        <div className="overview-kpi-meta">Active: {activeUsers} / {usersTotal}</div>
                        <div className="overview-progress"><div style={{ width: `${activeUsersRate}%` }} /></div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6} xl={3}>
                    <Card className="h-100 border-0 shadow-sm overview-kpi-card">
                      <Card.Body>
                        <div className="overview-kpi-label">Approval Rate</div>
                        <h3 className="mb-1 overview-kpi-value">{approvalRate}%</h3>
                        <div className="overview-kpi-meta">Approved: {stats?.approved_applications || 0}</div>
                        <div className="overview-progress"><div style={{ width: `${approvalRate}%` }} /></div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6} xl={3}>
                    <Card className="h-100 border-0 shadow-sm overview-kpi-card">
                      <Card.Body>
                        <div className="overview-kpi-label">Internship Utilization</div>
                        <h3 className="mb-1 overview-kpi-value">{internshipUtilization}%</h3>
                        <div className="overview-kpi-meta">Active: {stats?.active_internships || 0}</div>
                        <div className="overview-progress"><div style={{ width: `${internshipUtilization}%` }} /></div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6} xl={3}>
                    <Card className="h-100 border-0 shadow-sm overview-kpi-card">
                      <Card.Body>
                        <div className="overview-kpi-label">Pending Requests</div>
                        <h3 className="mb-1 overview-kpi-value">{pendingUsers.length}</h3>
                        <div className="overview-kpi-meta">Need admin action</div>
                        <div className="overview-progress"><div style={{ width: `${Math.min(100, pendingUsers.length * 10)}%` }} /></div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row className="g-4 mb-4">
                  <Col lg={8}>
                    <Card className="border-0 shadow-sm h-100 overview-ai-card">
                      <Card.Body>
                        <h5 className="mb-2">AI Insights & Reports</h5>
                        <p className="overview-section-subtitle mb-3">
                          AI-generated recommendations and risk signals for the current platform state.
                        </p>
                        <AIInsights userRole="admin" userId={String(user?.id || 'admin')} />
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100 overview-analysis-card">
                      <Card.Body>
                        <h5 className="mb-2">System Analysis Snapshot</h5>
                        <p className="overview-section-subtitle mb-3">Operational health breakdown across key entities.</p>
                        <div className="d-flex flex-column gap-2">
                          <div className="d-flex justify-content-between overview-stat-row">
                            <span>Students</span>
                            <strong>{stats?.total_students || 0}</strong>
                          </div>
                          <div className="d-flex justify-content-between overview-stat-row">
                            <span>Companies</span>
                            <strong>{stats?.total_companies || 0}</strong>
                          </div>
                          <div className="d-flex justify-content-between overview-stat-row">
                            <span>Coordinators</span>
                            <strong>{stats?.total_coordinators || 0}</strong>
                          </div>
                          <div className="d-flex justify-content-between overview-stat-row">
                            <span>Examiners</span>
                            <strong>{stats?.total_examiners || 0}</strong>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Card className="border-0 shadow-sm overview-graph-card">
                  <Card.Body>
                    <h5 className="mb-2">Overview System Analysis Graphs</h5>
                    <p className="overview-section-subtitle mb-3">Trend view of reports, evaluations, applications, and participation.</p>
                    <AIInsightsChartsSimple userRole="admin" userId={String(user?.id || 'admin')} />
                  </Card.Body>
                </Card>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="users-section">
                <div className="users-filters">
                  <div className="users-count-chip">
                    Showing {filteredUsers.length} of {users.length} users
                  </div>
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
                    <option value="super_admin">Super Admins</option>
                  </select>
                  <Button variant="primary" onClick={() => setActiveTab('register-user')} disabled={!canCreateUser}>
                    + Register User
                  </Button>
                </div>
                {!canCreateUser ? (
                  <Alert variant="warning" className="mt-3">
                    You do not have permission to register new users.
                  </Alert>
                ) : null}
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
                              <div className="d-flex gap-2 flex-wrap">
                                {canSuspendUser && (
                                  <button 
                                    className={`action-btn ${u.is_active ? 'danger' : 'success'}`}
                                    onClick={() => handleUserStatus(u.id, !u.is_active)}
                                    disabled={actionLoading}
                                  >
                                    {u.is_active ? 'Deactivate' : 'Approve'}
                                  </button>
                                )}
                                {canDeleteUser && (
                                  <button
                                    className="action-btn danger"
                                    onClick={() => handleDeleteUser(u.id)}
                                    disabled={actionLoading}
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
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
            )}

            {activeTab === 'register-user' && (
              <div className="register-section">
                <Card className="register-card">
                  <Card.Body>
                    <h4 className="register-title">Register New User</h4>
                    <p className="register-subtitle">Create a new user account in the system.</p>

                    {!canCreateUser ? (
                      <Alert variant="warning" className="mb-3">
                        You do not have permission to register new users.
                      </Alert>
                    ) : null}

                    <Form onSubmit={handleCreateUserSubmit}>
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Full name</Form.Label>
                            <Form.Control
                              value={createUserForm.name}
                              onChange={(e) => setCreateUserForm((p) => ({ ...p, name: e.target.value }))}
                              placeholder="Enter full name"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type="email"
                              value={createUserForm.email}
                              onChange={(e) => setCreateUserForm((p) => ({ ...p, email: e.target.value }))}
                              placeholder="Enter email address"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Role</Form.Label>
                            <Form.Select
                              value={createUserForm.role}
                              onChange={(e) => setCreateUserForm((p) => ({ ...p, role: e.target.value }))}
                            >
                              <option value="student">Student</option>
                              <option value="company">Company</option>
                              <option value="coordinator">Coordinator</option>
                              <option value="examiner">Examiner</option>
                              <option value="admin">Admin</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Check
                            type="switch"
                            id="verification_confirmed_inline"
                            label="I confirm the user details were verified and consent was obtained."
                            checked={!!createUserForm.verification_confirmed}
                            onChange={(e) => setCreateUserForm((p) => ({ ...p, verification_confirmed: e.target.checked }))}
                            required
                          />
                        </Col>
                        <Col md={12}>
                          <small className="text-muted">
                            Register users lawfully and only collect required personal data (name, email, role).
                          </small>
                        </Col>
                        <Col md={12} className="d-flex gap-2">
                          <Button
                            variant="outline-secondary"
                            type="button"
                            onClick={resetCreateUserForm}
                            disabled={actionLoading}
                          >
                            Reset
                          </Button>
                          <Button
                            className="register-btn"
                            type="submit"
                            disabled={actionLoading || !canCreateUser || !createUserForm.verification_confirmed}
                          >
                            {actionLoading ? (
                              <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Registering...
                              </>
                            ) : (
                              'Register User'
                            )}
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </Card.Body>
                </Card>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="users-section">
                <div className="section-header">
                  <h4>Pending User Requests</h4>
                  <p>Approve (activate) or delete pending user profiles.</p>
                </div>
                {pendingUsers.length === 0 ? (
                  <Alert variant="info">No pending user requests.</Alert>
                ) : (
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
                        {pendingUsers.map((u) => (
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
                            <td>{getStatusBadge('pending')}</td>
                            <td>
                              <div className="d-flex gap-2 flex-wrap">
                                {canEditUser && (
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleUserStatus(u.id, true)}
                                    disabled={actionLoading}
                                  >
                                    Approve
                                  </Button>
                                )}
                                {canDeleteUser && (
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDeleteUser(u.id)}
                                    disabled={actionLoading}
                                  >
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="activity-section">
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
            )}

            {activeTab === 'ai' && (
              <div>
                <div className="section-header">
                  <h4>AI Insights & Reports</h4>
                  <p>High-level analytics and predictions for admins.</p>
                </div>
                <AIInsights userRole="admin" userId={String(user?.id || 'admin')} />
                <AIInsightsChartsSimple userRole="admin" userId={String(user?.id || 'admin')} />
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default AdminDashboard;