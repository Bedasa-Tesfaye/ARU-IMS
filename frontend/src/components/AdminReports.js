import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, ScatterChart, Scatter
} from 'recharts';
import './AdminReports.css';

const AdminReports = ({ onBack }) => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRange, setDateRange] = useState('30days');
  const [reportType, setReportType] = useState('all');

  useEffect(() => {
    // Simulate API call for reports data
    setTimeout(() => {
      const mockReports = generateMockReports();
      const mockAnalytics = generateMockAnalytics();
      setReports(mockReports);
      setAnalytics(mockAnalytics);
      setLoading(false);
    }, 1500);
  }, [dateRange, reportType]);

  const generateMockReports = () => {
    return [
      {
        id: 1,
        title: 'Monthly System Performance Report',
        type: 'Performance',
        date: '2024-06-01',
        status: 'Completed',
        generatedBy: 'System Admin',
        size: '2.4 MB',
        downloads: 45,
        description: 'Comprehensive analysis of system performance metrics including response times, uptime, and user activity trends.'
      },
      {
        id: 2,
        title: 'User Engagement Analytics',
        type: 'Analytics',
        date: '2024-06-02',
        status: 'Completed',
        generatedBy: 'Analytics Team',
        size: '1.8 MB',
        downloads: 32,
        description: 'Detailed insights into user engagement patterns, session duration, and feature utilization across all user roles.'
      },
      {
        id: 3,
        title: 'Internship Placement Statistics',
        type: 'Statistics',
        date: '2024-06-03',
        status: 'Processing',
        generatedBy: 'Coordinator Office',
        size: '3.1 MB',
        downloads: 0,
        description: 'Statistical analysis of internship placement rates, company partnerships, and student success metrics.'
      },
      {
        id: 4,
        title: 'Security Audit Report',
        type: 'Security',
        date: '2024-06-04',
        status: 'Scheduled',
        generatedBy: 'Security Team',
        size: '0 MB',
        downloads: 0,
        description: 'Quarterly security audit including vulnerability assessments, access control reviews, and compliance checks.'
      },
      {
        id: 5,
        title: 'Financial Summary Q2 2024',
        type: 'Financial',
        date: '2024-06-05',
        status: 'Completed',
        generatedBy: 'Finance Department',
        size: '4.2 MB',
        downloads: 67,
        description: 'Comprehensive financial overview including revenue, expenses, and budget allocation for Q2 2024.'
      }
    ];
  };

  const generateMockAnalytics = () => {
    return {
      userGrowth: [
        { month: 'Jan', students: 420, companies: 75, coordinators: 10, examiners: 6, total: 511 },
        { month: 'Feb', students: 445, companies: 78, coordinators: 11, examiners: 7, total: 541 },
        { month: 'Mar', students: 478, companies: 82, coordinators: 11, examiners: 7, total: 578 },
        { month: 'Apr', students: 512, companies: 85, coordinators: 12, examiners: 8, total: 617 },
        { month: 'May', students: 545, companies: 88, coordinators: 12, examiners: 8, total: 653 },
        { month: 'Jun', students: 580, companies: 92, coordinators: 13, examiners: 9, total: 694 }
      ],
      systemPerformance: [
        { day: 'Mon', responseTime: 1.2, uptime: 99.8, errorRate: 0.2, throughput: 1250 },
        { day: 'Tue', responseTime: 1.1, uptime: 99.9, errorRate: 0.1, throughput: 1320 },
        { day: 'Wed', responseTime: 1.3, uptime: 99.7, errorRate: 0.3, throughput: 1180 },
        { day: 'Thu', responseTime: 1.0, uptime: 99.9, errorRate: 0.1, throughput: 1410 },
        { day: 'Fri', responseTime: 1.4, uptime: 99.6, errorRate: 0.4, throughput: 1090 },
        { day: 'Sat', responseTime: 0.8, uptime: 99.9, errorRate: 0.1, throughput: 890 },
        { day: 'Sun', responseTime: 0.7, uptime: 100, errorRate: 0.0, throughput: 680 }
      ],
      internshipStats: [
        { department: 'Computer Science', applied: 145, placed: 118, successRate: 81 },
        { department: 'Information Technology', applied: 98, placed: 72, successRate: 73 },
        { department: 'Software Engineering', applied: 87, placed: 68, successRate: 78 },
        { department: 'Information Systems', applied: 76, placed: 54, successRate: 71 },
        { department: 'Computer Engineering', applied: 65, placed: 48, successRate: 74 }
      ],
      companyEngagement: [
        { category: 'Technology', companies: 28, internships: 45, satisfaction: 92 },
        { category: 'Banking', companies: 15, internships: 32, satisfaction: 88 },
        { category: 'Telecommunications', companies: 12, internships: 28, satisfaction: 95 },
        { category: 'Government', companies: 8, internships: 18, satisfaction: 85 },
        { category: 'Consulting', companies: 10, internships: 22, satisfaction: 90 }
      ],
      reportDistribution: [
        { type: 'Performance', count: 45, percentage: 28 },
        { type: 'Analytics', count: 38, percentage: 24 },
        { type: 'Statistics', count: 32, percentage: 20 },
        { type: 'Security', count: 25, percentage: 16 },
        { type: 'Financial', count: 20, percentage: 12 }
      ],
      resourceUtilization: [
        { resource: 'Server CPU', used: 68, available: 32, threshold: 80 },
        { resource: 'Database', used: 74, available: 26, threshold: 85 },
        { resource: 'Storage', used: 52, available: 48, threshold: 90 },
        { resource: 'Bandwidth', used: 81, available: 19, threshold: 85 },
        { resource: 'Memory', used: 63, available: 37, threshold: 80 }
      ]
    };
  };

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];

  const handleDownloadReport = (reportId) => {
    console.log('Downloading report:', reportId);
    alert(`Report ${reportId} download started! This would trigger the actual file download.`);
  };

  const handleGenerateReport = (type) => {
    console.log('Generating report:', type);
    alert(`${type} report generation started! This would trigger the actual report generation process.`);
  };

  const handleViewReportDetails = (report) => {
    setSelectedReport(report);
  };

  const filteredReports = reports.filter(report => 
    reportType === 'all' || report.type.toLowerCase().includes(reportType.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-reports-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading administrative reports and analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-reports">
      <div className="reports-header">
        <div className="header-content">
          <button className="back-btn" onClick={onBack}>
            <span>←</span> Back to Dashboard
          </button>
          <h1>📊 Administrative Reports & Analytics</h1>
          <p>Comprehensive insights and reports for system management and decision-making</p>
        </div>
        <div className="header-controls">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="date-range-selector"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
          <button className="generate-btn" onClick={() => handleGenerateReport('Custom')}>
            <span>📄</span> Generate Custom Report
          </button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="metrics-overview">
        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>Total Users</h3>
            <p className="metric-value">{analytics.userGrowth?.[analytics.userGrowth.length - 1]?.total || 0}</p>
            <span className="metric-change positive">+12.5%</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <h3>System Uptime</h3>
            <p className="metric-value">99.8%</p>
            <span className="metric-change positive">+0.3%</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3>Reports Generated</h3>
            <p className="metric-value">{reports.length}</p>
            <span className="metric-change positive">+8 this week</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">⚡</div>
          <div className="metric-content">
            <h3>Avg Response Time</h3>
            <p className="metric-value">1.1s</p>
            <span className="metric-change positive">-0.2s</span>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="analytics-dashboard">
        <h2>📈 Real-Time Analytics</h2>
        
        <div className="charts-grid">
          {/* User Growth Chart */}
          <div className="chart-container large">
            <div className="chart-header">
              <h3>👥 User Growth Trends</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="students" stackId="1" stroke="#667eea" fill="#667eea" name="Students" />
                <Area type="monotone" dataKey="companies" stackId="1" stroke="#764ba2" fill="#764ba2" name="Companies" />
                <Area type="monotone" dataKey="coordinators" stackId="1" stroke="#43e97b" fill="#43e97b" name="Coordinators" />
                <Area type="monotone" dataKey="examiners" stackId="1" stroke="#fa709a" fill="#fa709a" name="Examiners" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* System Performance Chart */}
          <div className="chart-container large">
            <div className="chart-header">
              <h3>⚡ System Performance Metrics</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={analytics.systemPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis yAxisId="left" stroke="#666" />
                <YAxis yAxisId="right" orientation="right" stroke="#666" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="throughput" fill="#667eea" name="Throughput" />
                <Line yAxisId="right" type="monotone" dataKey="responseTime" stroke="#764ba2" strokeWidth={3} name="Response Time (s)" />
                <Line yAxisId="right" type="monotone" dataKey="uptime" stroke="#43e97b" strokeWidth={3} name="Uptime (%)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Internship Statistics */}
          <div className="chart-container large">
            <div className="chart-header">
              <h3>🎓 Internship Statistics by Department</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.internshipStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                <Bar dataKey="applied" fill="#667eea" name="Applied" />
                <Bar dataKey="placed" fill="#43e97b" name="Placed" />
                <Line type="monotone" dataKey="successRate" stroke="#fa709a" strokeWidth={3} name="Success Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Company Engagement */}
          <div className="chart-container medium">
            <div className="chart-header">
              <h3>🏢 Company Engagement by Category</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.companyEngagement}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, companies }) => `${category}: ${companies}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="companies"
                >
                  {analytics.companyEngagement.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Report Distribution */}
          <div className="chart-container medium">
            <div className="chart-header">
              <h3>📊 Report Type Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.reportDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Bar dataKey="count" fill="#667eea" name="Reports" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Resource Utilization */}
          <div className="chart-container medium">
            <div className="chart-header">
              <h3>💾 Resource Utilization</h3>
            </div>
            <div className="resource-bars">
              {analytics.resourceUtilization.map((resource, index) => (
                <div key={resource.resource} className="resource-item">
                  <div className="resource-info">
                    <span className="resource-name">{resource.resource}</span>
                    <span className="resource-usage">{resource.used}% used</span>
                  </div>
                  <div className="resource-bar-container">
                    <div className="resource-bar">
                      <div 
                        className="resource-used"
                        style={{ 
                          width: `${resource.used}%`,
                          backgroundColor: resource.used > resource.threshold ? '#dc3545' : COLORS[index % COLORS.length]
                        }}
                      ></div>
                      <div 
                        className="resource-available"
                        style={{ 
                          width: `${resource.available}%`,
                          backgroundColor: '#e0e0e0'
                        }}
                      ></div>
                    </div>
                    <div className="threshold-line" style={{ left: `${resource.threshold}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reports Management */}
      <div className="reports-management">
        <div className="section-header">
          <h2>📋 Generated Reports</h2>
          <div className="section-controls">
            <select 
              value={reportType} 
              onChange={(e) => setReportType(e.target.value)}
              className="filter-selector"
            >
              <option value="all">All Reports</option>
              <option value="performance">Performance</option>
              <option value="analytics">Analytics</option>
              <option value="statistics">Statistics</option>
              <option value="security">Security</option>
              <option value="financial">Financial</option>
            </select>
            <button className="refresh-btn" onClick={() => window.location.reload()}>
              <span>🔄</span> Refresh
            </button>
          </div>
        </div>

        <div className="reports-table">
          <table>
            <thead>
              <tr>
                <th>Report Title</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
                <th>Generated By</th>
                <th>Size</th>
                <th>Downloads</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} className="report-row">
                  <td>
                    <div className="report-title">
                      <h4>{report.title}</h4>
                      <p>{report.description}</p>
                    </div>
                  </td>
                  <td>
                    <span className={`report-type ${report.type.toLowerCase()}`}>
                      {report.type}
                    </span>
                  </td>
                  <td>{report.date}</td>
                  <td>
                    <span className={`status-badge ${report.status.toLowerCase()}`}>
                      {report.status}
                    </span>
                  </td>
                  <td>{report.generatedBy}</td>
                  <td>{report.size}</td>
                  <td>{report.downloads}</td>
                  <td>
                    <div className="report-actions">
                      <button 
                        className="action-btn view"
                        onClick={() => handleViewReportDetails(report)}
                        disabled={report.status !== 'Completed'}
                      >
                        👁️
                      </button>
                      <button 
                        className="action-btn download"
                        onClick={() => handleDownloadReport(report.id)}
                        disabled={report.status !== 'Completed'}
                      >
                        📥
                      </button>
                      <button className="action-btn share">
                        📤
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📊 Report Details</h3>
              <button className="close-btn" onClick={() => setSelectedReport(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="report-details">
                <div className="detail-row">
                  <label>Title:</label>
                  <span>{selectedReport.title}</span>
                </div>
                <div className="detail-row">
                  <label>Type:</label>
                  <span className={`report-type ${selectedReport.type.toLowerCase()}`}>
                    {selectedReport.type}
                  </span>
                </div>
                <div className="detail-row">
                  <label>Status:</label>
                  <span className={`status-badge ${selectedReport.status.toLowerCase()}`}>
                    {selectedReport.status}
                  </span>
                </div>
                <div className="detail-row">
                  <label>Generated By:</label>
                  <span>{selectedReport.generatedBy}</span>
                </div>
                <div className="detail-row">
                  <label>Date:</label>
                  <span>{selectedReport.date}</span>
                </div>
                <div className="detail-row">
                  <label>Size:</label>
                  <span>{selectedReport.size}</span>
                </div>
                <div className="detail-row">
                  <label>Downloads:</label>
                  <span>{selectedReport.downloads}</span>
                </div>
                <div className="detail-row full-width">
                  <label>Description:</label>
                  <p>{selectedReport.description}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-btn primary"
                onClick={() => handleDownloadReport(selectedReport.id)}
                disabled={selectedReport.status !== 'Completed'}
              >
                📥 Download Report
              </button>
              <button 
                className="modal-btn secondary"
                onClick={() => handleGenerateReport(selectedReport.type)}
              >
                🔄 Regenerate
              </button>
              <button className="modal-btn tertiary" onClick={() => setSelectedReport(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
