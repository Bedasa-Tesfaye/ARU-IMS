import React from 'react';
import { SEGMENT_KEYS } from '../../constants';
import { AnimatedStat } from '../shared/ProgressCard/ProgressCard';
import './AdvisorOverview.css';

export default function AdvisorOverview({
  dashboard,
  stats,
  breakdown,
  segmentTotal,
  tipRotate,
  showToast,
  onStudentSegment,
  onOpenTab,
}) {
  return (
    <div className="adv-grid">
      <section className="adv-card adv-hero">
        <div className="adv-hero-row">
          <div>
            <h2>{dashboard?.ai_greeting || `Welcome back, ${dashboard?.advisor?.name || 'Advisor'}!`}</h2>
            <p className="adv-sub">
              Advisor ID: {dashboard?.advisor?.employee_id || '—'} · Department:{' '}
              {dashboard?.advisor?.department_name || dashboard?.advisor?.department_id || '—'}
            </p>
          </div>
          <button type="button" className="adv-btn ghost adv-ai-opt" onClick={() => showToast('Optimizer: prioritize slots Tue/Thu AM based on cohort activity.')}>
            AI Schedule Optimizer
          </button>
        </div>
      </section>

      <section className="adv-stat-row">
        <AnimatedStat value={stats.total_assigned_students} label="Assigned Students" />
        <AnimatedStat value={stats.active_internship_process} label="Active in Process" />
        <AnimatedStat value={stats.pending_application_reviews} label="Pending Reviews" hint="Applications" />
        <AnimatedStat value={stats.students_placed} label="Placed / Secured" />
        <AnimatedStat value={stats.meetings_today} label="Meetings Today" />
        <AnimatedStat value={stats.unread_messages} label="Unread Messages" />
      </section>

      <section className="adv-card">
        <h3>AI-driven priority alerts</h3>
        <ul className="adv-alert-list">
          {(dashboard?.ai_priority_alerts || []).map((t, i) => (
            <li key={i} className="adv-alert-item">
              {t}
            </li>
          ))}
        </ul>
        {dashboard?.weekly_engagement_trend?.message && (
          <p className="adv-trend-note">📊 {dashboard.weekly_engagement_trend.message}</p>
        )}
      </section>

      <section className="adv-card">
        <h3>Student status overview</h3>
        <p className="adv-muted">{breakdown.ai_insight}</p>
        <div className="adv-seg-bar" role="presentation">
          {SEGMENT_KEYS.map(({ key, color }) => {
            const v = Number(breakdown[key]) || 0;
            const w = (v / segmentTotal) * 100;
            return <span key={key} style={{ width: `${w}%`, background: color }} title={`${key}: ${v}`} />;
          })}
        </div>
        <div className="adv-seg-legend">
          {SEGMENT_KEYS.map(({ key, label, filter, color }) => (
            <button key={key} type="button" className="adv-chip" onClick={() => onStudentSegment(filter)}>
              <span className="adv-chip-dot" style={{ background: color }} />
              {label}: {breakdown[key] ?? 0}
            </button>
          ))}
        </div>
      </section>

      <section className="adv-card adv-performance">
        <h3>AI performance insights</h3>
        <p>Based on your advising patterns:</p>
        <ul className="adv-insight-list">
          <li>
            Response time: {dashboard?.ai_performance_insights?.response_time_hours}h (Department avg:{' '}
            {dashboard?.ai_performance_insights?.department_avg_response_hours}h) ⭐️
          </li>
          <li>Student satisfaction: {dashboard?.ai_performance_insights?.student_satisfaction}/5</li>
          <li>
            Placement success: {dashboard?.ai_performance_insights?.placement_success_rate}% (
            {(dashboard?.ai_performance_insights?.placement_success_rate ?? 0) -
              (dashboard?.ai_performance_insights?.department_avg_placement ?? 0)}
            % vs dept avg)
          </li>
          <li>Most engaged: {(dashboard?.ai_performance_insights?.most_engaged || []).join(', ') || '—'}</li>
          <li>Needs attention: {(dashboard?.ai_performance_insights?.needs_more_attention || []).join(', ') || '—'}</li>
        </ul>
      </section>

      <section className="adv-card">
        <h3>Upcoming schedule</h3>
        <div className="adv-schedule-actions">
          <span>This week & today</span>
          <div>
            <button type="button" className="adv-btn secondary adv-btn-sm" onClick={() => showToast('Reminder sent (demo).')}>
              Send reminders
            </button>
          </div>
        </div>
        <div className="adv-list">
          {(dashboard?.upcoming_schedule || []).length === 0 && <div className="adv-empty">No upcoming meetings.</div>}
          {(dashboard?.upcoming_schedule || []).map((m) => (
            <div key={m.id} className="adv-list-item">
              <div>
                <strong>{m.title}</strong>
                <small>
                  {m.scheduled_at ? new Date(m.scheduled_at).toLocaleString() : ''} · {m.format}
                </small>
                <small className="adv-ai-hint">AI prep: {m.ai_prep_summary}</small>
              </div>
              <div className="adv-inline-actions">
                <button type="button" className="adv-btn adv-btn-sm" onClick={() => showToast('Launch meeting link (demo).')}>
                  Start
                </button>
                <button type="button" className="adv-btn ghost adv-btn-sm" onClick={() => onOpenTab('meetings')}>
                  Reschedule
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="adv-card">
        <h3>Recent activity</h3>
        <ul className="adv-activity">
          {(dashboard?.recent_activity || []).map((a, i) => (
            <li key={i}>
              <span className="adv-act-badge">{a.type}</span> {a.summary}{' '}
              <time>{a.at ? new Date(a.at).toLocaleString() : ''}</time>
            </li>
          ))}
        </ul>
        <button type="button" className="adv-link-btn" onClick={() => onOpenTab('progress')}>
          View full activity log →
        </button>
      </section>

      <section className="adv-card adv-tips">
        <h3>AI tips & best practices</h3>
        <blockquote>{dashboard?.ai_tips?.[tipRotate % (dashboard?.ai_tips?.length || 1)]}</blockquote>
        <div className="adv-tip-dots">
          {(dashboard?.ai_tips || []).map((_, i) => (
            <span key={i} className={i === tipRotate % (dashboard?.ai_tips?.length || 1) ? 'on' : ''} />
          ))}
        </div>
      </section>
    </div>
  );
}
