import React, { useState, useEffect } from 'react';
import './ApproveRequests.css';

const ApproveRequests = ({ onBack }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Simulate API call for requests data
    setTimeout(() => {
      const mockRequests = generateMockRequests();
      setRequests(mockRequests);
      setLoading(false);
    }, 1000);
  }, []);

  const generateMockRequests = () => {
    return [
      {
        id: 1,
        type: 'user_registration',
        title: 'New Student Registration',
        applicant: 'Abebe Kebede',
        email: 'abebe.kebede@aru.edu.et',
        role: 'student',
        department: 'Computer Science',
        submittedDate: '2024-06-15',
        status: 'pending',
        priority: 'normal',
        description: 'Student seeking registration for internship program',
        details: {
          studentId: 'ARU/2024/CS/001',
          year: '3rd Year',
          gpa: '3.6',
          phoneNumber: '+251 91 234 5678'
        }
      },
      {
        id: 2,
        type: 'company_registration',
        title: 'New Company Partnership',
        applicant: 'Ethiopian Airlines',
        email: 'hr@ethiopianairlines.com',
        role: 'company',
        department: 'Aviation',
        submittedDate: '2024-06-14',
        status: 'pending',
        priority: 'high',
        description: 'Company seeking partnership for internship placements',
        details: {
          industry: 'Aviation',
          location: 'Addis Ababa',
          website: 'www.ethiopianairlines.com',
          contactPerson: 'HR Manager'
        }
      },
      {
        id: 3,
        type: 'internship_application',
        title: 'Internship Application Review',
        applicant: 'Chala Lemma',
        email: 'chala.lemma@aru.edu.et',
        role: 'student',
        department: 'Information Technology',
        submittedDate: '2024-06-13',
        status: 'pending',
        priority: 'normal',
        description: 'Student application for internship position',
        details: {
          position: 'Software Developer Intern',
          company: 'Ethiotelecom',
          duration: '3 months',
          startDate: '2024-07-01'
        }
      },
      {
        id: 4,
        type: 'report_submission',
        title: 'Internship Report Review',
        applicant: 'Tigist Haile',
        email: 'tigist.haile@aru.edu.et',
        role: 'student',
        department: 'Software Engineering',
        submittedDate: '2024-06-12',
        status: 'pending',
        priority: 'normal',
        description: 'Monthly internship report for review',
        details: {
          reportType: 'Monthly Progress Report',
          month: 'May 2024',
          company: 'Commercial Bank',
          supervisor: 'John Smith'
        }
      },
      {
        id: 5,
        type: 'user_registration',
        title: 'New Company Registration',
        applicant: 'Commercial Bank of Ethiopia',
        email: 'careers@combank.et',
        role: 'company',
        department: 'Banking',
        submittedDate: '2024-06-11',
        status: 'approved',
        priority: 'high',
        description: 'Company registration approved',
        details: {
          industry: 'Banking',
          location: 'Addis Ababa',
          website: 'www.combank.et',
          contactPerson: 'HR Director'
        }
      },
      {
        id: 6,
        type: 'system_change',
        title: 'System Configuration Update',
        applicant: 'System Admin',
        email: 'admin@aru.edu.et',
        role: 'admin',
        department: 'IT Department',
        submittedDate: '2024-06-10',
        status: 'rejected',
        priority: 'critical',
        description: 'Request for system configuration changes',
        details: {
          changeType: 'Security Policy Update',
          reason: 'Enhanced security requirements',
          impact: 'All users'
        }
      }
    ];
  };

  const filteredRequests = requests.filter(request => {
    if (selectedTab === 'all') return true;
    return request.status === selectedTab;
  });

  const handleApprove = (requestId) => {
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { ...request, status: 'approved', approvedDate: new Date().toISOString().split('T')[0] }
        : request
    ));
    addNotification('Request approved successfully!', 'success');
  };

  const handleReject = (requestId, reason) => {
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { ...request, status: 'rejected', rejectedDate: new Date().toISOString().split('T')[0], rejectionReason: reason }
        : request
    ));
    addNotification('Request rejected!', 'info');
  };

  const addNotification = (message, type) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const getTypeIcon = (type) => {
    const icons = {
      user_registration: '👤',
      company_registration: '🏢',
      internship_application: '📋',
      report_submission: '📄',
      system_change: '⚙️'
    };
    return icons[type] || '📋';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: '#dc3545',
      high: '#fd7e14',
      normal: '#28a745',
      low: '#6c757d'
    };
    return colors[priority] || '#6c757d';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      approved: '#28a745',
      rejected: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const renderRequestDetails = (request) => {
    const details = request.details || {};
    
    switch (request.type) {
      case 'user_registration':
        return (
          <div className="request-details">
            <div className="detail-item">
              <label>Student ID:</label>
              <span>{details.studentId || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Year:</label>
              <span>{details.year || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>GPA:</label>
              <span>{details.gpa || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Phone:</label>
              <span>{details.phoneNumber || 'N/A'}</span>
            </div>
          </div>
        );
      case 'company_registration':
        return (
          <div className="request-details">
            <div className="detail-item">
              <label>Industry:</label>
              <span>{details.industry || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Location:</label>
              <span>{details.location || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Website:</label>
              <span>{details.website || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Contact Person:</label>
              <span>{details.contactPerson || 'N/A'}</span>
            </div>
          </div>
        );
      case 'internship_application':
        return (
          <div className="request-details">
            <div className="detail-item">
              <label>Position:</label>
              <span>{details.position || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Company:</label>
              <span>{details.company || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Duration:</label>
              <span>{details.duration || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Start Date:</label>
              <span>{details.startDate || 'N/A'}</span>
            </div>
          </div>
        );
      case 'report_submission':
        return (
          <div className="request-details">
            <div className="detail-item">
              <label>Report Type:</label>
              <span>{details.reportType || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Month:</label>
              <span>{details.month || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Company:</label>
              <span>{details.company || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Supervisor:</label>
              <span>{details.supervisor || 'N/A'}</span>
            </div>
          </div>
        );
      case 'system_change':
        return (
          <div className="request-details">
            <div className="detail-item">
              <label>Change Type:</label>
              <span>{details.changeType || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Reason:</label>
              <span>{details.reason || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Impact:</label>
              <span>{details.impact || 'N/A'}</span>
            </div>
          </div>
        );
      default:
        return (
          <div className="request-details">
            <p>No additional details available</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="approve-requests-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading approval requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="approve-requests">
      <div className="requests-header">
        <div className="header-content">
          <button className="back-btn" onClick={onBack}>
            <span>←</span> Back to Dashboard
          </button>
          <h1>📋 Approve Requests</h1>
          <p>Review and approve pending requests from users and system</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{requests.filter(r => r.status === 'pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{requests.filter(r => r.status === 'approved').length}</span>
            <span className="stat-label">Approved</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{requests.filter(r => r.status === 'rejected').length}</span>
            <span className="stat-label">Rejected</span>
          </div>
        </div>
      </div>

      {/* Request Tabs */}
      <div className="request-tabs">
        <div className="tab-navigation">
          <button
            className={`tab-btn ${selectedTab === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedTab('all')}
          >
            All Requests ({requests.length})
          </button>
          <button
            className={`tab-btn ${selectedTab === 'pending' ? 'active' : ''}`}
            onClick={() => setSelectedTab('pending')}
          >
            Pending ({requests.filter(r => r.status === 'pending').length})
          </button>
          <button
            className={`tab-btn ${selectedTab === 'approved' ? 'active' : ''}`}
            onClick={() => setSelectedTab('approved')}
          >
            Approved ({requests.filter(r => r.status === 'approved').length})
          </button>
          <button
            className={`tab-btn ${selectedTab === 'rejected' ? 'active' : ''}`}
            onClick={() => setSelectedTab('rejected')}
          >
            Rejected ({requests.filter(r => r.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="requests-list">
        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No requests found</h3>
            <p>There are no requests in this category</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <div className="request-type">
                  <span className="type-icon">{getTypeIcon(request.type)}</span>
                  <div className="type-info">
                    <h3>{request.title}</h3>
                    <p>{request.description}</p>
                  </div>
                </div>
                <div className="request-meta">
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(request.priority) }}
                  >
                    {request.priority.toUpperCase()}
                  </span>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(request.status) }}
                  >
                    {request.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="request-content">
                <div className="applicant-info">
                  <div className="applicant-details">
                    <h4>{request.applicant}</h4>
                    <p>{request.email}</p>
                    <span className="role-badge">{request.role}</span>
                    <span className="department-badge">{request.department}</span>
                  </div>
                  <div className="submission-info">
                    <p>Submitted: {request.submittedDate}</p>
                    {request.approvedDate && <p>Approved: {request.approvedDate}</p>}
                    {request.rejectedDate && <p>Rejected: {request.rejectedDate}</p>}
                  </div>
                </div>

                <div className="request-expanded-details">
                  {renderRequestDetails(request)}
                </div>

                {request.rejectionReason && (
                  <div className="rejection-reason">
                    <label>Rejection Reason:</label>
                    <p>{request.rejectionReason}</p>
                  </div>
                )}
              </div>

              {request.status === 'pending' && (
                <div className="request-actions">
                  <button 
                    className="action-btn approve"
                    onClick={() => handleApprove(request.id)}
                  >
                    ✅ Approve
                  </button>
                  <button 
                    className="action-btn reject"
                    onClick={() => {
                      const reason = prompt('Please provide rejection reason:');
                      if (reason) {
                        handleReject(request.id, reason);
                      }
                    }}
                  >
                    ❌ Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

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

export default ApproveRequests;
