import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';
import AIInsights from './AIInsights';
import AIInsightsChartsSimple from './AIInsightsChartsSimple';
import ChartTest from './ChartTest';
import { handleStudentActions } from '../utils/DashboardActions';

const StudentDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalApplications: 0,
    approvedApplications: 0,
    reportsSubmitted: 0,
    availableInternships: 0
  });
  const [applications, setApplications] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setStats({
        totalApplications: 5,
        approvedApplications: 2,
        reportsSubmitted: 3,
        availableInternships: 12
      });

      setApplications([
        {
          id: 1,
          title: 'Software Developer Intern',
          company: 'Ethio Telecom',
          status: 'approved',
          appliedDate: '2024-01-15',
          internshipPeriod: '3 months'
        },
        {
          id: 2,
          title: 'Web Development Intern',
          company: 'Commercial Bank',
          status: 'pending',
          appliedDate: '2024-01-20',
          internshipPeriod: '2 months'
        },
        {
          id: 3,
          title: 'Data Science Intern',
          company: 'Ethiopian Airlines',
          status: 'rejected',
          appliedDate: '2024-01-10',
          internshipPeriod: '4 months'
        }
      ]);

      setReports([
        {
          id: 1,
          title: 'Week 1 Progress Report',
          type: 'Weekly',
          status: 'submitted',
          submissionDate: '2024-01-22',
          grade: null
        },
        {
          id: 2,
          title: 'Week 2 Progress Report',
          type: 'Weekly',
          status: 'reviewed',
          submissionDate: '2024-01-29',
          grade: 'A'
        },
        {
          id: 3,
          title: 'Month 1 Summary Report',
          type: 'Monthly',
          status: 'draft',
          submissionDate: null,
          grade: null
        }
      ]);

      setLoading(false);
    }, 1500);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      approved: '#28a745',
      pending: '#ffc107',
      rejected: '#dc3545',
      submitted: '#17a2b8',
      reviewed: '#28a745',
      draft: '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusIcon = (status) => {
    const icons = {
      approved: '✅',
      pending: '⏳',
      rejected: '❌',
      submitted: '📤',
      reviewed: '👁️',
      draft: '📝'
    };
    return icons[status] || '📝';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading student dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>🎓 Student Dashboard</h1>
          <p>Track your internship applications, reports, and progress</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.totalApplications}</h3>
            <p>Total Applications</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.approvedApplications}</h3>
            <p>Approved Applications</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>{stats.reportsSubmitted}</h3>
            <p>Reports Submitted</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <h3>{stats.availableInternships}</h3>
            <p>Available Internships</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn primary" onClick={() => handleStudentActions('browse-internships', navigate)}>
            <span className="btn-icon">🔍</span>
            Browse Internships
          </button>
          <button className="action-btn secondary" onClick={() => handleStudentActions('submit-report', navigate)}>
            <span className="btn-icon">📝</span>
            Submit Report
          </button>
          <button className="action-btn tertiary" onClick={() => handleStudentActions('view-progress', navigate)}>
            <span className="btn-icon">📊</span>
            View Progress
          </button>
          <button className="action-btn quaternary" onClick={() => handleStudentActions('update-profile', navigate)}>
            <span className="btn-icon">👤</span>
            Update Profile
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
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
                    <h4>{app.title}</h4>
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
                      <span className="label">Company:</span>
                      <span className="value">{app.company}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Applied:</span>
                      <span className="value">{app.appliedDate}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Duration:</span>
                      <span className="value">{app.internshipPeriod}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon">📋</span>
                <p>No applications yet. Start browsing internships!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="content-card">
          <div className="card-header">
            <h3>📄 Recent Reports</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="card-content">
            {reports.length > 0 ? (
              reports.map(report => (
                <div key={report.id} className="report-item">
                  <div className="item-header">
                    <h4>{report.title}</h4>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(report.status) }}
                    >
                      <span className="status-icon">{getStatusIcon(report.status)}</span>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </div>
                  <div className="item-details">
                    <div className="detail-row">
                      <span className="label">Type:</span>
                      <span className="value">{report.type}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Submitted:</span>
                      <span className="value">{report.submissionDate || 'Not submitted'}</span>
                    </div>
                    {report.grade && (
                      <div className="detail-row">
                        <span className="label">Grade:</span>
                        <span className="value grade">{report.grade}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon">📄</span>
                <p>No reports submitted yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="progress-section">
        <h2>📊 Internship Progress</h2>
        <div className="progress-cards">
          <div className="progress-card">
            <h4>Current Internship</h4>
            <div className="internship-info">
              <h5>Software Developer Intern</h5>
              <p>Ethio Telecom</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '65%' }}></div>
              </div>
              <span className="progress-text">65% Complete</span>
            </div>
          </div>
          
          <div className="milestone-card">
            <h4>Upcoming Milestones</h4>
            <div className="milestone-list">
              <div className="milestone-item completed">
                <span className="milestone-icon">✅</span>
                <div className="milestone-content">
                  <h5>Week 1 Report</h5>
                  <p>Completed on Jan 22, 2024</p>
                </div>
              </div>
              <div className="milestone-item pending">
                <span className="milestone-icon">⏳</span>
                <div className="milestone-content">
                  <h5>Week 2 Report</h5>
                  <p>Due on Feb 5, 2024</p>
                </div>
              </div>
              <div className="milestone-item upcoming">
                <span className="milestone-icon">📅</span>
                <div className="milestone-content">
                  <h5>Mid-term Evaluation</h5>
                  <p>Scheduled for Feb 15, 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements */}
      <div className="announcements-section">
        <h2>📢 Announcements</h2>
        <div className="announcement-list">
          <div className="announcement-item">
            <div className="announcement-header">
              <span className="announcement-type">Important</span>
              <span className="announcement-date">Jan 25, 2024</span>
            </div>
            <h4>Mid-term Evaluation Schedule</h4>
            <p>All students must complete their mid-term evaluations by February 15, 2024. Please schedule with your supervisors.</p>
          </div>
          <div className="announcement-item">
            <div className="announcement-header">
              <span className="announcement-type">Reminder</span>
              <span className="announcement-date">Jan 20, 2024</span>
            </div>
            <h4>Weekly Report Deadline</h4>
            <p>Remember to submit your weekly progress reports every Friday by 5:00 PM.</p>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <AIInsights userRole="student" userId="student1" />
      
      {/* Chart Test Section */}
      <ChartTest />
      
      {/* AI Insights Charts Section */}
      <AIInsightsChartsSimple userRole="student" userId="student1" />
    </div>
  );
};

export default StudentDashboard;
