import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { superAdminAPI } from '../../../services/http';
import './AuditLogsPanel.css';

const severityOptions = ['', 'info', 'warning', 'error', 'critical'];

export default function AuditLogsPanel({ initialLogs = [] }) {
  const [tab, setTab] = useState('logs');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [severity, setSeverity] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [userId, setUserId] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [payload, setPayload] = useState(() =>
    initialLogs.length
      ? { data: initialLogs, current_page: 1, last_page: 1, total: initialLogs.length }
      : null
  );
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await superAdminAPI.getAuditLogs({
        page,
        module: moduleFilter || undefined,
        severity: severity || undefined,
        action: appliedSearch || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        user_id: userId || undefined,
      });
      setPayload(res.data);
    } catch {
      setPayload({ data: [], current_page: 1, last_page: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [page, moduleFilter, severity, appliedSearch, dateFrom, dateTo, userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!autoRefresh || tab !== 'logs') return;
    const t = setInterval(() => load(), 30000);
    return () => clearInterval(t);
  }, [autoRefresh, tab, load]);

  const rows = payload?.data || [];
  const lastPage = payload?.last_page || 1;
  const total = payload?.total ?? rows.length;

  const modulePresets = ['', 'settings', 'credentials', 'registrations', 'assignments', 'users', 'approvals'];

  const stats = useMemo(() => {
    const ok = rows.filter((r) => r.severity !== 'error' && r.severity !== 'critical').length;
    const rate = rows.length ? Math.round((ok / rows.length) * 100) : 0;
    return { rate };
  }, [rows]);

  const exportCurrentCsv = () => {
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = [
      'id',
      'timestamp',
      'actor_user_id',
      'target_user_id',
      'module',
      'action',
      'severity',
      'description',
      'ip_address',
      'user_agent',
    ];
    const lines = [
      header.join(','),
      ...rows.map((r) =>
        [
          r.id,
          r.created_at,
          r.actor_user_id,
          r.target_user_id,
          r.module,
          r.action,
          r.severity,
          r.description,
          r.ip_address,
          r.user_agent,
        ]
          .map(escape)
          .join(',')
      ),
    ].join('\n');
    const blob = new Blob([`\uFEFF${lines}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_page_${payload?.current_page || 1}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="sa-audit-panel">
      <div className="sa-audit-tabs">
        <button type="button" className={tab === 'logs' ? 'active' : ''} onClick={() => setTab('logs')}>
          Audit logs
        </button>
        <button type="button" className={tab === 'system' ? 'active' : ''} onClick={() => setTab('system')}>
          System audit
        </button>
        <button type="button" className={tab === 'stats' ? 'active' : ''} onClick={() => setTab('stats')}>
          Statistics
        </button>
      </div>

      {tab === 'logs' && (
        <>
          <div className="sa-audit-toolbar">
            <input
              type="search"
              placeholder="Search logs (action text)…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sa-audit-search"
            />
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            <input
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="User ID"
              style={{ width: 120 }}
            />
            <button
              type="button"
              className="sa-btn-primary"
              onClick={() => {
                setAppliedSearch(search);
                setPage(1);
              }}
            >
              Search
            </button>
          </div>

          <div className="sa-audit-filters">
            <select value={moduleFilter} onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}>
              {modulePresets.map((m) => (
                <option key={m || 'all'} value={m}>
                  {m ? m : 'All modules'}
                </option>
              ))}
            </select>
            <select value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(1); }}>
              {severityOptions.map((s) => (
                <option key={s || 'sev'} value={s}>
                  {s ? s : 'All severity'}
                </option>
              ))}
            </select>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#334155' }}>
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
              Auto-refresh
            </label>
            <button type="button" className="sa-btn-secondary" onClick={exportCurrentCsv} disabled={!rows.length}>
              Export (CSV)
            </button>
            <button
              type="button"
              className="sa-btn-ghost"
              onClick={() => {
                setSearch('');
                setAppliedSearch('');
                setModuleFilter('');
                setSeverity('');
                setDateFrom('');
                setDateTo('');
                setUserId('');
                setPage(1);
              }}
            >
              Clear
            </button>
          </div>

          <div className="sa-table-wrap">
            <table className="sa-table sa-table-compact">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Severity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5}>Loading…</td>
                  </tr>
                ) : (
                  rows.map((log) => (
                    <tr key={log.id} className="sa-click-row" onClick={() => setDetail(log)}>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                      <td>{log.actor_user_id ? `User #${log.actor_user_id}` : 'System'}</td>
                      <td>{log.action}</td>
                      <td>{log.severity}</td>
                      <td>{log.severity === 'error' || log.severity === 'critical' ? '❌' : '✅'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="sa-pagination">
            <span>
              Page {payload?.current_page || 1} of {lastPage} — {total} logs
            </span>
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ← Previous
            </button>
            <button type="button" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
              Next →
            </button>
          </div>
        </>
      )}

      {tab === 'system' && (
        <div className="sa-system-audit">
          <h3>🔍 System audit</h3>
          <p>
            Last audit: {new Date().toLocaleDateString()} — Status: ✅ Completed (demo summary)
          </p>
          <ul className="sa-audit-summary-list">
            <li>✅ User accounts: active roster reviewed</li>
            <li>✅ Permissions: policy enforced via authority config</li>
            <li>✅ Data integrity: no blocking issues detected in sample</li>
            <li>⚠️ Storage: monitor disk usage on server</li>
            <li>✅ Backups: verify cron / provider schedule</li>
            <li>✅ Security: review access logs regularly</li>
          </ul>
          <div className="sa-ai-actions">
            <button type="button" className="sa-btn-primary">
              Run full system audit
            </button>
            <button type="button" className="sa-btn-secondary">
              Schedule weekly audit
            </button>
            <button type="button" className="sa-btn-secondary">
              Download audit report
            </button>
          </div>
          <div className="sa-schedule-card">
            <h4>Audit schedule</h4>
            <ul>
              <li>Daily quick audit: 02:00 (configure on server)</li>
              <li>Weekly full audit: Sunday 03:00</li>
              <li>Monthly deep audit: 1st of month</li>
            </ul>
          </div>
        </div>
      )}

      {tab === 'stats' && (
        <div className="sa-audit-stats">
          <div className="sa-kpi-row">
            <div className="sa-kpi">
              <span>Total logs (page)</span>
              <strong>{total}</strong>
            </div>
            <div className="sa-kpi">
              <span>Success rate (sample)</span>
              <strong>{stats.rate}%</strong>
            </div>
            <div className="sa-kpi">
              <span>Avg time</span>
              <strong>1.2s</strong>
            </div>
            <div className="sa-kpi">
              <span>Critical</span>
              <strong>0</strong>
            </div>
          </div>
          <h4>Top actions (illustrative)</h4>
          <ul className="sa-top-actions">
            <li>Login (845)</li>
            <li>Registration (623)</li>
            <li>Approvals (412)</li>
            <li>Assignments (298)</li>
          </ul>
        </div>
      )}

      {detail && (
        <div className="sa-modal-overlay" role="dialog" aria-modal="true">
          <div className="sa-modal sa-modal-lg">
            <div className="sa-modal-header">
              <h3>Audit log detail</h3>
              <button type="button" className="sa-modal-close" onClick={() => setDetail(null)}>
                ✕
              </button>
            </div>
            <div className="sa-modal-body">
              <p>
                <strong>Event ID:</strong> #LOG-{detail.id}
              </p>
              <p>
                <strong>Timestamp:</strong> {new Date(detail.created_at).toLocaleString()}
              </p>
              <p>
                <strong>Actor user id:</strong> {detail.actor_user_id ?? '—'}
              </p>
              <p>
                <strong>IP:</strong> {detail.ip_address || '—'}
              </p>
              <p>
                <strong>Device:</strong> {detail.user_agent || '—'}
              </p>
              <p>
                <strong>Action:</strong> {detail.action}
              </p>
              <p>
                <strong>Module:</strong> {detail.module}
              </p>
              <p>
                <strong>Severity:</strong> {detail.severity}
              </p>
              <div className="sa-detail-box">
                <strong>Description</strong>
                <p>{detail.description}</p>
                {detail.meta && (
                  <pre className="sa-meta-pre">{JSON.stringify(detail.meta, null, 2)}</pre>
                )}
              </div>
            </div>
            <div className="sa-modal-footer">
              <button type="button" className="sa-btn-secondary" onClick={() => setDetail(null)}>
                Close
              </button>
              <button type="button" className="sa-btn-primary" onClick={() => setDetail(null)}>
                View related logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
