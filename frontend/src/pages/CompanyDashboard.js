import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInternship, setNewInternship] = useState({
    title: '',
    description: '',
    location: '',
    type: 'full-time',
    duration_weeks: 12,
    stipend: 0,
    start_date: '',
    end_date: '',
    requirements: '',
    responsibilities: '',
    max_applicants: 5
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [internshipsRes, applicationsRes, reportsRes] = await Promise.all([
        api.get('/internships'),
        api.get('/applications'),
        api.get('/reports'),
      ]);
      setInternships(internshipsRes.data.data || []);
      setApplications(applicationsRes.data.data || []);
      setReports(reportsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInternship = async (e) => {
    e.preventDefault();
    try {
      await api.post('/internships', newInternship);
      setShowCreateModal(false);
      fetchData();
      setNewInternship({
        title: '',
        description: '',
        location: '',
        type: 'full-time',
        duration_weeks: 12,
        stipend: 0,
        start_date: '',
        end_date: '',
        requirements: '',
        responsibilities: '',
        max_applicants: 5
      });
    } catch (error) {
      console.error('Error creating internship:', error);
    }
  };

  const handleReviewApplication = async (applicationId, status) => {
    try {
      const endpoint = status === 'approved' ? 'approve' : 'reject';
      await api.post(`/applications/${applicationId}/${endpoint}`);
      fetchData();
    } catch (error) {
      console.error('Error reviewing application:', error);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'success',
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      submitted: 'info'
    };
    return <Badge bg={colors[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return <Container className="py-5"><div>Loading...</div></Container>;
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Company Dashboard</h2>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + Post Internship
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-icon bg-primary">📋</div>
              <div className="stat-info">
                <h3>{internships.length}</h3>
                <p>Posted Internships</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-icon bg-warning">⏳</div>
              <div className="stat-info">
                <h3>{applications.filter(a => a.status === 'pending').length}</h3>
                <p>Pending Applications</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-icon bg-success">✅</div>
              <div className="stat-info">
                <h3>{applications.filter(a => a.status === 'approved').length}</h3>
                <p>Hired Interns</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-icon bg-info">📝</div>
              <div className="stat-info">
                <h3>{reports.length}</h3>
                <p>Reports Received</p>
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
                    className={`nav-link ${activeTab === 'applications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('applications')}
                  >
                    Applications
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'internships' ? 'active' : ''}`}
                    onClick={() => setActiveTab('internships')}
                  >
                    My Internships
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reports')}
                  >
                    Reports
                  </button>
                </li>
              </ul>
            </Card.Header>
            <Card.Body>
              {activeTab === 'overview' && (
                <div>
                  <h5>Company Overview</h5>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong>Your Role:</strong> Company Representative
                      </div>
                      <div className="mb-3">
                        <strong>Post opportunities, review applications, and evaluate interns.</strong>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              {activeTab === 'applications' && (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Internship</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id}>
                        <td>{app.user?.first_name} {app.user?.last_name}</td>
                        <td>{app.internship?.title}</td>
                        <td>{getStatusBadge(app.status)}</td>
                        <td>{new Date(app.created_at).toLocaleDateString()}</td>
                        <td>
                          {app.status === 'pending' && (
                            <>
                              <Button 
                                variant="success" 
                                size="sm" 
                                className="me-2"
                                onClick={() => handleReviewApplication(app.id, 'approved')}
                              >
                                Accept
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => handleReviewApplication(app.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              {activeTab === 'internships' && (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Location</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Applicants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {internships.map((intern) => (
                      <tr key={intern.id}>
                        <td>{intern.title}</td>
                        <td>{intern.location}</td>
                        <td>{intern.type}</td>
                        <td>{getStatusBadge(intern.status)}</td>
                        <td>{intern.current_applicants}/{intern.max_applicants}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              {activeTab === 'reports' && (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Internship</th>
                      <th>Status</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id}>
                        <td>{report.user?.first_name} {report.user?.last_name}</td>
                        <td>{report.internship?.title}</td>
                        <td>{getStatusBadge(report.status)}</td>
                        <td>{new Date(report.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Create Internship Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Post New Internship</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <Form onSubmit={handleCreateInternship}>
                <div className="modal-body">
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                          type="text"
                          value={newInternship.title}
                          onChange={(e) => setNewInternship({...newInternship, title: e.target.value})}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Location</Form.Label>
                        <Form.Control
                          type="text"
                          value={newInternship.location}
                          onChange={(e) => setNewInternship({...newInternship, location: e.target.value})}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={newInternship.description}
                      onChange={(e) => setNewInternship({...newInternship, description: e.target.value})}
                      required
                    />
                  </Form.Group>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Type</Form.Label>
                        <Form.Select
                          value={newInternship.type}
                          onChange={(e) => setNewInternship({...newInternship, type: e.target.value})}
                        >
                          <option value="full-time">Full Time</option>
                          <option value="part-time">Part Time</option>
                          <option value="remote">Remote</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Duration (weeks)</Form.Label>
                        <Form.Control
                          type="number"
                          value={newInternship.duration_weeks}
                          onChange={(e) => setNewInternship({...newInternship, duration_weeks: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Stipend</Form.Label>
                        <Form.Control
                          type="number"
                          value={newInternship.stipend}
                          onChange={(e) => setNewInternship({...newInternship, stipend: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Max Applicants</Form.Label>
                        <Form.Control
                          type="number"
                          value={newInternship.max_applicants}
                          onChange={(e) => setNewInternship({...newInternship, max_applicants: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
                <div className="modal-footer">
                  <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button variant="primary" type="submit">Post Internship</Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default CompanyDashboard;