import React, { useMemo, useState } from 'react';
import { advisorAPI, aiAdvisorAPI } from '../../../../services/http';
import { meetingTypeStyle } from '../../utils';
import MeetingCard from '../shared/MeetingCard/MeetingCard';
import './MeetingSchedule.css';
import { downloadIcs } from '../../../../utils/ics';

function studentLabel(s) {
  return `${s.first_name || ''} ${s.last_name || ''}`.trim() || `User #${s.id}`;
}

export default function MeetingSchedule({
  calendarMode,
  setCalendarMode,
  meetingDraft,
  setMeetingDraft,
  students,
  meetings,
  showToast,
  loadAll,
}) {
  const [studentSearch, setStudentSearch] = useState('');
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [focused, setFocused] = useState(null);
  const [editDraft, setEditDraft] = useState({ scheduled_at: '', format: 'video', notes: '' });

  const filteredStudents = useMemo(() => {
    const list = students || [];
    const q = studentSearch.trim().toLowerCase();
    if (!q) return list.slice(0, 60);
    return list
      .filter((s) => {
        const name = studentLabel(s).toLowerCase();
        const uid = String(s.id);
        const code = String(s.student_id || '').toLowerCase();
        return name.includes(q) || uid === q || code.includes(q) || `${s.first_name} ${s.last_name}`.toLowerCase().includes(q);
      })
      .slice(0, 50);
  }, [students, studentSearch]);

  const selectedStudent = useMemo(
    () => (students || []).find((s) => String(s.id) === String(meetingDraft.student_id)),
    [students, meetingDraft.student_id],
  );

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

  const meetingsByDay = useMemo(() => {
    const map = new Map();
    (meetings || []).forEach((m) => {
      const dt = new Date(m.scheduled_at);
      if (Number.isNaN(dt.getTime())) return;
      const key = dt.toISOString().slice(0, 10);
      const list = map.get(key) || [];
      list.push(m);
      map.set(key, list);
    });
    return map;
  }, [meetings]);

  const selectedKey = selectedDate.toISOString().slice(0, 10);
  const dayMeetings = meetingsByDay.get(selectedKey) || [];

  return (
    <div className="adv-meetings-page">
      <section className="adv-card">
        <div className="adv-toolbar-row">
          <h3>Meeting schedule</h3>
          <div className="adv-view-toggle">
            {['month', 'week', 'day'].map((m) => (
              <button key={m} type="button" className={calendarMode === m ? 'on' : ''} onClick={() => setCalendarMode(m)}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <p className="adv-muted">
          AI color key: <span className="adv-cal-dot student" /> Student ·<span className="adv-cal-dot group" /> Group ·
          <span className="adv-cal-dot admin" /> Admin · suggested slots highlighted below.
        </p>
        <div className="adv-ai-slots">
          <span>Suggested slots</span>
          <button type="button" className="adv-chip" onClick={() => showToast('Tue 10:00 · Thu 15:30 — best match for your cohort.')}>
            Tue 10:00
          </button>
          <button type="button" className="adv-chip" onClick={() => showToast('Thu 15:30 available.')}>
            Thu 15:30
          </button>
        </div>
      </section>

      {focused && (
        <div className="adv-modal-overlay" role="dialog" onClick={() => setFocused(null)}>
          <div className="adv-modal" onClick={(e) => e.stopPropagation()}>
            <header>
              <h3 style={{ margin: 0 }}>Reschedule meeting</h3>
              <button type="button" className="adv-icon-close" onClick={() => setFocused(null)}>
                ×
              </button>
            </header>
            <div className="adv-split">
              <div className="adv-split-left">
                <label className="adv-schedule-inline-label">
                  When
                  <input type="datetime-local" value={editDraft.scheduled_at} onChange={(e) => setEditDraft((d) => ({ ...d, scheduled_at: e.target.value }))} />
                </label>
                <label className="adv-schedule-inline-label" style={{ marginTop: 10 }}>
                  Format
                  <select value={editDraft.format} onChange={(e) => setEditDraft((d) => ({ ...d, format: e.target.value }))}>
                    <option value="video">Video</option>
                    <option value="phone">Phone</option>
                    <option value="in_person">In person</option>
                  </select>
                </label>
              </div>
              <div className="adv-split-right">
                <label className="adv-schedule-field-label">
                  Notes
                  <textarea rows={6} value={editDraft.notes} onChange={(e) => setEditDraft((d) => ({ ...d, notes: e.target.value }))} />
                </label>
              </div>
            </div>
            <div style={{ padding: '0 22px 18px', display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="adv-btn ghost" onClick={() => setFocused(null)}>
                Close
              </button>
              <button
                type="button"
                className="adv-btn"
                onClick={async () => {
                  try {
                    await advisorAPI.updateMeeting(focused.id, {
                      scheduled_at: editDraft.scheduled_at,
                      format: editDraft.format,
                      notes: editDraft.notes,
                    });
                    showToast('Updated.');
                    setFocused(null);
                    loadAll();
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

      <div className="adv-grid">
        <section className="adv-card adv-schedule-form-card">
          <h4>Schedule advising session</h4>
          <p className="adv-muted adv-schedule-hint">
            Search advisees by name, university student number, or user ID. Then set time and format.
          </p>

          <label className="adv-schedule-field-label">
            Find student
            <input
              type="search"
              className="adv-schedule-search"
              placeholder="Name, student ID code, or numeric user ID…"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
          </label>

          <div className="adv-student-pick-list">
            {filteredStudents.length === 0 && <div className="adv-student-pick-empty">No students match this search.</div>}
            {filteredStudents.map((s) => {
              const active = String(meetingDraft.student_id) === String(s.id);
              const initials = studentLabel(s)
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase())
                .join('');
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`adv-student-pick ${active ? 'active' : ''}`}
                  onClick={() => setMeetingDraft((d) => ({ ...d, student_id: String(s.id) }))}
                >
                  <span className="adv-student-pick-av">{initials}</span>
                  <div className="adv-student-pick-body">
                    <strong>{studentLabel(s)}</strong>
                    <span className="adv-student-pick-meta">
                      User #{s.id}
                      {s.student_id ? ` · ${s.student_id}` : ''}
                      {s.internship_stage ? ` · ${s.internship_stage.replace(/_/g, ' ')}` : ''}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedStudent && (
            <div className="adv-schedule-selected">
              Selected: <strong>{studentLabel(selectedStudent)}</strong>
              <button
                type="button"
                className="adv-btn ghost adv-btn-sm adv-schedule-clear"
                onClick={() => setMeetingDraft((d) => ({ ...d, student_id: '' }))}
              >
                Clear
              </button>
            </div>
          )}

          <div className="adv-form-row adv-schedule-row-2">
            <label className="adv-schedule-inline-label">
              When
              <input
                type="datetime-local"
                value={meetingDraft.scheduled_at}
                onChange={(e) => setMeetingDraft((d) => ({ ...d, scheduled_at: e.target.value }))}
              />
            </label>
            <label className="adv-schedule-inline-label">
              Format
              <select value={meetingDraft.format} onChange={(e) => setMeetingDraft((d) => ({ ...d, format: e.target.value }))}>
                <option value="video">Video</option>
                <option value="phone">Phone</option>
                <option value="in_person">In person</option>
              </select>
            </label>
          </div>

          <div className="adv-form-row adv-schedule-row-2">
            <label className="adv-schedule-inline-label">
              Session label (optional)
              <input
                placeholder="e.g. Career check-in"
                value={meetingDraft.position_title || ''}
                onChange={(e) => setMeetingDraft((d) => ({ ...d, position_title: e.target.value }))}
              />
            </label>
            <label className="adv-schedule-inline-label">
              Organization (optional)
              <input
                placeholder="e.g. ARU Advising"
                value={meetingDraft.company_name || ''}
                onChange={(e) => setMeetingDraft((d) => ({ ...d, company_name: e.target.value }))}
              />
            </label>
          </div>

          <textarea
            placeholder="Agenda / notes — AI can expand"
            value={meetingDraft.notes}
            onChange={(e) => setMeetingDraft((d) => ({ ...d, notes: e.target.value }))}
          />
          <div className="adv-inline-actions">
            <button
              type="button"
              className="adv-btn"
              onClick={async () => {
                if (!meetingDraft.student_id || !meetingDraft.scheduled_at) {
                  showToast('Pick a student and time.', 'error');
                  return;
                }
                await advisorAPI.createMeeting({
                  student_id: Number(meetingDraft.student_id),
                  scheduled_at: meetingDraft.scheduled_at,
                  notes: meetingDraft.notes,
                  format: meetingDraft.format,
                  company_name: meetingDraft.company_name || undefined,
                  position_title: meetingDraft.position_title || undefined,
                });
                showToast('Meeting scheduled.');
                loadAll();
              }}
            >
              Save meeting
            </button>
            <button
              type="button"
              className="adv-btn secondary"
              onClick={async () => {
                const res = await aiAdvisorAPI.meetingPrep({});
                showToast((res.data?.agenda || []).join(' · '));
              }}
            >
              AI agenda & duration
            </button>
          </div>
        </section>

        <section className="adv-card">
          <h4>Pre / post meeting AI</h4>
          <ul className="adv-muted">
            <li>During meeting: quick notes, AI action extraction (demo)</li>
            <li>Post meeting: minutes + action items emailed to student</li>
          </ul>
        </section>
      </div>

      <section className="adv-card">
        <div className="adv-toolbar-row" style={{ marginBottom: 10 }}>
          <h4>{calendarMode === 'month' ? 'Monthly' : calendarMode === 'week' ? 'Weekly' : 'Daily'} calendar</h4>
          {calendarMode === 'month' && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="adv-btn ghost adv-btn-sm" onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>
                Prev
              </button>
              <button type="button" className="adv-btn ghost adv-btn-sm" onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>
                Next
              </button>
            </div>
          )}
        </div>

        {calendarMode === 'month' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <strong>{cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</strong>
              <span className="adv-muted">{dayMeetings.length} event(s) selected day</span>
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
                const has = (meetingsByDay.get(key) || []).length > 0;
                const isSel = key === selectedKey;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`calendar-cell ${has ? 'has-viva' : ''} ${isSel ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(cell)}
                    title={has ? 'Has meetings' : 'No meetings'}
                  >
                    <span>{cell.getDate()}</span>
                    {has && <i>🟢</i>}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div style={{ marginTop: 12 }}>
          <div className="adv-muted" style={{ fontWeight: 800, marginBottom: 8 }}>
            Events on {selectedDate.toDateString()}
          </div>
          {dayMeetings.length === 0 && <div className="adv-empty">No meetings scheduled on this date.</div>}
          {dayMeetings.map((m) => (
            <div key={m.id} style={{ marginBottom: 10 }}>
              <MeetingCard
                meeting={m}
                dotClassName={meetingTypeStyle(m)}
                onPreBrief={async () => {
                  const res = await advisorAPI.getMeetingSummary(m.id);
                  showToast((res.data?.ai_summary?.topics || []).join(', '));
                }}
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                <button
                  type="button"
                  className="adv-btn ghost adv-btn-sm"
                  onClick={() => {
                    setFocused(m);
                    setEditDraft({
                      scheduled_at: new Date(new Date(m.scheduled_at).getTime() - new Date(m.scheduled_at).getTimezoneOffset() * 60000).toISOString().slice(0, 16),
                      format: m.format || 'video',
                      notes: m.notes || '',
                    });
                  }}
                >
                  Reschedule
                </button>
                <button
                  type="button"
                  className="adv-btn ghost adv-btn-sm"
                  onClick={() =>
                    downloadIcs({
                      filename: `advisor-meeting-${m.id}.ics`,
                      title: m.position_title || 'Advisor meeting',
                      description: m.notes || '',
                      start: m.scheduled_at,
                      end: new Date(new Date(m.scheduled_at).getTime() + 60 * 60 * 1000),
                      location: '',
                    })
                  }
                >
                  Export ICS
                </button>
                <button
                  type="button"
                  className="adv-btn secondary adv-btn-sm"
                  onClick={async () => {
                    try {
                      await advisorAPI.deleteMeeting(m.id);
                      showToast('Cancelled.');
                      loadAll();
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
      </section>

      <section className="adv-card">
        <h4>Meeting analytics</h4>
        <p className="adv-muted">Optimal frequency: AI recommends bi-weekly check-ins during application season.</p>
      </section>
    </div>
  );
}
