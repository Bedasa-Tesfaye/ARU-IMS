import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { superAdminAPI } from '../../../services/http';
import { COLLEGE_NAMES } from '../data/collegeDepartments';
import ExportReportModal from './ExportReportModal';
import './ReportsAnalyticsPanel.css';

const ROLES = ['', 'student', 'company', 'examiner', 'advisor', 'admin', 'coordinator', 'super_admin'];

async function exportReportBlob(reportType, format, filters, options) {
  const response = await superAdminAPI.exportReport({
    type: reportType,
    format: format === 'pdf' ? 'pdf' : format,
    filters,
    options,
  });

  const cd = response.headers['content-disposition'] || response.headers['Content-Disposition'] || '';
  const m = cd.match(/filename\*?=(?:UTF-8'')?["']?([^\"';]+)/i) || cd.match(/filename="([^"]+)"/i);
  let filename = m
    ? decodeURIComponent(m[1].trim())
    : `${reportType}_report.${format === 'excel' ? 'xls' : format === 'csv' ? 'csv' : 'html'}`;

  const mime =
    format === 'csv'
      ? 'text/csv;charset=utf-8'
      : format === 'excel'
        ? 'application/vnd.ms-excel'
        : 'text/html;charset=utf-8';

  const blob = new Blob([response.data], { type: response.headers['content-type'] || mime });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

function BarChart({ rows, labelKey = 'label', valueKey = 'value', color = '#6366f1' }) {
  const max = Math.max(1, ...rows.map((r) => r[valueKey]));
  return (
    <div className="sa-bar-chart">
      {rows.map((r) => (
        <div key={r[labelKey]} className="sa-bar-wrap">
          <div
            className="sa-bar"
            style={{ height: `${(r[valueKey] / max) * 100}%`, background: color }}
            title={`${r[labelKey]}: ${r[valueKey]}`}
          />
          <span className="sa-bar-label">{String(r[labelKey]).slice(0, 8)}</span>
        </div>
      ))}
    </div>
  );
}

export default function ReportsAnalyticsPanel({ departments = [] }) {
  const [tab, setTab] = useState('system');

  const [collegeName, setCollegeName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [role, setRole] = useState('');
  const [userStatus, setUserStatus] = useState('all');
  const [studentYear, setStudentYear] = useState('');
  const [approvalType, setApprovalType] = useState('all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const [exportOpen, setExportOpen] = useState(false);
  const [exportCtx, setExportCtx] = useState({ type: 'user_registration', title: '' });
  const [exporting, setExporting] = useState(false);

  const [schedules, setSchedules] = useState(() => {
    try {
      const raw = localStorage.getItem('aru_sa_report_schedules');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [newSchedule, setNewSchedule] = useState({
    enabled: true,
    name: 'Weekly system report',
    frequency: 'weekly', // daily | weekly | monthly
    dayOfWeek: 'Mon',
    time: '08:00',
    reportType: 'user_registration',
    format: 'pdf',
  });

  const persistSchedules = (next) => {
    setSchedules(next);
    localStorage.setItem('aru_sa_report_schedules', JSON.stringify(next));
  };

  const queryParams = useMemo(() => {
    const p = {};
    if (departmentId) p.department_id = Number(departmentId);
    if (companyId) p.company_id = Number(companyId);
    if (dateFrom) p.date_from = dateFrom;
    if (dateTo) p.date_to = dateTo;
    if (role) p.role = role;
    if (collegeName) p.college_name = collegeName;
    if (userStatus && userStatus !== 'all') p.user_status = userStatus;
    if (studentYear) p.student_year = studentYear;
    if (approvalType && approvalType !== 'all') p.approval_type = approvalType;
    return p;
  }, [collegeName, departmentId, companyId, dateFrom, dateTo, role, userStatus, studentYear, approvalType]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await superAdminAPI.getReportsDashboard(queryParams);
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load report data.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    load();
  }, [load]);

  const openExport = (type, title) => {
    setExportCtx({ type, title });
    setExportOpen(true);
  };

  const deptList = departments.length ? departments : data?.filterOptions?.departments || [];
  const companiesList = data?.filterOptions?.companies || [];

  const ur = data?.userRegistration;
  const ap = data?.approvalPipeline;
  const ar = data?.assignmentReport;
  const sd = data?.studentDistribution;
  const ew = data?.examinerWorkload || [];
  const ps = data?.placementStats;
  const ce = data?.companyEngagement || {};
  const companiesRanked = ce.companiesRanked || [];
  const monthlyTrend = ce.monthlyTrend || [];
  const maxMonth = Math.max(1, ...monthlyTrend.map((m) => m.count));

  const regTrendRows = (ur?.trend || []).map((x) => ({ label: x.month, value: x.count }));
  const collegePieRows = Object.entries(sd?.by_college || {}).map(([label, value]) => ({ label, value }));
  const deptBarRows = Object.entries(sd?.by_department || {})
    .map(([label, value]) => ({ label, value }))
    .slice(0, 12);

  return (
    <div className="sa-reports-panel">
      <header className="sa-panel-header">
        <div>
          <h2>Reports &amp; Analytics</h2>
          <p className="sa-panel-sub">System, academic, and company intelligence — export any section.</p>
        </div>
      </header>

      <nav className="sa-report-tabs" aria-label="Report categories">
        {[
          { id: 'system', label: 'A. System' },
          { id: 'academic', label: 'B. Academic' },
          { id: 'company', label: 'C. Company' },
        ].map((t) => (
          <button key={t.id} type="button" className={`sa-report-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      <section className="sa-report-filters">
        <h3>Shared filters</h3>
        <div className="sa-filter-grid">
          <label>
            Date from
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </label>
          <label>
            Date to
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </label>
          <label>
            College (mapping)
            <select value={collegeName} onChange={(e) => setCollegeName(e.target.value)}>
              <option value="">All colleges</option>
              {COLLEGE_NAMES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label>
            Department
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">All departments</option>
              {deptList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Company
            <select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
              <option value="">All companies</option>
              {companiesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Role (user registration)
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">All roles</option>
              {ROLES.filter(Boolean).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label>
            User status
            <select value={userStatus} onChange={(e) => setUserStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label>
            Student year (distribution)
            <input value={studentYear} onChange={(e) => setStudentYear(e.target.value)} placeholder="e.g. 3" />
          </label>
          <label>
            Approvals lens
            <select value={approvalType} onChange={(e) => setApprovalType(e.target.value)}>
              <option value="all">All</option>
              <option value="partner">Partner</option>
              <option value="internship">Internship</option>
            </select>
          </label>
        </div>
        <div className="sa-filter-actions">
          <button type="button" className="sa-btn-secondary" onClick={load} disabled={loading}>
            Apply filters
          </button>
          <button
            type="button"
            className="sa-btn-ghost"
            onClick={() => {
              setCollegeName('');
              setDepartmentId('');
              setCompanyId('');
              setDateFrom('');
              setDateTo('');
              setRole('');
              setUserStatus('all');
              setStudentYear('');
              setApprovalType('all');
            }}
          >
            Clear
          </button>
        </div>
      </section>

      {error && <div className="sa-inline-error">{error}</div>}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          {tab === 'system' && (
            <>
              <section className="sa-report-section">
                <div className="sa-report-section-head">
                  <h3>1. User registration report</h3>
                  <button type="button" className="sa-btn-primary sa-btn-sm" onClick={() => openExport('user_registration', 'User registration')}>
                    Export
                  </button>
                </div>
                <div className="sa-kpi-row">
                  <div className="sa-kpi">
                    <span>Total new users</span>
                    <strong>{ur?.summary?.total_new_users ?? 0}</strong>
                  </div>
                  <div className="sa-kpi">
                    <span>Growth vs prev.</span>
                    <strong>{ur?.summary?.growth_percent != null ? `${ur.summary.growth_percent}%` : '—'}</strong>
                  </div>
                </div>
                <div className="sa-kpi-row">
                  {Object.entries(ur?.summary?.by_role || {}).map(([k, v]) => (
                    <div key={k} className="sa-kpi">
                      <span>{k}</span>
                      <strong>{v}</strong>
                    </div>
                  ))}
                </div>
                <div className="sa-chart-block">
                  <h4>Registration trend</h4>
                  {regTrendRows.length ? <BarChart rows={regTrendRows} /> : <p className="sa-muted">No trend for filters.</p>}
                </div>
                <div className="sa-table-wrap">
                  <h4>User list</h4>
                  <table className="sa-table sa-table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Dept</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(ur?.users || []).map((u) => (
                        <tr key={u.id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.role}</td>
                          <td>{u.department || '—'}</td>
                          <td>{u.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="sa-report-section">
                <div className="sa-report-section-head">
                  <h3>2. Approval pipeline</h3>
                  <button type="button" className="sa-btn-primary sa-btn-sm" onClick={() => openExport('approval_pipeline', 'Approval pipeline')}>
                    Export
                  </button>
                </div>
                <div className="sa-kpi-row">
                  <div className="sa-kpi">
                    <span>Partner pending</span>
                    <strong>{ap?.partner?.pending ?? 0}</strong>
                  </div>
                  <div className="sa-kpi">
                    <span>Partner approved</span>
                    <strong>{ap?.partner?.approved ?? 0}</strong>
                  </div>
                  <div className="sa-kpi">
                    <span>Partner rejected</span>
                    <strong>{ap?.partner?.rejected ?? 0}</strong>
                  </div>
                  <div className="sa-kpi">
                    <span>Avg review (hrs)</span>
                    <strong>{ap?.metrics?.avg_internship_review_hours ?? '—'}</strong>
                  </div>
                  <div className="sa-kpi">
                    <span>Internship approval %</span>
                    <strong>{ap?.metrics?.internship_approval_rate_percent ?? '—'}</strong>
                  </div>
                </div>
                <div className="sa-chart-block">
                  <h4>Internship submission status</h4>
                  <BarChart
                    rows={Object.entries(ap?.internship || {}).map(([label, value]) => ({ label, value }))}
                    color="#0ea5e9"
                  />
                </div>
              </section>

              <section className="sa-report-section">
                <div className="sa-report-section-head">
                  <h3>3. Assignment snapshot</h3>
                  <button type="button" className="sa-btn-primary sa-btn-sm" onClick={() => openExport('assignment_report', 'Assignments')}>
                    Export
                  </button>
                </div>
                <div className="sa-chart-block">
                  <h4>Students per department (rows loaded)</h4>
                  <BarChart
                    rows={Object.entries(ar?.distribution || {}).map(([label, value]) => ({ label, value }))}
                    color="#22c55e"
                  />
                </div>
                <div className="sa-table-wrap">
                  <table className="sa-table sa-table-striped">
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Advisor links</th>
                        <th>Examiner links</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(ar?.rows || []).map((r, i) => (
                        <tr key={`${r.student_id}-${i}`}>
                          <td>{r.student_id}</td>
                          <td>{r.name}</td>
                          <td>{r.department}</td>
                          <td>{r.advisor_links}</td>
                          <td>{r.examiner_links}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {tab === 'academic' && (
            <>
              <section className="sa-report-section">
                <div className="sa-report-section-head">
                  <h3>4. Student distribution</h3>
                  <button type="button" className="sa-btn-primary sa-btn-sm" onClick={() => openExport('student_distribution', 'Student distribution')}>
                    Export
                  </button>
                </div>
                <div className="sa-kpi-row">
                  <div className="sa-kpi">
                    <span>Students in scope</span>
                    <strong>{sd?.total_students ?? 0}</strong>
                  </div>
                </div>
                <div className="sa-chart-block">
                  <h4>By college</h4>
                  {collegePieRows.length ? <BarChart rows={collegePieRows} color="#a855f7" /> : <p className="sa-muted">No students.</p>}
                </div>
                <div className="sa-chart-block">
                  <h4>By department (top 12)</h4>
                  {deptBarRows.length ? <BarChart rows={deptBarRows} color="#f97316" /> : <p className="sa-muted">No departments.</p>}
                </div>
              </section>

              <section className="sa-report-section">
                <div className="sa-report-section-head">
                  <h3>5. Examiner workload</h3>
                  <button type="button" className="sa-btn-primary sa-btn-sm" onClick={() => openExport('examiner_workload', 'Examiner workload')}>
                    Export
                  </button>
                </div>
                <p className="sa-muted">Bands: green 0–5, orange 6–10, red 11+ distinct students.</p>
                <div className="sa-table-wrap">
                  <table className="sa-table sa-table-striped">
                    <thead>
                      <tr>
                        <th>Examiner</th>
                        <th>Students</th>
                        <th>Band</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ew.map((r) => (
                        <tr key={r.examiner_id}>
                          <td>{r.name}</td>
                          <td>{r.students}</td>
                          <td>
                            <span className={`sa-workload-badge sa-wl-${r.band}`}>{r.band}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!ew.length && <p className="sa-muted">No examiner evaluation rows yet.</p>}
                </div>
                <div className="sa-insight-box">
                  <strong>Recommendations</strong>
                  <p>Balance students in the red band by redistributing cohorts or adding examiners in busy departments.</p>
                </div>
              </section>

              <section className="sa-report-section">
                <div className="sa-report-section-head">
                  <h3>6. Placement statistics</h3>
                  <button type="button" className="sa-btn-primary sa-btn-sm" onClick={() => openExport('placement_statistics', 'Placement statistics')}>
                    Export
                  </button>
                </div>
                <div className="sa-kpi-row">
                  {Object.entries(ps?.funnel || {}).map(([k, v]) => (
                    <div key={k} className="sa-kpi">
                      <span>{k}</span>
                      <strong>{v}</strong>
                    </div>
                  ))}
                  <div className="sa-kpi">
                    <span>Placement rate</span>
                    <strong>{ps?.placement_rate_percent != null ? `${ps.placement_rate_percent}%` : '—'}</strong>
                  </div>
                </div>
              </section>
            </>
          )}

          {tab === 'company' && (
            <section className="sa-report-section">
              <div className="sa-report-section-head">
                <h3>7. Company engagement</h3>
                <button type="button" className="sa-btn-primary sa-btn-sm" onClick={() => openExport('company_engagement', 'Company engagement')}>
                  Export
                </button>
              </div>
              <p className="sa-muted">Companies ranked by internship postings (respects shared filters).</p>
              <div className="sa-kpi-row">
                <div className="sa-kpi">
                  <span>Total postings</span>
                  <strong>{ce?.totals?.internships ?? 0}</strong>
                </div>
                <div className="sa-kpi">
                  <span>Companies</span>
                  <strong>{ce?.totals?.companies ?? 0}</strong>
                </div>
              </div>
              <div className="sa-chart-block">
                <h4>Posts per month trend</h4>
                <div className="sa-bar-chart">
                  {monthlyTrend.map((m) => (
                    <div key={m.month} className="sa-bar-wrap">
                      <div className="sa-bar" style={{ height: `${(m.count / maxMonth) * 100}%` }} title={`${m.month}: ${m.count}`} />
                      <span className="sa-bar-label">{m.month?.slice(5)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sa-table-wrap">
                <h4>Company activity</h4>
                <table className="sa-table sa-table-striped">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Company</th>
                      <th>Postings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companiesRanked.map((row, idx) => (
                      <tr key={row.company_id}>
                        <td>{idx + 1}</td>
                        <td>{row.company_name}</td>
                        <td>{row.posting_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!companiesRanked.length && <p className="sa-muted">No postings for current filters.</p>}
              </div>
            </section>
          )}

          <section className="sa-report-section">
            <div className="sa-report-section-head">
              <h3>8. Schedule automated reports</h3>
              <span className="sa-muted">Saved locally (server scheduler wiring pending).</span>
            </div>

            <div className="sa-kpi-row">
              <div className="sa-kpi">
                <span>Schedules</span>
                <strong>{schedules.length}</strong>
              </div>
              <div className="sa-kpi">
                <span>Enabled</span>
                <strong>{schedules.filter((s) => s.enabled).length}</strong>
              </div>
            </div>

            <div className="sa-filter-grid" style={{ marginTop: 0 }}>
              <label>
                Name
                <input value={newSchedule.name} onChange={(e) => setNewSchedule((p) => ({ ...p, name: e.target.value }))} />
              </label>
              <label>
                Frequency
                <select value={newSchedule.frequency} onChange={(e) => setNewSchedule((p) => ({ ...p, frequency: e.target.value }))}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </label>
              <label>
                Day (weekly)
                <select
                  value={newSchedule.dayOfWeek}
                  onChange={(e) => setNewSchedule((p) => ({ ...p, dayOfWeek: e.target.value }))}
                  disabled={newSchedule.frequency !== 'weekly'}
                >
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Time
                <input type="time" value={newSchedule.time} onChange={(e) => setNewSchedule((p) => ({ ...p, time: e.target.value }))} />
              </label>
              <label>
                Report type
                <select value={newSchedule.reportType} onChange={(e) => setNewSchedule((p) => ({ ...p, reportType: e.target.value }))}>
                  <option value="user_registration">User registration</option>
                  <option value="approval_pipeline">Approval pipeline</option>
                  <option value="assignment_report">Assignment report</option>
                  <option value="student_distribution">Student distribution</option>
                  <option value="examiner_workload">Examiner workload</option>
                  <option value="placement_statistics">Placement statistics</option>
                  <option value="company_engagement">Company engagement</option>
                </select>
              </label>
              <label>
                Format
                <select value={newSchedule.format} onChange={(e) => setNewSchedule((p) => ({ ...p, format: e.target.value }))}>
                  <option value="pdf">PDF (HTML)</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </label>
            </div>

            <div className="sa-filter-actions">
              <button
                type="button"
                className="sa-btn-primary"
                onClick={() => {
                  const entry = { ...newSchedule, id: `${Date.now()}` };
                  persistSchedules([entry, ...schedules].slice(0, 20));
                }}
              >
                Add schedule
              </button>
              <button type="button" className="sa-btn-secondary" onClick={() => persistSchedules([])} disabled={!schedules.length}>
                Clear schedules
              </button>
            </div>

            <div className="sa-table-wrap" style={{ marginTop: '0.75rem' }}>
              <table className="sa-table sa-table-striped">
                <thead>
                  <tr>
                    <th>Enabled</th>
                    <th>Name</th>
                    <th>Frequency</th>
                    <th>When</th>
                    <th>Report</th>
                    <th>Format</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.length ? (
                    schedules.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={!!s.enabled}
                            onChange={(e) => persistSchedules(schedules.map((x) => (x.id === s.id ? { ...x, enabled: e.target.checked } : x)))}
                          />
                        </td>
                        <td>{s.name}</td>
                        <td>{s.frequency}</td>
                        <td>
                          {s.frequency === 'weekly' ? `${s.dayOfWeek} ${s.time}` : s.frequency === 'daily' ? s.time : `1st ${s.time}`}
                        </td>
                        <td>{s.reportType}</td>
                        <td>{s.format}</td>
                        <td style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            className="sa-btn-secondary sa-btn-sm"
                            onClick={async () => {
                              setExporting(true);
                              try {
                                await exportReportBlob(s.reportType, s.format, queryParams, {
                                  includeCharts: true,
                                  includeTables: true,
                                  includeSummary: true,
                                  includeAIInsights: false,
                                  includeCover: true,
                                  pageSize: 'A4',
                                  orientation: 'portrait',
                                });
                              } catch (e) {
                                window.alert(e.response?.data?.message || 'Export failed.');
                              } finally {
                                setExporting(false);
                              }
                            }}
                          >
                            Run now
                          </button>
                          <button
                            type="button"
                            className="sa-btn-danger sa-btn-sm"
                            onClick={() => persistSchedules(schedules.filter((x) => x.id !== s.id))}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="sa-muted">
                        No schedules yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {exportOpen && (
        <ExportReportModal
          reportType={exportCtx.type}
          reportTitle={exportCtx.title}
          filters={queryParams}
          exporting={exporting}
          onClose={() => setExportOpen(false)}
          onExport={async (payload) => {
            setExporting(true);
            try {
              await exportReportBlob(payload.type, payload.format, payload.filters, payload.options);
              setExportOpen(false);
            } catch (e) {
              window.alert(e.response?.data?.message || 'Export failed.');
            } finally {
              setExporting(false);
            }
          }}
        />
      )}
    </div>
  );
}
