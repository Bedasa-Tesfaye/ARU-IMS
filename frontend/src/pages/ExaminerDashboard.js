import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ExaminerDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reportsRes, evaluationsRes] = await Promise.all([
        api.get('/reports'),
        api.get('/evaluations'),
      ]);
      setReports(reportsRes.data.data || []);
      setEvaluations(evaluationsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewReport = async (reportId, status) => {
    try {
      await api.post(`/reports/${reportId}/review`, { status });
      fetchData();
    } catch (error) {
      console.error('Error reviewing report:', error);
    }
  };

  const handleSubmitEvaluation = async (reportId, evaluationData) => {
    try {
      await api.post('/evaluations', {
        report_id: reportId,
        ...evaluationData
      });
      fetchData();
    } catch (error) {
      console.error('Error submitting evaluation:', error);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'success',
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      submitted: 'info',
      reviewed: 'primary'
    };
    return <Badge bg={colors[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return <Container className="py-5"><div>Loading...</div></Container>;
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Examiner Dashboard</h2>
        <span className="text-muted">Welcome, {user?.first_name}!</span>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-icon bg-primary">📝</div>
              <div className="stat-info">
                <h3>{reports.length}</h3>
                <p>Total Reports</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-icon bg-warning">⏳</div>
              <div className="stat-info">
                <h3>{reports.filter(r => r.status === 'submitted').length}</h3>
                <p>Pending Review</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-icon bg-success">✅</div>
              <div className="stat-info">
                <h3>{reports.filter(r => r.status === 'reviewed').length}</h3>
                <p>Reviewed</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-icon bg-info">📊</div>
              <div className="stat-info">
                <h3>{evaluations.length}</h3>
                <p>Evaluations Given</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reports')}
                  >
                    Reports to Review
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'evaluations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('evaluations')}
                  >
                    My Evaluations
                  </button>
                </li>
              </ul>
            </Card.Header>
            <Card.Body>
              {activeTab === 'overview' && (
                <div>
                  <h5>Examiner Overview</h5>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong>Your Role:</strong> Examiner
                      </div>
                      <div className="mb-3">
                        <strong>Review student reports and provide feedback and evaluations.</strong>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              {activeTab === 'reports' && (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Internship</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id}>
                        <td>{report.user?.first_name} {report.user?.last_name}</td>
                        <td>{report.internship?.title}</td>
                        <td>{getStatusBadge(report.status)}</td>
                        <td>{new Date(report.created_at).toLocaleDateString()}</td>
                        <td>
                          {report.status === 'submitted' && (
                            <>
                              <Button 
                                variant="success" 
                                size="sm" 
                                className="me-2"
                                onClick={() => handleReviewReport(report.id, 'reviewed')}
                              >
                                Review
                              </Button>
                            </>
                          )}
                          <Button variant="info" size="sm">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              {activeTab === 'evaluations' && (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Report</th>
                      <th>Score</th>
                      <th>Feedback</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations.map((eval_) => (
                      <tr key={eval_.id}>
                        <td>{eval_.report?.user?.first_name} {eval_.report?.user?.last_name}</td>
                        <td>{eval_.report?.title}</td>
                        <td>{eval_.score}/100</td>
                        <td>{eval_.feedback?.substring(0, 50)}...</td>
                        <td>{new Date(eval_.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ExaminerDashboard;