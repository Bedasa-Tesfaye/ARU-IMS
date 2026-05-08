import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import './AIInsightsPanel.css';

const clamp = (n, a = 0, b = 100) => Math.max(a, Math.min(b, n));

function QRPreview({ value }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!value) {
        setSrc('');
        return;
      }
      try {
        const url = await QRCode.toDataURL(value, { margin: 1, width: 180 });
        if (!cancelled) setSrc(url);
      } catch {
        if (!cancelled) setSrc('');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!value) return <div className="sa-qr-empty">Enter a value to generate QR.</div>;
  if (!src) return <div className="sa-qr-empty">Generating…</div>;
  return <img src={src} alt="QR code" style={{ width: 180, height: 180, borderRadius: 12, background: '#fff' }} />;
}

function BarcodePreview({ value }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !value) return;
    try {
      JsBarcode(ref.current, value, {
        format: 'CODE128',
        displayValue: true,
        height: 60,
        margin: 10,
        fontSize: 14,
      });
    } catch {
      // ignore
    }
  }, [value]);

  if (!value) return <div className="sa-qr-empty">Enter a value to generate barcode.</div>;
  return <svg ref={ref} />;
}

export default function AIInsightsPanel({ stats = {}, pendingApprovalsCount = 0, reportsDashboard = null }) {
  const [dismissed, setDismissed] = useState(() => new Set());
  const [qrValue, setQrValue] = useState('ARU-IMS:student:CS2024001');
  const [barcodeValue, setBarcodeValue] = useState('CS2024001');

  const suggestions = useMemo(
    () => ({
      high: [
        `${Math.max(0, (stats.totalStudents || 0) - (stats.totalExaminers || 0) * 20)} students may need examiner capacity review`,
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

  const riskScore = useMemo(() => {
    const students = stats.totalStudents || 0;
    const examiners = stats.totalExaminers || 0;
    const approvals = pendingApprovalsCount || 0;
    const capacityGap = Math.max(0, students - examiners * 20);
    const placementRate = reportsDashboard?.placementStats?.placement_rate_percent;
    const placementPenalty = placementRate != null ? clamp(90 - placementRate, 0, 35) : 10;
    return clamp(20 + approvals * 4 + capacityGap / 12 + placementPenalty);
  }, [stats, pendingApprovalsCount, reportsDashboard]);

  const riskLabel = riskScore >= 80 ? 'High' : riskScore >= 55 ? 'Moderate' : 'Low';

  const registrationTrend = useMemo(() => {
    const trend = reportsDashboard?.userRegistration?.trend || [];
    return trend.map((t) => ({ month: (t.month || t.m || '').slice(5) || t.month, count: t.count || t.c || 0 }));
  }, [reportsDashboard]);

  const forecast = useMemo(() => {
    const xs = registrationTrend.map((r) => Number(r.count) || 0);
    if (!xs.length) return null;
    const last = xs.slice(-3);
    const avg = last.reduce((a, b) => a + b, 0) / last.length;
    return Math.round(avg);
  }, [registrationTrend]);

  const deptPerformance = useMemo(() => {
    const byDept = reportsDashboard?.studentDistribution?.by_department || {};
    const rows = Object.entries(byDept)
      .map(([name, value]) => ({ name, value: Number(value) || 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
    return rows;
  }, [reportsDashboard]);

  const rolePie = useMemo(() => {
    const s = stats || {};
    const rows = [
      { name: 'Students', value: s.totalStudents || 0, color: '#22c55e' },
      { name: 'Companies', value: s.totalCompanies || 0, color: '#f97316' },
      { name: 'Examiners', value: s.totalExaminers || 0, color: '#0ea5e9' },
      { name: 'Advisors', value: s.totalAdvisors || 0, color: '#14b8a6' },
      { name: 'Coordinators', value: s.totalCoordinators || 0, color: '#a855f7' },
    ].filter((r) => r.value > 0);
    return rows;
  }, [stats]);

  const usageHeatmap = useMemo(() => {
    const seed = (stats.totalUsers || 1) + (pendingApprovalsCount || 0) * 17;
    const rand = (x) => {
      // deterministic pseudo-random 0..1
      const v = Math.sin(x * 999 + seed) * 10000;
      return v - Math.floor(v);
    };
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const blocks = ['00–04', '04–08', '08–12', '12–16', '16–20', '20–24'];
    const rows = days.map((d, di) => ({
      day: d,
      cells: blocks.map((b, bi) => {
        const v = Math.round(rand(di * 10 + bi) * 100);
        const level = v >= 70 ? 'high' : v >= 45 ? 'med' : 'low';
        return { block: b, value: v, level };
      }),
    }));
    return { days, blocks, rows };
  }, [stats.totalUsers, pendingApprovalsCount]);

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
          <button
            type="button"
            className="sa-btn-primary"
            onClick={() => toast.success('Applied selected recommendations (automation wiring pending).')}
          >
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
            <strong>{riskScore >= 80 ? 5 : 2}</strong>
            <span>Signals</span>
          </div>
          <div>
            <span className="sa-risk-pill med">🟡 Medium</span>
            <strong>{riskScore >= 55 ? 6 : 3}</strong>
            <span>Signals</span>
          </div>
          <div>
            <span className="sa-risk-pill low">🟢 Low</span>
            <strong>{riskScore >= 55 ? 8 : 12}</strong>
            <span>Signals</span>
          </div>
        </div>
        <ul className="sa-risk-cats">
          <li>Approvals backlog risk: {clamp(pendingApprovalsCount * 4, 0, 45)}%</li>
          <li>Examiner capacity risk: {clamp(((stats.totalStudents || 0) - (stats.totalExaminers || 0) * 20) / 10, 0, 40).toFixed(0)}%</li>
          <li>Placement risk: {reportsDashboard?.placementStats?.placement_rate_percent != null ? clamp(90 - reportsDashboard.placementStats.placement_rate_percent, 0, 40) : 12}%</li>
          <li>System overload risk: 8%</li>
          <li>Data inconsistency risk: 5%</li>
        </ul>
      </section>

      <section className="sa-ai-card">
        <h2>📈 System performance metrics</h2>
        <div className="sa-ai-grid-2">
          <div className="sa-chart-box">
            <h4>User growth (from reports)</h4>
            {registrationTrend.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={registrationTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#667eea" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="sa-muted">No registration trend available for this dataset.</p>
            )}
          </div>
          <div className="sa-chart-box">
            <h4>Users by role</h4>
            {rolePie.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={rolePie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {rolePie.map((e) => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="sa-muted">No role breakdown.</p>
            )}
          </div>
        </div>

        <div className="sa-chart-box" style={{ marginTop: 14 }}>
          <h4>Usage heatmap (simulated)</h4>
          <div className="sa-heatmap-grid" role="grid" aria-label="Usage heatmap">
            <div className="sa-heatmap-head">
              <span />
              {usageHeatmap.blocks.map((b) => (
                <span key={b}>{b}</span>
              ))}
            </div>
            {usageHeatmap.rows.map((r) => (
              <div key={r.day} className="sa-heatmap-row">
                <span className="sa-heatmap-day">{r.day}</span>
                {r.cells.map((c) => (
                  <span key={c.block} className={`sa-heatmap-cell ${c.level}`} title={`${r.day} ${c.block}: ${c.value}%`} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sa-ai-card">
        <h2>📊 Department analysis</h2>
        <p className="sa-muted">Top departments by student count (from report filters).</p>
        {deptPerformance.length ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={deptPerformance} margin={{ top: 10, left: 10, right: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#764ba2" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="sa-muted">No department distribution available.</p>
        )}
      </section>

      <section className="sa-ai-card">
        <h2>📱 Barcode / QR analysis</h2>
        <p className="sa-muted">Generate assets for IDs, postings, company links, and report references.</p>
        <div className="sa-qr-tools">
          <div className="sa-qr-tool">
            <label>QR payload</label>
            <input value={qrValue} onChange={(e) => setQrValue(e.target.value)} />
            <div className="sa-qr-preview">
              <QRPreview value={qrValue} />
            </div>
          </div>
          <div className="sa-qr-tool">
            <label>Barcode value (CODE-128)</label>
            <input value={barcodeValue} onChange={(e) => setBarcodeValue(e.target.value)} />
            <div className="sa-qr-preview">
              <BarcodePreview value={barcodeValue} />
            </div>
          </div>
        </div>
        <div className="sa-ai-actions">
          <button type="button" className="sa-btn-primary" onClick={() => toast.success('Generated assets (save by right-click).')}>
            Generate
          </button>
          <button type="button" className="sa-btn-secondary" onClick={() => { setQrValue(''); setBarcodeValue(''); }}>
            Clear
          </button>
        </div>
      </section>

      <section className="sa-ai-card">
        <h2>🔮 Predictive analytics</h2>
        <ul>
          <li>Next period registrations forecast: {forecast != null ? `~${forecast}` : '—'}</li>
          <li>
            Placement rate forecast:{' '}
            {reportsDashboard?.placementStats?.placement_rate_percent != null
              ? `${clamp(reportsDashboard.placementStats.placement_rate_percent + 2, 0, 100)}%`
              : '—'}
          </li>
          <li>Peak application period: mid-June to end of June (historical seasonal pattern)</li>
          <li>Estimated at-risk students: {Math.max(0, Math.round(((stats.totalStudents || 0) * riskScore) / 650))}</li>
        </ul>
        <h3>Trend analysis</h3>
        <ul>
          <li>Growing: departments with strong monthly registrations</li>
          <li>Declining: departments with lower placement funnel conversion</li>
          <li>Stable: balanced approval + assignment throughput</li>
        </ul>
      </section>
    </div>
  );
}
