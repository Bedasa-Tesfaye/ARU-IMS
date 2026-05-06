import React, { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { aiExaminerAPI, examinerAPI } from '../services/http';
import ExaminerHeader from './examiner/components/ExaminerHeader';
import ExaminerSidebar from './examiner/components/ExaminerSidebar';
import StatsCard from './examiner/components/StatsCard';
import StudentCard from './examiner/components/StudentCard';
import EvaluationForm from './examiner/components/EvaluationForm';
import Modal from './examiner/components/Modal';
import './examiner/ExaminerDashboard.css';

const NAV = [
  { id: 'overview', label: 'Dashboard', icon: '📊' },
  { id: 'examinees', label: 'My Examinees', icon: '👨‍🎓' },
  { id: 'queue', label: 'Evaluation Queue', icon: '📋' },
  { id: 'reports', label: 'Report Assessment', icon: '📝' },
  { id: 'viva', label: 'Viva/Oral Defense', icon: '🎤' },
  { id: 'grades', label: 'Grade Management', icon: '📊' },
  { id: 'schedule', label: 'Schedule', icon: '📅' },
  { id: 'messages', label: 'Messages/Chat', icon: '💬' },
  { id: 'analytics', label: 'Analytics & Reports', icon: '📈' },
  { id: 'ai', label: 'AI Assistant', icon: '🤖' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

const PAGE_META = Object.fromEntries(NAV.map((n) => [n.id, n]));

const ExaminerDashboard = () => {
  const [active, setActive] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [queue, setQueue] = useState([]);
  const [viva, setViva] = useState([]);
  const [grades, setGrades] = useState([]);
  const [messages, setMessages] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [settings, setSettings] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [typedGreeting, setTypedGreeting] = useState('');
  const [studentFilter, setStudentFilter] = useState({ status: 'all', sort: 'name' });
  const [queueFilter, setQueueFilter] = useState({ priority: 'all', sort: 'deadline' });
  const [scheduleCursor, setScheduleCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedScheduleDate, setSelectedScheduleDate] = useState(() => new Date());
  const [settingsForm, setSettingsForm] = useState({
    profile: {
      name: '',
      email: '',
      phone: '',
      specialization: '',
    },
    security: {
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    },
    theme: 'light',
    ai_assistance_level: 'balanced',
    notification_prefs: {
      deadline_alerts: true,
      submission_alerts: true,
      viva_reminders: true,
      weekly_digest: false,
    },
  });
  const [formErrors, setFormErrors] = useState({
    profile: {},
    security: {},
  });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState({});
  const [aiInput, setAiInput] = useState('');
  const [aiChat, setAiChat] = useState([
    { role: 'ai', text: 'Examiner AI assistant is ready. Ask for feedback drafting, consistency checks, or viva question banks.' },
  ]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    window.clearTimeout(window.__examinerToastTimer);
    window.__examinerToastTimer = window.setTimeout(() => setToast(null), 2800);
  };

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, studentsRes, queueRes, vivaRes, gradesRes, messagesRes, analyticsRes, settingsRes] = await Promise.all([
        examinerAPI.getDashboardStats(),
        examinerAPI.getStudents({}),
        examinerAPI.getEvaluationQueue(queueFilter),
        examinerAPI.getVivaSchedule(),
        examinerAPI.getGrades(),
        examinerAPI.getMessages(),
        examinerAPI.getAnalytics(),
        examinerAPI.getSettings(),
      ]);
      setStats(statsRes.data || {});
      setStudents(studentsRes.data?.data || studentsRes.data || []);
      setQueue(queueRes.data || []);
      setViva(vivaRes.data || []);
      setGrades(gradesRes.data || []);
      setMessages(messagesRes.data || []);
      setAnalytics(analyticsRes.data || {});
      setSettings(settingsRes.data || {});
      setSettingsForm((prev) => ({
        ...prev,
        profile: {
          name: statsRes.data?.examiner?.name || '',
          email: statsRes.data?.examiner?.email || '',
          phone: statsRes.data?.examiner?.phone || '',
          specialization: statsRes.data?.examiner?.specialization || '',
        },
        theme: settingsRes.data?.theme || prev.theme,
        ai_assistance_level: settingsRes.data?.ai_assistance_level || prev.ai_assistance_level,
        notification_prefs: {
          ...prev.notification_prefs,
          ...(settingsRes.data?.notification_prefs || {}),
        },
      }));
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load examiner dashboard.');
      showToast('Failed to refresh dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    const id = window.setTimeout(async () => {
      try {
        const queueRes = await examinerAPI.getEvaluationQueue(queueFilter);
        setQueue(queueRes.data || []);
      } catch {
        showToast('Unable to refresh queue filters.', 'error');
      }
    }, 150);
    return () => window.clearTimeout(id);
  }, [queueFilter]);

  useEffect(() => {
    const greeting = `You have ${kpi.reports_pending} reports to evaluate and ${kpi.upcoming_viva_sessions} viva sessions this week.`;
    setTypedGreeting('');
    let idx = 0;
    const timer = window.setInterval(() => {
      idx += 1;
      setTypedGreeting(greeting.slice(0, idx));
      if (idx >= greeting.length) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [kpi.reports_pending, kpi.upcoming_viva_sessions]);

  useEffect(() => {
    const id = window.setTimeout(async () => {
      if (search.trim().length < 2) return;
      try {
        const studentsRes = await examinerAPI.getStudents({ search: search.trim() });
        setStudents(studentsRes.data?.data || studentsRes.data || []);
      } catch {
        // Keep local fallback results when remote search fails.
      }
    }, 300);
    return () => window.clearTimeout(id);
  }, [search]);

  const kpi = useMemo(() => ({
    total_assigned_students: stats?.stats?.total_assigned_students || students.length,
    reports_pending: stats?.stats?.reports_pending || queue.length,
    upcoming_viva_sessions: stats?.stats?.upcoming_viva_sessions || viva.length,
    completion_rate: stats?.stats?.completion_rate || 95,
  }), [stats, students.length, queue.length, viva.length]);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    const base = !term
      ? [...students]
      : students.filter((s) => (`${s.first_name || ''} ${s.last_name || ''}`.toLowerCase().includes(term)
      || `${s.student_id || ''}`.toLowerCase().includes(term)));
    const filtered = studentFilter.status === 'all'
      ? base
      : base.filter((s) => (studentFilter.status === 'active' ? (s.is_active ?? true) : !(s.is_active ?? true)));
    return filtered.sort((a, b) => {
      if (studentFilter.sort === 'recent') return (b.id || 0) - (a.id || 0);
      return `${a.first_name || ''} ${a.last_name || ''}`.localeCompare(`${b.first_name || ''} ${b.last_name || ''}`);
    });
  }, [students, search, studentFilter]);

  const filteredQueue = useMemo(() => [...queue], [queue]);
  const gradeDistData = useMemo(() => {
    const buckets = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    grades.forEach((g) => {
      const score = Number(g.overall_score || 0);
      if (score >= 90) buckets.A += 1;
      else if (score >= 80) buckets.B += 1;
      else if (score >= 70) buckets.C += 1;
      else if (score >= 60) buckets.D += 1;
      else buckets.F += 1;
    });
    return Object.entries(buckets).map(([grade, count]) => ({ grade, count }));
  }, [grades]);

  const trendData = useMemo(() => {
    const base = analytics?.monthly_trend || [];
    if (base.length) return base;
    return [
      { month: 'Jan', avg: 82, evaluated: 12 },
      { month: 'Feb', avg: 84, evaluated: 15 },
      { month: 'Mar', avg: 81, evaluated: 10 },
      { month: 'Apr', avg: 85, evaluated: 18 },
    ];
  }, [analytics]);

  const maxGradeCount = Math.max(1, ...gradeDistData.map((g) => g.count || 0));
  const maxEvaluated = Math.max(1, ...trendData.map((t) => t.evaluated || 0));
  const minAvg = Math.min(...trendData.map((t) => t.avg || 0));
  const maxAvg = Math.max(...trendData.map((t) => t.avg || 100));
  const avgRange = Math.max(1, maxAvg - minAvg);
  const scheduleGrid = useMemo(() => {
    const year = scheduleCursor.getFullYear();
    const month = scheduleCursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i += 1) cells.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(year, month, d));
    return cells;
  }, [scheduleCursor]);
  const eventsByDate = useMemo(() => {
    const map = new Map();
    viva.forEach((v) => {
      const dt = new Date(v.scheduled_at);
      if (Number.isNaN(dt.getTime())) return;
      const key = dt.toISOString().slice(0, 10);
      const list = map.get(key) || [];
      list.push(v);
      map.set(key, list);
    });
    return map;
  }, [viva]);
  const selectedKey = selectedScheduleDate.toISOString().slice(0, 10);
  const selectedDateEvents = eventsByDate.get(selectedKey) || [];

  const sendAi = async () => {
    const message = aiInput.trim();
    if (!message) return;
    setAiChat((prev) => [...prev, { role: 'user', text: message }]);
    setAiInput('');
    try {
      const res = await aiExaminerAPI.chat({ message });
      setAiChat((prev) => [...prev, { role: 'ai', text: res.data?.reply || 'No response available.' }]);
    } catch {
      setAiChat((prev) => [...prev, { role: 'ai', text: 'AI assistant is currently unavailable.' }]);
    }
  };

  const saveNotificationSettings = async () => {
    try {
      await examinerAPI.updateSettings({
        notification_prefs: settingsForm.notification_prefs,
      });
      showToast('Notification preferences saved.');
      loadAll();
    } catch {
      showToast('Failed to save notification preferences.', 'error');
    }
  };

  const saveAppearanceSettings = async () => {
    try {
      await examinerAPI.updateSettings({
        theme: settingsForm.theme,
      });
      showToast('Appearance settings saved.');
      loadAll();
    } catch {
      showToast('Failed to save appearance settings.', 'error');
    }
  };

  const saveAiSettings = async () => {
    try {
      await examinerAPI.updateSettings({
        ai_assistance_level: settingsForm.ai_assistance_level,
      });
      showToast('AI settings saved.');
      loadAll();
    } catch {
      showToast('Failed to save AI settings.', 'error');
    }
  };

  const saveProfileSettings = async () => {
    const profileErrors = {};
    if (!settingsForm.profile.name.trim()) profileErrors.name = 'Name is required.';
    if (!settingsForm.profile.email.trim()) profileErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settingsForm.profile.email)) profileErrors.email = 'Enter a valid email address.';
    if (Object.keys(profileErrors).length) {
      setFormErrors((f) => ({ ...f, profile: profileErrors }));
      return;
    }

    try {
      setFormErrors((f) => ({ ...f, profile: {} }));
      await examinerAPI.updateProfile({
        name: settingsForm.profile.name,
        email: settingsForm.profile.email,
        phone: settingsForm.profile.phone,
        specialization: settingsForm.profile.specialization,
      });
      showToast('Profile updated successfully.');
      loadAll();
    } catch (e) {
      setFormErrors((f) => ({ ...f, profile: e?.response?.data?.errors || {} }));
      showToast(e?.response?.data?.message || 'Failed to update profile.', 'error');
    }
  };

  const saveSecuritySettings = async () => {
    const securityErrors = {};
    if (!settingsForm.security.current_password) securityErrors.current_password = 'Current password is required.';
    if (!settingsForm.security.new_password) securityErrors.new_password = 'New password is required.';
    else if (settingsForm.security.new_password.length < 8) securityErrors.new_password = 'New password must be at least 8 characters.';
    if (!settingsForm.security.new_password_confirmation) securityErrors.new_password_confirmation = 'Please confirm your new password.';
    if (Object.keys(securityErrors).length) {
      setFormErrors((f) => ({ ...f, security: securityErrors }));
      return;
    }

    if (settingsForm.security.new_password !== settingsForm.security.new_password_confirmation) {
      setFormErrors((f) => ({
        ...f,
        security: { ...f.security, new_password_confirmation: 'New password and confirmation do not match.' },
      }));
      showToast('New password and confirmation do not match.', 'error');
      return;
    }

    try {
      setFormErrors((f) => ({ ...f, security: {} }));
      await examinerAPI.changePassword({
        current_password: settingsForm.security.current_password,
        new_password: settingsForm.security.new_password,
        new_password_confirmation: settingsForm.security.new_password_confirmation,
      });
      setSettingsForm((s) => ({
        ...s,
        security: {
          current_password: '',
          new_password: '',
          new_password_confirmation: '',
        },
      }));
      showToast('Password changed successfully.');
    } catch (e) {
      setFormErrors((f) => ({ ...f, security: e?.response?.data?.errors || {} }));
      showToast(e?.response?.data?.message || 'Failed to change password.', 'error');
    }
  };

  const askAiScores = async () => {
    try {
      const res = await aiExaminerAPI.suggestScores({});
      setDraft((d) => ({ ...d, ...res.data }));
      showToast('AI score suggestions applied.');
    } catch {
      showToast('Unable to generate score suggestions.', 'error');
    }
  };

  const submitEvaluation = async (computed) => {
    if (!draft.student_id) return showToast('Select a student before submitting.', 'error');
    try {
      await examinerAPI.evaluateReport({
        student_id: draft.student_id,
        report_type: draft.report_type || 'final',
        technical_score: draft.technical_score || 0,
        documentation_score: draft.documentation_score || 0,
        methodology_score: draft.methodology_score || 0,
        learning_score: draft.learning_score || 0,
        presentation_score: draft.presentation_score || 0,
        overall_score: draft.overall_score || computed.overall,
        grade: draft.grade || computed.grade,
        comments: draft.comments || '',
      });
      setDraft({});
      showToast('Evaluation submitted successfully.');
      loadAll();
    } catch {
      showToast('Failed to submit evaluation.', 'error');
    }
  };

  const renderOverview = () => (
    <>
      <section className="welcome-banner examiner-card">
        <h2>👋 Welcome back, {stats?.examiner?.name || 'Dr. Examiner'}!</h2>
        <p>
          {typedGreeting} <span className="type-caret">|</span> Your completion rate is {kpi.completion_rate}%.
        </p>
        <div className="welcome-meta"><span>🟢 All Systems Operational</span><span>{new Date().toDateString()}</span></div>
      </section>
      <div className="stats-grid">
        <StatsCard icon="👨‍🎓" value={kpi.total_assigned_students} label="Total Examinees" trend="+2 new" color="#0ea5e9" />
        <StatsCard icon="📝" value={kpi.reports_pending} label="Pending Evaluations" trend="+3 urgent" color="#ef4444" />
        <StatsCard icon="⏳" value={kpi.upcoming_viva_sessions} label="Upcoming Vivas" trend="This week" color="#f59e0b" />
        <StatsCard icon="✅" value={`${kpi.completion_rate}%`} label="Completion Rate" trend="+5% vs avg" color="#10b981" />
      </div>
      <div className="two-col-grid">
        <section className="examiner-card">
          <h3>⚡ Priority Tasks</h3>
          <div className="task-list">
            {queue.slice(0, 3).map((q) => (
              <article key={q.id} className="task-item">
                <strong>{q.report_type || 'Report'} - Student #{q.student_id}</strong>
                <small>Due: {q.deadline ? new Date(q.deadline).toLocaleString() : 'Upcoming'}</small>
                <button type="button" className="examiner-btn" onClick={() => setActive('reports')}>Evaluate Now</button>
              </article>
            ))}
            {!queue.length && <div className="empty-state">No urgent tasks right now.</div>}
          </div>
        </section>
        <section className="examiner-card">
          <h3>📋 Recent Activity</h3>
          <ul className="timeline">
            {(stats?.activity || [
              'Evaluated final report for Student A',
              'Completed viva session for Student B',
              'Requested revision for Student C',
            ]).map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </section>
      </div>
      <section className="examiner-card ai-insight">
        <h3>🤖 AI Performance Insights</h3>
        <ul>
          <li>Average grading time: 35 minutes/report.</li>
          <li>Feedback quality score: 4.8/5.</li>
          <li>Suggestion: provide one concrete improvement example per student.</li>
        </ul>
      </section>
    </>
  );

  const renderExaminees = () => (
    <>
      <div className="toolbar examiner-card">
        <h3>👨‍🎓 My Examinees</h3>
        <div className="toolbar-filters">
          <select><option>All</option></select>
          <select><option>Department</option></select>
          <select value={studentFilter.status} onChange={(e) => setStudentFilter((p) => ({ ...p, status: e.target.value }))}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={studentFilter.sort} onChange={(e) => setStudentFilter((p) => ({ ...p, sort: e.target.value }))}>
            <option value="name">Sort: Name</option>
            <option value="recent">Sort: Recent</option>
          </select>
        </div>
      </div>
      <div className="student-grid">
        {filteredStudents.map((s) => (
          <StudentCard
            key={s.id}
            student={s}
            onView={async () => {
              const res = await examinerAPI.getStudentDetail(s.id);
              setStudentDetail(res.data || s);
            }}
            onEvaluate={() => {
              setDraft((d) => ({ ...d, student_id: s.id }));
              setActive('reports');
            }}
          />
        ))}
        {!filteredStudents.length && <div className="empty-state examiner-card">No examinees found.</div>}
      </div>
    </>
  );

  const renderQueue = () => (
    <section className="examiner-card">
      <h3>📋 Evaluation Queue</h3>
      <div className="toolbar-filters queue-filter-row">
        <select value={queueFilter.priority} onChange={(e) => setQueueFilter((p) => ({ ...p, priority: e.target.value }))}>
          <option value="all">All Priority</option>
          <option value="urgent">Urgent</option>
          <option value="normal">Normal</option>
        </select>
        <select value={queueFilter.sort} onChange={(e) => setQueueFilter((p) => ({ ...p, sort: e.target.value }))}>
          <option value="deadline">Sort by Deadline</option>
          <option value="created">Sort by Created</option>
        </select>
      </div>
      <div className="queue-list">
        {filteredQueue.map((q) => (
          <article key={q.id} className="queue-card">
            <span className={`priority ${q.priority === 'urgent' ? 'urgent' : 'normal'}`}>{q.priority || 'normal'}</span>
            <h4>Student #{q.student_id} - {q.report_type || 'Report'}</h4>
            <p>Submitted: {q.created_at ? new Date(q.created_at).toLocaleDateString() : 'N/A'} | Deadline: {q.deadline ? new Date(q.deadline).toLocaleString() : 'N/A'}</p>
            <div className="queue-actions">
              <button type="button" className="examiner-btn" onClick={() => setActive('reports')}>Start Evaluation</button>
              <button type="button" className="examiner-btn secondary">Preview Report</button>
            </div>
          </article>
        ))}
        {!filteredQueue.length && <div className="empty-state">No pending reports in the queue.</div>}
      </div>
    </section>
  );

  const renderReports = () => (
    <section className="three-panel">
      <article className="examiner-card">
        <h4>📄 Report Viewer</h4>
        <div className="report-viewer">Student report preview content area</div>
      </article>
      <article className="examiner-card">
        <h4>🤖 AI Analysis</h4>
        <ul>
          <li>Completeness: 95%</li>
          <li>Similarity: 7%</li>
          <li>Grammar score: 92%</li>
        </ul>
        <button type="button" className="examiner-btn secondary" onClick={askAiScores}>Use AI Suggestions</button>
      </article>
      <article className="examiner-card">
        <h4>📊 Evaluation Form</h4>
        <select value={draft.student_id || ''} onChange={(e) => setDraft((d) => ({ ...d, student_id: Number(e.target.value) || '' }))}>
          <option value="">Select student</option>
          {students.map((s) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
        </select>
        <EvaluationForm draft={draft} setDraft={setDraft} onSuggest={askAiScores} onSubmit={submitEvaluation} />
      </article>
    </section>
  );

  const renderViva = () => (
    <section className="examiner-card">
      <h3>🎤 Viva / Oral Defense Sessions</h3>
      <div className="queue-list">
        {viva.map((session) => (
          <article key={session.id} className="queue-card">
            <h4>👤 Student #{session.student_id}</h4>
            <p>📅 {session.scheduled_at ? new Date(session.scheduled_at).toLocaleString() : 'TBD'} | Format: {session.format || 'virtual'}</p>
            <div className="queue-actions">
              <button type="button" className="examiner-btn secondary" onClick={async () => {
                const res = await aiExaminerAPI.generateVivaQuestions({});
                setAiChat((prev) => [...prev, { role: 'ai', text: `Generated questions:\n${(res.data?.questions || []).join('\n')}` }]);
                setActive('ai');
              }}>Prepare Questions</button>
              <button type="button" className="examiner-btn" onClick={() => examinerAPI.recordVivaResults(session.id, { overall_score: 83, result: 'pass', feedback: 'Good performance.' }).then(loadAll)}>Submit Viva Result</button>
            </div>
          </article>
        ))}
        {!viva.length && <div className="empty-state">No scheduled viva sessions.</div>}
      </div>
    </section>
  );

  const renderGrades = () => (
    <section className="examiner-card">
      <h3>📊 Grade Management</h3>
      <div className="grade-bars">
        {gradeDistData.map((b, i) => (
          <div key={b.grade} className="bar-row">
            <span>{b.grade}</span>
            <div><i style={{ width: `${(b.count / maxGradeCount) * 100}%`, background: ['#667eea', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'][i] }} /></div>
            <strong>{b.count}</strong>
          </div>
        ))}
      </div>
      <div className="table-wrap">
        <table className="examiner-table">
          <thead><tr><th>Student</th><th>Report</th><th>Viva</th><th>Final</th><th>Grade</th><th>Status</th></tr></thead>
          <tbody>
            {grades.map((g) => <tr key={g.id}><td>#{g.student_id}</td><td>{g.report_score || '-'}</td><td>{g.viva_score || '-'}</td><td>{g.overall_score || '-'}</td><td>{g.grade || '-'}</td><td>{g.status || 'Draft'}</td></tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderSchedule = () => (
    <section className="two-col-grid">
      <article className="examiner-card">
        <h3>📅 Calendar</h3>
        <div className="calendar-nav">
          <button type="button" className="examiner-btn secondary" onClick={() => setScheduleCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>Prev</button>
          <strong>{scheduleCursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</strong>
          <button type="button" className="examiner-btn secondary" onClick={() => setScheduleCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>Next</button>
        </div>
        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => <div key={w} className="calendar-head">{w}</div>)}
          {scheduleGrid.map((cell, idx) => {
            if (!cell) return <div key={`empty-${idx}`} className="calendar-cell empty" />;
            const key = cell.toISOString().slice(0, 10);
            const hasViva = (eventsByDate.get(key) || []).length > 0;
            const isSelected = key === selectedKey;
            return (
              <button
                type="button"
                key={key}
                className={`calendar-cell ${hasViva ? 'has-viva' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedScheduleDate(cell)}
              >
                <span>{cell.getDate()}</span>
                {hasViva && <i>🔴</i>}
              </button>
            );
          })}
        </div>
      </article>
      <article className="examiner-card">
        <h3>📋 Events on {selectedScheduleDate.toDateString()}</h3>
        <ul className="timeline">
          {selectedDateEvents.map((v) => <li key={v.id}>🔴 Viva for Student #{v.student_id} - {new Date(v.scheduled_at).toLocaleTimeString()}</li>)}
          {!selectedDateEvents.length && <li>No events scheduled on this date.</li>}
        </ul>
      </article>
    </section>
  );

  const renderMessages = () => (
    <section className="chat-layout examiner-card">
      <aside className="contacts-panel">
        <h4>Contacts</h4>
        {messages.map((m) => <button key={m.id} type="button">{m.from_name || 'User'}</button>)}
      </aside>
      <div className="chat-panel">
        <h4>Chat Window</h4>
        <div className="chat-window">{messages.map((m) => <p key={m.id}><strong>{m.from_name || 'User'}:</strong> {m.subject || m.message || 'Message'}</p>)}</div>
      </div>
      <aside className="ai-panel">
        <h4>AI Assistant</h4>
        <p>Ask AI about report feedback, grading support, and viva questions.</p>
        <button type="button" className="examiner-btn secondary" onClick={() => setActive('ai')}>Open AI</button>
      </aside>
    </section>
  );

  const renderAnalytics = () => (
    <section className="two-col-grid">
      <article className="examiner-card">
        <h3>📊 My Performance</h3>
        <div className="grade-bars">
          {trendData.map((t) => (
            <div key={t.month} className="bar-row">
              <span>{t.month}</span>
              <div><i style={{ width: `${((t.evaluated || 0) / maxEvaluated) * 100}%` }} /></div>
              <strong>{t.evaluated}</strong>
            </div>
          ))}
        </div>
      </article>
      <article className="examiner-card">
        <h3>📈 Grade Trends</h3>
        <div className="line-chart-panel">
          <svg viewBox="0 0 400 140" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="#667eea"
              strokeWidth="4"
              points={trendData.map((t, i) => {
                const x = (i / Math.max(1, trendData.length - 1)) * 380 + 10;
                const y = 120 - (((t.avg || 0) - minAvg) / avgRange) * 90;
                return `${x},${y}`;
              }).join(' ')}
            />
            {trendData.map((t, i) => {
              const x = (i / Math.max(1, trendData.length - 1)) * 380 + 10;
              const y = 120 - (((t.avg || 0) - minAvg) / avgRange) * 90;
              return <circle key={t.month} cx={x} cy={y} r="4" fill="#0ea5e9" />;
            })}
          </svg>
          <div className="line-chart-labels">
            {trendData.map((t) => <span key={t.month}>{t.month}</span>)}
          </div>
        </div>
        <p>Average turnaround: {analytics?.metrics?.avg_turnaround_days || 0} days</p>
        <p>Completed evaluations: {analytics?.metrics?.completed_evaluations || 0}</p>
        <div className="queue-actions">
          <button type="button" className="examiner-btn secondary" onClick={() => examinerAPI.exportReport('csv')}>Export Analytics</button>
        </div>
      </article>
    </section>
  );

  const renderAI = () => (
    <section className="examiner-card">
      <h3>🤖 AI Evaluation Assistant</h3>
      <div className="ai-chat">
        {aiChat.map((m, i) => <div key={i} className={`bubble ${m.role}`}>{m.text}</div>)}
      </div>
      <div className="chat-input">
        <input value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="Ask AI..." />
        <button type="button" className="examiner-btn" onClick={sendAi}>Send</button>
      </div>
      <div className="quick-actions">
        <button type="button" className="examiner-btn secondary">Generate Feedback</button>
        <button type="button" className="examiner-btn secondary">Create Viva Questions</button>
        <button type="button" className="examiner-btn secondary">Check Consistency</button>
      </div>
    </section>
  );

  const renderSettings = () => (
    <section className="settings-grid">
      <article className="examiner-card">
        <h3>👤 Profile Settings</h3>
        <div className="form-grid">
          <input value={settingsForm.profile.name} onChange={(e) => setSettingsForm((s) => ({ ...s, profile: { ...s.profile, name: e.target.value } }))} placeholder="Full name" />
          {formErrors.profile.name && <small className="field-error">{formErrors.profile.name}</small>}
          <input value={settingsForm.profile.email} onChange={(e) => setSettingsForm((s) => ({ ...s, profile: { ...s.profile, email: e.target.value } }))} placeholder="Email" />
          {formErrors.profile.email && <small className="field-error">{formErrors.profile.email}</small>}
          <input value={settingsForm.profile.phone} onChange={(e) => setSettingsForm((s) => ({ ...s, profile: { ...s.profile, phone: e.target.value } }))} placeholder="Phone" />
          {formErrors.profile.phone && <small className="field-error">{formErrors.profile.phone}</small>}
          <input value={settingsForm.profile.specialization} onChange={(e) => setSettingsForm((s) => ({ ...s, profile: { ...s.profile, specialization: e.target.value } }))} placeholder="Specialization" />
          {formErrors.profile.specialization && <small className="field-error">{formErrors.profile.specialization}</small>}
        </div>
        <div className="queue-actions">
          <button type="button" className="examiner-btn" onClick={saveProfileSettings}>Update Profile</button>
        </div>
      </article>
      <article className="examiner-card">
        <h3>🔔 Notification Preferences</h3>
        <label><input type="checkbox" checked={Boolean(settingsForm.notification_prefs.deadline_alerts)} onChange={(e) => setSettingsForm((s) => ({ ...s, notification_prefs: { ...s.notification_prefs, deadline_alerts: e.target.checked } }))} /> Email: New evaluation assigned</label>
        <label><input type="checkbox" checked={Boolean(settingsForm.notification_prefs.submission_alerts)} onChange={(e) => setSettingsForm((s) => ({ ...s, notification_prefs: { ...s.notification_prefs, submission_alerts: e.target.checked } }))} /> Email: Report submitted</label>
        <label><input type="checkbox" checked={Boolean(settingsForm.notification_prefs.weekly_digest)} onChange={(e) => setSettingsForm((s) => ({ ...s, notification_prefs: { ...s.notification_prefs, weekly_digest: e.target.checked } }))} /> Email: Weekly digest</label>
        <div className="queue-actions">
          <button type="button" className="examiner-btn" onClick={saveNotificationSettings}>Save Preferences</button>
        </div>
      </article>
      <article className="examiner-card">
        <h3>🔒 Security</h3>
        <div className="form-grid">
          <input type="password" value={settingsForm.security.current_password} onChange={(e) => setSettingsForm((s) => ({ ...s, security: { ...s.security, current_password: e.target.value } }))} placeholder="Current password" />
          {formErrors.security.current_password && <small className="field-error">{formErrors.security.current_password}</small>}
          <input type="password" value={settingsForm.security.new_password} onChange={(e) => setSettingsForm((s) => ({ ...s, security: { ...s.security, new_password: e.target.value } }))} placeholder="New password" />
          {formErrors.security.new_password && <small className="field-error">{formErrors.security.new_password}</small>}
          <input type="password" value={settingsForm.security.new_password_confirmation} onChange={(e) => setSettingsForm((s) => ({ ...s, security: { ...s.security, new_password_confirmation: e.target.value } }))} placeholder="Confirm password" />
          {formErrors.security.new_password_confirmation && <small className="field-error">{formErrors.security.new_password_confirmation}</small>}
        </div>
        <div className="queue-actions">
          <button type="button" className="examiner-btn" onClick={saveSecuritySettings}>Change Password</button>
        </div>
      </article>
      <article className="examiner-card">
        <h3>🎨 Appearance</h3>
        <div className="form-grid">
          <select value={settingsForm.theme} onChange={(e) => setSettingsForm((s) => ({ ...s, theme: e.target.value }))}><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select>
          <select><option>Medium font</option><option>Small font</option><option>Large font</option></select>
        </div>
        <div className="queue-actions">
          <button type="button" className="examiner-btn" onClick={saveAppearanceSettings}>Save Appearance</button>
        </div>
      </article>
      <article className="examiner-card">
        <h3>🤖 AI Assistance</h3>
        <div className="form-grid">
          <select value={settingsForm.ai_assistance_level} onChange={(e) => setSettingsForm((s) => ({ ...s, ai_assistance_level: e.target.value }))}>
            <option value="minimal">Minimal</option>
            <option value="balanced">Balanced</option>
            <option value="maximum">Maximum</option>
          </select>
        </div>
        <div className="queue-actions">
          <button type="button" className="examiner-btn" onClick={saveAiSettings}>Save AI Settings</button>
        </div>
      </article>
    </section>
  );

  const content = {
    overview: renderOverview(),
    examinees: renderExaminees(),
    queue: renderQueue(),
    reports: renderReports(),
    viva: renderViva(),
    grades: renderGrades(),
    schedule: renderSchedule(),
    messages: renderMessages(),
    analytics: renderAnalytics(),
    ai: renderAI(),
    settings: renderSettings(),
  };

  const page = PAGE_META[active];

  return (
    <div className="examiner-layout">
      <ExaminerSidebar
        nav={NAV}
        active={active}
        onChange={setActive}
        onLogout={() => router.post('/logout')}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        examinerName={stats?.examiner?.name}
      />
      <main className="examiner-main">
        <ExaminerHeader
          title={page.label}
          icon={page.icon}
          subtitle="Professional evaluation workspace with AI-supported grading and viva management."
          onSearch={setSearch}
          searchPlaceholder="Search students, reports, sessions..."
        />
        {loading && <div className="skeleton-grid"><div className="skeleton-card" /><div className="skeleton-card" /><div className="skeleton-card" /></div>}
        {!loading && error && <div className="examiner-card error-state">{error}</div>}
        {!loading && !error && <section className="page-body">{content[active]}</section>}
      </main>
      <Modal
        open={Boolean(studentDetail)}
        onClose={() => setStudentDetail(null)}
        title={`👤 ${studentDetail?.first_name || ''} ${studentDetail?.last_name || ''} - Student Details`}
        size="lg"
        footer={(
          <>
            <button type="button" className="examiner-btn secondary" onClick={() => setActive('messages')}>Send Message</button>
            <button type="button" className="examiner-btn" onClick={() => { setActive('reports'); setStudentDetail(null); }}>Evaluate Report</button>
          </>
        )}
      >
        <div className="student-modal-grid">
          <div><strong>ID:</strong> {studentDetail?.student_id || studentDetail?.id}</div>
          <div><strong>Email:</strong> {studentDetail?.email || 'N/A'}</div>
          <div><strong>Department:</strong> {studentDetail?.department_name || studentDetail?.department_id || 'N/A'}</div>
          <div><strong>Company:</strong> {studentDetail?.company_name || 'N/A'}</div>
        </div>
      </Modal>
      {toast && <div className={`examiner-toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
};

export default ExaminerDashboard;
