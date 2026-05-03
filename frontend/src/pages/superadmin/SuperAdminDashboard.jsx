import React, { useState, useEffect } from 'react';
import { superAdminAPI } from '../../services/api';
import RegistrationsTab from './RegistrationsTab';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 45,
    memory: 67,
    disk: 32,
    network: 89
  });

  useEffect(() => {
    loadDashboardData();
    // Simulate real-time metrics update
    const interval = setInterval(updateSystemMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsResponse, insightsResponse] = await Promise.all([
        superAdminAPI.getDashboardStats(),
        superAdminAPI.getAIInsights()
      ]);
      setStats(statsResponse.data);
      setInsights(insightsResponse.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      addNotification('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateSystemMetrics = () => {
    setSystemMetrics(prev => ({
      cpu: Math.max(10, Math.min(95, prev.cpu + (Math.random() - 0.5) * 10)),
      memory: Math.max(20, Math.min(90, prev.memory + (Math.random() - 0.5) * 5)),
      disk: Math.max(15, Math.min(85, prev.disk + (Math.random() - 0.5) * 2)),
      network: Math.max(30, Math.min(100, prev.network + (Math.random() - 0.5) * 15))
    }));
  };

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const navigationItems = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: '📊',
      description: 'System statistics and insights',
      badge: null
    },
    {
      id: 'registrations',
      label: 'User Registrations',
      icon: '👤',
      description: 'Register new users',
      badge: null
    },
    {
      id: 'approvals',
      label: 'Pending Approvals',
      icon: '⏳',
      description: 'Review and approve requests',
      badge: stats.pending_approvals > 0 ? stats.pending_approvals : null
    },
    {
      id: 'assignments',
      label: 'Assignments',
      icon: '📋',
      description: 'Assign examiners and advisors',
      badge: null
    },
    {
      id: 'users',
      label: 'User Management',
      icon: '👥',
      description: 'Manage system users',
      badge: stats.total_users
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: '📈',
      description: 'Generate system reports',
      badge: null
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: '⚙️',
      description: 'Configure system preferences',
      badge: null
    }
  ];

  const StatCard = ({ title, value, icon, growth, color = 'primary', trend = 'up' }) => {
    const [animatedValue, setAnimatedValue] = useState(0);

    useEffect(() => {
      const timer = setTimeout(() => {
        setAnimatedValue(value);
      }, 500);
      return () => clearTimeout(timer);
    }, [value]);

    return (
      <div className={`stat-card stat-card-${color} ${darkMode ? 'dark' : ''}`}>
        <div className="stat-icon-wrapper">
          <div className="stat-icon">{icon}</div>
          <div className="stat-sparkle"></div>
        </div>
        <div className="stat-content">
          <div className="stat-value">
            <span className="animated-number">{animatedValue}</span>
            {growth && (
              <span className={`stat-trend trend-${trend}`}>
                <span className="trend-arrow">{trend === 'up' ? '↗' : '↘'}</span>
                {Math.abs(growth)}%
              </span>
            )}
          </div>
          <p className="stat-title">{title}</p>
          <div className="stat-bar">
            <div
              className="stat-bar-fill"
              style={{ width: `${Math.min(100, (animatedValue / 100) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  const AIInsightCard = ({ insight }) => (
    <div className={`insight-card insight-${insight.type} ${darkMode ? 'dark' : ''}`}>
      <div className="insight-icon">{insight.icon}</div>
      <div className="insight-content">
        <p>{insight.message}</p>
        <div className="insight-meta">
          <span className="insight-time">2 min ago</span>
          <span className="insight-confidence">95% confidence</span>
        </div>
      </div>
      <div className="insight-actions">
        <button className="insight-action-btn">View Details</button>
        <button className="insight-action-btn">Take Action</button>
      </div>
    </div>
  );

  const SystemMetricCard = ({ label, value, unit = '%', color = '#667eea' }) => (
    <div className={`metric-card ${darkMode ? 'dark' : ''}`}>
      <div className="metric-header">
        <span className="metric-label">{label}</span>
        <span className="metric-value" style={{ color }}>{value}{unit}</span>
      </div>
      <div className="metric-bar">
        <div
          className="metric-bar-fill"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}, ${color}dd)`
          }}
        ></div>
      </div>
    </div>
  );

  const NotificationToast = ({ notification, onClose }) => (
    <div className={`notification-toast toast-${notification.type}`}>
      <span className="toast-icon">
        {notification.type === 'success' ? '✅' :
         notification.type === 'error' ? '❌' :
         notification.type === 'warning' ? '⚠️' : 'ℹ️'}
      </span>
      <span className="toast-message">{notification.message}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );

  if (loading) {
    return (
      <div className={`super-admin-dashboard ${darkMode ? 'dark' : ''}`}>
        <div className="loading-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
          <div className="skeleton-insights"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`super-admin-dashboard ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar Navigation */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${darkMode ? 'dark' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">🎓</div>
            {!sidebarCollapsed && (
              <div className="logo-text">
                <h2>ARU IMS</h2>
                <span>Admin Panel</span>
              </div>
            )}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* User Profile Section */}
        <div className="sidebar-profile">
          <div className="profile-avatar">
            <span>👑</span>
          </div>
          {!sidebarCollapsed && (
            <div className="profile-info">
              <h4>Super Admin</h4>
              <p>System Administrator</p>
              <div className="profile-status">
                <span className="status-dot online"></span>
                <span>Online</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navigationItems.map(item => (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <div className="nav-content">
                      <span className="nav-label">{item.label}</span>
                      {item.badge && (
                        <span className={`nav-badge ${item.badge > 0 ? 'highlight' : ''}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                  {sidebarCollapsed && item.badge && (
                    <span className={`nav-badge-mini ${item.badge > 0 ? 'highlight' : ''}`}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </button>
                {!sidebarCollapsed && (
                  <div className="nav-description">{item.description}</div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {!sidebarCollapsed && (
            <div className="sidebar-stats">
              <div className="stat-item">
                <span className="stat-label">Active Users</span>
                <span className="stat-value">{stats.total_users}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending</span>
                <span className="stat-value">{stats.pending_approvals}</span>
              </div>
            </div>
          )}
          <div className="sidebar-actions">
            <button className="sidebar-action-btn" title="Help & Support">
              ❓
            </button>
            <button className="sidebar-action-btn" title="Logout">
              🚪
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top Header Bar */}
        <div className={`top-header ${darkMode ? 'dark' : ''}`}>
          <div className="header-left">
            <h1 className="page-title">
              {navigationItems.find(item => item.id === activeTab)?.icon}{' '}
              {navigationItems.find(item => item.id === activeTab)?.label}
            </h1>
            <div className="breadcrumb">
              <span>Home</span>
              <span>›</span>
              <span>{navigationItems.find(item => item.id === activeTab)?.label}</span>
            </div>
          </div>

          <div className="header-right">
            {/* Theme Toggle */}
            <button
              className="header-btn theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Notifications */}
            <div className="notifications-dropdown">
              <button className="header-btn notification-btn" title="Notifications">
                🔔
                {notifications.length > 0 && (
                  <span className="notification-count">{notifications.length}</span>
                )}
              </button>
            </div>

            {/* Quick Actions */}
            <button className="header-btn" title="Quick Actions">
              ⚡
            </button>

            {/* User Menu */}
            <div className="user-menu">
              <button className="header-btn user-btn">
                <span className="user-avatar">👑</span>
                {!sidebarCollapsed && <span className="user-name">Super Admin</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content">
          {/* Notifications */}
          <div className="notifications-container">
            {notifications.map(notification => (
              <NotificationToast
                key={notification.id}
                notification={notification}
                onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
              />
            ))}
          </div>

          {/* Dynamic Content Based on Active Tab */}
          {activeTab === 'overview' && (
            <div className="overview-page">
              {/* Welcome Header */}
              <div className="welcome-header">
                <div className="welcome-content">
                  <h1>👑 Welcome back, Super Admin!</h1>
                  <p>{new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                  <div className="header-badges">
                    <span className="badge badge-live">🔴 LIVE</span>
                    <span className="badge badge-uptime">99.9% Uptime</span>
                  </div>
                </div>
                <div className="system-status">
                  <div className="status-item">
                    <span className="status-dot status-green pulse"></span>
                    Server: 🟢 Online
                  </div>
                  <div className="status-item">
                    <span className="status-dot status-green pulse"></span>
                    Database: 🟢 Connected
                  </div>
                  <div className="status-item">
                    <span className="status-green"></span>
                    API: 145ms
                  </div>
                  <div className="status-item">
                    <span className="status-green"></span>
                    Memory: 67%
                  </div>
                </div>
              </div>

              {/* System Metrics */}
              <div className="system-metrics">
                <h2>🖥️ System Performance</h2>
                <div className="metrics-grid">
                  <SystemMetricCard label="CPU Usage" value={Math.round(systemMetrics.cpu)} color="#e74c3c" />
                  <SystemMetricCard label="Memory" value={Math.round(systemMetrics.memory)} color="#f39c12" />
                  <SystemMetricCard label="Disk Usage" value={Math.round(systemMetrics.disk)} color="#27ae60" />
                  <SystemMetricCard label="Network" value={Math.round(systemMetrics.network)} color="#3498db" />
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="stats-grid">
                <StatCard title="Total Users" value={stats.total_users} icon="👥" growth="12" />
                <StatCard title="Students" value={stats.students} icon="🎓" growth="15" />
                <StatCard title="Examiners" value={stats.examiners} icon="👨‍🏫" growth="8" />
                <StatCard title="Advisors" value={stats.advisors} icon="👨‍💼" growth="5" />
                <StatCard title="Companies" value={stats.companies} icon="🏢" growth="20" />
                <StatCard title="Coordinators" value={stats.coordinators} icon="👔" growth="3" />
                <StatCard
                  title="Pending Approvals"
                  value={stats.pending_approvals}
                  icon="⏳"
                  color={stats.pending_approvals > 0 ? 'warning' : 'success'}
                  trend={stats.pending_approvals > 0 ? 'up' : 'down'}
                />
                <StatCard title="Placement Rate" value={`${stats.placement_rate}%`} icon="📊" growth="7" />
              </div>

              {/* AI Insights Panel */}
              <div className="ai-insights-panel">
                <div className="panel-header">
                  <h2>🤖 AI System Insights</h2>
                  <div className="panel-actions">
                    <button className="panel-btn refresh" onClick={loadDashboardData}>
                      🔄 Refresh
                    </button>
                    <button className="panel-btn settings">⚙️ Settings</button>
                  </div>
                </div>
                <div className="insights-grid">
                  {insights.map((insight, index) => (
                    <AIInsightCard key={index} insight={insight} />
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <h2>⚡ Quick Actions</h2>
                <div className="actions-grid">
                  <button
                    className="action-btn primary pulse"
                    onClick={() => setActiveTab('registrations')}
                  >
                    <span className="btn-icon">👤</span>
                    <span className="btn-text">Register New Student</span>
                  </button>
                  <button
                    className="action-btn success"
                    onClick={() => setActiveTab('approvals')}
                  >
                    <span className="btn-icon">✅</span>
                    <span className="btn-text">Approve Pending</span>
                  </button>
                  <button
                    className="action-btn info"
                    onClick={() => setActiveTab('assignments')}
                  >
                    <span className="btn-icon">📋</span>
                    <span className="btn-text">Assign Examiners</span>
                  </button>
                  <button className="action-btn secondary">
                    <span className="btn-icon">📊</span>
                    <span className="btn-text">Generate Reports</span>
                  </button>
                  <button className="action-btn warning">
                    <span className="btn-icon">💾</span>
                    <span className="btn-text">System Backup</span>
                  </button>
                  <button className="action-btn dark">
                    <span className="btn-icon">📢</span>
                    <span className="btn-text">Broadcast Announcement</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'registrations' && <RegistrationsTab darkMode={darkMode} />}
          {activeTab === 'approvals' && <ApprovalsTab />}
          {activeTab === 'assignments' && <AssignmentsTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'reports' && <ReportsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
        {activeTab === 'users' && <UsersTab />}
      </div>
    </div>
  );
};

// Placeholder components for tabs
const ApprovalsTab = () => (
  <div className="tab-placeholder">
    <div className="placeholder-icon">⏳</div>
    <h3>Pending Approvals</h3>
    <p>Review and approve partnership requests and internship postings.</p>
    <div className="placeholder-actions">
      <button className="placeholder-btn">View Partnership Requests</button>
      <button className="placeholder-btn">Review Internship Posts</button>
    </div>
  </div>
);

const AssignmentsTab = () => (
  <div className="tab-placeholder">
    <div className="placeholder-icon">📋</div>
    <h3>Assignments</h3>
    <p>Assign examiners and advisors to students and internships.</p>
    <div className="placeholder-actions">
      <button className="placeholder-btn">Assign Examiners</button>
      <button className="placeholder-btn">Assign Advisors</button>
    </div>
  </div>
);

const UsersTab = () => (
  <div className="tab-placeholder">
    <div className="placeholder-icon">👥</div>
    <h3>User Management</h3>
    <p>Manage all system users, roles, and permissions.</p>
    <div className="placeholder-actions">
      <button className="placeholder-btn">View All Users</button>
      <button className="placeholder-btn">Manage Roles</button>
    </div>
  </div>
);

const ReportsTab = () => (
  <div className="tab-placeholder">
    <div className="placeholder-icon">📈</div>
    <h3>Reports & Analytics</h3>
    <p>Generate comprehensive reports and view system analytics.</p>
    <div className="placeholder-actions">
      <button className="placeholder-btn">Generate Report</button>
      <button className="placeholder-btn">View Analytics</button>
    </div>
  </div>
);

const SettingsTab = () => (
  <div className="tab-placeholder">
    <div className="placeholder-icon">⚙️</div>
    <h3>System Settings</h3>
    <p>Configure system preferences and settings.</p>
    <div className="placeholder-actions">
      <button className="placeholder-btn">General Settings</button>
      <button className="placeholder-btn">Security Settings</button>
    </div>
  </div>
);

export default SuperAdminDashboard;
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    return roleCounts;
  }, [users]);

  const addActivity = (icon, text) => {
    const timestamp = new Date().toLocaleTimeString();
    setSubmissionStatus(prev => ({
      ...prev,
      [timestamp]: { icon, text }
    }));
  };

  const handleRegister = async (formData, role) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      let res;
      if (role === 'student') res = await superAdminAPI.registerStudent({ ...formData, department_id: Number(formData.department_id), year: Number(formData.year), cgpa: Number(formData.cgpa) });
      if (role === 'company') res = await superAdminAPI.registerCompany(formData);
      if (role === 'examiner') res = await superAdminAPI.registerExaminer({ ...formData, department_id: Number(formData.department_id), years_of_experience: Number(formData.years_of_experience) });
      if (role === 'advisor') res = await superAdminAPI.registerAdvisor({ ...formData, department_id: Number(formData.department_id), years_of_experience: Number(formData.years_of_experience) });

      if (res?.data?.credentials) {
        setGeneratedCredentials((prev) => [res.data.credentials, ...prev].slice(0, 10));
      }
      setSuccess(`${role} registered successfully!`);
      addActivity('✅', `${role} registered successfully`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to register ${role}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkRegister = async (students) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await superAdminAPI.registerStudentsBulk({ students });
      if (res?.data?.credentials) {
        setGeneratedCredentials((prev) => [...res.data.credentials, ...prev].slice(0, 10));
      }
      setSuccess(`${students.length} students registered successfully!`);
      addActivity('✅', `Bulk registration: ${students.length} students`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register students');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      await superAdminAPI.updateUser(userId, userData);
      setSuccess('User updated successfully!');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleSuspendUser = async (userId, reason) => {
    try {
      await superAdminAPI.suspendUser(userId, { reason });
      setSuccess('User suspended successfully!');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to suspend user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await superAdminAPI.deleteUser(userId);
      setSuccess('User deleted successfully!');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleResetPassword = async (user) => {
    try {
      const res = await superAdminAPI.resetUserPassword(user.id);
      const password = res.data.password;
      window.alert(`New password for ${user.name}: ${password}`);
      addActivity('🔑', `Password reset for: ${user.name}`);
      setSuccess('Password reset successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    }
  };

  const renderContent = () => {
    if (activeSection === 'overview') return <OverviewStats stats={stats} />;
    if (['analytics-overview', 'user-analytics', 'system-health'].includes(activeSection)) {
      return <AnalyticsPanel users={users} departments={departments} />;
    }
    if (['student', 'company', 'examiner', 'advisor'].includes(activeSection)) {
      return (
        <RegistrationPanel
          activeSection={activeSection}
          departments={departments}
          onRegister={handleRegister}
          onBulkRegister={handleBulkRegister}
          isSubmitting={isSubmitting}
        />
      );
    }
    if (['all-users', 'students', 'examiners', 'coordinators', 'companies', 'advisors'].includes(activeSection)) {
      return (
        <UserManagementPanel
          users={users}
          activeSection={activeSection}
          departments={departments.map((d) => d.name)}
          onUpdateUser={handleUpdateUser}
          onSuspendUser={handleSuspendUser}
          onDeleteUser={handleDeleteUser}
          onResetPassword={handleResetPassword}
        />
      );
    }
    if (activeSection === 'notifications') return <NotificationCenter />;
    if (activeSection === 'audit-logs') return <AuditLogs />;
    if (activeSection === 'settings') return <SystemSettings />;
    return (
      <div className="sa-empty-panel">
        <h3>Page Not Found</h3>
        <p>The requested section is not available.</p>
      </div>
    );
  };

  return (
    <div className="sa-dashboard-container">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className={`sa-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Header
          currentTime={currentTime}
          generatedCredentials={generatedCredentials}
          submissionStatus={submissionStatus}
        />
        {error && <div className="sa-message error">{error}</div>}
        {success && <div className="sa-message success">{success}</div>}
        {renderContent()}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
