import React from 'react';
import { aiAdvisorAPI } from '../../../../services/http';
import { STAGE_LABELS } from '../../constants';
import { formatRelative } from '../../utils';
import AdviseeCard from '../shared/AdviseeCard/AdviseeCard';
import './MyAdvisees.css';

export default function MyAdvisees({
  students,
  studentMeta,
  studentView,
  setStudentView,
  nlSearch,
  setNlSearch,
  applyNlSearch,
  studentFilters,
  setStudentFilters,
  kanbanBuckets,
  openStudent,
  selectedStudentId,
  studentDetail,
  detailTab,
  setDetailTab,
  setActive,
  showToast,
  setBusyKey,
}) {
  const studentTable = (
    <div className="adv-table-wrap">
      <table className="adv-table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Program</th>
            <th>Status</th>
            <th>Apps</th>
            <th>Interviews</th>
            <th>Offers</th>
            <th>Engagement</th>
            <th>Last Active</th>
            <th>AI Flag</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(students || []).map((s) => (
            <tr key={s.id}>
              <td>{s.student_id || '—'}</td>
              <td>
                {s.first_name} {s.last_name}
              </td>
              <td>
                {s.program} · {s.year}
              </td>
              <td>
                <span className={`adv-badge-stage ${s.internship_stage}`}>{STAGE_LABELS[s.internship_stage] || s.internship_stage}</span>
              </td>
              <td>{s.applications_count}</td>
              <td>{s.interviews_count}</td>
              <td>{s.offers_count}</td>
              <td>{s.engagement_score}</td>
              <td>{formatRelative(s.last_active)}</td>
              <td>{s.ai_flag === 'attention' ? '⚠️' : '—'}</td>
              <td>
                <button type="button" className="adv-btn ghost adv-btn-sm" onClick={() => openStudent(s.id)}>
                  Open
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="adv-students-page">
      <section className="adv-card adv-toolbar">
        <div className="adv-toolbar-row">
          <h3>Smart student management</h3>
          <div className="adv-view-toggle">
            <button type="button" className={studentView === 'list' ? 'on' : ''} onClick={() => setStudentView('list')}>
              List
            </button>
            <button type="button" className={studentView === 'grid' ? 'on' : ''} onClick={() => setStudentView('grid')}>
              Grid
            </button>
            <button type="button" className={studentView === 'kanban' ? 'on' : ''} onClick={() => setStudentView('kanban')}>
              Kanban
            </button>
          </div>
        </div>
        <div className="adv-nl-search">
          <input
            placeholder='AI search: e.g. students who have not applied yet · low engagement'
            value={nlSearch}
            onChange={(e) => setNlSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyNlSearch()}
          />
          <button type="button" className="adv-btn" onClick={applyNlSearch}>
            Run AI search
          </button>
        </div>
        <div className="adv-filters">
          <select value={studentFilters.status} onChange={(e) => setStudentFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="">Status: All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="placed">Placed</option>
            <option value="at_risk">At Risk</option>
          </select>
          <select value={studentFilters.stage} onChange={(e) => setStudentFilters((f) => ({ ...f, stage: e.target.value }))}>
            <option value="">Stage: All</option>
            <option value="profile_building">Profile Building</option>
            <option value="applying">Applying</option>
            <option value="interviewing">Interviewing</option>
            <option value="placed">Placed</option>
          </select>
          <select value={studentFilters.engagement} onChange={(e) => setStudentFilters((f) => ({ ...f, engagement: e.target.value }))}>
            <option value="">Engagement</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={studentFilters.last_activity} onChange={(e) => setStudentFilters((f) => ({ ...f, last_activity: e.target.value }))}>
            <option value="">Last activity</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="inactive">Inactive (&gt;30d)</option>
          </select>
          <select value={studentFilters.sort} onChange={(e) => setStudentFilters((f) => ({ ...f, sort: e.target.value }))}>
            <option value="ai_recommended">Sort: AI Recommended</option>
            <option value="name">Name</option>
            <option value="last_active">Last Active</option>
            <option value="progress">Progress</option>
          </select>
          <input
            placeholder="Keyword (name / ID)"
            value={studentFilters.search}
            onChange={(e) => setStudentFilters((f) => ({ ...f, search: e.target.value }))}
          />
        </div>
      </section>

      {studentView === 'kanban' && (
        <div className="adv-kanban-board">
          {Object.entries(kanbanBuckets).map(([col, list]) => (
            <div key={col} className="adv-kanban-col">
              <h4>{STAGE_LABELS[col] || col}</h4>
              {list.map((s) => (
                <div
                  key={s.id}
                  className="adv-kanban-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => openStudent(s.id)}
                  onKeyDown={(e) => e.key === 'Enter' && openStudent(s.id)}
                >
                  <strong>
                    {s.first_name} {s.last_name}
                  </strong>
                  <small>{s.ai_insight}</small>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {studentView === 'grid' && (
        <div className="adv-student-grid">
          {(students || []).map((s) => (
            <AdviseeCard
              key={s.id}
              student={s}
              onOpen={() => openStudent(s.id)}
              onMessage={() => setActive('messages')}
              onMeetings={() => setActive('meetings')}
              onReviews={() => setActive('reviews')}
            />
          ))}
        </div>
      )}

      {(studentView === 'grid' || studentView === 'kanban') && studentMeta && (
        <p className="adv-meta-bar">
          Showing {students?.length || 0} of {studentMeta.total} advisees (page {studentMeta.current_page}/{studentMeta.last_page})
        </p>
      )}

      {studentView === 'list' && (
        <section className="adv-card">
          <div className="adv-toolbar-row">
            <h4>Student roster</h4>
            {studentMeta && (
              <span className="adv-muted">
                Page {studentMeta.current_page} / {studentMeta.last_page} · {studentMeta.total} total
              </span>
            )}
          </div>
          {studentTable}
        </section>
      )}

      {studentDetail && selectedStudentId && (
        <section className="adv-card adv-detail-panel">
          <div className="adv-detail-head">
            <h3>
              {studentDetail.student?.first_name} {studentDetail.student?.last_name}
            </h3>
            <div className="adv-detail-tabs">
              {['overview', 'applications', 'communications', 'ai'].map((t) => (
                <button key={t} type="button" className={detailTab === t ? 'on' : ''} onClick={() => setDetailTab(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {detailTab === 'overview' && (
            <div className="adv-detail-body">
              <p>
                Readiness <strong>{studentDetail.ai_student_insights?.readiness_score}/100</strong>
              </p>
              <p className="adv-muted">{studentDetail.ai_student_insights?.company_environment_fit}</p>
              <ul>
                <li>Strengths: {(studentDetail.ai_student_insights?.strengths || []).join(', ')}</li>
                <li>Improve: {(studentDetail.ai_student_insights?.improvements || []).join(', ')}</li>
                <li>Traits: {(studentDetail.ai_student_insights?.personality_traits || []).join(', ')}</li>
              </ul>
              <div className="adv-action-panel">
                <button type="button" className="adv-btn adv-btn-sm" onClick={() => setActive('meetings')}>
                  Schedule meeting
                </button>
                <button type="button" className="adv-btn secondary adv-btn-sm" onClick={() => setActive('messages')}>
                  Send message
                </button>
                <button type="button" className="adv-btn ghost adv-btn-sm" onClick={() => setActive('documents')}>
                  Review documents
                </button>
                <button type="button" className="adv-btn ghost adv-btn-sm" onClick={() => showToast('Goal saved (demo).')}>
                  Set goal
                </button>
                <button type="button" className="adv-btn ghost adv-btn-sm" onClick={() => showToast('Follow-up flagged.')}>
                  Flag follow-up
                </button>
              </div>
            </div>
          )}

          {detailTab === 'applications' && (
            <div className="adv-detail-body">
              <ul className="adv-apps-list">
                {(studentDetail.applications || []).map((a) => (
                  <li key={a.id}>
                    <strong>{a.internship?.title}</strong> · {a.status}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {detailTab === 'communications' && (
            <div className="adv-detail-body adv-two-col">
              <div>
                <h5>Meetings</h5>
                <ul>
                  {(studentDetail.meetings || []).map((m) => (
                    <li key={m.id}>
                      {m.company_name} · {m.scheduled_at ? new Date(m.scheduled_at).toLocaleString() : ''}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5>Messages</h5>
                <ul>
                  {(studentDetail.messages || []).map((m) => (
                    <li key={m.id}>
                      <em>{m.sentiment || 'neutral'}</em> — {m.subject}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {detailTab === 'ai' && (
            <div className="adv-detail-body">
              <ul>
                {(studentDetail.ai_recommendations || []).map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
              <button
                type="button"
                className="adv-btn"
                onClick={async () => {
                  setBusyKey('ai-ins');
                  try {
                    const res = await aiAdvisorAPI.studentInsights({ student_id: selectedStudentId });
                    showToast(`Readiness ${res.data?.readiness_score}`);
                  } finally {
                    setBusyKey('');
                  }
                }}
              >
                Refresh AI insights
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
