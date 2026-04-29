import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CompanyDashboard.css';
import AIInsights from './AIInsights';
import AIInsightsChartsSimple from './AIInsightsChartsSimple';
import { handleCompanyActions } from '../utils/DashboardActions';

const CompanyDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    postedInternships: 0,
    totalApplications: 0,
    activeInterns: 0,
    evaluations: 0
  });
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setStats({
        postedInternships: 8,
        totalApplications: 24,
        activeInterns: 5,
        evaluations: 12
      });

      setInternships([
        {
          id: 1,
          title: 'Software Developer Intern',
          department: 'IT Department',
          location: 'Addis Ababa',
          duration: '3 months',
          stipend: 'ETB 3,000/month',
          status: 'active',
          applications: 8,
          postedDate: '2024-01-10'
        },
        {
          id: 2,
          title: 'Web Development Intern',
          department: 'Digital Services',
          location: 'Addis Ababa',
          duration: '2 months',
          stipend: 'ETB 2,500/month',
          status: 'active',
          applications: 5,
          postedDate: '2024-01-15'
        },
        {
          id: 3,
          title: 'Data Science Intern',
          department: 'Analytics',
          location: 'Addis Ababa',
          duration: '4 months',
          stipend: 'ETB 3,500/month',
          status: 'closed',
          applications: 11,
          postedDate: '2024-01-05'
        }
      ]);

      setApplications([
        {
          id: 1,
          internshipTitle: 'Software Developer Intern',
          studentName: 'John Doe',
          studentEmail: 'john@aru.edu',
          status: 'pending',
          appliedDate: '2024-01-18',
          gpa: '3.8',
          skills: 'React, Node.js, Python'
        },
        {
          id: 2,
          internshipTitle: 'Software Developer Intern',
          studentName: 'Fatima Ahmed',
          studentEmail: 'fatima@aru.edu',
          status: 'approved',
          appliedDate: '2024-01-12',
          gpa: '3.9',
          skills: 'JavaScript, React, MongoDB'
        },
        {
          id: 3,
          internshipTitle: 'Web Development Intern',
          studentName: 'Kebede Tadesse',
          studentEmail: 'kebede@aru.edu',
          status: 'rejected',
          appliedDate: '2024-01-16',
          gpa: '3.2',
          skills: 'HTML, CSS, JavaScript'
        }
      ]);

      setLoading(false);
    }, 1500);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      active: '#28a745',
      closed: '#dc3545',
      pending: '#ffc107',
      approved: '#28a745',
      rejected: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: '🟢',
      closed: '🔴',
      pending: '⏳',
      approved: '✅',
      rejected: '❌'
    };
    return icons[status] || '📝';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading company dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="company-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>🏢 Company Dashboard</h1>
          <p>Manage your internship postings and review applications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <h3>{stats.postedInternships}</h3>
            <p>Posted Internships</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.totalApplications}</h3>
            <p>Total Applications</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.activeInterns}</h3>
            <p>Active Interns</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.evaluations}</h3>
            <p>Evaluations</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn primary" onClick={() => handleCompanyActions('post-internship', navigate)}>
            <span className="btn-icon">➕</span>
            Post New Internship
          </button>
          <button className="action-btn secondary" onClick={() => handleCompanyActions('review-applications', navigate)}>
            <span className="btn-icon">📋</span>
            Review Applications
          </button>
          <button className="action-btn tertiary" onClick={() => handleCompanyActions('view-analytics', navigate)}>
            <span className="btn-icon">📊</span>
            View Analytics
          </button>
          <button className="action-btn quaternary" onClick={() => handleCompanyActions('company-profile', navigate)}>
            <span className="btn-icon">👤</span>
            Company Profile
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Recent Internships */}
        <div className="content-card">
          <div className="card-header">
            <h3>💼 Recent Internships</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="card-content">
            {internships.length > 0 ? (
              internships.map(internship => (
                <div key={internship.id} className="internship-item">
                  <div className="item-header">
                    <h4>{internship.title}</h4>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(internship.status) }}
                    >
                      <span className="status-icon">{getStatusIcon(internship.status)}</span>
                      {internship.status.charAt(0).toUpperCase() + internship.status.slice(1)}
                    </span>
                  </div>
                  <div className="item-details">
                    <div className="detail-row">
                      <span className="label">Department:</span>
                      <span className="value">{internship.department}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Location:</span>
                      <span className="value">{internship.location}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Duration:</span>
                      <span className="value">{internship.duration}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Stipend:</span>
                      <span className="value stipend">{internship.stipend}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Applications:</span>
                      <span className="value">{internship.applications} received</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Posted:</span>
                      <span className="value">{internship.postedDate}</span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button className="action-btn-small">View Details</button>
                    <button className="action-btn-small">Edit</button>
                    <button className="action-btn-small">Close</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon">💼</span>
                <p>No internships posted yet. Post your first opportunity!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="content-card">
          <div className="card-header">
            <h3>📋 Recent Applications</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="card-content">
            {applications.length > 0 ? (
              applications.map(app => (
                <div key={app.id} className="application-item">
                  <div className="item-header">
                    <h4>{app.studentName}</h4>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(app.status) }}
                    >
                      <span className="status-icon">{getStatusIcon(app.status)}</span>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                  <div className="item-details">
                    <div className="detail-row">
                      <span className="label">Email:</span>
                      <span className="value">{app.studentEmail}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Position:</span>
                      <span className="value">{app.internshipTitle}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">GPA:</span>
                      <span className="value gpa">{app.gpa}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Skills:</span>
                      <span className="value">{app.skills}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Applied:</span>
                      <span className="value">{app.appliedDate}</span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button className="action-btn-small">View Profile</button>
                    <button className="action-btn-small">Approve</button>
                    <button className="action-btn-small">Reject</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon">📋</span>
                <p>No applications received yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="analytics-section">
        <h2>📊 Application Analytics</h2>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h4>Application Trends</h4>
            <div className="trend-chart">
              <div className="chart-placeholder">
                <div className="bar" style={{ height: '60%' }}></div>
                <div className="bar" style={{ height: '80%' }}></div>
                <div className="bar" style={{ height: '45%' }}></div>
                <div className="bar" style={{ height: '90%' }}></div>
                <div className="bar" style={{ height: '70%' }}></div>
              </div>
              <div className="chart-labels">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
              </div>
            </div>
          </div>
          
          <div className="analytics-card">
            <h4>Department Distribution</h4>
            <div className="distribution-chart">
              <div className="segment" style={{ backgroundColor: '#667eea', width: '40%' }}>
                <span>IT Dept (40%)</span>
              </div>
              <div className="segment" style={{ backgroundColor: '#764ba2', width: '35%' }}>
                <span>Digital (35%)</span>
              </div>
              <div className="segment" style={{ backgroundColor: '#28a745', width: '25%' }}>
                <span>Analytics (25%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="company-info-section">
        <h2>🏢 Company Information</h2>
        <div className="info-grid">
          <div className="info-card">
            <h4>Company Profile</h4>
            <div className="profile-content">
              <div className="profile-header">
                <div className="company-logo">🏢</div>
                <div className="company-details">
                  <h5>Ethio Telecom</h5>
                  <p>Leading Telecommunications Company</p>
                </div>
              </div>
              <div className="profile-stats">
                <div className="profile-stat">
                  <span className="stat-label">Verified</span>
                  <span className="stat-value verified">✅ Yes</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-label">Member Since</span>
                  <span className="stat-value">2023</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-label">Rating</span>
                  <span className="stat-value rating">⭐ 4.8/5.0</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="info-card">
            <h4>Quick Stats</h4>
            <div className="quick-stats">
              <div className="quick-stat">
                <span className="stat-icon">👥</span>
                <div className="stat-info">
                  <span className="stat-number">5</span>
                  <span className="stat-desc">Current Interns</span>
                </div>
              </div>
              <div className="quick-stat">
                <span className="stat-icon">📈</span>
                <div className="stat-info">
                  <span className="stat-number">92%</span>
                  <span className="stat-desc">Satisfaction Rate</span>
                </div>
              </div>
              <div className="quick-stat">
                <span className="stat-icon">🎯</span>
                <div className="stat-info">
                  <span className="stat-number">15</span>
                  <span className="stat-desc">Hired Students</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <AIInsights userRole="company" userId="company1" />
      
      {/* AI Insights Charts Section */}
      <AIInsightsChartsSimple userRole="company" userId="company1" />
    </div>
  );
};

export default CompanyDashboard;
