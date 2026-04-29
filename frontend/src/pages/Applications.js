import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Card, Button, Form, Row, Col, Spinner, Alert, Modal } from 'react-bootstrap';
import { applicationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Applications = () => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [filters, setFilters] = useState({ status: '' });
  
  const { user, hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const canWithdraw = hasPermission('applications.withdraw');

  const { data: applications, isLoading, error } = useQuery(
    ['applications', filters],
    () => applicationAPI.getApplications(filters),
    { keepPreviousData: true }
  );

  const approveMutation = useMutation(
    (id) => applicationAPI.approveApplication(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('applications');
      },
    }
  );

  const rejectMutation = useMutation(
    ({ id, reason }) => applicationAPI.rejectApplication(id, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('applications');
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedApplication(null);
      },
    }
  );

  const withdrawMutation = useMutation(
    (id) => applicationAPI.withdrawApplication(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('applications');
      },
    }
  );

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleApprove = (id) => {
    if (window.confirm('Are you sure you want to approve this application?')) {
      approveMutation.mutate(id);
    }
  };

  const handleReject = (application) => {
    setSelectedApplication(application);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    rejectMutation.mutate({
      id: selectedApplication.id,
      reason: rejectReason,
    });
  };

  const handleWithdraw = (id) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      withdrawMutation.mutate(id);
    }
  };

  const getStatusBadge = (status) => {
    return <span className={`status-badge status-${status}`}>{status}</span>;
  };

  if (error) {
    return <Alert variant="danger">Error loading applications: {error.message}</Alert>;
  }

  return (
    <div>
      <div className="page-header text-center">
        <h1 className="mb-0">Applications</h1>
        <p className="mb-0">
          {canWithdraw ? 'Your internship applications' : 'Manage internship applications'}
        </p>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">Filters</h5>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
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
            {applications?.data?.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Internship</th>
                      <th>Company</th>
                      <th>Applied Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.data.map((application) => (
                      <tr key={application.id}>
                        <td>
                          {canWithdraw ? 'You' : `${application.student?.first_name} ${application.student?.last_name}`}
                        </td>
                        <td>
                          <div>
                            <strong>{application.internship?.title}</strong>
                            <br />
                            <small className="text-muted">{application.internship?.type}</small>
                          </div>
                        </td>
                        <td>{application.internship?.company?.name}</td>
                        <td>{new Date(application.applied_date).toLocaleDateString()}</td>
                        <td>{getStatusBadge(application.status)}</td>
                        <td>
                          <div className="btn-group" role="group">
                            {hasPermission('applications.withdraw') && application.status === 'pending' && (
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => handleWithdraw(application.id)}
                                disabled={withdrawMutation.isLoading}
                              >
                                Withdraw
                              </Button>
                            )}
                            
                            {application.status === 'pending' && (
                              <>
                                {hasPermission('applications.approve') && (
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => handleApprove(application.id)}
                                    disabled={approveMutation.isLoading}
                                  >
                                    Approve
                                  </Button>
                                )}
                                {hasPermission('applications.reject') && (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleReject(application)}
                                    disabled={rejectMutation.isLoading}
                                  >
                                    Reject
                                  </Button>
                                )}
                              </>
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
                {canWithdraw ? 'You have not applied for any internships yet.' : 'No applications found.'}
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}

      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Application</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRejectSubmit}>
          <Modal.Body>
            {selectedApplication && (
              <div className="mb-3">
                <h6>{selectedApplication.student?.first_name} {selectedApplication.student?.last_name}</h6>
                <p className="text-muted mb-0">{selectedApplication.internship?.title}</p>
              </div>
            )}

            <Form.Group>
              <Form.Label>Rejection Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" disabled={rejectMutation.isLoading}>
              {rejectMutation.isLoading ? 'Rejecting...' : 'Reject Application'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Applications;
