import React, { useMemo, useState } from 'react';
import { advisorAPI, aiAdvisorAPI } from '../../../../services/http';
import { meetingTypeStyle } from '../../utils';
import MeetingCard from '../shared/MeetingCard/MeetingCard';
import './MeetingSchedule.css';

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
        <h4>{calendarMode === 'month' ? 'Monthly' : calendarMode === 'week' ? 'Weekly' : 'Daily'} calendar</h4>
        <div className="adv-cal-list">
          {meetings.length === 0 && <div className="adv-empty">No meetings scheduled.</div>}
          {meetings.map((m) => (
            <MeetingCard
              key={m.id}
              meeting={m}
              dotClassName={meetingTypeStyle(m)}
              onPreBrief={async () => {
                const res = await advisorAPI.getMeetingSummary(m.id);
                showToast((res.data?.ai_summary?.topics || []).join(', '));
              }}
            />
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
