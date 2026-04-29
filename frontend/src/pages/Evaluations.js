import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Card, Button, Form, Row, Col, Spinner, Alert, Modal } from 'react-bootstrap';
import { evaluationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Evaluations = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [filters, setFilters] = useState({ type: '' });
  const [createForm, setCreateForm] = useState({
    technical_skills: 5,
    communication_skills: 5,
    problem_solving: 5,
    teamwork: 5,
    time_management: 5,
    strengths: '',
    weaknesses: '',
    recommendations: '',
    type: 'midterm',
    evaluation_date: new Date().toISOString().split('T')[0],
    application_id: '',
  });
  
  const { user, hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const canEvaluate = hasPermission('evaluations.student.evaluate');

  const { data: evaluations, isLoading, error } = useQuery(
    ['evaluations', filters],
    () => evaluationAPI.getEvaluations(filters),
    { keepPreviousData: true }
  );

  const createMutation = useMutation(
    (data) => evaluationAPI.createEvaluation(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('evaluations');
        setShowCreateModal(false);
        setCreateForm({
          technical_skills: 5,
          communication_skills: 5,
          problem_solving: 5,
          teamwork: 5,
          time_management: 5,
          strengths: '',
          weaknesses: '',
          recommendations: '',
          type: 'midterm',
          evaluation_date: new Date().toISOString().split('T')[0],
          application_id: '',
        });
      },
    }
  );

  const deleteMutation = useMutation(
    (id) => evaluationAPI.deleteEvaluation(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('evaluations');
      },
    }
  );

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateEvaluation = () => {
    setShowCreateModal(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(createForm);
  };

  const handleViewDetail = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowDetailModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this evaluation?')) {
      deleteMutation.mutate(id);
    }
  };

  const getTypeBadge = (type) => {
    const variant = type === 'final' ? 'danger' : 'warning';
    return <span className={`badge bg-${variant} text-dark`}>{type}</span>;
  };

  const getPerformanceColor = (score) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'danger';
  };

  const getPerformanceBadge = (score) => {
    return <span className={`badge bg-${getPerformanceColor(score)}`}>{score}/10</span>;
  };

  if (error) {
    return <Alert variant="danger">Error loading evaluations: {error.message}</Alert>;
  }

  return (
    <div>
      <div className="page-header text-center">
        <h1 className="mb-0">Evaluations</h1>
        <p className="mb-0">
          {canEvaluate ? 'Evaluate student performance' : 'View evaluation results'}
        </p>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Filters</h5>
            {hasPermission('evaluations.student.evaluate') && (
              <Button variant="primary" onClick={handleCreateEvaluation}>
                Create Evaluation
              </Button>
            )}
          </div>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Type</Form.Label>
                <Form.Select name="type" value={filters.type} onChange={handleFilterChange}>
                  <option value="">All Types</option>
                  <option value="midterm">Midterm</option>
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
            {evaluations?.data?.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Type</th>
                      <th>Overall Score</th>
                      <th>Evaluation Date</th>
                      <th>Examiner</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations.data.map((evaluation) => (
                      <tr key={evaluation.id}>
                        <td>
                          {!canEvaluate ? 'You' : `${evaluation.student?.first_name} ${evaluation.student?.last_name}`}
                        </td>
                        <td>{getTypeBadge(evaluation.type)}</td>
                        <td>{getPerformanceBadge(evaluation.overall_performance)}</td>
                        <td>{new Date(evaluation.evaluation_date).toLocaleDateString()}</td>
                        <td>
                          {canEvaluate ? 'You' : `${evaluation.examiner?.first_name} ${evaluation.examiner?.last_name}`}
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleViewDetail(evaluation)}
                            >
                              View Details
                            </Button>
                            {hasPermission('evaluations.student.evaluate') && evaluation.examiner_id === user.id && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDelete(evaluation.id)}
                                disabled={deleteMutation.isLoading}
                              >
                                Delete
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
                {canEvaluate ? 'No evaluations created yet.' : 'No evaluations found.'}
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Evaluation</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateSubmit}>
          <Modal.Body>
            <Row>
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
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Evaluation Type</Form.Label>
                  <Form.Select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                  >
                    <option value="midterm">Midterm Evaluation</option>
                    <option value="final">Final Evaluation</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Evaluation Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={createForm.evaluation_date}
                    onChange={(e) => setCreateForm({ ...createForm, evaluation_date: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <h6 className="mb-3">Performance Ratings (1-10)</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Technical Skills: {createForm.technical_skills}</Form.Label>
                  <Form.Range
                    min="1"
                    max="10"
                    value={createForm.technical_skills}
                    onChange={(e) => setCreateForm({ ...createForm, technical_skills: parseInt(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Communication Skills: {createForm.communication_skills}</Form.Label>
                  <Form.Range
                    min="1"
                    max="10"
                    value={createForm.communication_skills}
                    onChange={(e) => setCreateForm({ ...createForm, communication_skills: parseInt(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Problem Solving: {createForm.problem_solving}</Form.Label>
                  <Form.Range
                    min="1"
                    max="10"
                    value={createForm.problem_solving}
                    onChange={(e) => setCreateForm({ ...createForm, problem_solving: parseInt(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teamwork: {createForm.teamwork}</Form.Label>
                  <Form.Range
                    min="1"
                    max="10"
                    value={createForm.teamwork}
                    onChange={(e) => setCreateForm({ ...createForm, teamwork: parseInt(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Time Management: {createForm.time_management}</Form.Label>
                  <Form.Range
                    min="1"
                    max="10"
                    value={createForm.time_management}
                    onChange={(e) => setCreateForm({ ...createForm, time_management: parseInt(e.target.value) })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Strengths</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={createForm.strengths}
                onChange={(e) => setCreateForm({ ...createForm, strengths: e.target.value })}
                placeholder="Describe the student's strengths..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Areas for Improvement</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={createForm.weaknesses}
                onChange={(e) => setCreateForm({ ...createForm, weaknesses: e.target.value })}
                placeholder="Describe areas where the student can improve..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Recommendations</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={createForm.recommendations}
                onChange={(e) => setCreateForm({ ...createForm, recommendations: e.target.value })}
                placeholder="Provide recommendations for future development..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={createMutation.isLoading}>
              {createMutation.isLoading ? 'Creating...' : 'Create Evaluation'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Evaluation Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvaluation && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <h6>Student: {selectedEvaluation.student?.first_name} {selectedEvaluation.student?.last_name}</h6>
                  <p className="text-muted">Type: {selectedEvaluation.type}</p>
                  <p className="text-muted">Date: {new Date(selectedEvaluation.evaluation_date).toLocaleDateString()}</p>
                  <p className="text-muted">Examiner: {selectedEvaluation.examiner?.first_name} {selectedEvaluation.examiner?.last_name}</p>
                </Col>
                <Col md={6}>
                  <h6>Overall Performance: {getPerformanceBadge(selectedEvaluation.overall_performance)}</h6>
                </Col>
              </Row>

              <h6 className="mb-3">Performance Breakdown</h6>
              <Row className="mb-4">
                <Col md={6}>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Technical Skills:</span>
                    {getPerformanceBadge(selectedEvaluation.technical_skills)}
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Communication Skills:</span>
                    {getPerformanceBadge(selectedEvaluation.communication_skills)}
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Problem Solving:</span>
                    {getPerformanceBadge(selectedEvaluation.problem_solving)}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Teamwork:</span>
                    {getPerformanceBadge(selectedEvaluation.teamwork)}
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Time Management:</span>
                    {getPerformanceBadge(selectedEvaluation.time_management)}
                  </div>
                </Col>
              </Row>

              {selectedEvaluation.strengths && (
                <div className="mb-3">
                  <h6>Strengths</h6>
                  <div className="bg-light p-3 rounded">{selectedEvaluation.strengths}</div>
                </div>
              )}

              {selectedEvaluation.weaknesses && (
                <div className="mb-3">
                  <h6>Areas for Improvement</h6>
                  <div className="bg-light p-3 rounded">{selectedEvaluation.weaknesses}</div>
                </div>
              )}

              {selectedEvaluation.recommendations && (
                <div className="mb-3">
                  <h6>Recommendations</h6>
                  <div className="bg-light p-3 rounded">{selectedEvaluation.recommendations}</div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Evaluations;
