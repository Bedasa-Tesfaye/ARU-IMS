import React, { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { aiExaminerAPI, examinerAPI } from '../services/http';
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

const ExaminerDashboard = () => {
  const [active, setActive] = useState('overview');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [queue, setQueue] = useState([]);
  const [viva, setViva] = useState([]);
  const [grades, setGrades] = useState([]);
  const [messages, setMessages] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [settings, setSettings] = useState(null);
  const [aiChat, setAiChat] = useState([{ role: 'ai', text: 'Examiner AI Co-Pilot ready. Ask about fair grading, feedback drafting, viva questions, and consistency checks.' }]);
  const [aiInput, setAiInput] = useState('');
  const [toast, setToast] = useState(null);
  const [activeVivaRunner, setActiveVivaRunner] = useState(null);
  const [vivaTimer, setVivaTimer] = useState(0);
  const [draft, setDraft] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('examiner-report-draft') || '{}');
    } catch {
      return {};
    }
  });
  const [vivaNotes, setVivaNotes] = useState(() => localStorage.getItem('examiner-viva-notes') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    window.clearTimeout(window.__examinerToastTimer);
    window.__examinerToastTimer = window.setTimeout(() => setToast(null), 2600);
  };

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, studentsRes, queueRes, vivaRes, gradesRes, messagesRes, analyticsRes, settingsRes] = await Promise.all([
        examinerAPI.getDashboardStats(),
        examinerAPI.getStudents({}),
        examinerAPI.getEvaluationQueue(),
        examinerAPI.getVivaSchedule(),
        examinerAPI.getGrades(),
        examinerAPI.getMessages(),
        examinerAPI.getAnalytics(),
        examinerAPI.getSettings(),
      ]);
      setStats(statsRes.data);
      setStudents(studentsRes.data?.data || studentsRes.data || []);
      setQueue(queueRes.data || []);
      setViva(vivaRes.data || []);
      setGrades(gradesRes.data || []);
      setMessages(messagesRes.data || []);
      setAnalytics(analyticsRes.data || null);
      setSettings(settingsRes.data || null);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load examiner dashboard.');
      showToast('Failed to refresh examiner dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (!activeVivaRunner) return undefined;
    const id = window.setInterval(() => setVivaTimer((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [activeVivaRunner]);

  useEffect(() => {
    localStorage.setItem('examiner-report-draft', JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    localStorage.setItem('examiner-viva-notes', vivaNotes);
  }, [vivaNotes]);

  const kpi = useMemo(() => stats?.stats || {
    total_assigned_students: 0,
    reports_pending: 0,
    reports_evaluated_this_month: 0,
    upcoming_viva_sessions: 0,
    average_grade_given: 0,
    students_passed: 0,
    students_failed: 0,
  }, [stats]);

  const sendAi = async () => {
    const message = aiInput.trim();
    if (!message) return;
    setAiChat((prev) => [...prev, { role: 'user', text: message }]);
    setAiInput('');
    try {
      const res = await aiExaminerAPI.chat({ message });
      setAiChat((prev) => [...prev, { role: 'ai', text: res.data?.reply || 'AI response unavailable.' }]);
    } catch {
      setAiChat((prev) => [...prev, { role: 'ai', text: 'AI assistant unavailable right now.' }]);
      showToast('AI assistant unavailable.', 'error');
    }
  };

  const renderOverview = () => (
    <div className="ex-grid">
      <section className="ex-card ex-hero">
        <h2>Welcome back, {stats?.examiner?.name || 'Examiner'}!</h2>
        <p>You have {kpi.reports_pending} reports pending and {kpi.upcoming_viva_sessions} viva sessions upcoming.</p>
      </section>
      <section className="ex-stat-row">
        <div className="ex-stat"><strong>{kpi.total_assigned_students}</strong><span>Assigned Students</span></div>
        <div className="ex-stat"><strong>{kpi.reports_pending}</strong><span>Reports Pending</span></div>
        <div className="ex-stat"><strong>{kpi.reports_evaluated_this_month}</strong><span>Evaluated This Month</span></div>
        <div className="ex-stat"><strong>{kpi.upcoming_viva_sessions}</strong><span>Upcoming Viva</span></div>
        <div className="ex-stat"><strong>{kpi.average_grade_given}</strong><span>Average Score</span></div>
        <div className="ex-stat"><strong>{kpi.students_passed}/{kpi.students_failed}</strong><span>Passed / Failed</span></div>
      </section>
      <section className="ex-card">
        <h3>AI-Prioritized Work Queue</h3>
        <ul>{(stats?.ai_work_queue || []).map((i, idx) => <li key={idx}>{i}</li>)}</ul>
      </section>
      <section className="ex-card">
        <h3>AI Performance Insights</h3>
        <ul>
          <li>Average grading time per report: 45 minutes</li>
          <li>Grade consistency score: 92%</li>
          <li>Feedback quality score: 4.8/5</li>
        </ul>
      </section>
    </div>
  );

  const renderExaminees = () => (
      <section className="ex-card">
      <h3>My Examinees</h3>
      <div className="ex-list">
          {students.length === 0 && <div className="ex-empty">No assigned examinees found for your filter.</div>}
        {students.map((s) => (
          <div key={s.id} className="ex-list-item">
            <div>
              <strong>{s.first_name} {s.last_name}</strong>
              <small>{s.student_id || 'N/A'} | Dept {s.department_id || 'N/A'}</small>
            </div>
            <button className="ex-btn" onClick={async () => {
              const res = await examinerAPI.getStudentDetail(s.id);
              setAiChat((p) => [...p, { role: 'ai', text: `AI Summary for ${s.first_name}: ${(res.data?.ai_summary || []).join(' | ')}` }]);
              setActive('ai');
              showToast('Student AI summary loaded.');
            }}>AI Detail</button>
          </div>
        ))}
      </div>
    </section>
  );

  const renderQueue = () => (
    <section className="ex-card">
      <h3>Evaluation Queue</h3>
      <div className="ex-list">
        {queue.length === 0 && <div className="ex-empty">No pending evaluations.</div>}
        {queue.map((q) => (
          <div key={q.id} className="ex-list-item">
            <div>
              <strong>Student #{q.student_id} | {q.report_type}</strong>
              <small>Status: {q.status}</small>
            </div>
            <button className="ex-btn" onClick={() => examinerAPI.updateEvaluation(q.id, { status: 'in_review' }).then(loadAll)}>Start Evaluation</button>
          </div>
        ))}
      </div>
    </section>
  );

  const renderReports = () => (
    <section className="ex-card">
      <h3>Report Assessment</h3>
      <p>AI-assisted rubric scoring and feedback drafting is available through evaluation actions.</p>
      <div className="ex-form-grid">
        <select
          value={draft.student_id || ''}
          onChange={(e) => setDraft((d) => ({ ...d, student_id: Number(e.target.value) || '' }))}
        >
          <option value="">Select student</option>
          {students.map((s) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
        </select>
        <select value={draft.report_type || 'final'} onChange={(e) => setDraft((d) => ({ ...d, report_type: e.target.value }))}>
          <option value="midterm">Mid-term</option>
          <option value="final">Final</option>
          <option value="revision">Revision</option>
        </select>
        <input type="number" min="0" max="100" placeholder="Technical" value={draft.technical_score || ''} onChange={(e) => setDraft((d) => ({ ...d, technical_score: Number(e.target.value) }))} />
        <input type="number" min="0" max="100" placeholder="Documentation" value={draft.documentation_score || ''} onChange={(e) => setDraft((d) => ({ ...d, documentation_score: Number(e.target.value) }))} />
        <input type="number" min="0" max="100" placeholder="Presentation" value={draft.presentation_score || ''} onChange={(e) => setDraft((d) => ({ ...d, presentation_score: Number(e.target.value) }))} />
        <input type="number" min="0" max="100" placeholder="Overall" value={draft.overall_score || ''} onChange={(e) => setDraft((d) => ({ ...d, overall_score: Number(e.target.value) }))} />
        <input placeholder="Grade (e.g., B+)" value={draft.grade || ''} onChange={(e) => setDraft((d) => ({ ...d, grade: e.target.value }))} />
        <textarea placeholder="Comments" value={draft.comments || ''} onChange={(e) => setDraft((d) => ({ ...d, comments: e.target.value }))} />
      </div>
      <div className="ex-inline-actions">
        <button className="ex-btn secondary" onClick={async () => {
          const res = await aiExaminerAPI.suggestScores({});
          setDraft((d) => ({
            ...d,
            technical_score: res.data?.technical_score,
            documentation_score: res.data?.documentation_score,
            presentation_score: res.data?.presentation_score,
            overall_score: res.data?.overall_score,
            grade: res.data?.grade,
          }));
          showToast('AI suggested scores applied.');
        }}>AI Suggest Scores</button>
        <button className="ex-btn" onClick={async () => {
          if (!draft.student_id) return showToast('Select a student first.', 'error');
          await examinerAPI.evaluateReport({
            student_id: draft.student_id,
            report_type: draft.report_type || 'final',
            technical_score: draft.technical_score || 0,
            documentation_score: draft.documentation_score || 0,
            presentation_score: draft.presentation_score || 0,
            overall_score: draft.overall_score || 0,
            grade: draft.grade || 'C',
            comments: draft.comments || '',
          });
          setDraft({});
          localStorage.removeItem('examiner-report-draft');
          showToast('Report evaluation submitted.');
          loadAll();
        }}>Submit Evaluation</button>
      </div>
    </section>
  );

  const renderViva = () => (
    <section className="ex-card">
      <h3>Viva / Oral Defense</h3>
      <div className="ex-list">
        {viva.length === 0 && <div className="ex-empty">No viva sessions scheduled.</div>}
        {viva.map((v) => (
          <div key={v.id} className="ex-list-item">
            <div>
              <strong>Student #{v.student_id}</strong>
              <small>{new Date(v.scheduled_at).toLocaleString()} | {v.format}</small>
            </div>
            <button className="ex-btn" onClick={() => examinerAPI.recordVivaResults(v.id, { overall_score: 80, result: 'pass', feedback: 'Strong technical responses.' }).then(loadAll)}>Record Result</button>
            <button className="ex-btn secondary" onClick={() => {
              setActiveVivaRunner(v);
              setVivaTimer(0);
            }}>Start Viva Runner</button>
          </div>
        ))}
      </div>
      {activeVivaRunner && (
        <div className="ex-viva-runner">
          <h4>Viva Runner: Student #{activeVivaRunner.student_id}</h4>
          <p>Elapsed: {Math.floor(vivaTimer / 60)}:{String(vivaTimer % 60).padStart(2, '0')}</p>
          <textarea
            className="ex-viva-notes"
            placeholder="Live viva notes / transcript draft (autosaved)..."
            value={vivaNotes}
            onChange={(e) => setVivaNotes(e.target.value)}
          />
          <div className="ex-inline-actions">
            <button className="ex-btn secondary" onClick={async () => {
              const res = await aiExaminerAPI.generateVivaQuestions({});
              setAiChat((prev) => [...prev, { role: 'ai', text: `Viva Questions:\n${(res.data?.questions || []).join('\n')}` }]);
              setActive('ai');
              showToast('Viva question bank generated.');
            }}>Generate Questions</button>
            <button className="ex-btn secondary" onClick={async () => {
              const res = await aiExaminerAPI.transcribeViva({ notes: vivaNotes });
              setVivaNotes((prev) => `${prev}\n\n[AI Transcript]\n${res.data?.transcript || ''}`.trim());
              showToast('AI transcript appended.');
            }}>Transcribe Viva</button>
            <button className="ex-btn" onClick={() => setActiveVivaRunner(null)}>End Session</button>
          </div>
        </div>
      )}
    </section>
  );

  const renderGrades = () => (
    <section className="ex-card">
      <h3>Grade Management</h3>
      <div className="ex-list">
        {grades.length === 0 && <div className="ex-empty">No grades available.</div>}
        {grades.map((g) => (
          <div key={g.id} className="ex-list-item">
            <div>
              <strong>Student #{g.student_id}</strong>
              <small>{g.grade} | Score {g.overall_score}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderSchedule = () => (
    <section className="ex-card">
      <h3>Schedule</h3>
      <button className="ex-btn" onClick={async () => {
        const s = students[0];
        if (!s) return;
        await examinerAPI.createVivaSchedule({ student_id: s.id, scheduled_at: new Date(Date.now() + 86400000).toISOString(), format: 'virtual' });
        loadAll();
      }}>Schedule Viva (Demo)</button>
    </section>
  );

  const renderMessages = () => (
    <section className="ex-card">
      <h3>Messages / Chat</h3>
      <div className="ex-list">
        {messages.length === 0 && <div className="ex-empty">No messages yet.</div>}
        {messages.map((m) => (
          <div key={m.id} className="ex-list-item">
            <div>
              <strong>{m.subject || 'Message'}</strong>
              <small>{m.from_name} | {m.category}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderAnalytics = () => (
    <section className="ex-card">
      <h3>Analytics & Reports</h3>
      <p>Completed evaluations: {analytics?.metrics?.completed_evaluations || 0}</p>
      <p>Average turnaround: {analytics?.metrics?.avg_turnaround_days || 0} days</p>
      <div className="ex-chart">
        {[
          { label: 'Completed', value: analytics?.metrics?.completed_evaluations || 0 },
          { label: 'Avg Score', value: Math.round(analytics?.metrics?.avg_score || 0) },
          { label: 'Consistency', value: analytics?.metrics?.grade_consistency || 0 },
        ].map((bar) => (
          <div key={bar.label} className="ex-chart-row">
            <span>{bar.label}</span>
            <div className="ex-chart-bar"><i style={{ width: `${Math.min(100, bar.value)}%` }} /></div>
            <strong>{bar.value}</strong>
          </div>
        ))}
      </div>
      <div className="ex-inline-actions">
        <button className="ex-btn secondary" onClick={async () => {
          const res = await examinerAPI.exportReport('csv');
          const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'examiner_analytics_report.csv';
          a.click();
          window.URL.revokeObjectURL(url);
          showToast('CSV report downloaded.');
        }}>Download CSV</button>
        <button className="ex-btn secondary" onClick={async () => {
          const res = await examinerAPI.exportReport('pdf');
          const blob = new Blob([res.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'examiner_analytics_report.pdf';
          a.click();
          window.URL.revokeObjectURL(url);
          showToast('PDF-ready report downloaded.');
        }}>Download PDF</button>
      </div>
      <ul>{(analytics?.insights || []).map((i, idx) => <li key={idx}>{i}</li>)}</ul>
    </section>
  );

  const renderAI = () => (
    <section className="ex-card">
      <h3>AI Examiner Assistant</h3>
      <div className="ex-chat">
        {aiChat.map((m, idx) => <div key={idx} className={`ex-bubble ${m.role}`}>{m.text}</div>)}
      </div>
      <div className="ex-chat-input">
        <input value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="Ask AI about grading, viva, consistency..." />
        <button className="ex-btn" onClick={sendAi}>Send</button>
      </div>
    </section>
  );

  const renderSettings = () => (
    <section className="ex-card">
      <h3>Settings</h3>
      <label>AI Assistance Level</label>
      <select value={settings?.ai_assistance_level || 'balanced'} onChange={(e) => examinerAPI.updateSettings({ ai_assistance_level: e.target.value }).then(loadAll)}>
        <option value="minimal">Minimal</option>
        <option value="balanced">Balanced</option>
        <option value="maximum">Maximum</option>
      </select>
      <h4>Rubric Templates</h4>
      <div className="ex-rubric-list">
        {(settings?.rubric_templates || []).map((r, idx) => (
          <div className="ex-rubric-item" key={`${r.name}-${idx}`}>
            <input
              value={r.name || ''}
              onChange={(e) => {
                const next = [...(settings?.rubric_templates || [])];
                next[idx] = { ...next[idx], name: e.target.value };
                setSettings((s) => ({ ...s, rubric_templates: next }));
              }}
              placeholder="Template name"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={r.technical ?? 0}
              onChange={(e) => {
                const next = [...(settings?.rubric_templates || [])];
                next[idx] = { ...next[idx], technical: Number(e.target.value) };
                setSettings((s) => ({ ...s, rubric_templates: next }));
              }}
              placeholder="Technical %"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={r.documentation ?? 0}
              onChange={(e) => {
                const next = [...(settings?.rubric_templates || [])];
                next[idx] = { ...next[idx], documentation: Number(e.target.value) };
                setSettings((s) => ({ ...s, rubric_templates: next }));
              }}
              placeholder="Documentation %"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={r.presentation ?? 0}
              onChange={(e) => {
                const next = [...(settings?.rubric_templates || [])];
                next[idx] = { ...next[idx], presentation: Number(e.target.value) };
                setSettings((s) => ({ ...s, rubric_templates: next }));
              }}
              placeholder="Presentation %"
            />
          </div>
        ))}
      </div>
      <div className="ex-inline-actions">
        <button className="ex-btn secondary" onClick={() => {
          const next = [...(settings?.rubric_templates || []), { name: 'New Rubric', technical: 40, documentation: 30, presentation: 30 }];
          setSettings((s) => ({ ...s, rubric_templates: next }));
        }}>Add Rubric</button>
        <button className="ex-btn" onClick={async () => {
          await examinerAPI.updateSettings({ rubric_templates: settings?.rubric_templates || [] });
          showToast('Rubric templates saved.');
          loadAll();
        }}>Save Rubrics</button>
      </div>
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

  return (
    <div className="ex-layout">
      <aside className="ex-sidebar">
        <h2>Examiner Portal</h2>
        <nav>
          {NAV.map((item) => (
            <button key={item.id} className={`ex-nav ${active === item.id ? 'active' : ''}`} onClick={() => setActive(item.id)}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <button className="ex-nav logout" type="button" onClick={() => router.post('logout')}>🚪 Logout</button>
      </aside>
      <main className="ex-main">
        {loading && <div className="ex-card">Loading examiner dashboard...</div>}
        {!loading && error && <div className="ex-card error">{error}</div>}
        {!loading && !error && content[active]}
      </main>
      {toast && <div className={`ex-toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
};

export default ExaminerDashboard;
