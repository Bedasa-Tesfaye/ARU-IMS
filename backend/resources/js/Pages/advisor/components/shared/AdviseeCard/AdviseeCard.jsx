import React from 'react';
import { STAGE_LABELS } from '../../../constants';
import { formatRelative } from '../../../utils';
import { EngagementGauge } from '../ProgressCard/ProgressCard';
import './AdviseeCard.css';

export default function AdviseeCard({ student, onOpen, onMessage, onMeetings, onReviews }) {
  const s = student;
  return (
    <div className="adv-student-card">
      <div className="adv-student-card-head">
        <div className="adv-avatar">{s.photo_url ? <img src={s.photo_url} alt="" /> : <span>{(s.first_name || '?')[0]}</span>}</div>
        <div>
          <strong>
            {s.first_name} {s.last_name}
          </strong>
          <div className="adv-muted">
            {s.student_id} · {s.program}
          </div>
          <span className={`adv-badge-stage sm ${s.internship_stage}`}>{STAGE_LABELS[s.internship_stage]}</span>
        </div>
        <EngagementGauge score={s.engagement_score} />
      </div>
      <p className="adv-ai-hint">{s.ai_insight}</p>
      <div className="adv-mini-stats">
        <span>Apps {s.applications_count}</span>
        <span>Int {s.interviews_count}</span>
        <span>Offers {s.offers_count}</span>
      </div>
      <div className="adv-progress-bar">
        <span style={{ width: `${Math.min(100, (s.applications_count || 0) * 15)}%` }} />
      </div>
      <small className="adv-muted">Last active: {formatRelative(s.last_active)}</small>
      <div className="adv-card-actions">
        <button type="button" className="adv-btn secondary adv-btn-sm" onClick={onMessage}>
          Message
        </button>
        <button type="button" className="adv-btn secondary adv-btn-sm" onClick={onMeetings}>
          Schedule
        </button>
        <button type="button" className="adv-btn adv-btn-sm" onClick={onOpen}>
          Profile
        </button>
        <button type="button" className="adv-btn ghost adv-btn-sm" onClick={onReviews}>
          Reviews
        </button>
      </div>
    </div>
  );
}
