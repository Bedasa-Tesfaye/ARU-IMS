import React, { useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import './coordinator.css';

export default function CoordinatorAssignmentsPage() {
  const { hasPermission } = useAuth();
  const canAssignExaminer = hasPermission('assignments.examiner.assign');
  const canAssignAdvisor = hasPermission('assignments.advisor.assign');

  const [selectedStudentId, setSelectedStudentId] = useState('101');
  const [examinerId, setExaminerId] = useState('501');
  const [advisorId, setAdvisorId] = useState('601');
  const [notice, setNotice] = useState('');

  const students = useMemo(
    () => [
      { id: '101', name: 'Demo Student A', year: '3rd', status: 'Unassigned' },
      { id: '102', name: 'Demo Student B', year: '4th', status: 'Examiner assigned' },
      { id: '103', name: 'Demo Student C', year: '3rd', status: 'Advisor assigned' },
    ],
    []
  );

  const examiners = useMemo(
    () => [
      { id: '501', name: 'Demo Examiner 1' },
      { id: '502', name: 'Demo Examiner 2' },
    ],
    []
  );

  const advisors = useMemo(
    () => [
      { id: '601', name: 'Demo Advisor 1' },
      { id: '602', name: 'Demo Advisor 2' },
    ],
    []
  );

  const assign = (type) => {
    // Backend endpoints can be added next; this is UI + permission gating.
    setNotice(`${type} assignment saved (UI). Hook endpoint next.`);
    setTimeout(() => setNotice(''), 2500);
  };

  return (
    <div className="coord-page">
      <div className="coord-pagehead">
        <div>
          <h2 className="coord-h2">Assignments</h2>
          <div className="coord-sub">Assign examiners and advisors to students (department scoped).</div>
        </div>
        <Badge bg="secondary">UI ready</Badge>
      </div>

      {notice ? <Alert variant="success">{notice}</Alert> : null}

      <Row className="g-3">
        <Col lg={7}>
          <Card className="coord-card">
            <Card.Body>
              <div className="coord-card-head">
                <div>
                  <div className="coord-card-title">Student list</div>
                  <div className="coord-card-sub">Assignment status overview.</div>
                </div>
              </div>

              <div className="coord-tablewrap">
                <Table hover responsive className="coord-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student</th>
                      <th>Year</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr
                        key={s.id}
                        className={selectedStudentId === s.id ? 'coord-row-active' : ''}
                        onClick={() => setSelectedStudentId(s.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{s.id}</td>
                        <td>{s.name}</td>
                        <td>{s.year}</td>
                        <td>
                          <span className="coord-pill">{s.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="coord-card">
            <Card.Body>
              <div className="coord-card-head">
                <div>
                  <div className="coord-card-title">Quick assignment</div>
                  <div className="coord-card-sub">Pick a student then assign.</div>
                </div>
              </div>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Selected student</Form.Label>
                  <Form.Control value={selectedStudentId} disabled />
                </Form.Group>

                <div className="coord-group mb-3">
                  <div className="coord-group-title">Assign examiner</div>
                  <Row className="g-2 align-items-end">
                    <Col>
                      <Form.Select value={examinerId} onChange={(e) => setExaminerId(e.target.value)}>
                        {examiners.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col xs="auto">
                      <Button disabled={!canAssignExaminer} onClick={() => assign(`Examiner ${examinerId}`)}>
                        Assign
                      </Button>
                    </Col>
                  </Row>
                  {!canAssignExaminer ? (
                    <div className="coord-muted mt-2">Not permitted by matrix: `assignments.examiner.assign`</div>
                  ) : null}
                </div>

                <div className="coord-group">
                  <div className="coord-group-title">Assign advisor</div>
                  <Row className="g-2 align-items-end">
                    <Col>
                      <Form.Select value={advisorId} onChange={(e) => setAdvisorId(e.target.value)}>
                        {advisors.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col xs="auto">
                      <Button variant="outline-primary" disabled={!canAssignAdvisor} onClick={() => assign(`Advisor ${advisorId}`)}>
                        Assign
                      </Button>
                    </Col>
                  </Row>
                  {!canAssignAdvisor ? (
                    <div className="coord-muted mt-2">Not permitted by matrix: `assignments.advisor.assign`</div>
                  ) : null}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

