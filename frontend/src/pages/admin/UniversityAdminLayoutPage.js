import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Alert, Badge, Dropdown } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import '../coordinator/coordinator.css';

function initials(user) {
  const first = (user?.first_name || 'U').trim().charAt(0).toUpperCase();
  const last = (user?.last_name || '').trim().charAt(0).toUpperCase();
  return `${first}${last}`.trim() || 'U';
}

function formatClock(d) {
  return d.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function UniversityAdminLayoutPage() {
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
  const [now, setNow] = useState(new Date());
  const [message, setMessage] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'System health: OK', time: 'Just now', unread: true, type: 'info' },
    { id: 2, title: '2 departments requested support', time: '1h ago', unread: true, type: 'urgent' },
    { id: 3, title: 'Weekly summary is ready', time: 'Yesterday', unread: false, type: 'info' },
  ]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => n.unread).length, [notifications]);

  const nav = useMemo(() => {
    const items = [
      { to: '/dashboard/admin', label: 'Dashboard', icon: '🏛️', permission: 'system.dashboard.view' },
      { to: '/dashboard/admin/registration', label: 'Register Actors', icon: '➕', permission: 'users.create' },
      { to: '/dashboard/admin/users', label: 'Manage Actors', icon: '👥', permission: 'users.viewAny' },
      { to: '/dashboard/admin/monitoring', label: 'System Monitoring', icon: '🖥️', permission: 'system.monitoring.view' },
      { to: '/dashboard/admin/reports', label: 'System Reports', icon: '📊', permission: 'reports.custom.generate' },
      { to: '/dashboard/admin/approvals', label: 'Approvals', icon: '✅', permission: 'applications.review' },
    ];

    return items.map((i) => ({ ...i, locked: !!i.permission && !hasPermission(i.permission) }));
  }, [hasPermission]);

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

  const registerUser = async (payload) => {
    if (!hasPermission('users.create')) {
      throw new Error('Not permitted. Please contact Super Admin.');
    }

    const role = (payload?.role || '').toString().trim().toLowerCase();
    const fullName = (payload?.fullName || payload?.name || '').toString().trim();
    const email = (payload?.email || '').toString().trim();

    await api.post('/admin/users', {
      name: fullName,
      email,
      role,
      meta: { ...payload, role: undefined, fullName: undefined, email: undefined },
    });
  };

  return (
    <div className="coord-shell">
      <aside className="coord-sidebar">
        <div className="coord-brand">
          <div className="coord-brand-icon">🛡️</div>
          <div>
            <div className="coord-brand-title">ARU IMS</div>
            <div className="coord-brand-subtitle">University Admin Portal</div>
          </div>
        </div>

        <nav className="coord-nav">
          {nav.map((item) =>
            item.locked ? (
              <button
                key={item.to}
                type="button"
                className="coord-nav-item locked"
                onClick={() => setMessage({ type: 'info', text: `Not allowed by authority matrix: ${item.permission}` })}
              >
                <span className="coord-nav-icon">{item.icon}</span>
                <span className="coord-nav-label">{item.label}</span>
                <span className="coord-nav-lock">🔒</span>
              </button>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard/admin'}
                className={({ isActive }) => `coord-nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="coord-nav-icon">{item.icon}</span>
                <span className="coord-nav-label">{item.label}</span>
              </NavLink>
            )
          )}
        </nav>

        <div className="coord-sidebar-footer">
          <div className="coord-user">
            <div className="coord-avatar">{initials(user)}</div>
            <div className="coord-user-meta">
              <div className="coord-user-name">
                {(user?.first_name || '').trim()} {(user?.last_name || '').trim()}
              </div>
              <div className="coord-user-sub">University Admin</div>
            </div>
          </div>

          <button className="coord-logout" type="button" onClick={logout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <main className="coord-main">
        <header className="coord-topbar">
          <div className="coord-topbar-left">
            <div className="coord-topbar-title">University Operations</div>
            <div className="coord-topbar-subtitle">{formatClock(now)}</div>
          </div>

          <div className="coord-topbar-right">
            <Dropdown align="end">
              <Dropdown.Toggle className="coord-bell" variant="light" id="admin-notifications">
                🔔
                {unreadCount > 0 ? (
                  <Badge bg="danger" pill className="coord-bell-badge">
                    {unreadCount}
                  </Badge>
                ) : null}
              </Dropdown.Toggle>
              <Dropdown.Menu className="coord-dropdown">
                <div className="coord-dropdown-head">
                  <div className="coord-dropdown-title">Notifications</div>
                  <button type="button" className="coord-linkbtn" onClick={markAllRead}>
                    Mark all read
                  </button>
                </div>
                <div className="coord-dropdown-list">
                  {notifications.map((n) => (
                    <div key={n.id} className={`coord-note ${n.unread ? 'unread' : ''} ${n.type}`}>
                      <div className="coord-note-title">{n.title}</div>
                      <div className="coord-note-time">{n.time}</div>
                    </div>
                  ))}
                </div>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => navigate('/dashboard/admin/monitoring')}>Go to monitoring</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <button className="coord-topbtn" type="button" onClick={() => navigate('/dashboard/profile')}>
              👤 Profile
            </button>
          </div>
        </header>

        <div className="coord-content">
          {message?.text ? (
            <Alert
              variant={message.type === 'error' ? 'danger' : message.type === 'success' ? 'success' : 'info'}
              dismissible
              onClose={() => setMessage(null)}
              className="mb-3"
            >
              {message.text}
            </Alert>
          ) : null}
          <Outlet context={{ registerUser, setMessage }} />
        </div>
      </main>
    </div>
  );
}

