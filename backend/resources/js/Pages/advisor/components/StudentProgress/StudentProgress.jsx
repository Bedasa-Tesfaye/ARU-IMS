import React from 'react';
import './StudentProgress.css';

export default function StudentProgress({ progress, showToast }) {
  return (
    <div className="adv-progress-page">
      <section className="adv-card">
        <h3>Cohort progress</h3>
        <div className="adv-funnel">
          {Object.entries(progress?.funnel || {}).map(([k, v]) => (
            <div key={k} className="adv-funnel-step">
              <span>{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
        <p>{progress?.ai_prediction}</p>
        <p className="adv-muted">Dept placement benchmark: {(progress?.department_comparison?.placement_rate_dept * 100 || 0).toFixed(0)}%</p>
      </section>
      <section className="adv-card adv-two-col">
        <div>
          <h4>Early warning</h4>
          <ul>
            {(progress?.at_risk || []).map((n, i) => (
              <li key={i}>⚠️ {n}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>AI interventions</h4>
          <ul>
            {(progress?.interventions || []).map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="adv-card">
        <h4>Goal tracking</h4>
        <p>
          Goal achievement rate: <strong>{progress?.goal_stats?.achievement_rate_pct}%</strong> · Active goals:{' '}
          {progress?.goal_stats?.active_goals}
        </p>
        <button type="button" className="adv-btn secondary" onClick={() => showToast('PDF export queued (demo).')}>
          Export progress PDF
        </button>
      </section>
    </div>
  );
}
