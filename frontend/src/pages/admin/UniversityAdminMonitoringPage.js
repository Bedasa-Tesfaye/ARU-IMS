import React from 'react';
import { Badge, Card, Col, Row } from 'react-bootstrap';
import '../coordinator/coordinator.css';

export default function UniversityAdminMonitoringPage() {
  return (
    <div className="coord-page">
      <div className="coord-pagehead">
        <div>
          <h2 className="coord-h2">System Monitoring</h2>
          <div className="coord-sub">High-level health checks and activity signals (university-wide).</div>
        </div>
        <Badge bg="secondary">Preview</Badge>
      </div>

      <Row className="g-3">
        <Col md={6} xl={4}>
          <div className="coord-kpi success">
            <div className="coord-kpi-icon">✅</div>
            <div className="coord-kpi-body">
              <div className="coord-kpi-label">API</div>
              <div className="coord-kpi-value">Healthy</div>
              <div className="coord-kpi-sub">Latency: ~120ms</div>
            </div>
          </div>
        </Col>
        <Col md={6} xl={4}>
          <div className="coord-kpi info">
            <div className="coord-kpi-icon">🗄️</div>
            <div className="coord-kpi-body">
              <div className="coord-kpi-label">Database</div>
              <div className="coord-kpi-value">OK</div>
              <div className="coord-kpi-sub">Connections: normal</div>
            </div>
          </div>
        </Col>
        <Col md={6} xl={4}>
          <div className="coord-kpi warning">
            <div className="coord-kpi-icon">🔔</div>
            <div className="coord-kpi-body">
              <div className="coord-kpi-label">Alerts</div>
              <div className="coord-kpi-value">3</div>
              <div className="coord-kpi-sub">Last 24 hours</div>
            </div>
          </div>
        </Col>
      </Row>

      <Card className="coord-card mt-3">
        <Card.Body>
          <div className="coord-card-head">
            <div>
              <div className="coord-card-title">Activity</div>
              <div className="coord-card-sub">Audit trail and system events (wire backend next).</div>
            </div>
            <Badge bg="secondary">UI ready</Badge>
          </div>
          <div className="coord-placeholder-chart" />
        </Card.Body>
      </Card>
    </div>
  );
}

