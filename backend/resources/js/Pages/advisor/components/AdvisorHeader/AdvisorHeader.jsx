import React from 'react';
import { NAV } from '../../constants';
import './AdvisorHeader.css';

export default function AdvisorHeader({
  active,
  onToggleSidebar,
  notificationsOpen,
  onToggleNotifications,
  notificationDigest,
}) {
  return (
    <header className="adv-topbar">
      <button type="button" className="adv-burger" aria-label="Menu" onClick={onToggleSidebar}>
        ☰
      </button>
      <h1 className="adv-title">{NAV.find((n) => n.id === active)?.label || 'Dashboard'}</h1>
      <div className="adv-top-actions">
        <button type="button" className="adv-notify-btn" onClick={onToggleNotifications} aria-label="Notifications">
          🔔
          {(notificationDigest?.length || 0) > 0 && <span className="adv-notify-dot" />}
        </button>
        {notificationsOpen && (
          <div className="adv-notify-panel">
            <h4>Today&apos;s briefing</h4>
            <ul>
              {(notificationDigest || []).map((n) => (
                <li key={n.id}>
                  <strong>{n.title}</strong>
                  <span>{n.body}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
