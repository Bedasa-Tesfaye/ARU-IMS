import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Card, Button, Form, Row, Col, Spinner, Alert, Modal } from 'react-bootstrap';
import { internshipAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Internships = () => {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [applyForm, setApplyForm] = useState({ cover_letter: '', resume_path: '' });
  const [filters, setFilters] = useState({ status: '', type: '', location: '' });
  
  const { user, hasPermission } = useAuth();
  const queryClient = useQueryClient();

  const { data: internships, isLoading, error } = useQuery(
    ['internships', filters],
    () => internshipAPI.getInternships(filters),
    { keepPreviousData: true }
  );

  const internshipsList = React.useMemo(() => {
    const payload = internships?.data;

    if (Array.isArray(payload)) {
      return payload;
    }

    // Handle Laravel paginator shape: { data: [...] }
    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    // Handle wrapped shape: { success: true, data: { data: [...] } }
    if (Array.isArray(payload?.data?.data)) {
      return payload.data.data;
    }

    return [];
  }, [internships]);

  const applyMutation = useMutation(
    ({ id, data }) => internshipAPI.applyToInternship(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('internships');
        setShowApplyModal(false);
        setApplyForm({ cover_letter: '', resume_path: '' });
        setSelectedInternship(null);
      },
    }
  );

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleApply = (internship) => {
    setSelectedInternship(internship);
    setShowApplyModal(true);
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    applyMutation.mutate({
      id: selectedInternship.id,
      data: applyForm,
    });
  };

  const getStatusBadge = (status) => {
    const variant = status === 'active' ? 'success' : status === 'closed' ? 'danger' : 'secondary';
    return <span className={`status-badge status-${status}`}>{status}</span>;
  };

  const getTypeBadge = (type) => {
    return <span className="badge bg-info text-dark">{type}</span>;
  };

  if (error) {
    return <Alert variant="danger">Error loading internships: {error.message}</Alert>;
  }

  return (
    <div>
      <div className="page-header text-center">
        <h1 className="mb-0">Internships</h1>
        <p className="mb-0">Browse and apply for internship opportunities</p>
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
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Type</Form.Label>
                <Form.Select name="type" value={filters.type} onChange={handleFilterChange}>
                  <option value="">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Enter location"
                />
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
        <Row>
          {internshipsList.map((internship) => (
            <Col md={6} lg={4} className="mb-4" key={internship.id}>
              <Card className="h-100">
                <Card.Body className="d-flex flex-column">
                  <div className="mb-2">
                    <h5 className="mb-2">{internship.title}</h5>
                    <p className="text-muted mb-2">{internship.company?.name}</p>
                  </div>
                  
                  <div className="mb-3">
                    {getStatusBadge(internship.status)}
                    <span className="ms-2">{getTypeBadge(internship.type)}</span>
                  </div>

                  <p className="flex-grow-1">
                    {internship.description?.substring(0, 150)}
                    {internship.description?.length > 150 && '...'}
                  </p>

                  <div className="mb-3">
                    <small className="text-muted">
                      <div>📍 {internship.location}</div>
                      <div>⏱️ {internship.duration_weeks} weeks</div>
                      <div>💰 ${internship.stipend || 'Unpaid'}</div>
                      <div>👥 {internship.current_applicants}/{internship.max_applicants} applicants</div>
                    </small>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      Starts: {new Date(internship.start_date).toLocaleDateString()}
                    </small>
                    {hasPermission('applications.apply') && internship.is_available && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApply(internship)}
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}

          {internshipsList.length === 0 && (
            <Col>
              <Alert variant="info">No internships found matching your criteria.</Alert>
            </Col>
          )}
        </Row>
      )}

      <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Apply for Internship</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleApplySubmit}>
          <Modal.Body>
            {selectedInternship && (
              <div className="mb-3">
                <h6>{selectedInternship.title}</h6>
                <p className="text-muted mb-0">{selectedInternship.company?.name}</p>
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Cover Letter</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="cover_letter"
                value={applyForm.cover_letter}
                onChange={(e) => setApplyForm({ ...applyForm, cover_letter: e.target.value })}
                placeholder="Tell us why you're interested in this internship..."
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Resume Path (Optional)</Form.Label>
              <Form.Control
                type="text"
                name="resume_path"
                value={applyForm.resume_path}
                onChange={(e) => setApplyForm({ ...applyForm, resume_path: e.target.value })}
                placeholder="Path to your resume file"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowApplyModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={applyMutation.isLoading}>
              {applyMutation.isLoading ? 'Applying...' : 'Submit Application'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Internships;
