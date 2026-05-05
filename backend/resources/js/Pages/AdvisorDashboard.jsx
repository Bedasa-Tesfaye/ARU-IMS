import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { advisorAPI, aiAdvisorAPI } from '../services/http';
import './advisor/AdvisorDashboard.css';

const NAV = [
  { id: 'overview', label: 'Dashboard', icon: '📊' },
  { id: 'students', label: 'My Students', icon: '👨‍🎓' },
  { id: 'reviews', label: 'Application Reviews', icon: '📝' },
  { id: 'meetings', label: 'Meeting Schedule', icon: '📅' },
  { id: 'progress', label: 'Student Progress', icon: '📊' },
  { id: 'messages', label: 'Messages/Chat', icon: '💬' },
  { id: 'documents', label: 'Document Reviews', icon: '📄' },
  { id: 'reports', label: 'Reports & Analytics', icon: '📈' },
  { id: 'ai', label: 'AI Assistant', icon: '🤖' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

const STAGE_LABELS = {
  profile_building: 'Profile Building',
  applying: 'Applying',
  interviewing: 'Interviewing',
  placed: 'Placed',
};

const SEGMENT_KEYS = [
  { key: 'profile_incomplete', filter: { stage: 'profile_building' }, label: 'Profile Incomplete', color: '#94a3b8' },
  { key: 'ready_to_apply', filter: { stage: 'applying' }, label: 'Ready to Apply', color: '#38bdf8' },
  { key: 'applied', filter: { stage: 'applying' }, label: 'Applied', color: '#6366f1' },
  { key: 'interviewing', filter: { stage: 'interviewing' }, label: 'Interviewing', color: '#f59e0b' },
  { key: 'placed', filter: { stage: 'placed' }, label: 'Placed', color: '#22c55e' },
  { key: 'inactive', filter: { status: 'inactive' }, label: 'Inactive', color: '#cbd5e1' },
];

function normalizePaginated(res) {
  const d = res?.data;
  if (Array.isArray(d)) return { data: d, meta: null };
  return {
    data: d?.data ?? [],
    meta: d
      ? {
          current_page: d.current_page,
          last_page: d.last_page,
          total: d.total,
        }
      : null,
  };
}

function formatRelative(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function reviewPriority(app) {
  const raw = app?.internship?.sla_deadline_at || app?.internship?.end_date;
  if (!raw) return { level: 'normal', label: 'Normal' };
  const end = new Date(raw).getTime();
  const hours = (end - Date.now()) / 3600000;
  if (hours > 0 && hours <= 48) return { level: 'urgent', label: 'Urgent (<48h)' };
  if (hours > 0 && hours <= 120) return { level: 'high', label: 'High' };
  return { level: 'normal', label: 'Normal' };
}

function interpretNlSearch(text) {
  const q = text.toLowerCase().trim();
  const next = {};
  if (!q) return next;
  if (/haven'?t applied|not applied|no application/i.test(q)) next.stage = 'profile_building';
  if (/tech|software|it\b/i.test(q)) next.search = 'tech';
  if (/interview/i.test(q)) next.stage = 'interviewing';
  if (/low engagement|at risk|disengaged/i.test(q)) {
    next.engagement = 'low';
    next.sort = 'ai_recommended';
  }
  if (/placed|secured|offer/i.test(q)) next.status = 'placed';
  return next;
}

function AnimatedStat({ value, label, hint }) {
  const target = Number(value) || 0;
  const [n, setN] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const from = fromRef.current;
    const dur = 650;
    let frame;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - (1 - p) ** 3;
      const next = Math.round(from + (target - from) * eased);
      setN(next);
      if (p < 1) frame = requestAnimationFrame(tick);
      else {
        setN(target);
        fromRef.current = target;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return (
    <div className="adv-stat adv-stat-animated">
      <strong>{n}</strong>
      <span>{label}</span>
      {hint && <small>{hint}</small>}
    </div>
  );
}

function EngagementGauge({ score }) {
  const pct = Math.min(100, Math.max(0, Number(score) || 0));
  return (
    <div className="adv-gauge" style={{ '--pct': `${pct}%` }} title={`Engagement ${pct}`}>
      <span>{pct}</span>
    </div>
  );
}

const AdvisorDashboard = () => {
  const [active, setActive] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentMeta, setStudentMeta] = useState(null);
  const [studentFilters, setStudentFilters] = useState({
    search: '',
    status: '',
    stage: '',
    engagement: '',
    last_activity: '',
    sort: 'ai_recommended',
  });
  const [studentView, setStudentView] = useState('grid');
  const [nlSearch, setNlSearch] = useState('');
  const [reviewQueue, setReviewQueue] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [progress, setProgress] = useState(null);
  const [reports, setReports] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [detailTab, setDetailTab] = useState('overview');
  const [tipRotate, setTipRotate] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [calendarMode, setCalendarMode] = useState('week');
  const [reviewFocus, setReviewFocus] = useState(null);
  const [reviewAi, setReviewAi] = useState(null);
  const [docFocus, setDocFocus] = useState(null);
  const [docAi, setDocAi] = useState(null);
  const [bulkIds, setBulkIds] = useState(() => new Set());
  const [msgThreadKey, setMsgThreadKey] = useState(null);
  const [chatDraft, setChatDraft] = useState('');
  const [aiChat, setAiChat] = useState([
    { role: 'ai', text: 'Advisor AI Co-Pilot: ask for mentoring strategies, cohort summaries, meeting prep, or feedback drafts.' },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [meetingDraft, setMeetingDraft] = useState({
    student_id: '',
    scheduled_at: '',
    notes: '',
    format: 'video',
  });
  const [msgDraft, setMsgDraft] = useState({ student_id: '', subject: '', body: '' });
  const [settingsDraft, setSettingsDraft] = useState({
    ai_assistance_level: 'balanced',
    office_hours: '',
    meeting_preference: 'hybrid',
    notify_digest: 'daily',
    expertise: '',
  });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    window.clearTimeout(window.__advToastTimer);
    window.__advToastTimer = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const loadStudents = useCallback(async (extra = {}) => {
    const params = { ...studentFilters, ...extra, per_page: 48 };
    Object.keys(params).forEach((k) => {
      if (params[k] === '' || params[k] === undefined) delete params[k];
    });
    const res = await advisorAPI.getStudents(params);
    const { data, meta } = normalizePaginated(res);
    setStudents(data);
    setStudentMeta(meta);
  }, [studentFilters]);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, studRes, queueRes, meetRes, msgRes, docRes, progRes, repRes, setRes] = await Promise.all([
        advisorAPI.getDashboardStats(),
        advisorAPI.getStudents({ per_page: 48, sort: 'ai_recommended' }),
        advisorAPI.getReviewQueue({}),
        advisorAPI.getMeetings({}),
        advisorAPI.getMessages({}),
        advisorAPI.getDocumentsReview({}),
        advisorAPI.getProgress(),
        advisorAPI.getReports(),
        advisorAPI.getSettings(),
      ]);
      const unwrap = (res) => {
        const d = res?.data;
        if (Array.isArray(d)) return d;
        if (d?.data && Array.isArray(d.data)) return d.data;
        return [];
      };

      setDashboard(dashRes.data);
      const sn = normalizePaginated(studRes);
      setStudents(sn.data);
      setStudentMeta(sn.meta);
      setReviewQueue(unwrap(queueRes));
      setMeetings(unwrap(meetRes));
      setMessages(unwrap(msgRes));
      setDocuments(unwrap(docRes));
      setProgress(progRes.data || null);
      setReports(repRes.data || null);
      const st = setRes.data || {};
      setSettings(st);
      setSettingsDraft({
        ai_assistance_level: st.ai_assistance_level || 'balanced',
        office_hours: st.office_hours || '',
        meeting_preference: st.meeting_preference || 'hybrid',
        notify_digest: st.notify_digest || 'daily',
        expertise: Array.isArray(st.expertise) ? st.expertise.join(', ') : '',
      });
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load advisor dashboard.');
      showToast('Unable to refresh advisor dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    const tips = dashboard?.ai_tips || [];
    if (!tips.length) return undefined;
    const id = window.setInterval(() => {
      setTipRotate((i) => (i + 1) % tips.length);
    }, 9000);
    return () => clearInterval(id);
  }, [dashboard?.ai_tips]);

  useEffect(() => {
    if (active !== 'students') return undefined;
    let cancelled = false;
    (async () => {
      try {
        await loadStudents();
      } catch {
        if (!cancelled) showToast('Could not refresh student list.', 'error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active, studentFilters, loadStudents, showToast]);

  const stats = dashboard?.stats || {};
  const breakdown = dashboard?.student_status_breakdown || {};

  const segmentTotal = useMemo(() => {
    const keys = ['profile_incomplete', 'ready_to_apply', 'applied', 'interviewing', 'placed', 'inactive'];
    return keys.reduce((s, k) => s + (Number(breakdown[k]) || 0), 0) || 1;
  }, [breakdown]);

  const openStudent = async (id) => {
    setSelectedStudentId(id);
    setBusyKey(`stu-${id}`);
    try {
      const res = await advisorAPI.getStudent(id);
      setStudentDetail(res.data);
      setDetailTab('overview');
      setActive('students');
    } catch {
      showToast('Could not load student.', 'error');
    } finally {
      setBusyKey('');
    }
  };

  const sendAi = async () => {
    const message = aiInput.trim();
    if (!message) return;
    setAiChat((prev) => [...prev, { role: 'user', text: message }]);
    setAiInput('');
    setBusyKey('ai-chat');
    try {
      const res = await aiAdvisorAPI.chat({ message });
      const reply = res.data?.reply || 'AI unavailable.';
      setAiChat((prev) => [...prev, { role: 'ai', text: reply }]);
    } catch {
      setAiChat((prev) => [...prev, { role: 'ai', text: 'AI assistant unavailable.' }]);
      showToast('AI unavailable.', 'error');
    } finally {
      setBusyKey('');
    }
  };

  const studentLookup = useMemo(() => {
    const m = new Map();
    (students || []).forEach((s) => m.set(s.id, s));
    return m;
  }, [students]);

  const threads = useMemo(() => {
    const map = new Map();
    (messages || []).forEach((row) => {
      const sid = row.student_id;
      if (!sid) return;
      const cur = map.get(sid) || {
        student_id: sid,
        last: row,
        unread: 0,
      };
      const t = new Date(row.created_at).getTime();
      const prev = new Date(cur.last.created_at).getTime();
      if (t > prev) cur.last = row;
      if (!row.read_at) cur.unread += 1;
      map.set(sid, cur);
    });
    return [...map.values()].sort((a, b) => new Date(b.last.created_at) - new Date(a.last.created_at));
  }, [messages]);

  useEffect(() => {
    if (active !== 'messages') return;
    if (msgThreadKey) return;
    if (threads[0]) setMsgThreadKey(threads[0].student_id);
  }, [active, threads, msgThreadKey]);

  const kanbanBuckets = useMemo(() => {
    const b = {
      profile_building: [],
      applying: [],
      interviewing: [],
      placed: [],
    };
    (students || []).forEach((s) => {
      const st = s.internship_stage || 'profile_building';
      if (b[st]) b[st].push(s);
      else b.applying.push(s);
    });
    return b;
  }, [students]);

  const applyNlSearch = () => {
    const parsed = interpretNlSearch(nlSearch);
    if (!Object.keys(parsed).length) {
      showToast('Try phrases like "students who haven\'t applied" or "low engagement".', 'error');
      return;
    }
    setStudentFilters((f) => ({ ...f, ...parsed }));
    setActive('students');
    showToast('Filters updated from AI search.', 'success');
  };

  const toggleBulk = (id) => {
    setBulkIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const runBulkFeedback = async () => {
    if (!bulkIds.size) {
      showToast('Select applications first.', 'error');
      return;
    }
    setBusyKey('bulk');
    try {
      await Promise.all(
        [...bulkIds].map((id) =>
          advisorAPI.reviewApplication(id, {
            decision: 'request_changes',
            advisor_feedback: 'Please align your bullets with the job keywords and add one measurable outcome.',
          })
        )
      );
      showToast('Bulk feedback recorded.', 'success');
      setBulkIds(new Set());
      loadAll();
    } catch {
      showToast('Bulk action failed.', 'error');
    } finally {
      setBusyKey('');
    }
  };

  const meetingTypeStyle = (m) => {
    const t = `${m.company_name || ''} ${m.position_title || ''}`.toLowerCase();
    if (t.includes('admin')) return 'adv-cal-dot admin';
    if (t.includes('group')) return 'adv-cal-dot group';
    return 'adv-cal-dot student';
  };

  const renderOverview = () => (
    <div className="adv-grid">
      <section className="adv-card adv-hero">
        <div className="adv-hero-row">
          <div>
            <h2>{dashboard?.ai_greeting || `Welcome back, ${dashboard?.advisor?.name || 'Advisor'}!`}</h2>
            <p className="adv-sub">
              Advisor ID: {dashboard?.advisor?.employee_id || '—'} · Department:{' '}
              {dashboard?.advisor?.department_name || dashboard?.advisor?.department_id || '—'}
            </p>
          </div>
          <button type="button" className="adv-btn ghost adv-ai-opt" onClick={() => showToast('Optimizer: prioritize slots Tue/Thu AM based on cohort activity.')}>
            AI Schedule Optimizer
          </button>
        </div>
      </section>

      <section className="adv-stat-row">
        <AnimatedStat value={stats.total_assigned_students} label="Assigned Students" />
        <AnimatedStat value={stats.active_internship_process} label="Active in Process" />
        <AnimatedStat value={stats.pending_application_reviews} label="Pending Reviews" hint="Applications" />
        <AnimatedStat value={stats.students_placed} label="Placed / Secured" />
        <AnimatedStat value={stats.meetings_today} label="Meetings Today" />
        <AnimatedStat value={stats.unread_messages} label="Unread Messages" />
      </section>

      <section className="adv-card">
        <h3>AI-driven priority alerts</h3>
        <ul className="adv-alert-list">
          {(dashboard?.ai_priority_alerts || []).map((t, i) => (
            <li key={i} className="adv-alert-item">
              {t}
            </li>
          ))}
        </ul>
        {dashboard?.weekly_engagement_trend?.message && (
          <p className="adv-trend-note">
            📊 {dashboard.weekly_engagement_trend.message}
          </p>
        )}
      </section>

      <section className="adv-card">
        <h3>Student status overview</h3>
        <p className="adv-muted">{breakdown.ai_insight}</p>
        <div className="adv-seg-bar" role="presentation">
          {SEGMENT_KEYS.map(({ key, color }) => {
            const v = Number(breakdown[key]) || 0;
            const w = (v / segmentTotal) * 100;
            return <span key={key} style={{ width: `${w}%`, background: color }} title={`${key}: ${v}`} />;
          })}
        </div>
        <div className="adv-seg-legend">
          {SEGMENT_KEYS.map(({ key, label, filter, color }) => (
            <button
              key={key}
              type="button"
              className="adv-chip"
              onClick={() => {
                setStudentFilters((f) => ({ ...f, ...filter }));
                setActive('students');
              }}
            >
              <span className="adv-chip-dot" style={{ background: color }} />
              {label}: {breakdown[key] ?? 0}
            </button>
          ))}
        </div>
      </section>

      <section className="adv-card adv-performance">
        <h3>AI performance insights</h3>
        <p>Based on your advising patterns:</p>
        <ul className="adv-insight-list">
          <li>
            Response time: {dashboard?.ai_performance_insights?.response_time_hours}h (Department avg:{' '}
            {dashboard?.ai_performance_insights?.department_avg_response_hours}h) ⭐️
          </li>
          <li>Student satisfaction: {dashboard?.ai_performance_insights?.student_satisfaction}/5</li>
          <li>
            Placement success: {dashboard?.ai_performance_insights?.placement_success_rate}% (
            {(dashboard?.ai_performance_insights?.placement_success_rate ?? 0) -
              (dashboard?.ai_performance_insights?.department_avg_placement ?? 0)}
            % vs dept avg)
          </li>
          <li>Most engaged: {(dashboard?.ai_performance_insights?.most_engaged || []).join(', ') || '—'}</li>
          <li>Needs attention: {(dashboard?.ai_performance_insights?.needs_more_attention || []).join(', ') || '—'}</li>
        </ul>
      </section>

      <section className="adv-card">
        <h3>Upcoming schedule</h3>
        <div className="adv-schedule-actions">
          <span>This week & today</span>
          <div>
            <button type="button" className="adv-btn secondary adv-btn-sm" onClick={() => showToast('Reminder sent (demo).')}>
              Send reminders
            </button>
          </div>
        </div>
        <div className="adv-list">
          {(dashboard?.upcoming_schedule || []).length === 0 && <div className="adv-empty">No upcoming meetings.</div>}
          {(dashboard?.upcoming_schedule || []).map((m) => (
            <div key={m.id} className="adv-list-item">
              <div>
                <strong>{m.title}</strong>
                <small>
                  {m.scheduled_at ? new Date(m.scheduled_at).toLocaleString() : ''} · {m.format}
                </small>
                <small className="adv-ai-hint">AI prep: {m.ai_prep_summary}</small>
              </div>
              <div className="adv-inline-actions">
                <button type="button" className="adv-btn adv-btn-sm" onClick={() => showToast('Launch meeting link (demo).')}>
                  Start
                </button>
                <button type="button" className="adv-btn ghost adv-btn-sm" onClick={() => setActive('meetings')}>
                  Reschedule
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="adv-card">
        <h3>Recent activity</h3>
        <ul className="adv-activity">
          {(dashboard?.recent_activity || []).map((a, i) => (
            <li key={i}>
              <span className="adv-act-badge">{a.type}</span> {a.summary}{' '}
              <time>{a.at ? new Date(a.at).toLocaleString() : ''}</time>
            </li>
          ))}
        </ul>
        <button type="button" className="adv-link-btn" onClick={() => setActive('progress')}>
          View full activity log →
        </button>
      </section>

      <section className="adv-card adv-tips">
        <h3>AI tips & best practices</h3>
        <blockquote>{dashboard?.ai_tips?.[tipRotate % (dashboard?.ai_tips?.length || 1)]}</blockquote>
        <div className="adv-tip-dots">
          {(dashboard?.ai_tips || []).map((_, i) => (
            <span key={i} className={i === tipRotate % (dashboard?.ai_tips?.length || 1) ? 'on' : ''} />
          ))}
        </div>
      </section>
    </div>
  );

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

  const renderStudents = () => (
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
          <select
            value={studentFilters.last_activity}
            onChange={(e) => setStudentFilters((f) => ({ ...f, last_activity: e.target.value }))}
          >
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
                <div key={s.id} className="adv-kanban-card" role="button" tabIndex={0} onClick={() => openStudent(s.id)} onKeyDown={(e) => e.key === 'Enter' && openStudent(s.id)}>
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
            <div key={s.id} className="adv-student-card">
              <div className="adv-student-card-head">
                <div className="adv-avatar">{s.photo_url ? <img src={s.photo_url} alt="" /> : <span>{(s.first_name || '?')[0]}</span>}</div>
                <div>
                  <strong>
                    {s.first_name} {s.last_name}
                  </strong>
                  <div className="adv-muted">
                    {s.student_id} · {s.program}
                  </div>
                  <span className={`adv-badge-stage sm ${s.internship_stage}`}>{STAGE_LABELS[s.internship_stage]}</span>
                </div>
                <EngagementGauge score={s.engagement_score} />
              </div>
              <p className="adv-ai-hint">{s.ai_insight}</p>
              <div className="adv-mini-stats">
                <span>Apps {s.applications_count}</span>
                <span>Int {s.interviews_count}</span>
                <span>Offers {s.offers_count}</span>
              </div>
              <div className="adv-progress-bar">
                <span style={{ width: `${Math.min(100, (s.applications_count || 0) * 15)}%` }} />
              </div>
              <small className="adv-muted">Last active: {formatRelative(s.last_active)}</small>
              <div className="adv-card-actions">
                <button type="button" className="adv-btn secondary adv-btn-sm" onClick={() => setActive('messages')}>
                  Message
                </button>
                <button type="button" className="adv-btn secondary adv-btn-sm" onClick={() => setActive('meetings')}>
                  Schedule
                </button>
                <button type="button" className="adv-btn adv-btn-sm" onClick={() => openStudent(s.id)}>
                  Profile
                </button>
                <button type="button" className="adv-btn ghost adv-btn-sm" onClick={() => setActive('reviews')}>
                  Reviews
                </button>
              </div>
            </div>
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

  const renderReviews = () => (
    <div className="adv-reviews-page">
      <section className="adv-card">
        <div className="adv-toolbar-row">
          <h3>AI-assisted application reviews</h3>
          <button type="button" className="adv-btn secondary adv-btn-sm" onClick={runBulkFeedback} disabled={busyKey === 'bulk'}>
            Bulk request changes ({bulkIds.size})
          </button>
        </div>
        <p className="adv-muted">Queue ordered by submission date — AI prioritizes deadlines under 48 hours.</p>
        <div className="adv-list">
          {reviewQueue.length === 0 && <div className="adv-empty">No pending reviews.</div>}
          {reviewQueue.map((app) => {
            const pr = reviewPriority(app);
            return (
              <div key={app.id} className={`adv-list-item adv-review-row pri-${pr.level}`}>
                <input type="checkbox" checked={bulkIds.has(app.id)} onChange={() => toggleBulk(app.id)} aria-label="Select for bulk" />
                <div className="adv-review-main">
                  <div className="adv-review-who">
                    <strong>
                      {app.student?.first_name} {app.student?.last_name}
                    </strong>
                    <span className={`adv-pri ${pr.level}`}>{pr.label}</span>
                  </div>
                  <small>
                    {app.internship?.company?.name} — {app.internship?.title}
                  </small>
                  <small>Applied {app.applied_date ? new Date(app.applied_date).toLocaleDateString() : '—'}</small>
                </div>
                <div className="adv-inline-actions">
                  <button
                    type="button"
                    className="adv-btn secondary adv-btn-sm"
                    onClick={async () => {
                      setReviewFocus(app);
                      setReviewAi(null);
                      setBusyKey(`rv-${app.id}`);
                      try {
                        const ai = await aiAdvisorAPI.applicationReview({ application_id: app.id });
                        setReviewAi(ai.data);
                      } finally {
                        setBusyKey('');
                      }
                    }}
                  >
                    AI review assistant
                  </button>
                  <button
                    type="button"
                    className="adv-btn adv-btn-sm"
                    onClick={async () => {
                      await advisorAPI.reviewApplication(app.id, {
                        decision: 'approve_notes',
                        advisor_feedback: 'Strong submission — proceed before deadline.',
                      });
                      showToast('Review recorded.');
                      loadAll();
                    }}
                  >
                    Approve notes
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="adv-card">
        <h4>Review history & consistency</h4>
        <p className="adv-muted">AI tracks your review patterns — you typically spend ~12 minutes per review; AI-assisted drafts can reduce time.</p>
      </section>

      {reviewFocus && (
        <div className="adv-modal-overlay" role="dialog" aria-modal="true">
          <div className="adv-modal adv-split-modal">
            <header>
              <h3>Review assistant</h3>
              <button type="button" className="adv-icon-close" onClick={() => setReviewFocus(null)}>
                ×
              </button>
            </header>
            <div className="adv-split">
              <div className="adv-split-left">
                <h4>Application documents</h4>
                <p className="adv-muted">Resume path: {reviewFocus.resume_path || 'On file'}</p>
                <p>{reviewFocus.cover_letter ? `${reviewFocus.cover_letter.slice(0, 480)}…` : 'No cover letter text.'}</p>
              </div>
              <div className="adv-split-right">
                <h4>AI analysis</h4>
                {!reviewAi && <p className="adv-processing">Running AI pre-review…</p>}
                {reviewAi && (
                  <>
                    <p>
                      Resume match: <strong>{reviewAi.resume_match_pct}%</strong>
                    </p>
                    <p>Missing keywords: {(reviewAi.missing_keywords || []).join(', ')}</p>
                    <p>{reviewAi.cover_letter_quality}</p>
                    <ul>
                      {(reviewAi.suggested_improvements || []).map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                    <textarea className="adv-feedback-draft" defaultValue={reviewAi.draft_feedback || ''} rows={5} />
                    <button type="button" className="adv-btn" onClick={() => showToast('Feedback copied to clipboard (demo).')}>
                      Use draft feedback
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMeetings = () => (
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
            <div key={m.id} className="adv-cal-item">
              <span className={meetingTypeStyle(m)} />
              <div>
                <strong>{m.company_name}</strong>
                <small>{m.scheduled_at ? new Date(m.scheduled_at).toLocaleString() : ''}</small>
              </div>
              <button
                type="button"
                className="adv-btn ghost adv-btn-sm"
                onClick={async () => {
                  const res = await advisorAPI.getMeetingSummary(m.id);
                  showToast((res.data?.ai_summary?.topics || []).join(', '));
                }}
              >
                Pre-meeting AI brief
              </button>
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

  const renderProgress = () => (
    <div className="adv-progress-page">
      <section className="adv-card">
        <h3>Cohort progress</h3>
        <div className="adv-funnel">
          {Object.entries(progress?.funnel || {}).map(([k, v]) => (
            <div key={k} className="adv-funnel-step">
              <span>{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
        <p>{progress?.ai_prediction}</p>
        <p className="adv-muted">Dept placement benchmark: {(progress?.department_comparison?.placement_rate_dept * 100 || 0).toFixed(0)}%</p>
      </section>
      <section className="adv-card adv-two-col">
        <div>
          <h4>Early warning</h4>
          <ul>
            {(progress?.at_risk || []).map((n, i) => (
              <li key={i}>
                ⚠️ {n}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>AI interventions</h4>
          <ul>
            {(progress?.interventions || []).map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="adv-card">
        <h4>Goal tracking</h4>
        <p>
          Goal achievement rate: <strong>{progress?.goal_stats?.achievement_rate_pct}%</strong> · Active goals:{' '}
          {progress?.goal_stats?.active_goals}
        </p>
        <button type="button" className="adv-btn secondary" onClick={() => showToast('PDF export queued (demo).')}>
          Export progress PDF
        </button>
      </section>
    </div>
  );

  const renderMessages = () => {
    const activeThread = threads.find((t) => t.student_id === msgThreadKey) || threads[0];
    const sid = msgThreadKey || activeThread?.student_id;
    const threadMsgs = (messages || []).filter((m) => m.student_id === sid).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const peer = studentLookup.get(sid);

    return (
      <div className="adv-messages-layout">
        <aside className="adv-msg-col">
          <h4>Smart inbox</h4>
          <div className="adv-msg-filters">
            <span className="adv-chip">Unread</span>
            <span className="adv-chip">Needs response</span>
            <span className="adv-chip">Urgent</span>
          </div>
          <div className="adv-msg-threads">
            {threads.map((th) => {
              const stu = studentLookup.get(th.student_id);
              return (
                <button
                  key={th.student_id}
                  type="button"
                  className={`adv-msg-thread ${msgThreadKey === th.student_id ? 'active' : ''}`}
                  onClick={() => setMsgThreadKey(th.student_id)}
                >
                  <div>
                    <strong>{stu ? `${stu.first_name} ${stu.last_name}` : `Student #${th.student_id}`}</strong>
                    <small>{th.last.body?.slice(0, 80)}</small>
                  </div>
                  <span className="adv-sent">{th.last.sentiment === 'positive' ? '🙂' : '😐'}</span>
                </button>
              );
            })}
          </div>
        </aside>
        <section className="adv-msg-chat">
          <header>
            <h4>
              {peer ? `${peer.first_name} ${peer.last_name}` : 'Conversation'} ·{' '}
              <span className="adv-muted">sentiment hints</span>
            </h4>
          </header>
          <div className="adv-chat-scroll">
            {threadMsgs.map((m) => (
              <div key={m.id} className={`adv-chat-row ${m.from_email?.includes('advisor') ? 'out' : 'in'}`}>
                <div className="adv-chat-bubble">{m.body}</div>
                <small>{new Date(m.created_at).toLocaleString()}</small>
              </div>
            ))}
          </div>
          <div className="adv-chat-compose">
            <textarea placeholder="Reply…" value={chatDraft} onChange={(e) => setChatDraft(e.target.value)} rows={3} />
            <div className="adv-inline-actions">
              <button
                type="button"
                className="adv-btn"
                onClick={async () => {
                  if (!sid || !chatDraft.trim()) {
                    showToast('Pick thread and enter message.', 'error');
                    return;
                  }
                  await advisorAPI.sendMessage({ student_id: sid, subject: 'Advisor reply', body: chatDraft });
                  setChatDraft('');
                  loadAll();
                  showToast('Sent.');
                }}
              >
                Send
              </button>
              <button
                type="button"
                className="adv-btn secondary"
                onClick={async () => {
                  const res = await aiAdvisorAPI.suggestReply({ context: chatDraft });
                  setChatDraft(res.data?.suggested_reply || chatDraft);
                }}
              >
                AI suggest reply
              </button>
              <button type="button" className="adv-btn ghost" onClick={() => showToast('Thread summarized (demo).')}>
                Summarize thread
              </button>
            </div>
          </div>
        </section>
        <aside className="adv-msg-ai">
          <h4>AI assistant</h4>
          <p className="adv-muted">Templates, translate, schedule — wired for cohort context.</p>
          <button type="button" className="adv-btn secondary adv-btn-sm" onClick={() => setActive('ai')}>
            Open full copilot
          </button>
        </aside>
      </div>
    );
  };

  const renderDocuments = () => (
    <div className="adv-doc-page">
      <section className="adv-card">
        <h3>Document review queue</h3>
        <div className="adv-list">
          {documents.length === 0 && <div className="adv-empty">No documents.</div>}
          {documents.map((d) => (
            <div key={d.id} className="adv-list-item">
              <div>
                <strong>{d.title}</strong>
                <small>{d.type}</small>
              </div>
              <div className="adv-inline-actions">
                <button
                  type="button"
                  className="adv-btn secondary adv-btn-sm"
                  onClick={async () => {
                    setDocFocus(d);
                    setDocAi(null);
                    const r = await aiAdvisorAPI.documentReview({ document_id: d.id });
                    setDocAi(r.data);
                  }}
                >
                  AI analysis
                </button>
                <button
                  type="button"
                  className="adv-btn adv-btn-sm"
                  onClick={async () => {
                    await advisorAPI.documentFeedback(d.id, { feedback: 'Please tighten summary and add metrics.', status: 'revision_requested' });
                    showToast('Feedback saved.');
                    loadAll();
                  }}
                >
                  Save feedback
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      {docFocus && (
        <div className="adv-modal-overlay" role="dialog">
          <div className="adv-modal adv-split-modal">
            <header>
              <h3>Document AI review</h3>
              <button type="button" className="adv-icon-close" onClick={() => setDocFocus(null)}>
                ×
              </button>
            </header>
            <div className="adv-split">
              <div>
                <p>{docFocus.title}</p>
                <p className="adv-muted">Version tracking & compare available in full IMS module.</p>
              </div>
              <div>
                {!docAi && <p className="adv-processing">Analyzing…</p>}
                {docAi && (
                  <>
                    <p>
                      Score: <strong>{docAi.overall_score}</strong>
                    </p>
                    <p>{docAi.grammar_spelling}</p>
                    <ul>
                      {(docAi.sections || []).map((s) => (
                        <li key={s.name}>
                          {s.name}: {s.score} — {s.tip}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderReports = () => (
    <div className="adv-reports-page">
      <section className="adv-card">
        <h3>Advisor performance</h3>
        <div className="adv-report-metrics">
          <div>
            <strong>{reports?.cohort_size ?? '—'}</strong>
            <span>Cohort size</span>
          </div>
          <div>
            <strong>{((reports?.placement_rate || 0) * 100).toFixed(0)}%</strong>
            <span>Placement rate</span>
          </div>
          <div>
            <strong>{reports?.avg_response_hours ?? '—'}h</strong>
            <span>Avg response</span>
          </div>
          <div>
            <strong>{reports?.student_satisfaction ?? '—'}</strong>
            <span>Satisfaction</span>
          </div>
          <div>
            <strong>{((reports?.meeting_attendance_rate || 0) * 100).toFixed(0)}%</strong>
            <span>Meeting attendance</span>
          </div>
        </div>
      </section>
      <section className="adv-card">
        <h4>Placement mix</h4>
        <div className="adv-bar-chart">
          {(reports?.placement_by_type || []).map((row) => (
            <div key={row.label} className="adv-bar-row">
              <span>{row.label}</span>
              <div className="adv-bar-track">
                <span style={{ width: `${row.value}%` }} />
              </div>
              <span>{row.value}%</span>
            </div>
          ))}
        </div>
      </section>
      <section className="adv-card">
        <h4>AI predictive analytics</h4>
        <p>Likely placements this month: <strong>{reports?.predictive?.likely_placements_this_month ?? '—'}</strong></p>
        <p>At-risk prediction count: <strong>{reports?.predictive?.at_risk_count ?? '—'}</strong></p>
        <ul>
          {(reports?.ai_findings || []).map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </section>
      <section className="adv-card">
        <div className="adv-inline-actions">
          <button type="button" className="adv-btn" onClick={() => advisorAPI.generateReport({ type: 'cohort' }).then(() => showToast('Queued.'))}>
            Export cohort (PDF/CSV)
          </button>
          <button
            type="button"
            className="adv-btn secondary"
            onClick={async () => {
              const ar = await aiAdvisorAPI.generateReport({});
              showToast(ar.data?.narrative?.slice(0, 90) || 'Done');
            }}
          >
            AI narrative report
          </button>
        </div>
      </section>
    </div>
  );

  const renderAI = () => (
    <section className="adv-card adv-ai-page">
      <h3>Advisor AI co-pilot</h3>
      <p className="adv-muted">Prepare meetings, draft feedback, analyze cohorts, and curate resources.</p>
      <div className="adv-ai-quick">
        {['Weekly cohort summary', 'Mock interview outline', 'Email to nudge inactive students'].map((q) => (
          <button key={q} type="button" className="adv-chip" onClick={() => setAiInput(q)}>
            {q}
          </button>
        ))}
      </div>
      <div className="adv-chat">
        {aiChat.map((m, i) => (
          <div key={i} className={`adv-chat-bubble ${m.role === 'user' ? 'user' : 'ai'}`}>
            {m.text}
          </div>
        ))}
        {busyKey === 'ai-chat' && <div className="adv-processing">AI is thinking…</div>}
      </div>
      <div className="adv-chat-input">
        <input value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="Ask your advisor AI…" onKeyDown={(e) => e.key === 'Enter' && sendAi()} />
        <button type="button" className="adv-btn" onClick={sendAi}>
          Send
        </button>
      </div>
      <div className="adv-inline-actions">
        <button
          type="button"
          className="adv-btn secondary"
          onClick={async () => {
            const s = await aiAdvisorAPI.mentoringStrategy({});
            setAiChat((p) => [...p, { role: 'ai', text: (s.data?.strategies || []).join('\n') }]);
          }}
        >
          Mentoring strategies
        </button>
        <button
          type="button"
          className="adv-btn secondary"
          onClick={async () => {
            const t = await aiAdvisorAPI.trends();
            setAiChat((p) => [...p, { role: 'ai', text: `Trending skills: ${(t.data?.skills_in_demand || []).join(', ')}` }]);
          }}
        >
          Industry trends
        </button>
      </div>
    </section>
  );

  const renderSettings = () => (
    <section className="adv-card adv-settings">
      <h3>Settings & preferences</h3>
      <div className="adv-settings-grid">
        <label>
          AI assistance level
          <select
            value={settingsDraft.ai_assistance_level}
            onChange={(e) => setSettingsDraft((s) => ({ ...s, ai_assistance_level: e.target.value }))}
          >
            <option value="minimal">Minimal</option>
            <option value="balanced">Balanced</option>
            <option value="maximum">Maximum</option>
          </select>
        </label>
        <label>
          Office hours
          <input value={settingsDraft.office_hours} onChange={(e) => setSettingsDraft((s) => ({ ...s, office_hours: e.target.value }))} />
        </label>
        <label>
          Meeting preference
          <select
            value={settingsDraft.meeting_preference}
            onChange={(e) => setSettingsDraft((s) => ({ ...s, meeting_preference: e.target.value }))}
          >
            <option value="virtual">Virtual</option>
            <option value="in_person">In person</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </label>
        <label>
          AI digest frequency
          <select value={settingsDraft.notify_digest} onChange={(e) => setSettingsDraft((s) => ({ ...s, notify_digest: e.target.value }))}>
            <option value="off">Off</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </label>
        <label className="adv-span-2">
          Expertise tags (comma separated)
          <input value={settingsDraft.expertise} onChange={(e) => setSettingsDraft((s) => ({ ...s, expertise: e.target.value }))} />
        </label>
      </div>
      <div className="adv-inline-actions">
        <button
          type="button"
          className="adv-btn"
          onClick={async () => {
            const payload = {
              ai_assistance_level: settingsDraft.ai_assistance_level,
              office_hours: settingsDraft.office_hours,
              meeting_preference: settingsDraft.meeting_preference,
              notify_digest: settingsDraft.notify_digest,
              expertise: settingsDraft.expertise
                .split(',')
                .map((x) => x.trim())
                .filter(Boolean),
            };
            const r = await advisorAPI.updateSettings(payload);
            setSettings(r.data?.settings || settings);
            showToast('Settings saved.');
          }}
        >
          Save settings
        </button>
      </div>
      <p className="adv-muted">Quiet hours, calendar sync (Google/Outlook), and mobile push — configure in institutional SSO settings.</p>
    </section>
  );

  const content = {
    overview: renderOverview(),
    students: renderStudents(),
    reviews: renderReviews(),
    meetings: renderMeetings(),
    progress: renderProgress(),
    messages: renderMessages(),
    documents: renderDocuments(),
    reports: renderReports(),
    ai: renderAI(),
    settings: renderSettings(),
  };

  return (
    <div className="adv-layout">
      <aside className={`adv-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="adv-brand">
          <h2>ARU IMS</h2>
          <p className="adv-brand-sub">Advisor workspace</p>
        </div>
        <nav className="adv-nav-wrap">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`adv-nav ${active === item.id ? 'active' : ''}`}
              onClick={() => {
                setActive(item.id);
                setSidebarOpen(false);
              }}
            >
              <span className="adv-nav-ico">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button type="button" className="adv-nav adv-logout" onClick={() => router.post('/logout')}>
          <span className="adv-nav-ico">🚪</span> Logout
        </button>
      </aside>
      <div className="adv-shell">
        <header className="adv-topbar">
          <button type="button" className="adv-burger" aria-label="Menu" onClick={() => setSidebarOpen((o) => !o)}>
            ☰
          </button>
          <h1 className="adv-title">{NAV.find((n) => n.id === active)?.label || 'Dashboard'}</h1>
          <div className="adv-top-actions">
            <button type="button" className="adv-notify-btn" onClick={() => setNotificationsOpen((v) => !v)} aria-label="Notifications">
              🔔
              {(dashboard?.notification_digest?.length || 0) > 0 && <span className="adv-notify-dot" />}
            </button>
            {notificationsOpen && (
              <div className="adv-notify-panel">
                <h4>Today&apos;s briefing</h4>
                <ul>
                  {(dashboard?.notification_digest || []).map((n) => (
                    <li key={n.id}>
                      <strong>{n.title}</strong>
                      <span>{n.body}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </header>
        <main className="adv-main">
          {loading && (
            <div className="adv-card adv-skeleton">
              <p>Loading advisor workspace…</p>
              <div className="adv-shimmer" />
            </div>
          )}
          {!loading && error && <div className="adv-card error">{error}</div>}
          {!loading && !error && content[active]}
          {!loading && busyKey && <div className="adv-global-busy" aria-live="polite" />}
        </main>
      </div>
      {toast && <div className={`adv-toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
};

export default AdvisorDashboard;
