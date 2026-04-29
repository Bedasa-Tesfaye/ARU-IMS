import React, { useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import './coordinator.css';

export default function CoordinatorSettingsPage() {
  const { user, hasPermission } = useAuth();
  const canManageDept = hasPermission('settings.department.manage');

  const [form, setForm] = useState({
    displayName: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
    departmentName: user?.department?.name || '',
    notifyEmail: true,
    notifyInApp: true,
    security2FA: false,
  });

  const [msg, setMsg] = useState('');

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const save = () => {
    setMsg('Saved (UI). Hook backend persistence next.');
    setTimeout(() => setMsg(''), 2500);
  };

  return (
    <div className="coord-page">
      <div className="coord-pagehead">
        <div>
          <h2 className="coord-h2">Settings</h2>
          <div className="coord-sub">Department profile, notifications, and security preferences.</div>
        </div>
        <Badge bg={canManageDept ? 'success' : 'secondary'}>{canManageDept ? 'Editable' : 'Read-only'}</Badge>
      </div>

      {msg ? <Alert variant="success">{msg}</Alert> : null}

      {!canManageDept ? (
        <Alert variant="warning">
          Your matrix doesn’t currently allow department settings changes for this role. UI stays visible; editing is disabled.
        </Alert>
      ) : null}

      <Row className="g-3">
        <Col lg={6}>
          <Card className="coord-card">
            <Card.Body>
              <div className="coord-card-head">
                <div>
                  <div className="coord-card-title">Profile</div>
                  <div className="coord-card-sub">Basic coordinator profile settings.</div>
                </div>
              </div>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Display name</Form.Label>
                  <Form.Control value={form.displayName} onChange={(e) => set('displayName', e.target.value)} disabled={!canManageDept} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Control value={form.departmentName} onChange={(e) => set('departmentName', e.target.value)} placeholder="Computer Science" disabled={!canManageDept} />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="coord-card">
            <Card.Body>
              <div className="coord-card-head">
                <div>
                  <div className="coord-card-title">Notifications</div>
                  <div className="coord-card-sub">Preferences for alerts and summaries.</div>
                </div>
              </div>

              <Form>
                <Form.Check
                  type="switch"
                  id="notifyEmail"
                  label="Email notifications"
                  checked={form.notifyEmail}
                  onChange={(e) => set('notifyEmail', e.target.checked)}
                  disabled={!canManageDept}
                  className="mb-2"
                />
                <Form.Check
                  type="switch"
                  id="notifyInApp"
                  label="In-app notifications"
                  checked={form.notifyInApp}
                  onChange={(e) => set('notifyInApp', e.target.checked)}
                  disabled={!canManageDept}
                />
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={12}>
          <Card className="coord-card">
            <Card.Body>
              <div className="coord-card-head">
                <div>
                  <div className="coord-card-title">Security</div>
                  <div className="coord-card-sub">Optional security hardening.</div>
                </div>
              </div>

              <Row className="g-3">
                <Col md={6}>
                  <Form.Check
                    type="switch"
                    id="security2FA"
                    label="Enable two-factor authentication"
                    checked={form.security2FA}
                    onChange={(e) => set('security2FA', e.target.checked)}
                    disabled={!canManageDept}
                  />
                  <div className="coord-muted mt-2">Backend enforcement can be added later.</div>
                </Col>
                <Col md={6} className="d-flex justify-content-md-end align-items-start gap-2">
                  <Button variant="outline-secondary" disabled={!canManageDept} onClick={() => window.location.reload()}>
                    Cancel
                  </Button>
                  <Button disabled={!canManageDept} onClick={save}>
                    Save changes
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

