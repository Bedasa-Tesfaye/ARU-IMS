import React, { useMemo, useState } from 'react';

export default function AIInsightsPanel({ stats = {}, pendingApprovalsCount = 0 }) {
  const [dismissed, setDismissed] = useState(() => new Set());

  const suggestions = useMemo(
    () => ({
      high: [
        `${Math.max(0, stats.totalStudents - stats.totalExaminers * 20)} students may need examiner capacity review`,
        `${pendingApprovalsCount} items in pending approvals — review aging requests`,
        'Storage and backup health should be monitored on the application server',
      ],
      medium: [
        'Balance examiner workload across departments before peak application weeks',
        'Several internship posts may need renewal messaging to partners',
        'Engagement from some colleges can be boosted with targeted outreach',
      ],
      low: [
        'Consider adding examiner capacity in high-volume departments',
        'Schedule re-engagement emails for inactive company accounts',
        'Refresh internship posting guidelines for coordinators',
      ],
    }),
    [stats, pendingApprovalsCount]
  );

  const riskScore = 72;
  const riskLabel = 'Moderate';

  return (
    <div className="sa-ai-panel">
      <section className="sa-ai-card">
        <h2>🤖 AI system recommendations</h2>
        <p className="sa-muted">Illustrative priorities based on dashboard signals — connect to live models when available.</p>

        {['high', 'medium', 'low'].map((tier) => {
          const title = tier === 'high' ? '🔴 High priority' : tier === 'medium' ? '🟡 Medium priority' : '🟢 Suggestions';
          return (
            <div key={tier} className={`sa-ai-tier sa-ai-tier--${tier}`}>
              <h3>{title}</h3>
              <ul>
                {suggestions[tier].map((line, i) => {
                  const id = `${tier}-${i}`;
                  if (dismissed.has(id)) return null;
                  return (
                    <li key={id}>
                      {line}
                      <button type="button" className="sa-ai-dismiss" onClick={() => setDismissed((s) => new Set(s).add(id))}>
                        Dismiss
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        <div className="sa-ai-actions">
          <button type="button" className="sa-btn-secondary" onClick={() => setDismissed(new Set())}>
            Restore all
          </button>
          <button type="button" className="sa-btn-primary" onClick={() => window.alert('Apply flow can trigger automations when wired.')}>
            Apply selected
          </button>
        </div>
      </section>

      <section className="sa-ai-card">
        <h2>⚠️ Risk analysis</h2>
        <div className="sa-risk-score">
          <p>
            Risk score: <strong>{riskScore}/100</strong> ({riskLabel})
          </p>
          <div className="sa-risk-bar">
            <span style={{ width: `${riskScore}%` }} />
          </div>
        </div>
        <div className="sa-risk-grid">
          <div>
            <span className="sa-risk-pill high">🔴 High</span>
            <strong>3</strong>
            <span>Risks</span>
          </div>
          <div>
            <span className="sa-risk-pill med">🟡 Medium</span>
            <strong>7</strong>
            <span>Risks</span>
          </div>
          <div>
            <span className="sa-risk-pill low">🟢 Low</span>
            <strong>12</strong>
            <span>Risks</span>
          </div>
        </div>
        <ul className="sa-risk-cats">
          <li>Student dropout risk: 15%</li>
          <li>Placement failure risk: 22%</li>
          <li>Company churn risk: 10%</li>
          <li>System overload risk: 8%</li>
          <li>Data inconsistency risk: 5%</li>
        </ul>
        <button type="button" className="sa-btn-secondary">
          View detailed risk report
        </button>
      </section>

      <section className="sa-ai-card">
        <h2>📈 System performance metrics</h2>
        <div className="sa-chart-placeholder">
          <p>Line chart: user growth over time</p>
          <div className="sa-fake-line">Jan → Sep trend</div>
        </div>
        <div className="sa-chart-placeholder">
          <p>Bar chart: registrations by month</p>
          <div className="sa-fake-bars">
            {[40, 65, 55, 80, 72, 90, 60, 78, 85].map((h, i) => (
              <span key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="sa-chart-placeholder">
          <p>Pie chart: users by role</p>
          <div className="sa-fake-pie">
            Students 65% · Companies 12% · Examiners 15% · Advisors 5% · Coordinators 3%
          </div>
        </div>
        <div className="sa-chart-placeholder">
          <p>Peak usage hours</p>
          <ul className="sa-heatmap">
            <li>8–10am: High</li>
            <li>10–12pm: Very high</li>
            <li>12–2pm: Medium</li>
            <li>2–5pm: High</li>
          </ul>
        </div>
      </section>

      <section className="sa-ai-card">
        <h2>📊 Department analysis</h2>
        <p className="sa-muted">Radar and placement bars — connect to analytics service for live values.</p>
        <div className="sa-dept-bars">
          {[
            ['Computer Science', 85],
            ['Business Admin', 78],
            ['Engineering', 72],
            ['Law', 35],
          ].map(([name, pct]) => (
            <div key={name} className="sa-hbar-row">
              <span>{name}</span>
              <div className="sa-hbar-track">
                <span style={{ width: `${pct}%` }} />
              </div>
              <strong>{pct}%</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="sa-ai-card">
        <h2>📱 Barcode / QR analysis</h2>
        <p>Generate QR codes for student IDs, postings, companies, and reports.</p>
        <div className="sa-qr-grid">
          <div className="sa-qr-fake">
            <div className="sa-qr-pattern" />
            <span>Student ID sample</span>
          </div>
          <div className="sa-qr-fake">
            <div className="sa-qr-pattern" />
            <span>Report access</span>
          </div>
        </div>
        <ul className="sa-scan-stats">
          <li>Total scans (demo): 1,245</li>
          <li>Unique users: 892</li>
          <li>Most scanned: Student IDs (65%)</li>
        </ul>
        <div className="sa-ai-actions">
          <button type="button" className="sa-btn-primary">
            Generate new QR
          </button>
          <button type="button" className="sa-btn-secondary">
            View scan history
          </button>
        </div>
      </section>

      <section className="sa-ai-card">
        <h2>🔮 Predictive analytics</h2>
        <ul>
          <li>Next month registrations: ~45 students</li>
          <li>Placement rate forecast: 82%</li>
          <li>Peak application period: June 15–30</li>
          <li>Estimated at-risk students: 15</li>
        </ul>
        <h3>Trend analysis</h3>
        <ul>
          <li>Growing: CS, Business</li>
          <li>Declining: Law, Agriculture</li>
          <li>Stable: Health Sciences, Education</li>
        </ul>
      </section>
    </div>
  );
}
