import React, { useEffect, useMemo, useState } from 'react';
import { companyAPI } from '../../../services/http';
import './CompanyEvaluation.css';

function InternPicker({ interns, search, onSearch, selectedStudentId, onSelect }) {
  const rows = useMemo(() => {
    const q = String(search || '').trim().toLowerCase();
    return (interns || []).filter((row) => {
      if (!q) return true;
      const name = `${row.student?.first_name || ''} ${row.student?.last_name || ''}`.toLowerCase();
      const code = String(row.student?.student_id || '').toLowerCase();
      const uid = String(row.student?.id || '');
      const appId = String(row.application_id || '');
      const prog = String(row.internship_title || '').toLowerCase();
      return (
        name.includes(q) ||
        code.includes(q) ||
        uid === q ||
        appId === q ||
        prog.includes(q)
      );
    });
  }, [interns, search]);

  return (
    <div className="co-eval-picker">
      <label className="co-eval-search">
        <span>Find intern</span>
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Name, student ID, user #, application #…"
        />
      </label>
      <div className="co-eval-picker-list" role="list">
        {rows.map((row) => {
          const sid = row.student?.id;
          const active = String(selectedStudentId) === String(sid);
          return (
            <button
              key={row.application_id}
              type="button"
              role="listitem"
              className={`co-eval-picker-row ${active ? 'active' : ''}`}
              onClick={() => onSelect(row)}
            >
              <span className="co-eval-avatar">
                {(row.student?.first_name?.[0] || '?').toUpperCase()}
              </span>
              <span className="co-eval-picker-main">
                <strong>
                  {row.student?.first_name} {row.student?.last_name}
                </strong>
                <span className="co-eval-meta">
                  {row.student?.student_id ? `Code ${row.student.student_id} · ` : ''}User #{sid} · App #{row.application_id}
                </span>
                <span className="co-eval-meta">{row.internship_title}</span>
              </span>
              <span className="co-eval-pills">
                <span className="co-eval-pill">Intern</span>
              </span>
            </button>
          );
        })}
        {!rows.length && <div className="co-eval-empty">No interns match this search.</div>}
      </div>
    </div>
  );
}

export default function CompanyEvaluationPanel({
  interns = [],
  evalDraft,
  setEvalDraft,
  onSubmit,
  onAiDraft,
  evalHistoryTick = 0,
}) {
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState([]);
  const [loadingHist, setLoadingHist] = useState(false);

  const studentId = Number(evalDraft.student_id);

  useEffect(() => {
    if (!Number.isFinite(studentId) || studentId <= 0) {
      setHistory([]);
      return;
    }
    let cancelled = false;
    setLoadingHist(true);
    companyAPI
      .getInternEvaluations(studentId)
      .then((res) => {
        if (!cancelled) setHistory(res.data || []);
      })
      .catch(() => {
        if (!cancelled) setHistory([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingHist(false);
      });
    return () => {
      cancelled = true;
    };
  }, [studentId, evalHistoryTick]);

  const selectedRow = useMemo(
    () => (interns || []).find((r) => String(r.student?.id) === String(evalDraft.student_id)),
    [interns, evalDraft.student_id],
  );

  const typeLabels = {
    midterm: 'Mid-internship review',
    final: 'End-of-internship review',
  };

  return (
    <div className="co-eval-layout">
      <section className="co-eval-card">
        <h3 className="co-eval-title">Select intern</h3>
        <p className="co-eval-lead">
          Choose an active placement, then submit a <strong>mid-internship</strong> and a <strong>final</strong>{' '}
          evaluation. Both are required before the placement counts toward the student&apos;s official composite grade with
          campus assessment.
        </p>
        <InternPicker
          interns={interns}
          search={search}
          onSearch={setSearch}
          selectedStudentId={evalDraft.student_id}
          onSelect={(row) => {
            setEvalDraft((d) => ({
              ...d,
              student_id: String(row.student?.id || ''),
              application_ref: String(row.application_id || ''),
            }));
          }}
        />
      </section>

      <section className="co-eval-card co-eval-form-card">
        <div className="co-eval-form-head">
          <h3 className="co-eval-title">Evaluation</h3>
          {selectedRow && (
            <div className="co-eval-selected">
              <strong>
                {selectedRow.student?.first_name} {selectedRow.student?.last_name}
              </strong>
              <span className="co-eval-meta">
                Application #{selectedRow.application_id} · {selectedRow.internship_title}
              </span>
            </div>
          )}
        </div>

        <div className="co-eval-type-toggle">
          {['midterm', 'final'].map((t) => (
            <button
              key={t}
              type="button"
              className={evalDraft.type === t ? 'active' : ''}
              onClick={() => setEvalDraft((d) => ({ ...d, type: t }))}
            >
              {typeLabels[t]}
            </button>
          ))}
        </div>

        <p className="co-eval-hint">Score each criterion from 0–100. An overall score is calculated from the five dimensions.</p>

        <div className="co-eval-grid">
          {[
            ['technical_skills', 'Technical skills'],
            ['communication_skills', 'Communication'],
            ['problem_solving', 'Problem solving'],
            ['teamwork', 'Teamwork'],
            ['time_management', 'Time management'],
          ].map(([key, label]) => (
            <label key={key} className="co-eval-field">
              <span>{label}</span>
              <input
                type="number"
                min={0}
                max={100}
                value={evalDraft[key]}
                onChange={(e) =>
                  setEvalDraft((d) => ({ ...d, [key]: Number(e.target.value) }))
                }
              />
            </label>
          ))}
        </div>

        <label className="co-eval-field full">
          <span>Evaluation date</span>
          <input
            type="date"
            value={evalDraft.evaluation_date}
            onChange={(e) => setEvalDraft((d) => ({ ...d, evaluation_date: e.target.value }))}
          />
        </label>

        <div className="co-eval-narrative">
          <label className="co-eval-field full">
            <span>Strengths</span>
            <textarea
              rows={3}
              value={evalDraft.strengths}
              onChange={(e) => setEvalDraft((d) => ({ ...d, strengths: e.target.value }))}
            />
          </label>
          <label className="co-eval-field full">
            <span>Areas to improve</span>
            <textarea
              rows={2}
              value={evalDraft.weaknesses}
              onChange={(e) => setEvalDraft((d) => ({ ...d, weaknesses: e.target.value }))}
            />
          </label>
          <label className="co-eval-field full">
            <span>Recommendations</span>
            <textarea
              rows={2}
              value={evalDraft.recommendations}
              onChange={(e) => setEvalDraft((d) => ({ ...d, recommendations: e.target.value }))}
            />
          </label>
        </div>

        <div className="co-eval-actions">
          <button type="button" className="co-btn co-btn-sm" onClick={onSubmit}>
            Save evaluation
          </button>
          <button type="button" className="co-btn ghost co-btn-sm" onClick={onAiDraft}>
            AI draft (strengths)
          </button>
        </div>

        <div className="co-eval-history">
          <h4>Submitted for this intern</h4>
          {loadingHist && <p className="co-eval-meta">Loading…</p>}
          {!loadingHist && !history.length && (
            <p className="co-eval-meta">No evaluations yet.</p>
          )}
          <ul>
            {history.map((ev) => (
              <li key={ev.id}>
                <span className={`co-eval-tag ${ev.type === 'final' ? 'final' : 'mid'}`}>{ev.type}</span>
                <strong>{ev.evaluation_date}</strong>
                <span className="co-eval-meta">Overall {ev.overall_performance ?? '—'}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
