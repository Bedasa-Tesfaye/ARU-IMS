import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Form, Modal, Spinner, Table } from 'react-bootstrap';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './coordinator.css';

function roleIcon(role) {
  const map = {
    student: '🎓',
    examiner: '👨‍🏫',
    advisor: '👨‍💼',
    coordinator: '📋',
    company: '🏢',
    admin: '👑',
    super_admin: '🛡️',
  };
  return map[role] || '👤';
}

export default function CoordinatorUserManagementPage() {
  const { hasPermission } = useAuth();
  const canView = hasPermission('users.viewAny');
  const canSuspend = hasPermission('users.suspend');
  const canDelete = hasPermission('users.delete');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [confirm, setConfirm] = useState({ open: false, user: null, action: '' });
  const [busy, setBusy] = useState(false);

  const fetchUsers = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await api.get('/admin/users');
      const payload = res.data?.data?.data || res.data?.data || [];
      setUsers(Array.isArray(payload) ? payload : []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canView) return;
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const text = `${u.first_name || ''} ${u.last_name || ''} ${u.email || ''}`.toLowerCase();
      const matchesQ = !q || text.includes(q.toLowerCase());
      const matchesRole = role === 'all' || u.role === role;
      const matchesStatus =
        status === 'all' || (status === 'active' ? !!u.is_active : status === 'inactive' ? !u.is_active : true);
      return matchesQ && matchesRole && matchesStatus;
    });
  }, [users, q, role, status]);

  const openConfirm = (u, action) => setConfirm({ open: true, user: u, action });
  const closeConfirm = () => setConfirm({ open: false, user: null, action: '' });

  const act = async () => {
    if (!confirm.user) return;
    try {
      setBusy(true);
      if (confirm.action === 'toggle') {
        await api.put(`/admin/users/${confirm.user.id}/status`, { is_active: !confirm.user.is_active });
      } else if (confirm.action === 'delete') {
        await api.delete(`/admin/users/${confirm.user.id}`);
      }
      closeConfirm();
      await fetchUsers();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  if (!canView) {
    return <Alert variant="warning">You don’t have permission to view users.</Alert>;
  }

  if (loading) {
    return (
      <div className="coord-center">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="coord-page">
      <div className="coord-pagehead">
        <div>
          <h2 className="coord-h2">User Management</h2>
          <div className="coord-sub">Department-scoped user list, filtering, and actions.</div>
        </div>
        <Badge bg="secondary">Matrix enforced</Badge>
      </div>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <Card className="coord-card">
        <Card.Body>
          <div className="coord-filters">
            <Form.Control
              placeholder="Search name or email..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="all">All roles</option>
              <option value="student">Students</option>
              <option value="examiner">Examiners</option>
              <option value="advisor">Advisors</option>
              <option value="company">Companies</option>
            </Form.Select>
            <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Form.Select>
            <Button variant="outline-secondary" onClick={fetchUsers}>
              Refresh
            </Button>
          </div>

          <div className="coord-tablewrap">
            <Table hover responsive className="coord-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ width: 220 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="coord-usercell">
                        <div className="coord-chip">{(u.first_name || 'U').slice(0, 1).toUpperCase()}</div>
                        <div>
                          <div className="coord-userline">
                            {u.first_name} {u.last_name}
                          </div>
                          <div className="coord-muted">ID: {u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className="coord-pill">
                        {roleIcon(u.role)} {u.role}
                      </span>
                    </td>
                    <td>
                      {u.is_active ? (
                        <span className="coord-status ok">Active</span>
                      ) : (
                        <span className="coord-status off">Inactive</span>
                      )}
                    </td>
                    <td>
                      <div className="coord-actions-inline">
                        <Button
                          size="sm"
                          variant={u.is_active ? 'outline-warning' : 'outline-success'}
                          disabled={!canSuspend}
                          onClick={() => openConfirm(u, 'toggle')}
                        >
                          {u.is_active ? 'Suspend' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          disabled={!canDelete}
                          onClick={() => openConfirm(u, 'delete')}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="coord-empty">No users match your filters.</div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={confirm.open} onHide={closeConfirm} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirm.action === 'delete' ? (
            <div>
              Delete <strong>{confirm.user?.email}</strong> permanently?
            </div>
          ) : (
            <div>
              {confirm.user?.is_active ? 'Suspend' : 'Activate'} <strong>{confirm.user?.email}</strong>?
            </div>
          )}
          {!canSuspend && confirm.action === 'toggle' ? (
            <Alert variant="warning" className="mt-3 mb-0">
              You don’t have permission to suspend/activate users.
            </Alert>
          ) : null}
          {!canDelete && confirm.action === 'delete' ? (
            <Alert variant="warning" className="mt-3 mb-0">
              You don’t have permission to delete users.
            </Alert>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeConfirm} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant={confirm.action === 'delete' ? 'danger' : 'primary'}
            onClick={act}
            disabled={busy || (confirm.action === 'toggle' ? !canSuspend : !canDelete)}
          >
            {busy ? 'Working…' : 'Confirm'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

