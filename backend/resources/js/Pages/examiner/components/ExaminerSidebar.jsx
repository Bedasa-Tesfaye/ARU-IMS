import React from 'react';
import './ExaminerSidebar.css';

const ExaminerSidebar = ({ nav, active, onChange, onLogout, collapsed, onToggle, examinerName }) => (
  <aside className={`examiner-sidebar ${collapsed ? 'collapsed' : ''}`}>
    <div className="examiner-sidebar-top">
      <button type="button" className="examiner-collapse-btn" onClick={onToggle}>
        {collapsed ? '➡️' : '⬅️'}
      </button>
      {!collapsed && <h2>Examiner Hub</h2>}
    </div>

    <nav className="examiner-nav">
      {nav.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`examiner-nav-item ${active === item.id ? 'active' : ''}`}
          onClick={() => onChange(item.id)}
          title={item.label}
        >
          <span className="icon">{item.icon}</span>
          {!collapsed && <span>{item.label}</span>}
        </button>
      ))}
    </nav>

    <div className="examiner-sidebar-foot">
      {!collapsed && (
        <div className="examiner-profile-chip">
          <strong>{examinerName || 'Examiner'}</strong>
          <small>Role: Examiner</small>
        </div>
      )}
      <button type="button" className="examiner-nav-item logout" onClick={onLogout}>
        <span className="icon">🚪</span>
        {!collapsed && <span>Logout</span>}
      </button>
    </div>
  </aside>
);

export default ExaminerSidebar;
