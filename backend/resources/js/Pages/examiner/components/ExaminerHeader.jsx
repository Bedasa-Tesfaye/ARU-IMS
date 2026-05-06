import React from 'react';
import './ExaminerHeader.css';

const ExaminerHeader = ({ title, icon, subtitle, onSearch, searchPlaceholder = 'Search...' }) => (
  <header className="examiner-header examiner-card">
    <div className="examiner-header-main">
      <div className="examiner-breadcrumb">Examiner Portal / {title}</div>
      <h1>{icon} {title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
    <div className="examiner-header-actions">
      <div className="examiner-search">
        <input
          type="search"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      <button type="button" className="examiner-icon-btn" aria-label="Notifications">🔔</button>
      <button type="button" className="examiner-icon-btn" aria-label="Help">❓</button>
      <button type="button" className="examiner-icon-btn" aria-label="Profile">👤</button>
    </div>
  </header>
);

export default ExaminerHeader;
