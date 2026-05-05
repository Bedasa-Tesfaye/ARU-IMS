import React, { useEffect, useMemo, useState } from 'react';
import { aiAPI, studentAPI } from '../services/http';
import './student/StudentDashboard.css';

const NAV = [
  { id: 'overview', label: 'Dashboard', icon: '📊' },
  { id: 'browse', label: 'Browse Internships', icon: '🔍' },
  { id: 'ai-assistant', label: 'AI Career Assistant', icon: '🤖' },
  { id: 'applications', label: 'My Applications', icon: '📝' },
  { id: 'interviews', label: 'Interviews', icon: '📅' },
  { id: 'profile', label: 'My Profile', icon: '📋' },
  { id: 'messages', label: 'Messages/Chat', icon: '💬' },
  { id: 'documents', label: 'Documents', icon: '📄' },
  { id: 'progress', label: 'Progress Tracking', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

const StudentDashboard = () => {
  const [active, setActive] = useState('overview');
  const [data, setData] = useState(null);
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chat, setChat] = useState([{ role: 'ai', text: "Hi! I'm your ARU Career AI Assistant. Ask me about internships, resume improvement, interviews, and career planning." }]);
  const [interviews, setInterviews] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [progress, setProgress] = useState(null);
  const [settings, setSettings] = useState(null);
  const [smartReplyInput, setSmartReplyInput] = useState('');
  const [smartReply, setSmartReply] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState('resume');
  const [newDocContent, setNewDocContent] = useState('');
  const [newMessage, setNewMessage] = useState({ subject: '', body: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiError, setAiError] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    window.clearTimeout(window.__stToastTimer);
    window.__stToastTimer = window.setTimeout(() => setToast(null), 2600);
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const [overviewRes, internshipsRes, appsRes, interviewsRes, calendarRes, messagesRes, docsRes, progressRes, settingsRes] = await Promise.all([
        studentAPI.getOverview(),
        studentAPI.getInternships({}),
        studentAPI.getApplications({}),
        studentAPI.getInterviews(),
        studentAPI.getInterviewCalendar(),
        studentAPI.getMessages({}),
        studentAPI.getDocuments(),
        studentAPI.getProgress(),
        studentAPI.getSettings(),
      ]);
      setData(overviewRes.data);
      setInternships(internshipsRes.data?.data || internshipsRes.data || []);
      setApplications(appsRes.data?.data || appsRes.data || []);
      setInterviews(interviewsRes.data || []);
      setCalendarEvents(calendarRes.data || []);
      setMessages(messagesRes.data || []);
      setDocuments(docsRes.data || []);
      setProgress(progressRes.data || null);
      setSettings(settingsRes.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load student dashboard.');
      showToast('Unable to refresh dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(() => data?.stats || {
    total_applications: 0,
    active_applications: 0,
    ai_matched: 0,
    upcoming_interviews: 0,
    offers_received: 0,
  }, [data]);

  const sendChat = async () => {
    const message = chatInput.trim();
    if (!message) return;
    setChat((prev) => [...prev, { role: 'user', text: message }]);
    setChatInput('');
    try {
      const res = await aiAPI.careerChat({ message });
      setChat((prev) => [...prev, { role: 'ai', text: res.data?.reply || 'I can help with that.' }]);
    } catch (err) {
      setAiError('AI assistant is temporarily unavailable. You can continue using standard dashboard features.');
      setChat((prev) => [...prev, { role: 'ai', text: 'AI assistant is temporarily unavailable.' }]);
    }
  };

  const generateInterviewPrep = async (companyName) => {
    try {
      const res = await aiAPI.interviewPrep({ company: companyName });
      setChat((prev) => [...prev, { role: 'ai', text: `Interview Prep Plan:\n${(res.data?.plan || []).join('\n')}` }]);
      setActive('ai-assistant');
    } catch {
      setError('Unable to generate interview prep right now.');
      showToast('Interview prep failed.', 'error');
    }
  };

  const getSmartReply = async () => {
    if (!smartReplyInput.trim()) return;
    try {
      const res = await aiAPI.smartReply({ message: smartReplyInput });
      setSmartReply(res.data?.reply || '');
    } catch {
      setAiError('Smart reply service is currently unavailable.');
      setSmartReply('Unable to generate smart reply currently.');
      showToast('Smart reply unavailable.', 'error');
    }
  };

  const saveDocument = async () => {
    if (!newDocTitle.trim()) return;
    try {
      await studentAPI.saveDocument({
        type: newDocType,
        title: newDocTitle,
        content: newDocContent,
      });
      setNewDocTitle('');
      setNewDocContent('');
      const docsRes = await studentAPI.getDocuments();
      setDocuments(docsRes.data || []);
      showToast('Document saved.');
    } catch {
      setError('Failed to save document.');
      showToast('Failed to save document.', 'error');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.body.trim()) return;
    try {
      await studentAPI.sendMessage({
        thread_key: `thread-${Date.now()}`,
        subject: newMessage.subject,
        from_name: data?.student?.name || 'Student',
        body: newMessage.body,
        category: 'general',
        sentiment: 'neutral',
      });
      setNewMessage({ subject: '', body: '' });
      const res = await studentAPI.getMessages({});
      setMessages(res.data || []);
      showToast('Message sent.');
    } catch {
      setError('Failed to send message.');
      showToast('Failed to send message.', 'error');
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const payload = { [key]: value };
      const res = await studentAPI.updateSettings(payload);
      setSettings(res.data?.settings || settings);
      showToast('Settings updated.');
    } catch {
      setError('Failed to update settings.');
      showToast('Could not update settings.', 'error');
    }
  };

  const quickApply = async (internshipId) => {
    try {
      await studentAPI.applyInternship(internshipId, { cover_letter: 'Generated via quick apply.', resume_path: null });
      await loadDashboard();
      showToast('Application submitted.');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to apply.');
      showToast('Application failed.', 'error');
    }
  };

  const renderOverview = () => (
    <div className="st-grid">
      <section className="st-card st-hero">
        <h2>Welcome back, {data?.student?.name || 'Student'}!</h2>
        <p>{data?.insights?.[0] || 'AI is preparing recommendations for you.'}</p>
        <div className="st-subline">Student ID: {data?.student?.student_id || 'N/A'} | Department: {data?.student?.department_id || 'N/A'}</div>
      </section>

      <section className="st-stat-row">
        <div className="st-stat"><strong>{stats.total_applications}</strong><span>Total Applications</span></div>
        <div className="st-stat"><strong>{stats.active_applications}</strong><span>Active Applications</span></div>
        <div className="st-stat"><strong>{stats.ai_matched}</strong><span>AI-Matched Opportunities</span></div>
        <div className="st-stat"><strong>{stats.upcoming_interviews}</strong><span>Upcoming Interviews</span></div>
        <div className="st-stat"><strong>{stats.offers_received}</strong><span>Offers Received</span></div>
      </section>

      <section className="st-card">
        <h3>AI Career Insight</h3>
        <ul>{(data?.insights || []).map((item, idx) => <li key={idx}>{item}</li>)}</ul>
        <button className="st-btn" onClick={() => setActive('ai-assistant')}>Ask AI Assistant</button>
      </section>

      <section className="st-card">
        <h3>Assigned Staff</h3>
        <p>
          <strong>Examiner:</strong>{' '}
          {data?.assigned_staff?.examiner
            ? `${data.assigned_staff.examiner.first_name} ${data.assigned_staff.examiner.last_name}`
            : 'Pending Assignment'}
          {data?.assigned_staff?.examiner?.email && (
            <>
              {' · '}
              <a href={`mailto:${data.assigned_staff.examiner.email}`}>{data.assigned_staff.examiner.email}</a>
            </>
          )}
        </p>
        <p>
          <strong>Advisor:</strong>{' '}
          {data?.assigned_staff?.advisor
            ? `${data.assigned_staff.advisor.first_name} ${data.assigned_staff.advisor.last_name}`
            : 'Pending Assignment'}
          {data?.assigned_staff?.advisor_assignment_source === 'assigned' && (
            <span className="st-badge" title="Assigned to you">Assigned</span>
          )}
          {data?.assigned_staff?.advisor_assignment_source === 'department' && (
            <span className="st-badge secondary" title="Department advisor">Dept advisor</span>
          )}
        </p>
        {data?.assigned_staff?.advisor?.email && (
          <p className="st-subline">
            <a href={`mailto:${data.assigned_staff.advisor.email}`}>Email advisor</a>
            {' · '}
            Book advising via Messages tab — your advisor can see your department cohort.
          </p>
        )}
      </section>

      <section className="st-card">
        <h3>AI-Matched For You</h3>
        <div className="st-list">
          {(data?.matches || []).slice(0, 6).map((match) => (
            <div key={match.id} className="st-list-item">
              <div>
                <strong>{match.title}</strong>
                <small>{match.company} | {match.location}</small>
                <small>Match: {match.match_score}%</small>
              </div>
              <button className="st-btn" onClick={() => quickApply(match.id)}>Quick Apply</button>
            </div>
          ))}
        </div>
      </section>

      <section className="st-card">
        <h3>Upcoming Deadlines</h3>
        <ul>{(data?.deadlines || []).map((d) => <li key={d.application_id}>{d.title} - {d.deadline}</li>)}</ul>
      </section>
    </div>
  );

  const renderBrowse = () => (
    <div className="st-grid">
      <section className="st-card">
        <h3>Browse Internships (AI Enhanced)</h3>
        <p>Use smart filters and AI recommendations to find your best matches.</p>
      </section>
      <section className="st-card">
        <div className="st-list">
          {internships.slice(0, 20).map((job) => (
            <div key={job.id} className="st-list-item">
              <div>
                <strong>{job.title}</strong>
                <small>{job.company?.name || 'Company'} | {job.location || 'N/A'}</small>
                <small>Deadline: {job.end_date || 'N/A'}</small>
              </div>
              <div className="st-actions">
                <button className="st-btn" onClick={() => quickApply(job.id)}>Apply Now</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderAIAssistant = () => (
    <div className="st-grid">
      <section className="st-card">
        <h3>AI Career Assistant</h3>
        <div className="st-chat">
          {chat.map((m, i) => (
            <div key={i} className={`st-chat-bubble ${m.role}`}>{m.text}</div>
          ))}
        </div>
        <div className="st-chat-input">
          <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask AI anything about internships..." />
          <button className="st-btn" onClick={sendChat}>Send</button>
        </div>
        <div className="st-actions-inline">
          <button
            className="st-btn secondary"
            onClick={async () => {
              const message = 'Find internships matching my profile';
              setChat((prev) => [...prev, { role: 'user', text: message }]);
              const res = await aiAPI.careerChat({ message });
              setChat((prev) => [...prev, { role: 'ai', text: res.data?.reply || 'I can help with that.' }]);
            }}
          >
            Find matches
          </button>
          <button className="st-btn secondary" onClick={async () => {
            const res = await aiAPI.resumeAnalyze({});
            setChat((prev) => [...prev, { role: 'ai', text: `Resume score: ${res.data?.score} / ATS: ${res.data?.ats_score}` }]);
          }}>Analyze resume</button>
        </div>
      </section>
    </div>
  );

  const renderApplications = () => (
    <section className="st-card">
      <h3>My Applications</h3>
      <div className="st-list">
        {applications.map((app) => (
          <div key={app.id} className="st-list-item">
            <div>
              <strong>{app.internship?.title || 'Internship'}</strong>
              <small>{app.internship?.company?.name || 'Company'} | Status: {app.status}</small>
            </div>
            <button className="st-btn secondary" onClick={() => studentAPI.withdrawApplication(app.id).then(loadDashboard)}>Withdraw</button>
          </div>
        ))}
      </div>
    </section>
  );

  const renderSimple = (title, subtitle) => (
    <section className="st-card">
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </section>
  );

  const renderInterviews = () => (
    <div className="st-grid">
      <section className="st-card">
        <h3>AI-Assisted Interviews</h3>
        <div className="st-list">
          {interviews.length === 0 && <div className="st-empty">No interviews scheduled yet.</div>}
          {interviews.map((it) => (
            <div key={it.id} className="st-list-item">
              <div>
                <strong>{it.company_name} - {it.position_title}</strong>
                <small>{new Date(it.scheduled_at).toLocaleString()} | {it.format}</small>
              </div>
              <div className="st-actions">
                <button className="st-btn" onClick={() => generateInterviewPrep(it.company_name)}>Prepare with AI</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="st-card">
        <h3>Interview Calendar</h3>
        <div className="st-list">
          {calendarEvents.length === 0 && <div className="st-empty">No calendar events.</div>}
          {calendarEvents.map((e) => (
            <div key={e.id} className="st-list-item">
              <div>
                <strong>{e.title}</strong>
                <small>{e.date} at {e.time} ({e.format})</small>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderMessages = () => (
    <div className="st-grid">
      <section className="st-card">
        <h3>Smart Inbox</h3>
        <div className="st-list">
          {messages.length === 0 && <div className="st-empty">No messages yet.</div>}
          {messages.slice(0, 20).map((m) => (
            <div key={m.id} className="st-list-item">
              <div>
                <strong>{m.subject || 'Message'}</strong>
                <small>{m.from_name} | {m.category} | {m.sentiment}</small>
                <small>{m.body}</small>
              </div>
              <div className="st-actions">
                {!m.read_at && <button className="st-btn secondary" onClick={async () => {
                  await studentAPI.markMessageRead(m.id);
                  const res = await studentAPI.getMessages({});
                  setMessages(res.data || []);
                  showToast('Message marked as read.');
                }}>Mark read</button>}
                <button className="st-btn secondary" onClick={async () => {
                  const res = await studentAPI.getThreadSummary(m.thread_key);
                  setSmartReply(`Thread summary:\n${res.data?.summary || 'No summary.'}`);
                  showToast('Thread summary generated.');
                }}>Summarize</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="st-card">
        <h3>Compose & AI Smart Reply</h3>
        <input placeholder="Subject" value={newMessage.subject} onChange={(e) => setNewMessage((p) => ({ ...p, subject: e.target.value }))} />
        <textarea className="st-textarea" placeholder="Write your message..." value={newMessage.body} onChange={(e) => setNewMessage((p) => ({ ...p, body: e.target.value }))} />
        <button className="st-btn" onClick={sendMessage}>Send Message</button>
        <hr />
        <input placeholder="Paste incoming message for AI reply..." value={smartReplyInput} onChange={(e) => setSmartReplyInput(e.target.value)} />
        <button className="st-btn secondary" onClick={getSmartReply}>Generate Smart Reply</button>
        {smartReply && <div className="st-ai-preview">{smartReply}</div>}
      </section>
    </div>
  );

  const renderDocuments = () => (
    <div className="st-grid">
      <section className="st-card">
        <h3>AI Document Hub</h3>
        <div className="st-list">
          {documents.length === 0 && <div className="st-empty">No documents yet.</div>}
          {documents.map((d) => (
            <div key={d.id} className="st-list-item">
              <div>
                <strong>{d.title}</strong>
                <small>{d.type} | v{d.version}</small>
                <small>AI score: {d.ai_review?.score ?? 'N/A'}</small>
              </div>
              <button className="st-btn secondary" onClick={async () => {
                const res = await studentAPI.downloadDocument(d.id);
                const blob = new Blob([res.data], { type: 'text/plain;charset=utf-8' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${d.title.replace(/\s+/g, '_').toLowerCase()}.txt`;
                a.click();
                window.URL.revokeObjectURL(url);
                showToast('Document downloaded.');
              }}>Download</button>
            </div>
          ))}
        </div>
      </section>
      <section className="st-card">
        <h3>Create Document</h3>
        <select value={newDocType} onChange={(e) => setNewDocType(e.target.value)}>
          <option value="resume">Resume</option>
          <option value="cover_letter">Cover Letter</option>
          <option value="thank_you_note">Thank You Letter</option>
          <option value="follow_up">Follow-up Email</option>
        </select>
        <input placeholder="Document title" value={newDocTitle} onChange={(e) => setNewDocTitle(e.target.value)} />
        <textarea className="st-textarea" placeholder="Document content..." value={newDocContent} onChange={(e) => setNewDocContent(e.target.value)} />
        <button className="st-btn" onClick={saveDocument}>Save Document</button>
      </section>
    </div>
  );

  const renderProgress = () => (
    <section className="st-card">
      <h3>AI Progress Tracking</h3>
      <p>{progress?.prediction?.summary}</p>
      <div className="st-stat-row">
        <div className="st-stat"><strong>{progress?.funnel?.applications ?? 0}</strong><span>Applications</span></div>
        <div className="st-stat"><strong>{progress?.funnel?.shortlisted ?? 0}</strong><span>Shortlisted</span></div>
        <div className="st-stat"><strong>{progress?.funnel?.interviews ?? 0}</strong><span>Interviews</span></div>
        <div className="st-stat"><strong>{progress?.funnel?.offers ?? 0}</strong><span>Offers</span></div>
        <div className="st-stat"><strong>{progress?.prediction?.placement_probability ?? 0}%</strong><span>Placement Probability</span></div>
      </div>
      <h4>Achievements</h4>
      <ul>{(progress?.achievements || []).map((a) => <li key={a.id}>{a.title} - {a.description}</li>)}</ul>
      <h4>Application Funnel Chart</h4>
      <div className="st-chart">
        {(progress?.chart_series || []).map((bar) => {
          const max = Math.max(1, ...(progress?.chart_series || []).map((x) => x.value || 0));
          const width = Math.round(((bar.value || 0) / max) * 100);
          return (
            <div key={bar.label} className="st-chart-row">
              <span>{bar.label}</span>
              <div className="st-chart-bar"><i style={{ width: `${width}%` }} /></div>
              <strong>{bar.value}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );

  const renderSettings = () => (
    <section className="st-card">
      <h3>AI Settings & Preferences</h3>
      <label>AI Assistance Level</label>
      <select value={settings?.ai_assistance_level || 'balanced'} onChange={(e) => updateSetting('ai_assistance_level', e.target.value)}>
        <option value="minimal">Minimal</option>
        <option value="balanced">Balanced</option>
        <option value="maximum">Maximum</option>
      </select>
      <div className="st-toggle-row">
        <label><input type="checkbox" checked={!!settings?.smart_alerts} onChange={(e) => updateSetting('smart_alerts', e.target.checked)} /> Smart Alerts</label>
        <label><input type="checkbox" checked={!!settings?.deadline_predictions} onChange={(e) => updateSetting('deadline_predictions', e.target.checked)} /> Deadline Predictions</label>
        <label><input type="checkbox" checked={!!settings?.profile_nudges} onChange={(e) => updateSetting('profile_nudges', e.target.checked)} /> Profile Nudges</label>
      </div>
      <label>Theme</label>
      <select value={settings?.theme || 'system'} onChange={(e) => updateSetting('theme', e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
      <label>Font Scale</label>
      <input type="range" min="80" max="140" value={settings?.font_scale || 100} onChange={(e) => updateSetting('font_scale', Number(e.target.value))} />
    </section>
  );

  const content = {
    overview: renderOverview(),
    browse: renderBrowse(),
    'ai-assistant': renderAIAssistant(),
    applications: renderApplications(),
    interviews: renderInterviews(),
    profile: renderSimple('AI-Enhanced Profile', 'Profile optimizer, completeness scoring, and smart document extraction can be managed in this section.'),
    messages: renderMessages(),
    documents: renderDocuments(),
    progress: renderProgress(),
    settings: renderSettings(),
  };

  return (
    <div className="st-layout">
      <aside className="st-sidebar">
        <h2>Student Portal</h2>
        <nav>
          {NAV.map((item) => (
            <button key={item.id} className={`st-nav ${active === item.id ? 'active' : ''}`} onClick={() => setActive(item.id)}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <form method="post" action="/logout">
          <button className="st-nav logout" type="submit">🚪 Logout</button>
        </form>
      </aside>
      <main className="st-main">
        {loading && <div className="st-card">AI is thinking... loading your dashboard.</div>}
        {!loading && error && <div className="st-card error">{error}</div>}
        {!loading && aiError && (
          <div className="st-card st-ai-warning">
            <strong>AI Service Notice:</strong> {aiError}
            <button className="st-btn secondary" onClick={() => { setAiError(''); loadDashboard(); }}>Retry AI</button>
          </div>
        )}
        {!loading && !error && content[active]}
      </main>
      {toast && <div className={`st-toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
};

export default StudentDashboard;
