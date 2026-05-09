import React, { useCallback, useEffect, useState } from 'react';
import { superAdminAPI } from '../../../services/http';
import './InternshipGradesPanel.css';

const readinessLabel = (r) => {
  switch (r) {
    case 'complete':
      return { text: 'Complete', className: 'ig-ready-complete' };
    case 'pending_company':
      return { text: 'Awaiting company', className: 'ig-ready-warn' };
    case 'pending_campus':
      return { text: 'Awaiting campus', className: 'ig-ready-warn' };
    default:
      return { text: 'Awaiting both', className: 'ig-ready-muted' };
  }
};

export default function InternshipGradesPanel() {
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 25, total: 0 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [completeOnly, setCompleteOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 320);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, completeOnly]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await superAdminAPI.getInternshipCompositeGrades({
        page,
        per_page: 25,
        search: debouncedSearch || undefined,
        complete_only: completeOnly ? 1 : undefined,
      });
      setSummary(res.data?.summary || null);
      setRows(res.data?.data || []);
      if (res.data?.meta) {
        setMeta(res.data.meta);
      }
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, completeOnly]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="ig-panel">
      <header className="ig-header">
        <div>
          <h2>Internship composite grades</h2>
          <p className="ig-sub">
            Combines <strong>company</strong> mid-internship and final reviews (both required; averaged 50/50) with the
            examiner <strong>campus (return)</strong> assessment. The official combined result appears only when all
            three pieces exist.
          </p>
          {summary?.weights && (
            <p className="ig-weights">
              Weights: company internship average {Math.round(summary.weights.company_internship * 100)}% · campus
              examiner {Math.round(summary.weights.campus_examiner * 100)}%
            </p>
          )}
        </div>
        <button type="button" className="sa-btn-secondary" onClick={() => load()} disabled={loading}>
          Refresh
        </button>
      </header>

      <div className="ig-toolbar">
        <label className="ig-search">
          <span>Search student</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, email, student code…"
          />
        </label>
        <label className="ig-check">
          <input
            type="checkbox"
            checked={completeOnly}
            onChange={(e) => setCompleteOnly(e.target.checked)}
          />
          <span>Show only complete (company mid + final + campus)</span>
        </label>
      </div>

      {loading && <div className="ig-loading">Loading…</div>}

      {!loading && (
        <div className="ig-table-wrap">
          <table className="ig-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Company / placement</th>
                <th>Company scores</th>
                <th>Campus</th>
                <th>Combined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const st = readinessLabel(row.readiness);
                return (
                  <tr key={row.application_id}>
                    <td>
                      <div className="ig-student">
                        <strong>{row.student?.name || '—'}</strong>
                        <span className="ig-muted">
                          {row.student?.student_code ? `${row.student.student_code} · ` : ''}#{row.student?.id}
                        </span>
                        {row.student?.department && (
                          <span className="ig-muted">{row.student.department}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="ig-stack">
                        <span>{row.company?.name || '—'}</span>
                        <span className="ig-muted">{row.internship_title || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="ig-stack">
                        <span>
                          Mid:{' '}
                          <strong>
                            {row.company_midterm?.overall_performance != null
                              ? row.company_midterm.overall_performance
                              : '—'}
                          </strong>
                        </span>
                        <span>
                          Final:{' '}
                          <strong>
                            {row.company_final?.overall_performance != null
                              ? row.company_final.overall_performance
                              : '—'}
                          </strong>
                        </span>
                        <span className="ig-muted">
                          Avg:{' '}
                          <strong>
                            {row.company_internship_average != null ? row.company_internship_average : '—'}
                          </strong>
                        </span>
                      </div>
                    </td>
                    <td>
                      {row.campus_evaluation ? (
                        <div className="ig-stack">
                          <strong>{row.campus_evaluation.overall_score ?? '—'}</strong>
                          <span className="ig-muted">Grade {row.campus_evaluation.grade || '—'}</span>
                        </div>
                      ) : (
                        <span className="ig-muted">—</span>
                      )}
                    </td>
                    <td>
                      {row.combined_score != null ? (
                        <div className="ig-combined">
                          <strong>{row.combined_score}</strong>
                          <span className="ig-grade-pill">{row.combined_grade}</span>
                        </div>
                      ) : (
                        <span className="ig-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`ig-ready ${st.className}`}>{st.text}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!rows.length && <div className="ig-empty">No placements match your filters.</div>}
        </div>
      )}

      {meta.last_page > 1 && (
        <div className="ig-pager">
          <button
            type="button"
            className="sa-btn-secondary"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="ig-muted">
            Page {meta.current_page} / {meta.last_page} ({meta.total} total)
          </span>
          <button
            type="button"
            className="sa-btn-secondary"
            disabled={page >= meta.last_page || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
