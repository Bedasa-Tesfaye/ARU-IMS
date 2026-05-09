import React, { useMemo, useState } from 'react';
import { companyAPI } from '../../../services/http';

function buildScheduleOptions(applicants, interns) {
  const map = new Map();
  (applicants || []).forEach((a) => {
    if (!a.id) return;
    map.set(a.id, {
      applicationId: a.id,
      studentId: a.student_id,
      name: [a.first_name, a.last_name].filter(Boolean).join(' ') || `Student #${a.student_id}`,
      studentCode: a.student_code,
      title: a.internship_title || '—',
      kind: 'applicant',
      detail: a.pipeline_stage ? `Stage: ${a.pipeline_stage}` : 'Applicant',
    });
  });
  (interns || []).forEach((row) => {
    const appId = row.application_id;
    if (!appId) return;
    const s = row.student;
    map.set(appId, {
      applicationId: appId,
      studentId: s?.id,
      name: [s?.first_name, s?.last_name].filter(Boolean).join(' ') || `Student #${s?.id}`,
      studentCode: s?.student_id,
      title: row.internship_title || '—',
      kind: 'intern',
      detail: 'Current intern',
    });
  });
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export default function CompanySchedulePanel({ applicants, interns, scheduleDraft, setScheduleDraft, showToast, onScheduled }) {
  const [search, setSearch] = useState('');
  const options = useMemo(() => buildScheduleOptions(applicants, interns), [applicants, interns]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const hay = [
        o.name,
        String(o.applicationId),
        o.studentId != null ? String(o.studentId) : '',
        o.studentCode != null ? String(o.studentCode) : '',
        o.title,
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [options, search]);

  const selected = options.find((o) => String(o.applicationId) === String(scheduleDraft.application_id)) || null;

  const saveInterview = async () => {
    const applicationId = Number(scheduleDraft.application_id);
    if (!applicationId || !scheduleDraft.scheduled_at) {
      showToast('Pick a student (application) and choose date & time.', 'error');
      return;
    }
    try {
      await companyAPI.createSchedule({
        application_id: applicationId,
        scheduled_at: scheduleDraft.scheduled_at,
        notes: scheduleDraft.notes,
      });
      showToast('Interview scheduled.');
      setScheduleDraft((d) => ({ ...d, notes: '' }));
      onScheduled?.();
    } catch (e) {
      showToast(e?.response?.data?.error || e?.response?.data?.message || 'Scheduling failed.', 'error');
    }
  };

  return (
    <div className="co-schedule-layout">
      <section className="co-schedule-card">
        <div className="co-schedule-head">
          <h3>Schedule interview or check-in</h3>
          <p className="co-muted co-schedule-lead">
            Search by student name, university ID, application ID, or user number. Only applicants and active interns appear here.
          </p>
        </div>

        <label className="co-schedule-label">
          Find student / application
          <input
            type="search"
            className="co-schedule-search"
            placeholder="e.g. Jane Smith, STU-2024, or application 42…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <div className="co-schedule-pick-list">
          {filtered.length === 0 && <div className="co-schedule-empty">No matches. Try another name or ID.</div>}
          {filtered.map((o) => {
            const active = String(scheduleDraft.application_id) === String(o.applicationId);
            const initials = o.name
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase())
              .join('');
            return (
              <button
                key={o.applicationId}
                type="button"
                className={`co-schedule-pick ${active ? 'active' : ''}`}
                onClick={() =>
                  setScheduleDraft((d) => ({
                    ...d,
                    application_id: String(o.applicationId),
                  }))
                }
              >
                <span className="co-schedule-pick-av">{initials}</span>
                <div className="co-schedule-pick-body">
                  <div className="co-schedule-pick-row">
                    <strong>{o.name}</strong>
                    <span className={`co-schedule-pill co-schedule-pill--${o.kind}`}>
                      {o.kind === 'intern' ? 'Intern' : 'Applicant'}
                    </span>
                  </div>
                  <div className="co-schedule-pick-meta">
                    App #{o.applicationId}
                    {o.studentId != null ? ` · User #${o.studentId}` : ''}
                    {o.studentCode ? ` · ${o.studentCode}` : ''}
                  </div>
                  <div className="co-schedule-pick-role">
                    {o.title} · {o.detail}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="co-schedule-selected">
            <span className="co-muted">Selected:</span>{' '}
            <strong>{selected.name}</strong> — application #{selected.applicationId}
          </div>
        )}
      </section>

      <section className="co-schedule-card co-schedule-details">
        <h4>Date, time & notes</h4>
        <div className="co-schedule-grid">
          <label className="co-schedule-label">
            When
            <input
              type="datetime-local"
              value={scheduleDraft.scheduled_at}
              onChange={(e) => setScheduleDraft((d) => ({ ...d, scheduled_at: e.target.value }))}
            />
          </label>
          <label className="co-schedule-label co-schedule-label--full">
            Notes for the student (optional)
            <textarea
              rows={4}
              placeholder="Interview format, meeting link, parking, what to prepare…"
              value={scheduleDraft.notes}
              onChange={(e) => setScheduleDraft((d) => ({ ...d, notes: e.target.value }))}
            />
          </label>
        </div>
        <div className="co-schedule-actions">
          <button type="button" className="co-btn co-btn-sm" onClick={saveInterview}>
            Save to calendar
          </button>
          <button
            type="button"
            className="co-btn ghost co-btn-sm"
            onClick={() => {
              const dt = new Date(Date.now() + 24 * 60 * 60 * 1000);
              const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
              setScheduleDraft((d) => ({ ...d, scheduled_at: local }));
            }}
          >
            Suggest tomorrow
          </button>
        </div>
      </section>
    </div>
  );
}
