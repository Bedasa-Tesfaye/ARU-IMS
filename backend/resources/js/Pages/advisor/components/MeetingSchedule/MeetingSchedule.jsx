import React from 'react';
import { advisorAPI, aiAdvisorAPI } from '../../../../services/http';
import { meetingTypeStyle } from '../../utils';
import MeetingCard from '../shared/MeetingCard/MeetingCard';
import './MeetingSchedule.css';

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
        <section className="adv-card">
          <h4>Schedule advising session</h4>
          <div className="adv-form-row">
            <select value={meetingDraft.student_id} onChange={(e) => setMeetingDraft((d) => ({ ...d, student_id: e.target.value }))}>
              <option value="">Select student</option>
              {(students || []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name}
                </option>
              ))}
            </select>
            <input type="datetime-local" value={meetingDraft.scheduled_at} onChange={(e) => setMeetingDraft((d) => ({ ...d, scheduled_at: e.target.value }))} />
            <select value={meetingDraft.format} onChange={(e) => setMeetingDraft((d) => ({ ...d, format: e.target.value }))}>
              <option value="video">Video</option>
              <option value="phone">Phone</option>
              <option value="in_person">In person</option>
            </select>
          </div>
          <textarea placeholder="Agenda / notes — AI can expand" value={meetingDraft.notes} onChange={(e) => setMeetingDraft((d) => ({ ...d, notes: e.target.value }))} />
          <div className="adv-inline-actions">
            <button
              type="button"
              className="adv-btn"
              onClick={async () => {
                if (!meetingDraft.student_id || !meetingDraft.scheduled_at) {
                  showToast('Pick student and time.', 'error');
                  return;
                }
                await advisorAPI.createMeeting({
                  student_id: Number(meetingDraft.student_id),
                  scheduled_at: meetingDraft.scheduled_at,
                  notes: meetingDraft.notes,
                  format: meetingDraft.format,
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
