import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Card, Button, Form, Row, Col, Spinner, Alert, Modal } from 'react-bootstrap';
import { reportAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Reports = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState({ status: '', type: '' });
  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    type: 'weekly',
    report_date: new Date().toISOString().split('T')[0],
    application_id: '',
  });
  const [reviewForm, setReviewForm] = useState({
    feedback: '',
    status: 'reviewed',
  });
  
  const { user, hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const canSubmitReports = hasPermission('reports.weekly.submit');

  const { data: reports, isLoading, error } = useQuery(
    ['reports', filters],
    () => reportAPI.getReports(filters),
    { keepPreviousData: true }
  );

  const createMutation = useMutation(
    (data) => reportAPI.createReport(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('reports');
        setShowCreateModal(false);
        setCreateForm({
          title: '',
          content: '',
          type: 'weekly',
          report_date: new Date().toISOString().split('T')[0],
          application_id: '',
        });
      },
    }
  );

  const reviewMutation = useMutation(
    ({ id, data }) => reportAPI.reviewReport(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('reports');
        setShowReviewModal(false);
        setReviewForm({ feedback: '', status: 'reviewed' });
        setSelectedReport(null);
      },
    }
  );

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateReport = () => {
    setShowCreateModal(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(createForm);
  };

  const handleReview = (report) => {
    setSelectedReport(report);
    setShowReviewModal(true);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    reviewMutation.mutate({
      id: selectedReport.id,
      data: reviewForm,
    });
  };

  const getStatusBadge = (status) => {
    return <span className={`status-badge status-${status}`}>{status}</span>;
  };

  const getTypeBadge = (type) => {
    const variant = type === 'final' ? 'danger' : type === 'monthly' ? 'warning' : 'info';
    return <span className={`badge bg-${variant} text-dark`}>{type}</span>;
  };

  if (error) {
    return <Alert variant="danger">Error loading reports: {error.message}</Alert>;
  }

  return (
    <div>
      <div className="page-header text-center">
        <h1 className="mb-0">Reports</h1>
        <p className="mb-0">
          {canSubmitReports ? 'Submit and track your internship reports' : 'Review and evaluate student reports'}
        </p>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Filters</h5>
            {hasPermission('reports.weekly.submit') && (
              <Button variant="primary" onClick={handleCreateReport}>
                Submit New Report
              </Button>
            )}
          </div>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                  <option value="">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Type</Form.Label>
                <Form.Select name="type" value={filters.type} onChange={handleFilterChange}>
                  <option value="">All Types</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="final">Final</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Card>
          <Card.Body>
            {reports?.data?.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Student</th>
                      <th>Type</th>
                      <th>Report Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.data.map((report) => (
                      <tr key={report.id}>
                        <td>
                          <div>
                            <strong>{report.title}</strong>
                            {report.feedback && (
                              <div>
                                <small className="text-muted">Has feedback</small>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          {canSubmitReports ? 'You' : `${report.student?.first_name} ${report.student?.last_name}`}
                        </td>
                        <td>{getTypeBadge(report.type)}</td>
                        <td>{new Date(report.report_date).toLocaleDateString()}</td>
                        <td>{getStatusBadge(report.status)}</td>
                        <td>
                          <div className="btn-group" role="group">
                            {hasPermission('reports.review') && report.status === 'submitted' && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleReview(report)}
                                disabled={reviewMutation.isLoading}
                              >
                                Review
                              </Button>
                            )}
                            
                            {hasPermission('reports.weekly.submit') && report.status === 'submitted' && (
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                disabled
                              >
                                Pending Review
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Alert variant="info">
                {canSubmitReports ? 'You have not submitted any reports yet.' : 'No reports found.'}
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Submit New Report</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Report Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    placeholder="Enter report title"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Report Type</Form.Label>
                  <Form.Select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                  >
                    <option value="weekly">Weekly Report</option>
                    <option value="monthly">Monthly Report</option>
                    <option value="final">Final Report</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Report Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={createForm.report_date}
                    onChange={(e) => setCreateForm({ ...createForm, report_date: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Application ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={createForm.application_id}
                    onChange={(e) => setCreateForm({ ...createForm, application_id: e.target.value })}
                    placeholder="Enter application ID"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Report Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={createForm.content}
                onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                placeholder="Enter your report content..."
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={createMutation.isLoading}>
              {createMutation.isLoading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Review Report</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleReviewSubmit}>
          <Modal.Body>
            {selectedReport && (
              <div className="mb-3">
                <h6>{selectedReport.title}</h6>
                <p className="text-muted mb-2">
                  {selectedReport.student?.first_name} {selectedReport.student?.last_name} • {selectedReport.type}
                </p>
                <div className="bg-light p-3 rounded">
                  <small>{selectedReport.content?.substring(0, 200)}...</small>
                </div>
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Review Status</Form.Label>
              <Form.Select
                value={reviewForm.status}
                onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
              >
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Feedback</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={reviewForm.feedback}
                onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                placeholder="Provide feedback on the report..."
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={reviewMutation.isLoading}>
              {reviewMutation.isLoading ? 'Reviewing...' : 'Submit Review'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Reports;
