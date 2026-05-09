import React, { useEffect, useMemo, useState } from 'react';
import { Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import './OverviewStats.css';

const safe = (v, fallback = 0) => (v === null || v === undefined || Number.isNaN(v) ? fallback : v);

const useAnimatedNumber = (target, durationMs = 700) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = value;
    const to = Number(target) || 0;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / durationMs);
      const next = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      setValue(next);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return value;
};

const badgeTone = (score) => {
  if (score >= 85) return 'good';
  if (score >= 70) return 'warn';
  return 'danger';
};

const relativeTime = (isoOrDate) => {
  const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  const ms = Date.now() - d.getTime();
  if (Number.isNaN(ms)) return '—';
  const s = Math.floor(ms / 1000);
  if (s < 10) return 'Just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
};

const OverviewStats = ({
  stats,
  pendingApprovalsCount = 0,
  reportsDashboard = null,
  activity = [],
  onNavigate,
  onQuickAction,
  loading = false,
}) => {
  const StatCard = ({ icon, label, value, color }) => {
    const v = useAnimatedNumber(value);
    return (
      <div className="sa-stat-card" style={{ borderLeftColor: color }}>
        <div className="stat-icon" style={{ background: `${color}15`, color }}>
          {icon}
        </div>
        <div className="stat-info">
          <h3>{v}</h3>
          <p>{label}</p>
        </div>
      </div>
    );
  };

  const statCards = useMemo(
    () => [
      { icon: '👥', label: 'Total Users', value: safe(stats.totalUsers), color: '#667eea' },
      { icon: '🎓', label: 'Students', value: safe(stats.totalStudents), color: '#28a745' },
      { icon: '👨‍🏫', label: 'Examiners', value: safe(stats.totalExaminers), color: '#17a2b8' },
      { icon: '🏢', label: 'Companies', value: safe(stats.totalCompanies), color: '#fd7e14' },
      { icon: '📋', label: 'Coordinators', value: safe(stats.totalCoordinators), color: '#6f42c1' },
      { icon: '👨‍💼', label: 'Advisors', value: safe(stats.totalAdvisors), color: '#20c997' },
    ],
    [stats]
  );

  const rolePie = useMemo(() => {
    const rows = [
      ['Students', safe(stats.totalStudents), '#28a745'],
      ['Companies', safe(stats.totalCompanies), '#fd7e14'],
      ['Examiners', safe(stats.totalExaminers), '#17a2b8'],
      ['Advisors', safe(stats.totalAdvisors), '#20c997'],
      ['Coordinators', safe(stats.totalCoordinators), '#6f42c1'],
    ].filter((x) => x[1] > 0);

    return rows.map(([name, value, color]) => ({ name, value, color }));
  }, [stats]);

  const growthSeries = useMemo(() => {
    const trend = reportsDashboard?.userRegistration?.trend || [];
    return trend.map((t) => ({ month: (t.month || '').slice(5) || t.month, value: safe(t.count) }));
  }, [reportsDashboard]);

  const approvalBars = useMemo(() => {
    const ap = reportsDashboard?.approvalPipeline || {};
    const partner = ap.partner || {};
    const internship = ap.internship || {};
    const internshipPending = safe(internship.pending) + safe(internship.improvement);
    const internshipApproved = safe(internship.approved);
    const internshipRejected = safe(internship.rejected);
    return [
      { name: 'Partner pending', value: safe(partner.pending), color: '#f59e0b' },
      { name: 'Partner approved', value: safe(partner.approved), color: '#22c55e' },
      { name: 'Partner rejected', value: safe(partner.rejected), color: '#ef4444' },
      { name: 'Internship pending', value: internshipPending, color: '#0ea5e9' },
      { name: 'Internship approved', value: internshipApproved, color: '#22c55e' },
      { name: 'Internship rejected', value: internshipRejected, color: '#ef4444' },
    ];
  }, [reportsDashboard]);

  const aiCards = useMemo(() => {
    const urgent = [];
    const warnings = [];
    const recs = [];
    const predictions = [];

    if (pendingApprovalsCount > 0) urgent.push(`${pendingApprovalsCount} approval item(s) waiting review`);
    if (safe(stats.totalStudents) > safe(stats.totalExaminers) * 18) warnings.push('Examiner capacity may be low for current student volume');
    if (safe(stats.totalCompanies) < 10) warnings.push('Partner pool is small — consider outreach campaigns');

    recs.push('Run the weekly placement funnel report before department meetings');
    recs.push('Audit inactive accounts and reset credentials before intake week');
    predictions.push('User registrations expected to rise near internship posting periods');
    predictions.push('High workload departments may need additional advisors');

    return {
      urgent,
      warnings,
      recs,
      predictions,
    };
  }, [pendingApprovalsCount, stats]);

  const [health, setHealth] = useState({
    api: { status: 'checking', detail: '' },
    database: { status: 'checking', detail: '' },
    storage: { status: 'checking', detail: '' },
    memory: { status: 'checking', detail: '' },
    sessions: { status: 'unknown', detail: '—' },
    backup: { status: 'unknown', detail: '—' },
  });

  useEffect(() => {
    let cancelled = false;
    const ping = async () => {
      const start = performance.now();
      try {
        await fetch('/me', { credentials: 'include', headers: { Accept: 'application/json' } });
        const ms = Math.round(performance.now() - start);
        if (!cancelled) {
          setHealth((p) => ({
            ...p,
            api: { status: ms < 900 ? 'ok' : 'warn', detail: `${ms}ms` },
            database: { status: 'ok', detail: 'Connected' },
          }));
        }
      } catch {
        if (!cancelled) {
          setHealth((p) => ({
            ...p,
            api: { status: 'down', detail: 'Unreachable' },
            database: { status: 'down', detail: 'Unknown' },
          }));
        }
      }

      try {
        if (navigator.storage?.estimate) {
          const est = await navigator.storage.estimate();
          const used = est.usage ? Math.round(est.usage / (1024 * 1024)) : null;
          const quota = est.quota ? Math.round(est.quota / (1024 * 1024)) : null;
          const pct = used != null && quota != null && quota > 0 ? Math.round((used / quota) * 100) : null;
          if (!cancelled) {
            setHealth((p) => ({
              ...p,
              storage: {
                status: pct != null ? (pct >= 85 ? 'danger' : pct >= 65 ? 'warn' : 'ok') : 'unknown',
                detail: pct != null ? `${pct}% used` : '—',
              },
            }));
          }
        } else if (!cancelled) {
          setHealth((p) => ({ ...p, storage: { status: 'unknown', detail: '—' } }));
        }
      } catch {
        if (!cancelled) setHealth((p) => ({ ...p, storage: { status: 'unknown', detail: '—' } }));
      }

      try {
        const mem = performance?.memory?.usedJSHeapSize;
        const limit = performance?.memory?.jsHeapSizeLimit;
        if (mem && limit) {
          const pct = Math.round((mem / limit) * 100);
          if (!cancelled) {
            setHealth((p) => ({
              ...p,
              memory: {
                status: pct >= 85 ? 'danger' : pct >= 65 ? 'warn' : 'ok',
                detail: `${pct}% heap`,
              },
            }));
          }
        } else if (!cancelled) {
          setHealth((p) => ({ ...p, memory: { status: 'unknown', detail: '—' } }));
        }
      } catch {
        if (!cancelled) setHealth((p) => ({ ...p, memory: { status: 'unknown', detail: '—' } }));
      }
    };

    ping();
    const t = setInterval(ping, 45000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  const statusLabel = health.api.status === 'ok' ? 'Operational' : health.api.status === 'warn' ? 'Degraded' : health.api.status === 'down' ? 'Down' : 'Checking';
  const statusScore = health.api.status === 'ok' ? 92 : health.api.status === 'warn' ? 74 : health.api.status === 'down' ? 30 : 0;
  const statusBadge = badgeTone(statusScore);

  const totalUsersAnim = useAnimatedNumber(stats.totalUsers);

  return (
    <div className="sa-overview">
      <section className="sa-welcome-banner">
        <div className="sa-welcome-left">
          <h2>Welcome back, Super Admin</h2>
          <p>Monitor the system, approve requests, assign staff, and export analytics from one place.</p>
          <div className="sa-welcome-meta">
            <span className={`sa-status-pill ${statusBadge}`}>
              <span className="sa-status-dot" />
              System: {statusLabel}
            </span>
            <span className="sa-muted">Total users: {totalUsersAnim}</span>
          </div>
        </div>
        <div className="sa-welcome-actions">
          {[
            { id: 'register', label: 'Register', icon: '➕', to: 'student' },
            { id: 'approve', label: 'Approve', icon: '⏳', to: 'pending-approvals' },
            { id: 'assign', label: 'Assign', icon: '🧩', to: 'assign' },
            { id: 'report', label: 'Report', icon: '📈', to: 'reports-analytics' },
            { id: 'grades', label: 'Grades', icon: '🎓', to: 'internship-grades' },
            { id: 'backup', label: 'Backup', icon: '💾', to: null },
            { id: 'announce', label: 'Announce', icon: '📣', to: null },
          ].map((a) => (
            <button
              key={a.id}
              type="button"
              className="sa-quick-btn"
              onClick={() => {
                if (a.to) onNavigate?.(a.to);
                else onQuickAction?.(a.id);
              }}
            >
              <span className="sa-quick-icon">{a.icon}</span>
              <span className="sa-quick-label">{a.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="sa-stats-grid">
        {statCards.map((stat) => (
          <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} color={stat.color} />
        ))}
      </section>

      <div className="sa-overview-grid">
        <section className="sa-overview-card">
          <header className="sa-card-head">
            <h3>AI insights</h3>
            <span className="sa-card-chip">Live signals</span>
          </header>
          <div className="sa-ai-block">
            <div className="sa-ai-col">
              <h4>Urgent</h4>
              {aiCards.urgent.length ? (
                <ul>
                  {aiCards.urgent.map((x) => (
                    <li key={x}>🔴 {x}</li>
                  ))}
                </ul>
              ) : (
                <p className="sa-muted">No urgent alerts right now.</p>
              )}
            </div>
            <div className="sa-ai-col">
              <h4>Warnings</h4>
              {aiCards.warnings.length ? (
                <ul>
                  {aiCards.warnings.map((x) => (
                    <li key={x}>🟡 {x}</li>
                  ))}
                </ul>
              ) : (
                <p className="sa-muted">No warnings detected.</p>
              )}
            </div>
            <div className="sa-ai-col">
              <h4>Recommendations</h4>
              <ul>
                {aiCards.recs.map((x) => (
                  <li key={x}>✅ {x}</li>
                ))}
              </ul>
            </div>
            <div className="sa-ai-col">
              <h4>Predictions</h4>
              <ul>
                {aiCards.predictions.map((x) => (
                  <li key={x}>🔮 {x}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="sa-overview-card">
          <header className="sa-card-head">
            <h3>Recent activity</h3>
            <button type="button" className="sa-btn-ghost" onClick={() => onNavigate?.('audit-logs')}>
              View audit logs
            </button>
          </header>
          <div className="sa-activity-list">
            {activity.length ? (
              activity.slice(0, 7).map((item, idx) => (
                <div key={`${item.message}-${idx}`} className="sa-activity-row">
                  <span className="sa-activity-icon">{item.icon}</span>
                  <div className="sa-activity-main">
                    <span className="sa-activity-msg">{item.message}</span>
                    <span className="sa-activity-time">{relativeTime(item.at || item.time)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="sa-muted">No activity yet.</p>
            )}
          </div>
        </section>

        <section className="sa-overview-card sa-overview-card-wide">
          <header className="sa-card-head">
            <h3>Performance charts</h3>
            <span className="sa-card-chip">Last 6 months</span>
          </header>

          <div className="sa-charts-grid">
            <div className="sa-chart-card">
              <h4>User growth</h4>
              {loading ? (
                <div className="sa-skeleton sa-skel-chart" />
              ) : (
                <div className="sa-chart-wrap">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={growthSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#667eea" strokeWidth={3} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="sa-chart-card">
              <h4>Registrations by role</h4>
              {loading ? (
                <div className="sa-skeleton sa-skel-chart" />
              ) : (
                <div className="sa-chart-wrap">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={rolePie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                        {rolePie.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="sa-chart-card">
              <h4>Approval timeline</h4>
              {loading ? (
                <div className="sa-skeleton sa-skel-chart" />
              ) : (
                <div className="sa-chart-wrap">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={approvalBars}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} height={60} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value">
                        {approvalBars.map((x) => (
                          <Cell key={x.name} fill={x.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="sa-overview-card">
          <header className="sa-card-head">
            <h3>System health</h3>
            <span className="sa-card-chip">Auto refresh</span>
          </header>
          <div className="sa-health-grid">
            {[
              ['API', health.api],
              ['Database', health.database],
              ['Storage', health.storage],
              ['Memory', health.memory],
              ['Sessions', health.sessions],
              ['Last backup', health.backup],
            ].map(([label, val]) => (
              <div key={label} className={`sa-health-item ${val.status}`}>
                <span className="sa-health-label">{label}</span>
                <strong className="sa-health-detail">{val.detail || '—'}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default OverviewStats;
