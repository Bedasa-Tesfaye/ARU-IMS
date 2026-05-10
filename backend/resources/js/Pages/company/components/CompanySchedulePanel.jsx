import React, { useEffect, useMemo, useState } from 'react';
import { companyAPI } from '../../../services/http';
import { downloadIcs } from '../../../utils/ics';

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
  const [mode, setMode] = useState('month');
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editDraft, setEditDraft] = useState({ scheduled_at: '', format: 'video', notes: '' });
  const options = useMemo(() => buildScheduleOptions(applicants, interns), [applicants, interns]);

  const loadSchedule = async () => {
    try {
      const res = await companyAPI.getSchedule({ per_page: 80 });
      const payload = res.data?.data || res.data?.data?.data || res.data?.data || res.data;
      const arr = Array.isArray(payload) ? payload : payload?.data || [];
      setItems(arr || []);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    loadSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const monthCells = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const first = new Date(y, m, 1);
    const startOffset = first.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i += 1) cells.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(y, m, d));
    return cells;
  }, [cursor]);

  const itemsByDay = useMemo(() => {
    const map = new Map();
    (items || []).forEach((it) => {
      const dt = new Date(it.scheduled_at);
      if (Number.isNaN(dt.getTime())) return;
      const key = dt.toISOString().slice(0, 10);
      const list = map.get(key) || [];
      list.push(it);
      map.set(key, list);
    });
    return map;
  }, [items]);

  const selectedKey = selectedDate.toISOString().slice(0, 10);
  const selectedDayItems = itemsByDay.get(selectedKey) || [];

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
      await loadSchedule();
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
        <div className="co-schedule-head">
          <h4>Date, time & notes</h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['month', 'week', 'day'].map((m) => (
              <button key={m} type="button" className={`co-btn ghost co-btn-sm ${mode === m ? '' : ''}`} onClick={() => setMode(m)}>
                {m}
              </button>
            ))}
          </div>
        </div>
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

        <div style={{ marginTop: 16 }}>
          <div className="co-muted" style={{ fontWeight: 700, marginBottom: 8 }}>
            Calendar
          </div>

          {mode === 'month' && (
            <>
              <div className="calendar-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <button type="button" className="co-btn ghost co-btn-sm" onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>
                  Prev
                </button>
                <strong>{cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</strong>
                <button type="button" className="co-btn ghost co-btn-sm" onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>
                  Next
                </button>
              </div>

              <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => (
                  <div key={w} className="calendar-head">
                    {w}
                  </div>
                ))}
                {monthCells.map((cell, idx) => {
                  if (!cell) return <div key={`empty-${idx}`} className="calendar-cell empty" />;
                  const key = cell.toISOString().slice(0, 10);
                  const has = (itemsByDay.get(key) || []).length > 0;
                  const isSel = key === selectedKey;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`calendar-cell ${has ? 'has-viva' : ''} ${isSel ? 'selected' : ''}`}
                      onClick={() => setSelectedDate(cell)}
                      title={has ? 'Has scheduled items' : 'No items'}
                    >
                      <span>{cell.getDate()}</span>
                      {has && <i>🔵</i>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div style={{ marginTop: 12 }}>
            <div className="co-muted" style={{ fontWeight: 700, marginBottom: 8 }}>
              Items on {selectedDate.toDateString()}
            </div>
            {selectedDayItems.length === 0 && <div className="co-schedule-empty">No scheduled items on this date.</div>}
            {selectedDayItems.map((it) => (
              <div key={it.id} className="co-find-result-row" style={{ alignItems: 'flex-start' }}>
                <div>
                  <strong>{it.position_title || 'Interview / session'}</strong>
                  <div className="co-muted" style={{ marginTop: 4 }}>
                    {it.company_name} · {new Date(it.scheduled_at).toLocaleString()} · {it.format || 'video'}
                  </div>
                  {it.notes && <div className="co-muted" style={{ marginTop: 6 }}>{it.notes}</div>}
                </div>
                <div className="co-find-result-actions">
                  <button
                    type="button"
                    className="co-btn ghost co-btn-sm"
                    onClick={() => {
                      setSelectedItem(it);
                      setEditDraft({
                        scheduled_at: new Date(new Date(it.scheduled_at).getTime() - new Date(it.scheduled_at).getTimezoneOffset() * 60000).toISOString().slice(0, 16),
                        format: it.format || 'video',
                        notes: it.notes || '',
                      });
                    }}
                  >
                    Reschedule
                  </button>
                  <button
                    type="button"
                    className="co-btn ghost co-btn-sm"
                    onClick={() =>
                      downloadIcs({
                        filename: `company-schedule-${it.id}.ics`,
                        title: it.position_title || 'Scheduled session',
                        description: it.notes || '',
                        start: it.scheduled_at,
                        end: new Date(new Date(it.scheduled_at).getTime() + 60 * 60 * 1000),
                        location: it.location || '',
                      })
                    }
                  >
                    Export ICS
                  </button>
                  <button
                    type="button"
                    className="co-btn"
                    style={{ background: '#dc2626' }}
                    onClick={async () => {
                      try {
                        await companyAPI.deleteSchedule(it.id);
                        showToast('Cancelled.');
                        await loadSchedule();
                      } catch (e) {
                        showToast(e?.response?.data?.message || 'Cancel failed.', 'error');
                      }
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedItem && (
        <div className="co-modal-overlay" role="dialog" onClick={() => setSelectedItem(null)}>
          <div className="co-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Reschedule</h3>
            <label className="co-schedule-label">
              When
              <input type="datetime-local" value={editDraft.scheduled_at} onChange={(e) => setEditDraft((d) => ({ ...d, scheduled_at: e.target.value }))} />
            </label>
            <label className="co-schedule-label">
              Format
              <select value={editDraft.format} onChange={(e) => setEditDraft((d) => ({ ...d, format: e.target.value }))}>
                <option value="video">Video</option>
                <option value="phone">Phone</option>
                <option value="in_person">In person</option>
              </select>
            </label>
            <label className="co-schedule-label">
              Notes
              <textarea rows={4} value={editDraft.notes} onChange={(e) => setEditDraft((d) => ({ ...d, notes: e.target.value }))} />
            </label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="co-btn ghost co-btn-sm" type="button" onClick={() => setSelectedItem(null)}>
                Close
              </button>
              <button
                className="co-btn co-btn-sm"
                type="button"
                onClick={async () => {
                  try {
                    await companyAPI.updateSchedule(selectedItem.id, {
                      scheduled_at: editDraft.scheduled_at,
                      format: editDraft.format,
                      notes: editDraft.notes,
                    });
                    showToast('Updated.');
                    setSelectedItem(null);
                    await loadSchedule();
                  } catch (e) {
                    showToast(e?.response?.data?.message || 'Update failed.', 'error');
                  }
                }}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
