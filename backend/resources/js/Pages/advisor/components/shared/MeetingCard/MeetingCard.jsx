import React from 'react';
import './MeetingCard.css';

export default function MeetingCard({ meeting, dotClassName, onPreBrief }) {
  const m = meeting;
  return (
    <div className="adv-cal-item">
      <span className={dotClassName} />
      <div>
        <strong>{m.company_name}</strong>
        <small>{m.scheduled_at ? new Date(m.scheduled_at).toLocaleString() : ''}</small>
      </div>
      <button type="button" className="adv-btn ghost adv-btn-sm" onClick={onPreBrief}>
        Pre-meeting AI brief
      </button>
    </div>
  );
}
