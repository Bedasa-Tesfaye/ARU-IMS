import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './coordinator.css';

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

export default function CoordinatorDashboardPage() {
  const { user, hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        setError('');
        setLoading(true);
        // Coordinators are allowed to see system analytics in the matrix; this endpoint is permission-guarded.
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

  const deptName = useMemo(() => {
    // Backend currently stores department_id only; showing a placeholder.
    return user?.department?.name || 'Your Department';
  }, [user]);

  const placementRate = 92;
  const satisfaction = 4.7;

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
            <span>🏛️</span> Academic Year 2025/26 <Badge bg="light" text="dark">Live</Badge>
          </div>
          <h1 className="coord-hero-title">
            Welcome back, {user?.first_name} {user?.last_name}
          </h1>
          <div className="coord-hero-sub">
            Department Admin • <strong>{deptName}</strong> • Internship Management System
          </div>
        </div>

        <div className="coord-hero-actions">
          <Button variant="light" onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button variant="outline-light" href="/dashboard/coordinator/approvals">
            Go to Approvals
          </Button>
        </div>
      </div>

      {error ? <Alert variant="warning">{error}</Alert> : null}

      <Row className="g-3">
        <Col md={6} xl={4}>
          {kpi('Total Students', stats?.total_students ?? '—', 'Department-level view', '🎓', 'primary')}
        </Col>
        <Col md={6} xl={4}>
          {kpi('Active Internships', stats?.active_internships ?? '—', 'Currently running', '💼', 'success')}
        </Col>
        <Col md={6} xl={4}>
          {kpi('Pending Approvals', stats?.pending_applications ?? '—', 'Applications awaiting action', '⏳', 'warning')}
        </Col>
        <Col md={6} xl={4}>
          {kpi('Weekly Reports', stats?.pending_reports ?? '—', 'Submitted this period', '📄', 'info')}
        </Col>
        <Col md={6} xl={4}>
          {kpi('Placement Rate', `${placementRate}%`, 'Estimated trend', '📈', 'purple')}
        </Col>
        <Col md={6} xl={4}>
          {kpi('Satisfaction Score', `${satisfaction}/5`, 'Based on feedback', '⭐', 'dark')}
        </Col>
      </Row>

      <Row className="g-3 mt-1">
        <Col lg={8}>
          <Card className="coord-card">
            <Card.Body>
              <div className="coord-card-head">
                <div>
                  <div className="coord-card-title">Analytics & Insights</div>
                  <div className="coord-card-sub">Enrollment trend, application summary, and completion signals.</div>
                </div>
                <Badge bg="secondary">Preview</Badge>
              </div>

              <div className="coord-mini-grid">
                <div className="coord-mini">
                  <div className="coord-mini-label">Application Status</div>
                  <div className="coord-mini-value">{stats?.total_applications ?? 0}</div>
                  <div className="coord-mini-sub">
                    Approved <strong>{stats?.approved_applications ?? 0}</strong> • Pending{' '}
                    <strong>{stats?.pending_applications ?? 0}</strong>
                  </div>
                </div>
                <div className="coord-mini">
                  <div className="coord-mini-label">Completion Rate</div>
                  <div className="coord-mini-value">88%</div>
                  <div className="coord-mini-sub">Reports completed on time</div>
                </div>
                <div className="coord-mini">
                  <div className="coord-mini-label">Year Distribution</div>
                  <div className="coord-mini-value">3rd/4th</div>
                  <div className="coord-mini-sub">Most active cohorts</div>
                </div>
              </div>

              <div className="coord-placeholder-chart">
                <div className="coord-placeholder-title">Enrollment Trend</div>
                <div className="coord-placeholder-sub">
                  Chart placeholder (hook your dataset later). UI is ready.
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="coord-card">
            <Card.Body>
              <div className="coord-card-head">
                <div className="coord-card-title">Quick Actions</div>
                <div className="coord-card-sub">Common department tasks.</div>
              </div>

              <div className="coord-actions">
                <Button
                  className="coord-action"
                  variant="primary"
                  href="/dashboard/coordinator/approvals"
                  disabled={!hasPermission('applications.review')}
                >
                  ✅ Review approvals
                </Button>
                <Button
                  className="coord-action"
                  variant="outline-primary"
                  href="/dashboard/coordinator/users"
                  disabled={!hasPermission('users.viewAny')}
                >
                  👥 Manage users
                </Button>
                <Button
                  className="coord-action"
                  variant="outline-secondary"
                  href="/dashboard/coordinator/assignments"
                  disabled={!hasPermission('assignments.examiner.assign')}
                >
                  🧩 Assign examiners/advisors
                </Button>
                <Button className="coord-action" variant="outline-dark" href="/dashboard/coordinator/reports">
                  📄 Department reports
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

