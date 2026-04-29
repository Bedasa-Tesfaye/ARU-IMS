import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ExaminerDashboard.css';
import AIInsights from './AIInsights';
import AIInsightsChartsSimple from './AIInsightsChartsSimple';
import { handleExaminerActions } from '../utils/DashboardActions';

const ExaminerDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    reportsAssigned: 0,
    reportsToReview: 0,
    reportsReviewed: 0,
    evaluations: 0
  });
  const [reports, setReports] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setStats({
        reportsAssigned: 15,
        reportsToReview: 8,
        reportsReviewed: 7,
        evaluations: 12
      });

      setReports([
        {
          id: 1,
          title: 'Week 1 Progress Report',
          studentName: 'John Doe',
          studentEmail: 'john@aru.edu',
          company: 'Ethio Telecom',
          status: 'submitted',
          submissionDate: '2024-01-22',
          dueDate: '2024-01-25',
          priority: 'normal'
        },
        {
          id: 2,
          title: 'Week 2 Progress Report',
          studentName: 'Fatima Ahmed',
          studentEmail: 'fatima@aru.edu',
          company: 'Commercial Bank',
          status: 'pending_review',
          submissionDate: '2024-01-29',
          dueDate: '2024-02-01',
          priority: 'high'
        }
      ]);

      setEvaluations([
        {
          id: 1,
          studentName: 'John Doe',
          internshipTitle: 'Software Developer Intern',
          company: 'Ethio Telecom',
          evaluationDate: '2024-01-20',
          status: 'completed',
          overallScore: 85,
          categories: {
            technical: 88,
            communication: 82,
            teamwork: 85,
            problemSolving: 85
          }
        }
      ]);

      setLoading(false);
    }, 1500);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      submitted: '#17a2b8',
      pending_review: '#ffc107',
      overdue: '#dc3545',
      completed: '#28a745',
      in_progress: '#6f42c1',
      normal: '#28a745',
      high: '#ffc107',
      urgent: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusIcon = (status) => {
    const icons = {
      submitted: '📤',
      pending_review: '⏳',
      overdue: '⚠️',
      completed: '✅',
      in_progress: '🔄',
      normal: '🟢',
      high: '🟡',
      urgent: '🔴'
    };
    return icons[status] || '📝';
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#28a745';
    if (score >= 80) return '#ffc107';
    if (score >= 70) return '#fd7e14';
    if (score >= 60) return '#dc3545';
    return '#dc3545';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading examiner dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="examiner-dashboard">
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>👨‍⚕️ Examiner Dashboard</h1>
          <p>Review student reports and conduct evaluations</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.reportsAssigned}</h3>
            <p>Reports Assigned</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-content">
            <h3>{stats.reportsToReview}</h3>
            <p>Reports to Review</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.reportsReviewed}</h3>
            <p>Reports Reviewed</p>
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

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn primary" onClick={() => handleExaminerActions('review-reports', navigate)}>
            <span className="btn-icon">📋</span>
            Review Reports
          </button>
          <button className="action-btn secondary" onClick={() => handleExaminerActions('create-evaluation', navigate)}>
            <span className="btn-icon">📊</span>
            Create Evaluation
          </button>
          <button className="action-btn tertiary" onClick={() => handleExaminerActions('view-analytics', navigate)}>
            <span className="btn-icon">📈</span>
            View Analytics
          </button>
          <button className="action-btn quaternary" onClick={() => handleExaminerActions('submit-feedback', navigate)}>
            <span className="btn-icon">📤</span>
            Submit Feedback
          </button>
        </div>
      </div>

      <div className="content-grid">
        <div className="content-card">
          <div className="card-header">
            <h3>📋 Reports to Review</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="card-content">
            {reports.length > 0 ? (
              reports.map(report => (
                <div key={report.id} className="report-item">
                  <div className="item-header">
                    <h4>{report.title}</h4>
                    <div className="status-container">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(report.status) }}
                      >
                        <span className="status-icon">{getStatusIcon(report.status)}</span>
                        {report.status.replace('_', ' ').charAt(0).toUpperCase() + report.status.replace('_', ' ').slice(1)}
                      </span>
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getStatusColor(report.priority) }}
                      >
                        {report.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="item-details">
                    <div className="detail-row">
                      <span className="label">Student:</span>
                      <span className="value">{report.studentName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Email:</span>
                      <span className="value">{report.studentEmail}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Company:</span>
                      <span className="value">{report.company}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Submitted:</span>
                      <span className="value">{report.submissionDate || 'Not submitted'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Due:</span>
                      <span className="value due">{report.dueDate}</span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button className="action-btn-small">View Report</button>
                    <button className="action-btn-small">Review</button>
                    <button className="action-btn-small">Request Revision</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon">📋</span>
                <p>No reports pending review.</p>
              </div>
            )}
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h3>📊 Recent Evaluations</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="card-content">
            {evaluations.length > 0 ? (
              evaluations.map(evaluation => (
                <div key={evaluation.id} className="evaluation-item">
                  <div className="item-header">
                    <h4>{evaluation.studentName}</h4>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(evaluation.status) }}
                    >
                      <span className="status-icon">{getStatusIcon(evaluation.status)}</span>
                      {evaluation.status.replace('_', ' ').charAt(0).toUpperCase() + evaluation.status.replace('_', ' ').slice(1)}
                    </span>
                  </div>
                  <div className="item-details">
                    <div className="detail-row">
                      <span className="label">Position:</span>
                      <span className="value">{evaluation.internshipTitle}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Company:</span>
                      <span className="value">{evaluation.company}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Date:</span>
                      <span className="value">{evaluation.evaluationDate}</span>
                    </div>
                    {evaluation.overallScore && (
                      <div className="score-display">
                        <span className="score-label">Overall Score:</span>
                        <span 
                          className="score-value"
                          style={{ color: getScoreColor(evaluation.overallScore) }}
                        >
                          {evaluation.overallScore}/100
                        </span>
                      </div>
                    )}
                  </div>
                  {evaluation.categories && (
                    <div className="categories-breakdown">
                      <h5>Performance Categories</h5>
                      <div className="category-scores">
                        <div className="category-item">
                          <span className="category-label">Technical Skills</span>
                          <div className="category-bar">
                            <div 
                              className="category-fill"
                              style={{ 
                                width: `${evaluation.categories.technical}%`,
                                backgroundColor: getScoreColor(evaluation.categories.technical)
                              }}
                            ></div>
                            <span className="category-score">{evaluation.categories.technical}%</span>
                          </div>
                        </div>
                        <div className="category-item">
                          <span className="category-label">Communication</span>
                          <div className="category-bar">
                            <div 
                              className="category-fill"
                              style={{ 
                                width: `${evaluation.categories.communication}%`,
                                backgroundColor: getScoreColor(evaluation.categories.communication)
                              }}
                            ></div>
                            <span className="category-score">{evaluation.categories.communication}%</span>
                          </div>
                        </div>
                        <div className="category-item">
                          <span className="category-label">Teamwork</span>
                          <div className="category-bar">
                            <div 
                              className="category-fill"
                              style={{ 
                                width: `${evaluation.categories.teamwork}%`,
                                backgroundColor: getScoreColor(evaluation.categories.teamwork)
                              }}
                            ></div>
                            <span className="category-score">{evaluation.categories.teamwork}%</span>
                          </div>
                        </div>
                        <div className="category-item">
                          <span className="category-label">Problem Solving</span>
                          <div className="category-bar">
                            <div 
                              className="category-fill"
                              style={{ 
                                width: `${evaluation.categories.problemSolving}%`,
                                backgroundColor: getScoreColor(evaluation.categories.problemSolving)
                              }}
                            ></div>
                            <span className="category-score">{evaluation.categories.problemSolving}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="item-actions">
                    <button className="action-btn-small">View Details</button>
                    <button className="action-btn-small">Edit Evaluation</button>
                    <button className="action-btn-small">Download Report</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon">📊</span>
                <p>No evaluations completed yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="performance-section">
        <h2>📈 Performance Overview</h2>
        <div className="performance-grid">
          <div className="performance-card">
            <h4>Review Statistics</h4>
            <div className="performance-stats">
              <div className="perf-stat">
                <span className="perf-number">85%</span>
                <span className="perf-label">On-Time Reviews</span>
              </div>
              <div className="perf-stat">
                <span className="perf-number">4.2</span>
                <span className="perf-label">Avg. Days to Review</span>
              </div>
              <div className="perf-stat">
                <span className="perf-number">92%</span>
                <span className="perf-label">Student Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="schedule-section">
        <h2>📅 Review Schedule</h2>
        <div className="schedule-list">
          <div className="schedule-item upcoming">
            <div className="schedule-date">
              <span className="date">Today</span>
              <span className="time">2:00 PM</span>
            </div>
            <div className="schedule-content">
              <h4>John Doe - Final Evaluation</h4>
              <p>Ethio Telecom - Software Developer Intern</p>
            </div>
            <button className="schedule-btn">Start Session</button>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <AIInsights userRole="examiner" userId="examiner1" />
      
      {/* AI Insights Charts Section */}
      <AIInsightsChartsSimple userRole="examiner" userId="examiner1" />
    </div>
  );
};

export default ExaminerDashboard;
