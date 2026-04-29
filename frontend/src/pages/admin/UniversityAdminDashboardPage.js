import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import '../coordinator/coordinator.css';

function kpi(label, value, sub, icon, tone) {
  return (
    <div className={`coord-kpi ${tone || 'primary'}`}>
      <div className="coord-kpi-icon">{icon}</div>
      <div className="coord-kpi-body">
        <div className="coord-kpi-label">{label}</div>
        <div className="coord-kpi-value">{value}</div>
        {sub ? <div className="coord-kpi-sub">{sub}</div> : null}
      </div>
    </div>
  );
}

export default function UniversityAdminDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        setError('');
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        setStats(res.data?.data || null);
      } catch (e) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load dashboard');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const scopeLabel = useMemo(() => 'Whole University', []);

  if (loading) {
    return (
      <div className="coord-center">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="coord-page">
      <div className="coord-hero">
        <div>
          <div className="coord-hero-badge">
            <span>🛡️</span> University Admin <Badge bg="light" text="dark">Live</Badge>
          </div>
          <h1 className="coord-hero-title">
            Welcome back, {user?.first_name} {user?.last_name}
          </h1>
          <div className="coord-hero-sub">
            Scope • <strong>{scopeLabel}</strong> • System Monitoring & Governance
          </div>
        </div>

        <div className="coord-hero-actions">
          <Button variant="light" onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button variant="outline-light" href="/dashboard/admin/reports">
            View Reports
          </Button>
        </div>
      </div>

      {error ? <Alert variant="warning">{error}</Alert> : null}

      <Row className="g-3">
        <Col md={6} xl={4}>
          {kpi('Total Students', stats?.total_students ?? '—', 'University-wide', '🎓', 'primary')}
        </Col>
        <Col md={6} xl={4}>
          {kpi('Active Internships', stats?.active_internships ?? '—', 'Across all departments', '💼', 'success')}
        </Col>
        <Col md={6} xl={4}>
          {kpi('Pending Approvals', stats?.pending_applications ?? '—', 'Needs action', '⏳', 'warning')}
        </Col>
        <Col md={6} xl={4}>
          {kpi('Reports Pending', stats?.pending_reports ?? '—', 'Department submissions', '📄', 'info')}
        </Col>
        <Col md={6} xl={4}>
          {kpi('System Health', 'OK', 'API/DB/Queue', '🖥️', 'purple')}
        </Col>
        <Col md={6} xl={4}>
          {kpi('Audit Alerts', '3', 'Last 24h', '🔎', 'dark')}
        </Col>
      </Row>

      <Row className="g-3 mt-1">
        <Col lg={8}>
          <Card className="coord-card">
            <Card.Body>
              <div className="coord-card-head">
                <div>
                  <div className="coord-card-title">University Analytics</div>
                  <div className="coord-card-sub">Cross-department insights and trends.</div>
                </div>
                <Badge bg="secondary">Preview</Badge>
              </div>
              <div className="coord-placeholder-chart" />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="coord-card">
            <Card.Body>
              <div className="coord-card-head">
                <div className="coord-card-title">Quick Actions</div>
                <div className="coord-card-sub">High-impact admin tasks.</div>
              </div>
              <div className="coord-actions">
                <Button className="coord-action" variant="primary" href="/dashboard/admin/users">
                  👥 Manage actors
                </Button>
                <Button className="coord-action" variant="outline-primary" href="/dashboard/admin/registration">
                  ➕ Register actors
                </Button>
                <Button className="coord-action" variant="outline-secondary" href="/dashboard/admin/monitoring">
                  🖥️ Monitoring
                </Button>
                <Button className="coord-action" variant="outline-dark" href="/dashboard/admin/approvals">
                  ✅ Approvals
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

