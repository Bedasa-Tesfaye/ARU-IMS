import React from 'react';
import './StudentCard.css';

const StudentCard = ({ student, onView, onEvaluate }) => {
  const progress = Math.max(0, Math.min(100, Number(student.progress ?? 65)));
  const name = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student';

  return (
    <article className="examiner-card student-card">
      <div className="student-head">
        <div className="student-avatar">{name.slice(0, 1).toUpperCase()}</div>
        <div>
          <h4>{name}</h4>
          <small>ID: {student.student_id || `STU-${student.id || 'N/A'}`}</small>
        </div>
      </div>
      <ul className="student-meta">
        <li>📍 Dept: {student.department_name || student.department_id || 'N/A'}</li>
        <li>🏢 Company: {student.company_name || 'Not assigned'}</li>
        <li>⏱️ Last Active: {student.last_active || 'Recently'}</li>
      </ul>
      <div className="student-progress">
        <div><span>Progress</span><strong>{progress}%</strong></div>
        <div className="progress-track"><i style={{ width: `${progress}%` }} /></div>
      </div>
      <div className="student-actions">
        <button type="button" className="examiner-btn secondary" onClick={onView}>View Details</button>
        <button type="button" className="examiner-btn" onClick={onEvaluate}>Evaluate</button>
      </div>
    </article>
  );
};

export default StudentCard;
