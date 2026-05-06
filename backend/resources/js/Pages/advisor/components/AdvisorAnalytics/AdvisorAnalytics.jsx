import React from 'react';
import { advisorAPI, aiAdvisorAPI } from '../../../../services/http';
import './AdvisorAnalytics.css';

export default function AdvisorAnalytics({ reports, showToast }) {
  return (
    <div className="adv-reports-page">
      <section className="adv-card">
        <h3>Advisor performance</h3>
        <div className="adv-report-metrics">
          <div>
            <strong>{reports?.cohort_size ?? '—'}</strong>
            <span>Cohort size</span>
          </div>
          <div>
            <strong>{((reports?.placement_rate || 0) * 100).toFixed(0)}%</strong>
            <span>Placement rate</span>
          </div>
          <div>
            <strong>{reports?.avg_response_hours ?? '—'}h</strong>
            <span>Avg response</span>
          </div>
          <div>
            <strong>{reports?.student_satisfaction ?? '—'}</strong>
            <span>Satisfaction</span>
          </div>
          <div>
            <strong>{((reports?.meeting_attendance_rate || 0) * 100).toFixed(0)}%</strong>
            <span>Meeting attendance</span>
          </div>
        </div>
      </section>
      <section className="adv-card">
        <h4>Placement mix</h4>
        <div className="adv-bar-chart">
          {(reports?.placement_by_type || []).map((row) => (
            <div key={row.label} className="adv-bar-row">
              <span>{row.label}</span>
              <div className="adv-bar-track">
                <span style={{ width: `${row.value}%` }} />
              </div>
              <span>{row.value}%</span>
            </div>
          ))}
        </div>
      </section>
      <section className="adv-card">
        <h4>AI predictive analytics</h4>
        <p>
          Likely placements this month: <strong>{reports?.predictive?.likely_placements_this_month ?? '—'}</strong>
        </p>
        <p>
          At-risk prediction count: <strong>{reports?.predictive?.at_risk_count ?? '—'}</strong>
        </p>
        <ul>
          {(reports?.ai_findings || []).map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </section>
      <section className="adv-card">
        <div className="adv-inline-actions">
          <button type="button" className="adv-btn" onClick={() => advisorAPI.generateReport({ type: 'cohort' }).then(() => showToast('Queued.'))}>
            Export cohort (PDF/CSV)
          </button>
          <button
            type="button"
            className="adv-btn secondary"
            onClick={async () => {
              const ar = await aiAdvisorAPI.generateReport({});
              showToast(ar.data?.narrative?.slice(0, 90) || 'Done');
            }}
          >
            AI narrative report
          </button>
        </div>
      </section>
    </div>
  );
}
