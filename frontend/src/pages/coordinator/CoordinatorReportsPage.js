import React from 'react';
import { Badge, Card, Col, Form, Row } from 'react-bootstrap';
import './coordinator.css';

export default function CoordinatorReportsPage() {
  return (
    <div className="coord-page">
      <div className="coord-pagehead">
        <div>
          <h2 className="coord-h2">Department Reports</h2>
          <div className="coord-sub">Enrollment trends, placement, approval timelines, completion metrics.</div>
        </div>
        <Badge bg="secondary">Preview</Badge>
      </div>

      <Card className="coord-card mb-3">
        <Card.Body>
          <div className="coord-filters">
            <Form.Select defaultValue="2025/26">
              <option value="2025/26">Academic Year 2025/26</option>
              <option value="2024/25">Academic Year 2024/25</option>
            </Form.Select>
            <Form.Select defaultValue="semester-1">
              <option value="semester-1">Semester 1</option>
              <option value="semester-2">Semester 2</option>
            </Form.Select>
            <Form.Select defaultValue="all">
              <option value="all">All years</option>
              <option value="3">3rd year</option>
              <option value="4">4th year</option>
            </Form.Select>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-3">
        <Col md={6} xl={3}>
          <div className="coord-kpi primary">
            <div className="coord-kpi-icon">📄</div>
            <div className="coord-kpi-body">
              <div className="coord-kpi-label">Reports submitted</div>
              <div className="coord-kpi-value">128</div>
              <div className="coord-kpi-sub">This semester</div>
            </div>
          </div>
        </Col>
        <Col md={6} xl={3}>
          <div className="coord-kpi success">
            <div className="coord-kpi-icon">✅</div>
            <div className="coord-kpi-body">
              <div className="coord-kpi-label">Completion rate</div>
              <div className="coord-kpi-value">88%</div>
              <div className="coord-kpi-sub">On-time</div>
            </div>
          </div>
        </Col>
        <Col md={6} xl={3}>
          <div className="coord-kpi warning">
            <div className="coord-kpi-icon">⏱️</div>
            <div className="coord-kpi-body">
              <div className="coord-kpi-label">Approval timeline</div>
              <div className="coord-kpi-value">2.4d</div>
              <div className="coord-kpi-sub">Avg turnaround</div>
            </div>
          </div>
        </Col>
        <Col md={6} xl={3}>
          <div className="coord-kpi dark">
            <div className="coord-kpi-icon">🎯</div>
            <div className="coord-kpi-body">
              <div className="coord-kpi-label">Placement</div>
              <div className="coord-kpi-value">92%</div>
              <div className="coord-kpi-sub">Estimated</div>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-3 mt-1">
        <Col lg={7}>
          <Card className="coord-card">
            <Card.Body>
              <div className="coord-card-head">
                <div>
                  <div className="coord-card-title">Enrollment Trend</div>
                  <div className="coord-card-sub">Line chart placeholder (hook real data later).</div>
                </div>
              </div>
              <div className="coord-placeholder-chart" />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="coord-card">
            <Card.Body>
              <div className="coord-card-head">
                <div>
                  <div className="coord-card-title">Application Summary</div>
                  <div className="coord-card-sub">Pending vs approved vs rejected.</div>
                </div>
              </div>
              <div className="coord-mini-grid">
                <div className="coord-mini">
                  <div className="coord-mini-label">Pending</div>
                  <div className="coord-mini-value">15</div>
                </div>
                <div className="coord-mini">
                  <div className="coord-mini-label">Approved</div>
                  <div className="coord-mini-value">95</div>
                </div>
                <div className="coord-mini">
                  <div className="coord-mini-label">Rejected</div>
                  <div className="coord-mini-value">10</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

