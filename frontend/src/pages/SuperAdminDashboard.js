import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import '../components/SuperAdminDashboard.css';

// Navigation Configuration
const NAV_SECTIONS = {
  main: [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'user-register', label: 'User Registration', icon: '👤', badge: 3, badgeType: 'amber' },
  ],
  management: [
    { id: 'user-management', label: 'User Management', icon: '🏢' },
    { id: 'approvals', label: 'Approve Requests', icon: '✅', badge: 7, badgeType: 'coral' },
  ],
  internships: [
    { id: 'internships', label: 'Internship Posts', icon: '💼' },
    { id: 'applications', label: 'Applications', icon: '📝', badge: 12, badgeType: 'amber' },
  ],
  reporting: [
    { id: 'reports', label: 'Reports & Analytics', icon: '📈' },
    { id: 'student-progress', label: 'Student Progress', icon: '🎓' },
  ],
};

// Helper Functions
const extractArray = (responseData) => {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.data)) return responseData.data;
  if (Array.isArray(responseData?.data?.data)) return responseData.data.data;
  return [];
};

const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// Mock Data Generators
const generateMockStats = () => ({
  totalStudents: 1247,
  weeklyDelta: 23,
  activeInternships: 342,
  monthlyDelta: 18,
  pendingApprovals: 15,
  partnerCompanies: 89,
  semesterDelta: 5,
});

const generateMockDepartments = () => [
  { name: 'IT & Computing', placements: 156, total: 200 },
  { name: 'Business & Economics', placements: 98, total: 150 },
  { name: 'Engineering', placements: 124, total: 180 },
  { name: 'Health Sciences', placements: 67, total: 100 },
  { name: 'Natural Sciences', placements: 45, total: 80 },
];

const generateMockActivities = () => [
  { id: 1, type: 'company', actor: 'Tech Solutions PLC', action: 'submitted partnership request', time: new Date(Date.now() - 1800000), icon: '🏢' },
  { id: 2, type: 'report', actor: 'Ahmed Mohammed', action: 'submitted final internship report', time: new Date(Date.now() - 3600000), icon: '📄' },
  { id: 3, type: 'profile', actor: 'Sara Johnson', action: 'requested profile update (phone)', time: new Date(Date.now() - 7200000), icon: '👤' },
  { id: 4, type: 'application', actor: 'Daniel Kim', action: 'applied to Software Developer Intern', time: new Date(Date.now() - 10800000), icon: '📝' },
  { id: 5, type: 'company', actor: 'Global Industries', action: 'updated internship capacity', time: new Date(Date.now() - 14400000), icon: '🏢' },
];

const generateMockChartData = () => ({
  monthly: [
    { month: 'Sep', submissions: 45, approvals: 38 },
    { month: 'Oct', submissions: 78, approvals: 62 },
    { month: 'Nov', submissions: 112, approvals: 89 },
    { month: 'Dec', submissions: 65, approvals: 58 },
    { month: 'Jan', submissions: 88, approvals: 72 },
    { month: 'Feb', submissions: 52, approvals: 45 },
  ],
  applicationStatus: [
    { status: 'Accepted', count: 342, percentage: 60, color: '#10B981' },
    { status: 'Pending', count: 171, percentage: 30, color: '#F59E0B' },
    { status: 'Declined', count: 57, percentage: 10, color: '#EF4444' },
  ],
});

// Simple Bar Chart Component
const BarChart = ({ data }) => {
  const maxValue = Math.max(...data.flatMap(d => [d.submissions, d.approvals]));
  
  return (
    <div className="sa-chart-container">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '200px', padding: '10px 0' }}>
        {data.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flex: 1, justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ height: `${(item.submissions / maxValue) * 160}px`, width: '24px', background: '#185FA5', borderRadius: '4px 4px 0 0' }} />
              <span style={{ fontSize: '10px', color: '#185FA5', fontWeight: '600' }}>{item.submissions}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ height: `${(item.approvals / maxValue) * 160}px`, width: '24px', background: '#0D9488', borderRadius: '4px 4px 0 0' }} />
              <span style={{ fontSize: '10px', color: '#0D9488', fontWeight: '600' }}>{item.approvals}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '8px' }}>
        {data.map((item, idx) => (
          <span key={idx} style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>{item.month}</span>
        ))}
      </div>
    </div>
  );
};

// Simple Donut Chart Component
const DonutChart = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <div style={{ position: 'relative', width: '160px', height: '160px' }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          {data.map((item, idx) => {
            const percent = item.count / total;
            const dashLength = percent * circumference;
            const result = (
              <circle
                key={idx}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="20"
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 80 80)"
              />
            );
            offset += dashLength;
            return result;
          })}
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>{total}</div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Total</div>
        </div>
      </div>
      <div className="sa-donut-legend" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data.map((item, idx) => (
          <div key={idx} className="sa-donut-legend-item">
            <div className="sa-donut-legend-dot" style={{ background: item.color }} />
            <span className="sa-donut-legend-label">{item.status}</span>
            <span className="sa-donut-legend-value">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function SuperAdminDashboard({ initialTab }) {
  const { user, logout } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  
  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState({ type: '', message: '' });
  
  // Data State
  const [stats, setStats] = useState(generateMockStats());
  const [departments, setDepartments] = useState(generateMockDepartments());
  const [activities, setActivities] = useState(generateMockActivities());
  const [chartData, setChartData] = useState(generateMockChartData());
  const [users, setUsers] = useState([]);
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [requests, setRequests] = useState({ companies: [], profiles: [], posts: [] });
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [approvalSubTab, setApprovalSubTab] = useState('companies');
  const [reportSubTab, setReportSubTab] = useState('system');
  const [internshipView, setInternshipView] = useState('all');
  const [unreadNotifications] = useState(5);
  
  // Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  
  // Form State
  const [registerForm, setRegisterForm] = useState({
    role: 'student',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    department: '',
    password: '',
    sendEmail: true,
  });
  
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkPreview, setBulkPreview] = useState([]);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  
  const [postForm, setPostForm] = useState({
    title: '',
    description: '',
    company: '',
    targetDepartment: '',
    startDate: '',
    endDate: '',
    slots: 1,
    deadline: '',
    status: 'draft',
  });

  // Current date for topbar
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const academicYear = '2025-2026';

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersRes, internshipsRes, applicationsRes] = await Promise.all([
          api.get('/admin/users').catch(() => ({ data: { data: [] } })),
          api.get('/internships').catch(() => ({ data: { data: [] } })),
          api.get('/applications').catch(() => ({ data: { data: [] } })),
        ]);
        setUsers(extractArray(usersRes.data));
        setInternships(extractArray(internshipsRes.data));
        setApplications(extractArray(applicationsRes.data));
      } catch (error) {
        console.log('Using mock data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtered Data
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const term = searchTerm.toLowerCase();
      const matchSearch = !term || 
        `${u.first_name || ''} ${u.last_name || ''} ${u.email || ''}`.toLowerCase().includes(term);
      const matchRole = selectedRole === 'all' || u.role === selectedRole;
      return matchSearch && matchRole;
    });
  }, [users, searchTerm, selectedRole]);

  const pendingApprovals = useMemo(() => ({
    users: users.filter(u => !u.is_active).length,
    applications: applications.filter(a => a.status === 'pending').length,
    posts: internships.filter(i => i.status === 'draft').length,
  }), [users, applications, internships]);

  // Handlers
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', registerForm);
      setNotice({ type: 'success', message: 'User registered successfully!' });
      setShowRegisterModal(false);
      setRegisterForm({ role: 'student', firstName: '', lastName: '', email: '', phone: '', employeeId: '', department: '', password: '', sendEmail: true });
    } catch (error) {
      setNotice({ type: 'danger', message: 'Failed to register user.' });
    }
  };

  const handleBulkUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFile(file);
    // Simulate preview
    setTimeout(() => {
      setBulkPreview([
        { name: 'John Doe', email: 'john@uni.edu', id: 'STU001', department: 'IT', status: 'valid' },
        { name: 'Jane Smith', email: 'jane@uni.edu', id: 'STU002', department: 'Business', status: 'valid' },
        { name: 'Bob Wilson', email: 'bob@uni.edu', id: 'STU003', department: 'Engineering', status: 'error', error: 'Duplicate ID' },
      ]);
    }, 500);
  };

  const handleBulkProcess = async () => {
    setBulkUploading(true);
    setBulkProgress(0);
    // Simulate upload
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 200));
      setBulkProgress(i);
    }
    setBulkUploading(false);
    setNotice({ type: 'success', message: 'Bulk upload complete: 2 imported, 1 skipped, 0 errors' });
  };

  const handleUserStatus = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { is_active: isActive });
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: isActive } : u));
      setNotice({ type: 'success', message: `User ${isActive ? 'activated' : 'deactivated'}` });
    } catch (error) {
      setNotice({ type: 'danger', message: 'Failed to update status' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      setNotice({ type: 'success', message: 'User deleted successfully' });
    } catch (error) {
      setNotice({ type: 'danger', message: 'Failed to delete user' });
    }
  };

  const handleApprove = async (type, id) => {
    setNotice({ type: 'success', message: `${type} approved successfully` });
  };

  const handleReject = async (type, id, reason) => {
    setNotice({ type: 'warning', message: `${type} rejected` });
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await api.post('/internships', postForm);
      setNotice({ type: 'success', message: 'Internship post created successfully' });
      setShowCreatePostModal(false);
      setPostForm({ title: '', description: '', company: '', targetDepartment: '', startDate: '', endDate: '', slots: 1, deadline: '', status: 'draft' });
    } catch (error) {
      setNotice({ type: 'danger', message: 'Failed to create post' });
    }
  };

  if (loading) {
    return (
      <div className="sa-loading">
        <div className="sa-spinner" />
        <p className="sa-loading-text">Loading Super Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="sa-shell">
      {/* Sidebar */}
      <aside className="sa-sidebar">
        <div className="sa-sidebar-brand">
          <div className="sa-brand-title">Arsi University</div>
          <div className="sa-brand-subtitle">IMS Control Panel</div>
          <div className="sa-role-badge">
            <span>🛡️</span>
            <span>Super Admin</span>
          </div>
        </div>

        <nav className="sa-nav-section">
          <div className="sa-nav-section-title">Main</div>
          {NAV_SECTIONS.main.map(item => (
            <button
              key={item.id}
              className={`sa-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="sa-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className={`sa-nav-badge ${item.badgeType || ''}`}>{item.badge}</span>}
            </button>
          ))}
        </nav>

        <nav className="sa-nav-section">
          <div className="sa-nav-section-title">Management</div>
          {NAV_SECTIONS.management.map(item => (
            <button
              key={item.id}
              className={`sa-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="sa-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className={`sa-nav-badge ${item.badgeType || ''}`}>{item.badge}</span>}
            </button>
          ))}
        </nav>

        <nav className="sa-nav-section">
          <div className="sa-nav-section-title">Internships</div>
          {NAV_SECTIONS.internships.map(item => (
            <button
              key={item.id}
              className={`sa-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="sa-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className={`sa-nav-badge ${item.badgeType || ''}`}>{item.badge}</span>}
            </button>
          ))}
        </nav>

        <nav className="sa-nav-section">
          <div className="sa-nav-section-title">Reporting</div>
          {NAV_SECTIONS.reporting.map(item => (
            <button
              key={item.id}
              className={`sa-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="sa-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sa-sidebar-footer">
          <div className="sa-user-info">
            <div className="sa-user-avatar">{getInitials(user?.first_name)}</div>
            <div className="sa-user-details">
              <div className="sa-user-name">{user?.first_name} {user?.last_name}</div>
              <div className="sa-user-dept">IT Administration</div>
            </div>
            <button className="sa-logout-btn" onClick={logout} title="Logout">🚪</button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="sa-main">
        {/* Top Bar */}
        <header className="sa-topbar">
          <div className="sa-topbar-left">
            <h1 className="sa-page-title">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'user-register' && 'User Registration'}
              {activeTab === 'user-management' && 'User Management'}
              {activeTab === 'approvals' && 'Approve Requests'}
              {activeTab === 'internships' && 'Internship Posts'}
              {activeTab === 'applications' && 'Applications'}
              {activeTab === 'reports' && 'Reports & Analytics'}
              {activeTab === 'student-progress' && 'Student Progress'}
            </h1>
            <p className="sa-page-subtitle">{academicYear} • {currentDate}</p>
          </div>
          <div className="sa-topbar-right">
            <div className="sa-ai-pill">
              <span className="sa-ai-pill-icon">🤖</span>
              <span>AI Insights Active</span>
            </div>
            <button className="sa-btn sa-btn-secondary">
              📊 Export Report
            </button>
            <button className="sa-btn sa-btn-primary" onClick={() => setShowRegisterModal(true)}>
              ➕ Register User
            </button>
            <button className="sa-notification-btn">
              🔔
              {unreadNotifications > 0 && <span className="sa-notification-count">{unreadNotifications}</span>}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="sa-content">
          {notice.message && (
            <Alert variant={notice.type} onClose={() => setNotice({ type: '', message: '' })} dismissible>
              {notice.message}
            </Alert>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="sa-tab-content">
              {/* Quick Actions */}
              <div className="sa-quick-actions">
                <button className="sa-quick-action-btn blue" onClick={() => setActiveTab('overview')}>
                  📊 Dashboard
                </button>
                <button className="sa-quick-action-btn green" onClick={() => setShowRegisterModal(true)}>
                  👤 Register User
                </button>
                <button className="sa-quick-action-btn purple" onClick={() => setActiveTab('user-management')}>
                  🏢 Manage Users
                </button>
                <button className="sa-quick-action-btn amber" onClick={() => setActiveTab('approvals')}>
                  ✅ Approve Requests
                  {pendingApprovals.users + pendingApprovals.applications > 0 && (
                    <span className="sa-nav-badge amber" style={{ marginLeft: '8px' }}>
                      {pendingApprovals.users + pendingApprovals.applications}
                    </span>
                  )}
                </button>
                <button className="sa-quick-action-btn coral" onClick={() => setActiveTab('internships')}>
                  💼 Internship Posts
                </button>
                <button className="sa-quick-action-btn teal" onClick={() => setActiveTab('reports')}>
                  📈 View Reports
                </button>
              </div>

              {/* Stats Grid */}
              <div className="sa-stats-grid">
                <div className="sa-stat-card">
                  <div className="sa-stat-header">
                    <span className="sa-stat-label">Total Students</span>
                    <div className="sa-stat-icon blue">🎓</div>
                  </div>
                  <div className="sa-stat-value">{stats.totalStudents.toLocaleString()}</div>
                  <div className="sa-stat-delta positive">↑ {stats.weeklyDelta} this week</div>
                  <div className="sa-stat-progress">
                    <div className="sa-stat-progress-bar blue" style={{ width: '78%' }} />
                  </div>
                </div>

                <div className="sa-stat-card">
                  <div className="sa-stat-header">
                    <span className="sa-stat-label">Active Internships</span>
                    <div className="sa-stat-icon teal">💼</div>
                  </div>
                  <div className="sa-stat-value">{stats.activeInternships}</div>
                  <div className="sa-stat-delta positive">↑ {stats.monthlyDelta} this month</div>
                  <div className="sa-stat-progress">
                    <div className="sa-stat-progress-bar teal" style={{ width: '65%' }} />
                  </div>
                </div>

                <div className="sa-stat-card">
                  <div className="sa-stat-header">
                    <span className="sa-stat-label">Pending Approvals</span>
                    <div className="sa-stat-icon amber">⏳</div>
                  </div>
                  <div className="sa-stat-value">{stats.pendingApprovals}</div>
                  {stats.pendingApprovals > 0 && (
                    <div className="sa-stat-action-label">⚠️ Requires action</div>
                  )}
                  <div className="sa-stat-progress">
                    <div className="sa-stat-progress-bar amber" style={{ width: '35%' }} />
                  </div>
                </div>

                <div className="sa-stat-card">
                  <div className="sa-stat-header">
                    <span className="sa-stat-label">Partner Companies</span>
                    <div className="sa-stat-icon purple">🏢</div>
                  </div>
                  <div className="sa-stat-value">{stats.partnerCompanies}</div>
                  <div className="sa-stat-delta positive">↑ {stats.semesterDelta} this semester</div>
                  <div className="sa-stat-progress">
                    <div className="sa-stat-progress-bar purple" style={{ width: '82%' }} />
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="sa-charts-row">
                <div className="sa-chart-card">
                  <div className="sa-chart-header">
                    <h3 className="sa-chart-title">Monthly Internship Submissions vs Approvals</h3>
                    <div className="sa-chart-legend">
                      <div className="sa-legend-item">
                        <div className="sa-legend-dot" style={{ background: '#185FA5' }} />
                        <span>Submissions</span>
                      </div>
                      <div className="sa-legend-item">
                        <div className="sa-legend-dot" style={{ background: '#0D9488' }} />
                        <span>Approvals</span>
                      </div>
                    </div>
                  </div>
                  <BarChart data={chartData.monthly} />
                  <div className="sa-ai-annotation">
                    <span>🤖</span>
                    <span><strong>AI Insight:</strong> Peak submissions in November (112) — likely due to semester deadline. Consider sending reminders earlier in October.</span>
                  </div>
                </div>

                <div className="sa-chart-card">
                  <div className="sa-chart-header">
                    <h3 className="sa-chart-title">Application Status Breakdown</h3>
                  </div>
                  <DonutChart data={chartData.applicationStatus} />
                </div>
              </div>

              {/* Bottom Row */}
              <div className="sa-bottom-row">
                <div className="sa-panel-card">
                  <h3 className="sa-panel-title">Department Placement</h3>
                  <div className="sa-dept-list">
                    {departments.map((dept, idx) => (
                      <div key={idx} className="sa-dept-item">
                        <span className="sa-dept-name">{dept.name}</span>
                        <div className="sa-dept-bar-container">
                          <div className="sa-dept-bar" style={{ width: `${(dept.placements / dept.total) * 100}%` }} />
                        </div>
                        <span className="sa-dept-count">{dept.placements}/{dept.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sa-panel-card">
                  <h3 className="sa-panel-title">Recent Activity</h3>
                  <div className="sa-activity-feed">
                    {activities.map(activity => (
                      <div key={activity.id} className="sa-activity-item">
                        <div className={`sa-activity-icon ${activity.type}`}>
                          {activity.icon}
                        </div>
                        <div className="sa-activity-content">
                          <div className="sa-activity-text">
                            <strong>{activity.actor}</strong> {activity.action}
                          </div>
                          <div className="sa-activity-time">{formatTime(activity.time)}</div>
                        </div>
                        <div className="sa-activity-action">
                          <button className="sa-activity-btn review">Review</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Registration Tab */}
          {activeTab === 'user-register' && (
            <div className="sa-tab-content">
              <Row>
                <Col lg={6}>
                  <div className="sa-form-card">
                    <h3 className="sa-form-title">Single User Registration</h3>
                    <form onSubmit={handleRegister}>
                      <div className="sa-form-row">
                        <div className="sa-form-group">
                          <label className="sa-form-label">Role</label>
                          <select 
                            className="sa-form-select"
                            value={registerForm.role}
                            onChange={(e) => setRegisterForm({...registerForm, role: e.target.value})}
                          >
                            <option value="student">Student</option>
                            <option value="examiner">Examiner</option>
                            <option value="coordinator">Coordinator</option>
                            <option value="company">Company</option>
                          </select>
                        </div>
                        <div className="sa-form-group">
                          <label className="sa-form-label">Department</label>
                          <select 
                            className="sa-form-select"
                            value={registerForm.department}
                            onChange={(e) => setRegisterForm({...registerForm, department: e.target.value})}
                          >
                            <option value="">Select Department</option>
                            <option value="IT">IT & Computing</option>
                            <option value="Business">Business & Economics</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Health">Health Sciences</option>
                            <option value="Sciences">Natural Sciences</option>
                          </select>
                        </div>
                      </div>

                      <div className="sa-form-row">
                        <div className="sa-form-group">
                          <label className="sa-form-label">First Name</label>
                          <input 
                            type="text" 
                            className="sa-form-input"
                            value={registerForm.firstName}
                            onChange={(e) => setRegisterForm({...registerForm, firstName: e.target.value})}
                            required
                          />
                        </div>
                        <div className="sa-form-group">
                          <label className="sa-form-label">Last Name</label>
                          <input 
                            type="text" 
                            className="sa-form-input"
                            value={registerForm.lastName}
                            onChange={(e) => setRegisterForm({...registerForm, lastName: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <div className="sa-form-row">
                        <div className="sa-form-group">
                          <label className="sa-form-label">Email</label>
                          <input 
                            type="email" 
                            className="sa-form-input"
                            value={registerForm.email}
                            onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                            required
                          />
                        </div>
                        <div className="sa-form-group">
                          <label className="sa-form-label">Phone</label>
                          <input 
                            type="tel" 
                            className="sa-form-input"
                            value={registerForm.phone}
                            onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="sa-form-row">
                        <div className="sa-form-group">
                          <label className="sa-form-label">{registerForm.role === 'student' ? 'Student ID' : 'Employee Number'}</label>
                          <input 
                            type="text" 
                            className="sa-form-input"
                            value={registerForm.employeeId}
                            onChange={(e) => setRegisterForm({...registerForm, employeeId: e.target.value})}
                          />
                        </div>
                        <div className="sa-form-group">
                          <label className="sa-form-label">Password</label>
                          <input 
                            type="text" 
                            className="sa-form-input"
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                            placeholder="Auto-generated if empty"
                          />
                        </div>
                      </div>

                      <div className="sa-form-group" style={{ marginTop: '16px' }}>
                        <label className="sa-form-checkbox">
                          <input 
                            type="checkbox"
                            checked={registerForm.sendEmail}
                            onChange={(e) => setRegisterForm({...registerForm, sendEmail: e.target.checked})}
                          />
                          Send login credentials via email
                        </label>
                      </div>

                      <div className="sa-form-actions">
                        <button type="submit" className="sa-btn sa-btn-primary">
                          Register User
                        </button>
                      </div>
                    </form>
                  </div>
                </Col>

                <Col lg={6}>
                  <div className="sa-form-card">
                    <h3 className="sa-form-title">Bulk Registration (Students Only)</h3>
                    <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px' }}>
                      Upload a CSV file with columns: name, email, student_id, department
                    </p>
                    
                    <div className="sa-upload-zone" onClick={() => document.getElementById('bulk-upload').click()}>
                      <div className="sa-upload-icon">📁</div>
                      <div className="sa-upload-text">Click to upload CSV/Excel file</div>
                      <div className="sa-upload-hint">or drag and drop</div>
                      <input 
                        type="file" 
                        id="bulk-upload"
                        accept=".csv,.xlsx"
                        style={{ display: 'none' }}
                        onChange={handleBulkUpload}
                      />
                    </div>

                    {bulkPreview.length > 0 && (
                      <>
                        <h4 style={{ marginTop: '20px', marginBottom: '12px', fontSize: '16px' }}>Preview</h4>
                        <table className="sa-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>ID</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bulkPreview.map((row, idx) => (
                              <tr key={idx}>
                                <td>{row.name}</td>
                                <td>{row.email}</td>
                                <td>{row.id}</td>
                                <td>
                                  <span className={`sa-badge ${row.status === 'valid' ? 'active' : 'declined'}`}>
                                    {row.status === 'valid' ? 'Valid' : row.error}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {bulkUploading && (
                          <div className="sa-upload-progress">
                            <div className="sa-progress-bar">
                              <div className="sa-progress-fill" style={{ width: `${bulkProgress}%` }} />
                            </div>
                            <p style={{ marginTop: '8px', fontSize: '14px', color: '#6B7280' }}>Processing... {bulkProgress}%</p>
                          </div>
                        )}

                        <div style={{ marginTop: '16px' }}>
                          <button 
                            className="sa-btn sa-btn-primary"
                            onClick={handleBulkProcess}
                            disabled={bulkUploading}
                          >
                            {bulkUploading ? 'Processing...' : `Import ${bulkPreview.length} Students`}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          )}

          {/* User Management Tab */}
          {activeTab === 'user-management' && (
            <div className="sa-tab-content">
              <div className="sa-table-container">
                <div className="sa-table-toolbar">
                  <div className="sa-table-search">
                    <input 
                      type="text" 
                      className="sa-search-input"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select 
                      className="sa-filter-select"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    >
                      <option value="all">All Roles</option>
                      <option value="student">Student</option>
                      <option value="examiner">Examiner</option>
                      <option value="coordinator">Coordinator</option>
                      <option value="company">Company</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.slice(0, 20).map(u => (
                      <tr key={u.id}>
                        <td>
                          <div className="sa-user-cell">
                            <div className="sa-user-avatar-sm">{getInitials(u.first_name)}</div>
                            <div className="sa-user-info-sm">
                              <span className="sa-user-name-sm">{u.first_name} {u.last_name}</span>
                              <span className="sa-user-email-sm">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="sa-badge" style={{ 
                            background: u.role === 'student' ? 'rgba(16, 185, 129, 0.1)' : 
                                       u.role === 'coordinator' ? 'rgba(24, 95, 165, 0.1)' :
                                       u.role === 'examiner' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(124, 58, 237, 0.1)',
                            color: u.role === 'student' ? '#10B981' : 
                                   u.role === 'coordinator' ? '#185FA5' :
                                   u.role === 'examiner' ? '#06B6D4' : '#7C3AED'
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td>{u.department || 'N/A'}</td>
                        <td>
                          <span className={`sa-badge ${u.is_active ? 'active' : 'inactive'}`}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="sa-table-actions">
                            <button className="sa-action-btn edit" onClick={() => { setEditTarget(u); setShowEditModal(true); }}>Edit</button>
                            <button className="sa-action-btn reset" onClick={() => { setResetTarget(u); setShowResetModal(true); }}>Reset</button>
                            <button className="sa-action-btn delete" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                          <div className="sa-empty-state">
                            <div className="sa-empty-icon">👥</div>
                            <div className="sa-empty-title">No users found</div>
                            <div className="sa-empty-text">Try adjusting your search or filters</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Approve Requests Tab */}
          {activeTab === 'approvals' && (
            <div className="sa-tab-content">
              <div className="sa-tabs">
                <button 
                  className={`sa-tab ${approvalSubTab === 'companies' ? 'active' : ''}`}
                  onClick={() => setApprovalSubTab('companies')}
                >
                  Company Partnerships
                  <span className="sa-tab-count">{requests.companies.length || 3}</span>
                </button>
                <button 
                  className={`sa-tab ${approvalSubTab === 'profiles' ? 'active' : ''}`}
                  onClick={() => setApprovalSubTab('profiles')}
                >
                  Profile Updates
                  <span className="sa-tab-count">{requests.profiles.length || 2}</span>
                </button>
                <button 
                  className={`sa-tab ${approvalSubTab === 'posts' ? 'active' : ''}`}
                  onClick={() => setApprovalSubTab('posts')}
                >
                  Internship Posts
                  <span className="sa-tab-count">{requests.posts.length || 4}</span>
                </button>
              </div>

              {approvalSubTab === 'companies' && (
                <div className="sa-request-card">
                  <div className="sa-request-header">
                    <div>
                      <div className="sa-request-company">Tech Solutions PLC</div>
                      <div className="sa-request-sector">Technology • Software Development</div>
                    </div>
                  </div>
                  <div className="sa-request-details">
                    <div className="sa-request-detail">
                      <span className="sa-request-detail-label">Contact Person</span>
                      <span className="sa-request-detail-value">Michael Chen</span>
                    </div>
                    <div className="sa-request-detail">
                      <span className="sa-request-detail-label">Submitted Date</span>
                      <span className="sa-request-detail-value">Apr 20, 2026</span>
                    </div>
                    <div className="sa-request-detail">
                      <span className="sa-request-detail-label">Internship Capacity</span>
                      <span className="sa-request-detail-value">15 students</span>
                    </div>
                    <div className="sa-request-detail">
                      <span className="sa-request-detail-label">Duration</span>
                      <span className="sa-request-detail-value">6 months</span>
                    </div>
                  </div>
                  <div className="sa-request-actions">
                    <button className="sa-btn sa-btn-success" onClick={() => handleApprove('Company', 1)}>✓ Approve</button>
                    <button className="sa-btn sa-btn-danger" onClick={() => handleReject('Company', 1)}>✗ Reject</button>
                  </div>
                </div>
              )}

              {approvalSubTab === 'profiles' && (
                <div className="sa-request-card">
                  <div className="sa-request-header">
                    <div>
                      <div className="sa-request-company">Sara Johnson</div>
                      <div className="sa-request-sector">Student • IT & Computing</div>
                    </div>
                  </div>
                  <div className="sa-request-details">
                    <div className="sa-request-detail">
                      <span className="sa-request-detail-label">Field Changed</span>
                      <span className="sa-request-detail-value">Phone Number</span>
                    </div>
                    <div className="sa-request-detail">
                      <span className="sa-request-detail-label">Old Value</span>
                      <span className="sa-request-detail-value">+251 911 123456</span>
                    </div>
                    <div className="sa-request-detail">
                      <span className="sa-request-detail-label">New Value</span>
                      <span className="sa-request-detail-value">+251 912 654321</span>
                    </div>
                    <div className="sa-request-detail">
                      <span className="sa-request-detail-label">Submitted</span>
                      <span className="sa-request-detail-value">Apr 22, 2026</span>
                    </div>
                  </div>
                  <div className="sa-request-actions">
                    <button className="sa-btn sa-btn-success" onClick={() => handleApprove('Profile', 1)}>✓ Approve</button>
                    <button className="sa-btn sa-btn-danger" onClick={() => handleReject('Profile', 1)}>✗ Reject</button>
                  </div>
                </div>
              )}

              {approvalSubTab === 'posts' && (
                <div className="sa-request-card">
                  <div className="sa-request-header">
                    <div>
                      <div className="sa-request-company">Global Industries</div>
                      <div className="sa-request-sector">Software Developer Intern</div>
                    </div>
                  </div>
                  <div className="sa-request-details">
                    <div className="sa-request-detail">
                      <span className="sa-request-detail-label">Target Department</span>
                      <span className="sa-request-detail-value">IT & Computing</span>
                    </div>
                    <div className="sa-request-detail">
                      <span className="sa-request-detail-label">Duration</span>
                      <span className="sa-request-detail-value">3 months</span>
                    </div>
                    <div className="sa-request-detail">
                      <span className="sa-request-detail-label">Slots Available</span>
                      <span className="sa-request-detail-value">5</span>
                    </div>
                    <div className="sa-request-detail">
                      <span className="sa-request-detail-label">Submitted</span>
                      <span className="sa-request-detail-value">Apr 18, 2026</span>
                    </div>
                  </div>
                  <div className="sa-request-actions">
                    <button className="sa-btn sa-btn-success" onClick={() => handleApprove('Post', 1)}>✓ Approve</button>
                    <button className="sa-btn sa-btn-danger" onClick={() => handleReject('Post', 1)}>✗ Reject</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Internship Posts Tab */}
          {activeTab === 'internships' && (
            <div className="sa-tab-content">
              <div className="sa-section-header">
                <div className="sa-view-toggle">
                  <button 
                    className={`sa-view-toggle-btn ${internshipView === 'all' ? 'active' : ''}`}
                    onClick={() => setInternshipView('all')}
                  >
                    All Posts
                  </button>
                  <button 
                    className={`sa-view-toggle-btn ${internshipView === 'department' ? 'active' : ''}`}
                    onClick={() => setInternshipView('department')}
                  >
                    Department Posts
                  </button>
                  <button 
                    className={`sa-view-toggle-btn ${internshipView === 'company' ? 'active' : ''}`}
                    onClick={() => setInternshipView('company')}
                  >
                    Company Posts
                  </button>
                </div>
                <button className="sa-btn sa-btn-primary" onClick={() => setShowCreatePostModal(true)}>
                  ➕ Create New Post
                </button>
              </div>

              <div className="sa-table-container">
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Company</th>
                      <th>Target Dept</th>
                      <th>Duration</th>
                      <th>Slots</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {internships.slice(0, 10).map(i => (
                      <tr key={i.id}>
                        <td>{i.title}</td>
                        <td>{i.company?.name || '-'}</td>
                        <td>{i.department || 'All'}</td>
                        <td>{i.duration_weeks || 12} weeks</td>
                        <td>{i.max_applicants || 1}</td>
                        <td>
                          <span className={`sa-badge ${i.status === 'active' ? 'open' : i.status === 'closed' ? 'closed' : 'draft'}`}>
                            {i.status || 'active'}
                          </span>
                        </td>
                        <td>
                          <div className="sa-table-actions">
                            <button className="sa-action-btn view">View</button>
                            <button className="sa-action-btn delete">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {internships.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                          <div className="sa-empty-state">
                            <div className="sa-empty-icon">💼</div>
                            <div className="sa-empty-title">No internship posts yet</div>
                            <div className="sa-empty-text">Create your first internship post</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="sa-tab-content">
              <div className="sa-section-header">
                <div className="sa-table-search">
                  <input 
                    type="text" 
                    className="sa-search-input"
                    placeholder="Search applications..."
                  />
                  <select className="sa-filter-select">
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
                <div>
                  <button className="sa-btn sa-btn-success">Accept All Selected</button>
                  <button className="sa-btn sa-btn-danger" style={{ marginLeft: '8px' }}>Decline All Selected</button>
                </div>
              </div>

              <div className="sa-table-container">
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Applied Post</th>
                      <th>Department</th>
                      <th>Applied Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.slice(0, 15).map(a => (
                      <tr key={a.id}>
                        <td>
                          <div className="sa-user-cell">
                            <div className="sa-user-avatar-sm">{getInitials(a.user?.first_name)}</div>
                            <div className="sa-user-info-sm">
                              <span className="sa-user-name-sm">{a.user?.first_name} {a.user?.last_name}</span>
                              <span className="sa-user-email-sm">#{a.student_id || a.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>{a.internship?.title || 'Internship'}</td>
                        <td>{a.department || 'IT'}</td>
                        <td>{formatDate(a.created_at)}</td>
                        <td>
                          <span className={`sa-badge ${a.status === 'accepted' ? 'accepted' : a.status === 'declined' ? 'declined' : 'pending'}`}>
                            {a.status || 'pending'}
                          </span>
                        </td>
                        <td>
                          <div className="sa-table-actions">
                            {a.status === 'pending' && (
                              <>
                                <button className="sa-action-btn edit" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>Accept</button>
                                <button className="sa-action-btn delete" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>Decline</button>
                              </>
                            )}
                            <button className="sa-action-btn view">View</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {applications.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                          <div className="sa-empty-state">
                            <div className="sa-empty-icon">📝</div>
                            <div className="sa-empty-title">No applications yet</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="sa-tab-content">
              <div className="sa-tabs">
                <button 
                  className={`sa-tab ${reportSubTab === 'system' ? 'active' : ''}`}
                  onClick={() => setReportSubTab('system')}
                >
                  System-wide Analytics
                </button>
                <button 
                  className={`sa-tab ${reportSubTab === 'department' ? 'active' : ''}`}
                  onClick={() => setReportSubTab('department')}
                >
                  Department Reports
                </button>
                <button 
                  className={`sa-tab ${reportSubTab === 'student' ? 'active' : ''}`}
                  onClick={() => setReportSubTab('student')}
                >
                  Student Progress
                </button>
              </div>

              {reportSubTab === 'system' && (
                <Row>
                  <Col lg={8}>
                    <div className="sa-chart-card" style={{ marginBottom: '20px' }}>
                      <h3 className="sa-chart-title">Total Internships per Semester</h3>
                      <BarChart data={chartData.monthly} />
                    </div>
                    <div className="sa-chart-card">
                      <h3 className="sa-chart-title">Acceptance Rate Trend</h3>
                      <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                        Line chart visualization would appear here
                      </div>
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="sa-form-card">
                      <h3 className="sa-form-title">AI Insight Summary</h3>
                      <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#374151' }}>
                        <p style={{ marginBottom: '12px' }}>
                          <strong>System Health:</strong> Good
                        </p>
                        <p style={{ marginBottom: '12px' }}>
                          Submission rate dropped 12% in December — likely due to exam period. Consider sending reminders earlier in October.
                        </p>
                        <p style={{ marginBottom: '12px' }}>
                          <strong>Acceptance Rate:</strong> 68% (above target of 60%)
                        </p>
                        <p>
                          <strong>Report Compliance:</strong> 82% on-time submissions, 12% late, 6% missing
                        </p>
                      </div>
                    </div>
                    <div className="sa-form-card">
                      <h3 className="sa-form-title">Quick Stats</h3>
                      <div style={{ display: 'grid', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#F9FAFB', borderRadius: '8px' }}>
                          <span>Active Internships</span>
                          <strong>342</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#F9FAFB', borderRadius: '8px' }}>
                          <span>Completed</span>
                          <strong>1,247</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#F9FAFB', borderRadius: '8px' }}>
                          <span>On-time Reports</span>
                          <strong>82%</strong>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              )}

              {reportSubTab === 'department' && (
                <div className="sa-form-card">
                  <h3 className="sa-form-title">Department-level Reports</h3>
                  <div className="sa-form-group" style={{ marginBottom: '20px' }}>
                    <label className="sa-form-label">Select Department</label>
                    <select className="sa-form-select" style={{ maxWidth: '300px' }}>
                      <option>IT & Computing</option>
                      <option>Business & Economics</option>
                      <option>Engineering</option>
                      <option>Health Sciences</option>
                      <option>Natural Sciences</option>
                    </select>
                  </div>
                  <div className="sa-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <div className="sa-stat-card">
                      <div className="sa-stat-label">Total Students</div>
                      <div className="sa-stat-value">200</div>
                    </div>
                    <div className="sa-stat-card">
                      <div className="sa-stat-label">Placements</div>
                      <div className="sa-stat-value">156</div>
                    </div>
                    <div className="sa-stat-card">
                      <div className="sa-stat-label">Completion Rate</div>
                      <div className="sa-stat-value">78%</div>
                    </div>
                  </div>
                </div>
              )}

              {reportSubTab === 'student' && (
                <div className="sa-form-card">
                  <h3 className="sa-form-title">Student Progress Reports</h3>
                  <div className="sa-form-group" style={{ marginBottom: '20px' }}>
                    <label className="sa-form-label">Search Student</label>
                    <input 
                      type="text" 
                      className="sa-form-input" 
                      placeholder="Enter student name or ID..."
                      style={{ maxWidth: '400px' }}
                    />
                  </div>
                  <div className="sa-empty-state" style={{ padding: '40px' }}>
                    <div className="sa-empty-icon">🎓</div>
                    <div className="sa-empty-title">Search for a student</div>
                    <div className="sa-empty-text">Enter a student name or ID to view their progress</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Student Progress Tab */}
          {activeTab === 'student-progress' && (
            <div className="sa-tab-content">
              <div className="sa-form-card">
                <h3 className="sa-form-title">Student Progress Timeline</h3>
                <div className="sa-form-group" style={{ marginBottom: '20px' }}>
                  <label className="sa-form-label">Search Student by Name/ID</label>
                  <input 
                    type="text" 
                    className="sa-form-input" 
                    placeholder="Enter student name or ID..."
                    style={{ maxWidth: '400px' }}
                  />
                </div>
                <div className="sa-empty-state" style={{ padding: '40px' }}>
                  <div className="sa-empty-icon">📊</div>
                  <div className="sa-empty-title">Student Progress Reports</div>
                  <div className="sa-empty-text">Search for a student to view their complete internship timeline</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Register User Modal */}
      <Modal show={showRegisterModal} onHide={() => setShowRegisterModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Register New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleRegister}>
            <div className="sa-form-row">
              <div className="sa-form-group">
                <label className="sa-form-label">Role</label>
                <select 
                  className="sa-form-select"
                  value={registerForm.role}
                  onChange={(e) => setRegisterForm({...registerForm, role: e.target.value})}
                >
                  <option value="student">Student</option>
                  <option value="examiner">Examiner</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="company">Company</option>
                </select>
              </div>
              <div className="sa-form-group">
                <label className="sa-form-label">Department</label>
                <select 
                  className="sa-form-select"
                  value={registerForm.department}
                  onChange={(e) => setRegisterForm({...registerForm, department: e.target.value})}
                >
                  <option value="">Select Department</option>
                  <option value="IT">IT & Computing</option>
                  <option value="Business">Business & Economics</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>
            </div>
            <div className="sa-form-row">
              <div className="sa-form-group">
                <label className="sa-form-label">First Name</label>
                <input type="text" className="sa-form-input" value={registerForm.firstName} onChange={(e) => setRegisterForm({...registerForm, firstName: e.target.value})} required />
              </div>
              <div className="sa-form-group">
                <label className="sa-form-label">Last Name</label>
                <input type="text" className="sa-form-input" value={registerForm.lastName} onChange={(e) => setRegisterForm({...registerForm, lastName: e.target.value})} required />
              </div>
            </div>
            <div className="sa-form-row">
              <div className="sa-form-group">
                <label className="sa-form-label">Email</label>
                <input type="email" className="sa-form-input" value={registerForm.email} onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})} required />
              </div>
              <div className="sa-form-group">
                <label className="sa-form-label">Phone</label>
                <input type="tel" className="sa-form-input" value={registerForm.phone} onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})} />
              </div>
            </div>
            <div className="sa-form-group" style={{ marginTop: '16px' }}>
              <label className="sa-form-checkbox">
                <input type="checkbox" checked={registerForm.sendEmail} onChange={(e) => setRegisterForm({...registerForm, sendEmail: e.target.checked})} />
                Send login credentials via email
              </label>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRegisterModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleRegister}>Register User</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editTarget && (
            <div className="sa-form-row">
              <div className="sa-form-group">
                <label className="sa-form-label">First Name</label>
                <input type="text" className="sa-form-input" defaultValue={editTarget.first_name} />
              </div>
              <div className="sa-form-group">
                <label className="sa-form-label">Last Name</label>
                <input type="text" className="sa-form-input" defaultValue={editTarget.last_name} />
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button variant="primary">Save Changes</Button>
        </Modal.Footer>
      </Modal>

      {/* Reset Password Modal */}
      <Modal show={showResetModal} onHide={() => setShowResetModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Reset password for: <strong>{resetTarget?.email}</strong></p>
          <div className="sa-form-group">
            <label className="sa-form-label">New Password</label>
            <input type="text" className="sa-form-input" defaultValue="password123" />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResetModal(false)}>Cancel</Button>
          <Button variant="warning">Reset Password</Button>
        </Modal.Footer>
      </Modal>

      {/* Create Post Modal */}
      <Modal show={showCreatePostModal} onHide={() => setShowCreatePostModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Internship Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleCreatePost}>
            <div className="sa-form-row">
              <div className="sa-form-group" style={{ gridColumn: 'span 2' }}>
                <label className="sa-form-label">Post Title</label>
                <input type="text" className="sa-form-input" value={postForm.title} onChange={(e) => setPostForm({...postForm, title: e.target.value})} required />
              </div>
            </div>
            <div className="sa-form-group" style={{ marginBottom: '16px' }}>
              <label className="sa-form-label">Description</label>
              <textarea className="sa-form-input" rows="3" value={postForm.description} onChange={(e) => setPostForm({...postForm, description: e.target.value})} />
            </div>
            <div className="sa-form-row">
              <div className="sa-form-group">
                <label className="sa-form-label">Company</label>
                <select className="sa-form-select" value={postForm.company} onChange={(e) => setPostForm({...postForm, company: e.target.value})}>
                  <option value="">Select Company</option>
                  <option value="1">Tech Solutions PLC</option>
                  <option value="2">Global Industries</option>
                </select>
              </div>
              <div className="sa-form-group">
                <label className="sa-form-label">Target Department</label>
                <select className="sa-form-select" value={postForm.targetDepartment} onChange={(e) => setPostForm({...postForm, targetDepartment: e.target.value})}>
                  <option value="">Select Department</option>
                  <option value="IT">IT & Computing</option>
                  <option value="Business">Business & Economics</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>
            </div>
            <div className="sa-form-row">
              <div className="sa-form-group">
                <label className="sa-form-label">Start Date</label>
                <input type="date" className="sa-form-input" value={postForm.startDate} onChange={(e) => setPostForm({...postForm, startDate: e.target.value})} />
              </div>
              <div className="sa-form-group">
                <label className="sa-form-label">End Date</label>
                <input type="date" className="sa-form-input" value={postForm.endDate} onChange={(e) => setPostForm({...postForm, endDate: e.target.value})} />
              </div>
            </div>
            <div className="sa-form-row">
              <div className="sa-form-group">
                <label className="sa-form-label">Available Slots</label>
                <input type="number" className="sa-form-input" value={postForm.slots} onChange={(e) => setPostForm({...postForm, slots: e.target.value})} min="1" />
              </div>
              <div className="sa-form-group">
                <label className="sa-form-label">Application Deadline</label>
                <input type="date" className="sa-form-input" value={postForm.deadline} onChange={(e) => setPostForm({...postForm, deadline: e.target.value})} />
              </div>
            </div>
            <div className="sa-form-group">
              <label className="sa-form-label">Status</label>
              <select className="sa-form-select" value={postForm.status} onChange={(e) => setPostForm({...postForm, status: e.target.value})}>
                <option value="draft">Draft</option>
                <option value="active">Publish Immediately</option>
              </select>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreatePostModal(false)}>Cancel</Button>
          <Button variant="secondary" onClick={handleCreatePost}>Save as Draft</Button>
          <Button variant="primary" onClick={handleCreatePost}>Publish</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
