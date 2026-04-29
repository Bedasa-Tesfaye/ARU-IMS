import React, { useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Form, Table } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import './coordinator.css';

const MOCK = [
  { id: 'a1', type: 'Student application', title: 'Application for Software Intern', submitted: '2026-04-20', priority: 'urgent', status: 'pending' },
  { id: 'a2', type: 'Internship post', title: 'Data Science Internship (Acme)', submitted: '2026-04-18', priority: 'normal', status: 'pending' },
  { id: 'a3', type: 'Grade approval', title: 'Final grade approval – Student #101', submitted: '2026-04-12', priority: 'high', status: 'pending' },
];

function chip(status) {
  const cls = status === 'pending' ? 'pending' : status === 'approved' ? 'ok' : 'off';
  return <span className={`coord-chip2 ${cls}`}>{status}</span>;
}

export default function CoordinatorApprovalsPage() {
  const { hasPermission } = useAuth();
  const canApproveApp = hasPermission('applications.approve');
  const canRejectApp = hasPermission('applications.reject');
  const canApprovePost = hasPermission('internships.approvePost');
  const [filter, setFilter] = useState('all');
  const [priority, setPriority] = useState('all');
  const [rows, setRows] = useState(MOCK);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const okType = filter === 'all' || r.type === filter;
      const okPri = priority === 'all' || r.priority === priority;
      return okType && okPri;
    });
  }, [rows, filter, priority]);

  const update = (id, status) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <div className="coord-page">
      <div className="coord-pagehead">
        <div>
          <h2 className="coord-h2">Approvals</h2>
          <div className="coord-sub">Approval queue for internship posts, applications, and grade approvals.</div>
        </div>
        <Badge bg="secondary">Queue</Badge>
      </div>

      <Card className="coord-card mb-3">
        <Card.Body>
          <div className="coord-filters">
            <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All types</option>
              <option value="Student application">Student applications</option>
              <option value="Internship post">Internship posts</option>
              <option value="Grade approval">Grade approvals</option>
            </Form.Select>
            <Form.Select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="all">All priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
            </Form.Select>
          </div>
        </Card.Body>
      </Card>

      <Alert variant="info">
        This page is fully matrix-gated. Wiring to real endpoints can be added next (applications + internship post approval + grade approval).
      </Alert>

      <Card className="coord-card">
        <Card.Body>
          <div className="coord-tablewrap">
            <Table hover responsive className="coord-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Submitted</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style={{ width: 260 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const canApprove =
                    r.type === 'Student application' ? canApproveApp :
                    r.type === 'Internship post' ? canApprovePost :
                    false;
                  const canReject =
                    r.type === 'Student application' ? canRejectApp :
                    r.type === 'Internship post' ? canApprovePost :
                    false;

                  return (
                    <tr key={r.id}>
                      <td>{r.type}</td>
                      <td>{r.title}</td>
                      <td>{r.submitted}</td>
                      <td>
                        <span className={`coord-pri ${r.priority}`}>{r.priority}</span>
                      </td>
                      <td>{chip(r.status)}</td>
                      <td>
                        <div className="coord-actions-inline">
                          <Button size="sm" disabled={!canApprove || r.status !== 'pending'} onClick={() => update(r.id, 'approved')}>
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            disabled={!canReject || r.status !== 'pending'}
                            onClick={() => update(r.id, 'rejected')}
                          >
                            Reject
                          </Button>
                          <Button size="sm" variant="outline-secondary" onClick={() => alert('Add comment flow next')}>
                            Comment
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="coord-empty">No items in this view.</div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

