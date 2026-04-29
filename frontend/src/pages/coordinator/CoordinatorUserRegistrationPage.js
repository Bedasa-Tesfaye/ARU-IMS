import React, { useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Tab, Tabs } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './coordinator.css';

const ROLE_CARDS = [
  { key: 'student', title: 'Student', icon: '🎓', desc: 'Register eligible students in your department.' },
  { key: 'examiner', title: 'Examiner', icon: '👨‍🏫', desc: 'Add an examiner to evaluate and review reports.' },
  { key: 'advisor', title: 'Advisor', icon: '👨‍💼', desc: 'Add an advisor for assigned student guidance.' },
];

export default function CoordinatorUserRegistrationPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('users.create');

  const [mode, setMode] = useState('single');
  const [role, setRole] = useState('student');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'student',
    verification_confirmed: false,
  });

  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v, role }));

  const roleMeta = useMemo(() => ROLE_CARDS.find((r) => r.key === role), [role]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    if (!canCreate) {
      setMsg({ type: 'warning', text: 'Per the authority matrix, Department Admin cannot create users. Ask Super Admin.' });
      return;
    }
    try {
      setBusy(true);
      await api.post('/admin/users', {
        ...form,
        role,
      });
      setMsg({ type: 'success', text: 'User registered successfully.' });
      setForm({ name: '', email: '', role, verification_confirmed: false });
    } catch (e2) {
      setMsg({ type: 'danger', text: e2?.response?.data?.message || e2?.message || 'Registration failed.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="coord-page">
      <div className="coord-pagehead">
        <div>
          <h2 className="coord-h2">User Registration</h2>
          <div className="coord-sub">Single registration + bulk mode UI (CSV) for students.</div>
        </div>
        <Badge bg={canCreate ? 'success' : 'secondary'}>{canCreate ? 'Enabled' : 'Read-only'}</Badge>
      </div>

      {!canCreate ? (
        <Alert variant="warning">
          Your matrix currently allows <strong>Super Admin</strong> to create users. This page stays visible as a
          coordinator workflow, but the submit button will be disabled until permission/endpoint is enabled.
        </Alert>
      ) : null}

      {msg.text ? <Alert variant={msg.type || 'info'}>{msg.text}</Alert> : null}

      <Tabs activeKey={mode} onSelect={(k) => setMode(k || 'single')} className="coord-tabs mb-3">
        <Tab eventKey="single" title="Single user" />
        <Tab eventKey="bulk" title="Bulk students (CSV)" />
      </Tabs>

      {mode === 'single' ? (
        <Row className="g-3">
          <Col lg={5}>
            <Card className="coord-card">
              <Card.Body>
                <div className="coord-card-head">
                  <div>
                    <div className="coord-card-title">Choose role</div>
                    <div className="coord-card-sub">Visually distinct role cards.</div>
                  </div>
                </div>
                <div className="coord-rolegrid">
                  {ROLE_CARDS.map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      className={`coord-rolecard ${role === r.key ? 'active' : ''}`}
                      onClick={() => setRole(r.key)}
                    >
                      <div className="coord-roleicon">{r.icon}</div>
                      <div className="coord-roletitle">{r.title}</div>
                      <div className="coord-roledesc">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={7}>
            <Card className="coord-card">
              <Card.Body>
                <div className="coord-card-head">
                  <div>
                    <div className="coord-card-title">
                      Register {roleMeta?.title || 'User'} {roleMeta?.icon ? <span className="ms-1">{roleMeta.icon}</span> : null}
                    </div>
                    <div className="coord-card-sub">Dynamic field groups can be extended per role.</div>
                  </div>
                </div>

                <Form onSubmit={submit}>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Full name</Form.Label>
                        <Form.Control value={form.name} onChange={(e) => onChange('name', e.target.value)} required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          value={form.email}
                          onChange={(e) => onChange('email', e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>

                    {role === 'student' ? (
                      <Col md={12}>
                        <div className="coord-group">
                          <div className="coord-group-title">Student fields</div>
                          <div className="coord-group-sub">Year / ID fields can be added when backend supports them.</div>
                        </div>
                      </Col>
                    ) : null}

                    {(role === 'examiner' || role === 'advisor') ? (
                      <Col md={12}>
                        <div className="coord-group">
                          <div className="coord-group-title">{role === 'examiner' ? 'Examiner' : 'Advisor'} fields</div>
                          <div className="coord-group-sub">Specialization / title can be added later.</div>
                        </div>
                      </Col>
                    ) : null}

                    <Col md={12}>
                      <Form.Check
                        type="switch"
                        id="verify"
                        label="I confirm details were verified and consent was obtained."
                        checked={!!form.verification_confirmed}
                        onChange={(e) => onChange('verification_confirmed', e.target.checked)}
                        required
                      />
                    </Col>

                    <Col md={12} className="d-flex gap-2">
                      <Button variant="outline-secondary" type="button" onClick={() => setForm({ name: '', email: '', role, verification_confirmed: false })}>
                        Reset
                      </Button>
                      <Button type="submit" disabled={!canCreate || busy || !form.verification_confirmed}>
                        {busy ? 'Registering…' : 'Register user'}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <Card className="coord-card">
          <Card.Body>
            <div className="coord-card-head">
              <div>
                <div className="coord-card-title">Bulk student registration</div>
                <div className="coord-card-sub">CSV upload UI (backend ingestion can be added next).</div>
              </div>
              <Badge bg="secondary">UI only</Badge>
            </div>

            <Alert variant="info">
              This screen is ready for CSV upload + repeated entries. When you’re ready, I can add an endpoint and parse
              CSV into student users scoped to department.
            </Alert>

            <Form>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>CSV file</Form.Label>
                    <Form.Control type="file" accept=".csv" disabled />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Template</Form.Label>
                    <Form.Control value="name,email,year,student_id" disabled />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Button disabled>Upload & preview</Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

