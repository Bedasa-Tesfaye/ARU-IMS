import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { aiCompanyAPI, authAPI, companyAPI, notificationAPI } from '../services/http';
import './company/CompanyDashboard.css';
import './company/components/CompanySidebar.css';
import './company/components/CompanyHeader.css';
import './company/components/CompanyCards.css';
import './company/components/CompanyStats.css';
import './company/components/CompanyForms.css';
import './company/components/CompanyTables.css';
import './company/components/CompanyKanban.css';
import './company/components/CompanyModal.css';
import './company/components/CompanyChat.css';

const NAV = [
  { id: 'overview', label: 'Dashboard', icon: '📊' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'requests', label: 'Requests', icon: '📥' },
  { id: 'post', label: 'Post Internship', icon: '📋' },
  { id: 'manage', label: 'Manage Internships', icon: '📝' },
  { id: 'applicants', label: 'Applicants', icon: '👨‍🎓' },
  { id: 'find', label: 'Find Candidates', icon: '🔍' },
  { id: 'interns', label: 'Current Interns', icon: '👥' },
  { id: 'intern-history', label: 'Intern History', icon: '🗂️' },
  { id: 'evaluations', label: 'Intern Evaluations', icon: '📊' },
  { id: 'messages', label: 'Messages/Chat', icon: '💬' },
  { id: 'schedule', label: 'Schedule', icon: '📅' },
  { id: 'analytics', label: 'Analytics & Reports', icon: '📈' },
  { id: 'profile', label: 'Company Profile', icon: '🏢' },
  { id: 'ai', label: 'AI Assistant', icon: '🤖' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

const PIPELINE_COLS = ['applied', 'screening', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'];
const SECTION_SUBTITLE = {
  overview: 'Live company operations summary',
  notifications: 'Alerts and updates from internship workflow',
  requests: 'Incoming student requests requiring decisions',
  post: 'Create and submit internship programs',
  manage: 'Manage posted internship programs',
  applicants: 'Screen and decide on applicants',
  find: 'Search students by relevance',
  interns: 'Manage active interns lifecycle',
  'intern-history': 'Completed and terminated placements',
  evaluations: 'Track intern performance reviews',
  messages: 'Communicate with students',
  schedule: 'Plan interviews and check-ins',
  analytics: 'Performance and recruitment insights',
  profile: 'Company profile information',
  ai: 'AI assistant for recruiting tasks',
  settings: 'Preferences and security settings',
};

function normalizePaginated(res) {
  const d = res?.data;
  if (Array.isArray(d)) return { data: d, meta: null };
  return { data: d?.data ?? [], meta: d ? { current_page: d.current_page, last_page: d.last_page, total: d.total } : null };
}

function AnimatedStat({ value, label }) {
  const target = Number(value) || 0;
  const [n, setN] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const from = fromRef.current;
    const dur = 600;
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
    <div className="co-stat">
      <strong>{n}</strong>
      <span>{label}</span>
    </div>
  );
}

function MustChangePasswordBanner({ auth, onGo }) {
  if (!auth?.must_change_password) return null;
  return (
    <div className="co-card" style={{ border: '1px solid #f59e0b', background: '#fffbeb' }}>
      <strong>You must change your password</strong>
      <div className="co-muted" style={{ marginTop: 6 }}>
        Your account is using a one-time password. Please update it now.
      </div>
      <div style={{ marginTop: 10 }}>
        <button type="button" className="co-btn co-btn-sm" onClick={onGo}>
          Change password
        </button>
      </div>
    </div>
  );
}

const CompanyDashboard = () => {
  const { props } = usePage();
  const auth = props?.auth || null;
  const [active, setActive] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [internships, setInternships] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [interns, setInterns] = useState([]);
  const [internHistory, setInternHistory] = useState([]);
  const [internSearch, setInternSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [internAction, setInternAction] = useState(null); // { type:'terminate'|'complete', row }
  const [internActionNote, setInternActionNote] = useState('');
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [profileDraft, setProfileDraft] = useState({ name: '', industry: '', description: '' });
  const [pwd, setPwd] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  const [postStep, setPostStep] = useState(1);
  const [postDraft, setPostDraft] = useState({
    title: '',
    program_field: 'technology',
    description: '',
    work_modality: 'hybrid',
    location: '',
    type: 'full-time',
    duration_weeks: 12,
    stipend: '',
    start_date: '',
    end_date: '',
    requirements: '',
    responsibilities: '',
    required_skills: '',
    sla_deadline_at: '',
    max_applicants: 20,
  });
  const [applicantView, setApplicantView] = useState('kanban');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [decisionModal, setDecisionModal] = useState(null); // { type: 'approve'|'reject', applicantId, reason }
  const [findQuery, setFindQuery] = useState('');
  const [findResults, setFindResults] = useState([]);
  const [evalDraft, setEvalDraft] = useState({
    student_id: '',
    application_ref: '',
    type: 'midterm',
    technical_skills: 80,
    communication_skills: 80,
    problem_solving: 80,
    teamwork: 80,
    time_management: 80,
    strengths: '',
    weaknesses: '',
    recommendations: '',
    evaluation_date: new Date().toISOString().slice(0, 10),
  });
  const [scheduleDraft, setScheduleDraft] = useState({ application_id: '', scheduled_at: '', notes: '' });
  const [msgDraft, setMsgDraft] = useState({ student_id: '', body: '' });
  const [aiChat, setAiChat] = useState([
    { role: 'ai', text: 'Company recruitment AI: job posts, screening, interviews, intern performance.' },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [busy, setBusy] = useState('');

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    window.clearTimeout(window.__coToast);
    window.__coToast = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const loadCore = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, intsRes, appsRes, internsRes, historyRes, msgRes, anaRes, profRes, setRes] = await Promise.allSettled([
        companyAPI.getDashboardStats(),
        companyAPI.getInternships({ per_page: 50 }),
        companyAPI.getApplicants({ per_page: 100 }),
        companyAPI.getInterns({ per_page: 50 }),
        companyAPI.getInternHistory({ per_page: 100 }),
        companyAPI.getMessages({}),
        companyAPI.getAnalytics(),
        companyAPI.getProfile(),
        companyAPI.getSettings(),
      ]);

      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value.data);
      if (intsRes.status === 'fulfilled') setInternships(normalizePaginated(intsRes.value).data);
      if (appsRes.status === 'fulfilled') {
        const appsData = normalizePaginated(appsRes.value);
        setApplicants(appsData.data);
      }
      if (internsRes.status === 'fulfilled') {
        setInterns(normalizePaginated(internsRes.value).data);
      } else {
        setInterns([]);
        showToast('Could not load current interns.', 'error');
      }
      if (historyRes.status === 'fulfilled') {
        setInternHistory(normalizePaginated(historyRes.value).data);
      } else {
        setInternHistory([]);
      }
      if (msgRes.status === 'fulfilled') setMessages(normalizePaginated(msgRes.value).data);
      if (anaRes.status === 'fulfilled') setAnalytics(anaRes.value.data);
      if (profRes.status === 'fulfilled') setProfile(profRes.value.data);
      if (setRes.status === 'fulfilled') setSettings(setRes.value.data);
    } catch (e) {
      showToast(e?.response?.data?.message || 'Failed to load company workspace.', 'error');
    } finally {
      setLoading(false);
    }

    // Load notifications separately so they don't break the whole dashboard if they fail.
    try {
      const notifRes = await notificationAPI.list({ per_page: 25 });
      setNotifications(normalizePaginated(notifRes).data);
    } catch (e) {
      console.warn('Failed to load notifications', e);
    }
  }, [showToast]);

  useEffect(() => {
    setProfileDraft({
      name: profile?.company?.name || '',
      industry: profile?.company?.industry || '',
      description: profile?.company?.description || '',
    });
  }, [profile]);

  const markNotificationRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      // refresh only notifications
      const notifRes = await notificationAPI.list({ per_page: 25 });
      setNotifications(normalizePaginated(notifRes).data);
    } catch {
      showToast('Could not mark notification as read.', 'error');
    }
  };

  useEffect(() => {
    loadCore();
  }, [loadCore]);

  const stats = dashboard?.stats || {};
  const funnel = dashboard?.recruitment_funnel || {};

  const unreadNotificationCount = useMemo(
    () => (notifications || []).filter((n) => !n.read_at).length,
    [notifications],
  );

  const applicantsByStage = useMemo(() => {
    const buckets = Object.fromEntries(PIPELINE_COLS.map((k) => [k, []]));
    (applicants || []).forEach((a) => {
      const st = a.pipeline_stage || 'applied';
      if (buckets[st]) buckets[st].push(a);
      else buckets.applied.push(a);
    });
    return buckets;
  }, [applicants]);

  const openApplicant = async (id) => {
    setBusy('app');
    try {
      const res = await companyAPI.getApplicant(id);
      setSelectedApplicant(res.data);
    } catch {
      showToast('Could not load applicant.', 'error');
    } finally {
      setBusy('');
    }
  };

  const performDecision = async ({ type, applicantId, reason }) => {
    const id = applicantId;
    try {
      if (type === 'approve') {
        await companyAPI.approveApplicant(id);
        showToast('Approved! Student moved to Current Interns.');
        setActive('interns');
      } else {
        await companyAPI.rejectApplicant(id, reason || '');
        showToast('Rejected.');
      }
      setDecisionModal(null);
      setSelectedApplicant(null);
      await loadCore();
    } catch (e) {
      showToast(e?.response?.data?.error || `Failed to ${type}.`, 'error');
    }
  };

  const moveApplicantStage = async (id, stage) => {
    try {
      await companyAPI.updateApplicantStatus(id, { pipeline_stage: stage });
      showToast('Stage updated.');
      loadCore();
    } catch {
      showToast('Update failed.', 'error');
    }
  };

  const sendAi = async () => {
    const message = aiInput.trim();
    if (!message) return;
    setAiChat((c) => [...c, { role: 'user', text: message }]);
    setAiInput('');
    try {
      const res = await aiCompanyAPI.chat({ message });
      setAiChat((c) => [...c, { role: 'ai', text: res.data?.reply || '—' }]);
    } catch {
      setAiChat((c) => [...c, { role: 'ai', text: 'AI unavailable.' }]);
    }
  };

  const submitPost = async () => {
    setBusy('post');
    try {
      await companyAPI.createInternship({
        ...postDraft,
        stipend: postDraft.stipend === '' ? null : Number(postDraft.stipend),
      });
      showToast('Draft internship saved. Submit for approval from Manage or click Submit for Approval.');
      setPostStep(1);
      loadCore();
    } catch (e) {
      showToast('Validation failed — check required fields.', 'error');
    } finally {
      setBusy('');
    }
  };

  const submitForApproval = async () => {
    setBusy('submit');
    try {
      const res = await companyAPI.createInternship({
        ...postDraft,
        stipend: postDraft.stipend === '' ? null : Number(postDraft.stipend),
      });
      const internshipId = res.data?.internship?.id;
      if (internshipId) {
        await companyAPI.submitInternshipForApproval(internshipId);
        showToast('Internship submitted for approval! 🚀 Super Admin will review it.');
        setPostStep(1);
        setPostDraft({
          title: '', program_field: 'technology', description: '', work_modality: 'hybrid',
          location: '', type: 'full-time', duration_weeks: 12, stipend: '',
          start_date: '', end_date: '', requirements: '', responsibilities: '',
          required_skills: '', sla_deadline_at: '', max_applicants: 20,
        });
        loadCore();
      } else {
        showToast('Failed to submit. Please try again.', 'error');
      }
    } catch (e) {
      showToast('Failed to submit internship. Check all required fields.', 'error');
    } finally {
      setBusy('');
    }
  };

  const runFindSearch = async () => {
    setBusy('find');
    try {
      const res = await companyAPI.searchStudents({ q: findQuery, per_page: 30 });
      setFindResults(normalizePaginated(res).data);
    } catch (e) {
      showToast(e?.response?.data?.error || 'Search failed.', 'error');
    } finally {
      setBusy('');
    }
  };

  const optimizePosting = async () => {
    try {
      const r = await aiCompanyAPI.optimizePosting({});
      showToast(r.data?.keywords?.join(', ') || 'Posting optimized!');
    } catch (e) {
      showToast(e?.response?.data?.error || 'AI optimizer failed.', 'error');
    }
  };

  const generateDescription = async () => {
    try {
      const r = await aiCompanyAPI.generateJobDescription({ role_type: postDraft.title });
      setPostDraft((d) => ({ ...d, description: r.data?.description || d.description }));
      showToast('AI description generated.');
    } catch (e) {
      showToast(e?.response?.data?.error || 'AI description generation failed.', 'error');
    }
  };

  const submitExistingInternshipForApproval = async (internshipId) => {
    try {
      await companyAPI.submitInternshipForApproval(internshipId);
      showToast('Submitted for approval! 🚀');
      await loadCore();
    } catch (e) {
      showToast(e?.response?.data?.error || 'Submit failed.', 'error');
    }
  };

  const deleteInternship = async (internshipId) => {
    if (!window.confirm('Delete this internship posting?')) return;
    try {
      await companyAPI.deleteInternship(internshipId);
      showToast('Internship deleted.');
      await loadCore();
    } catch (e) {
      showToast(e?.response?.data?.error || 'Delete failed.', 'error');
    }
  };

  const saveToTalentPool = async (studentId) => {
    try {
      await companyAPI.addTalentPool({ student_id: studentId });
      showToast('Saved to talent pool');
    } catch (e) {
      showToast(e?.response?.data?.error || 'Save failed.', 'error');
    }
  };

  const submitEvaluation = async () => {
    const sid = Number(evalDraft.student_id);
    if (!sid) return showToast('Enter a valid student user ID.', 'error');
    try {
      await companyAPI.evaluateIntern(sid, {
        type: evalDraft.type,
        technical_skills: evalDraft.technical_skills,
        communication_skills: evalDraft.communication_skills,
        problem_solving: evalDraft.problem_solving,
        teamwork: evalDraft.teamwork,
        time_management: evalDraft.time_management,
        strengths: evalDraft.strengths,
        weaknesses: evalDraft.weaknesses,
        recommendations: evalDraft.recommendations,
        evaluation_date: evalDraft.evaluation_date,
      });
      showToast('Evaluation saved');
    } catch (e) {
      showToast(e?.response?.data?.error || 'Evaluation failed.', 'error');
    }
  };

  const aiDraftEvaluation = async () => {
    try {
      const r = await aiCompanyAPI.generateEvaluation({});
      setEvalDraft((d) => ({ ...d, strengths: r.data?.draft || d.strengths }));
    } catch (e) {
      showToast(e?.response?.data?.error || 'AI draft failed.', 'error');
    }
  };

  const sendMessageToStudent = async () => {
    const sid = Number(msgDraft.student_id);
    if (!sid || !msgDraft.body.trim()) return showToast('Enter student ID and message.', 'error');
    try {
      await companyAPI.sendMessage({ student_id: sid, body: msgDraft.body });
      showToast('Sent');
      setMsgDraft((d) => ({ ...d, body: '' }));
      const res = await companyAPI.getMessages({});
      setMessages(normalizePaginated(res).data);
    } catch (e) {
      showToast(e?.response?.data?.error || 'Send failed.', 'error');
    }
  };

  const aiSuggestReply = async () => {
    try {
      const r = await aiCompanyAPI.suggestReply({});
      setMsgDraft((d) => ({ ...d, body: r.data?.suggested_reply || d.body }));
    } catch (e) {
      showToast(e?.response?.data?.error || 'AI suggestion failed.', 'error');
    }
  };

  const saveInterview = async () => {
    const applicationId = Number(scheduleDraft.application_id);
    if (!applicationId || !scheduleDraft.scheduled_at) return showToast('Application ID and date/time are required.', 'error');
    try {
      await companyAPI.createSchedule({
        application_id: applicationId,
        scheduled_at: scheduleDraft.scheduled_at,
        notes: scheduleDraft.notes,
      });
      showToast('Scheduled');
      setScheduleDraft((d) => ({ ...d, notes: '' }));
    } catch (e) {
      showToast(e?.response?.data?.error || 'Scheduling failed.', 'error');
    }
  };

  const queueRecruitmentReport = async () => {
    try {
      await companyAPI.generateReport({ type: 'recruitment' });
      showToast('Report queued');
    } catch (e) {
      showToast(e?.response?.data?.error || 'Report request failed.', 'error');
    }
  };

  const saveProfile = async () => {
    try {
      await companyAPI.updateProfile(profileDraft);
      showToast('Profile saved');
      await loadCore();
    } catch (e) {
      showToast(e?.response?.data?.error || 'Profile save failed.', 'error');
    }
  };

  const showMarketInsights = async () => {
    try {
      const r = await aiCompanyAPI.marketInsights();
      showToast(r.data?.stipend_benchmark?.slice(0, 80) || 'Market insights ready.');
    } catch (e) {
      showToast(e?.response?.data?.error || 'Could not fetch market insights.', 'error');
    }
  };

  const updateCompanySetting = async (key, value) => {
    try {
      const r = await companyAPI.updateSettings({ [key]: value });
      setSettings(r.data?.settings ?? settings);
      showToast('Settings saved');
    } catch (e) {
      showToast(e?.response?.data?.error || 'Settings update failed.', 'error');
    }
  };

  const runInternRiskMonitor = async () => {
    try {
      const r = await aiCompanyAPI.internPerformancePredict({});
      showToast(`Risk ${r.data?.risk_score ?? 'N/A'}`);
    } catch (e) {
      showToast(e?.response?.data?.error || 'AI monitor failed.', 'error');
    }
  };

  const renderOverview = () => (
    <div className="co-grid">
      <section className="co-card co-hero">
        <div className={`co-verify ${dashboard?.company?.is_verified ? '' : 'pending'}`}>
          {dashboard?.company?.is_verified ? '✓ Verified partner' : '⏳ Verification pending'}
        </div>
        <h2>{dashboard?.ai_greeting || 'Welcome back!'}</h2>
        <p className="co-muted">{dashboard?.company?.industry || 'Industry'} · ARU IMS partner workspace</p>
      </section>
      <div className="co-stat-row">
        <AnimatedStat value={stats.active_postings} label="Active postings" />
        <AnimatedStat value={stats.total_applicants_cycle} label="Applicants (cycle)" />
        <AnimatedStat value={stats.shortlisted} label="Shortlisted" />
        <AnimatedStat value={stats.current_interns} label="Current interns" />
        <AnimatedStat value={stats.interviews_scheduled} label="Interviews" />
        <AnimatedStat value={stats.positions_filled} label="Filled" />
        <AnimatedStat value={stats.avg_intern_rating} label="Avg rating" />
      </div>
      <section className="co-card"><h3>AI priority alerts</h3><ul className="co-alert-list">{(dashboard?.ai_priority_alerts || []).map((t, i) => (<li key={i}>{t}</li>))}</ul></section>
      <section className="co-card"><h3>Recruitment funnel</h3><div className="co-funnel">{['views','applications','shortlisted','interviewed','offered','accepted'].map((k) => (<div key={k} className="co-funnel-step"><span>{k}</span><strong>{funnel[k] ?? '—'}</strong></div>))}</div><p className="co-muted">{funnel.offer_acceptance_note}</p><p className="co-muted">{funnel.bottleneck_note}</p></section>
      <section className="co-card"><h3>Active internship performance</h3><div className="co-posting-cards">{(dashboard?.posting_cards || []).map((p) => (<div key={p.id} className="co-posting-card"><strong>{p.title}</strong><p className="co-muted">{p.days_active}d active · AI pool score {p.ai_quality_score}</p><div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}><button className="co-btn co-btn-sm" onClick={()=>setActive('applicants')}>Applicants</button><button className="co-btn ghost co-btn-sm" onClick={()=>setActive('manage')}>Edit</button></div></div>))}</div></section>
      <section className="co-card"><h3>Upcoming schedule</h3><ul>{(dashboard?.upcoming_schedule || []).map((s) => (<li key={s.id}>{s.title} · {s.scheduled_at ? new Date(s.scheduled_at).toLocaleString() : ''}<div className="co-muted">{s.ai_brief}</div></li>))}</ul><button className="co-btn ghost co-btn-sm" onClick={()=>showToast('Optimizer: cluster interviews Tue/Thu AM.')}>AI schedule optimizer</button></section>
      <section className="co-card"><h3>Recent activity</h3><ul>{(dashboard?.recent_activity || []).map((a,i)=>(<li key={i}>{a.summary} · {a.at ? new Date(a.at).toLocaleString() : ''}</li>))}</ul></section>
      <section className="co-card"><h3>AI recruitment insights</h3><ul>{(dashboard?.ai_recruitment_insights || []).map((t,i)=>(<li key={i}>{t}</li>))}</ul></section>
    </div>
  );

  const renderNotifications = () => (
    <div className="co-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0 }}>🔔 Notifications</h3>
        <button className="co-btn ghost co-btn-sm" type="button" onClick={() => loadCore()}>
          Refresh
        </button>
      </div>

      {(notifications || []).length === 0 ? (
        <div style={{ padding: 18 }} className="co-muted">
          No notifications yet. New student applications will appear here.
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          <div className="co-muted" style={{ marginBottom: 10 }}>
            Unread: {unreadNotificationCount}
          </div>
          <ul className="co-alert-list">
            {(notifications || []).map((n) => (
              <li
                key={n.id}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: n.read_at ? 0.75 : 1,
                }}
              >
                <span>
                  <strong>{n.title}</strong>
                  <div className="co-muted">{n.message}</div>
                </span>
                <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {n?.type === 'internship_application' && n?.meta?.application_id && (
                    <>
                      <button
                        className="co-btn ghost co-btn-sm"
                        type="button"
                        onClick={() => {
                          setActive('requests');
                          openApplicant(n.meta.application_id);
                        }}
                      >
                        Open request
                      </button>
                      <button
                        className="co-btn co-btn-sm"
                        type="button"
                        style={{ background: '#10b981', color: 'white', border: 'none' }}
                        onClick={() => setDecisionModal({ type: 'approve', applicantId: n.meta.application_id })}
                      >
                        Approve
                      </button>
                      <button
                        className="co-btn ghost co-btn-sm"
                        type="button"
                        style={{ color: '#ef4444' }}
                        onClick={() => setDecisionModal({ type: 'reject', applicantId: n.meta.application_id, reason: '' })}
                      >
                        Reject
                      </button>
                    </>
                  )}
                {!n.read_at && (
                  <button className="co-btn ghost co-btn-sm" type="button" onClick={() => markNotificationRead(n.id)}>
                    Mark read
                  </button>
                )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const pendingRequests = useMemo(
    () => (applicants || []).filter((a) => String(a.status || '').toLowerCase() === 'pending'),
    [applicants],
  );

  const requestNotifs = useMemo(
    () => (notifications || []).filter((n) => n?.type === 'internship_application' && n?.meta?.application_id),
    [notifications],
  );

  const renderRequests = () => (
    <div className="co-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0 }}>📥 Internship Requests</h3>
          <div className="co-muted" style={{ marginTop: 6 }}>
            Student applications waiting for your decision.
          </div>
        </div>
        <button className="co-btn ghost co-btn-sm" type="button" onClick={() => loadCore()}>
          Refresh
        </button>
      </div>

      {pendingRequests.length === 0 ? (
        <div style={{ padding: 18 }} className="co-muted">
          No pending requests right now.
          {requestNotifs.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div className="co-muted" style={{ marginBottom: 8 }}>
                You have {requestNotifs.length} application notification(s). Click one below to open it.
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {requestNotifs.slice(0, 6).map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className="co-btn ghost co-btn-sm"
                    onClick={() => openApplicant(n.meta.application_id)}
                  >
                    Open request #{n.meta.application_id}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="co-table-wrap" style={{ marginTop: 12 }}>
          <table className="co-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Internship</th>
                <th>Applied</th>
                <th>Stage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>
                      {a.first_name || 'Student'} {a.last_name || ''}
                    </strong>
                    <div className="co-muted" style={{ fontSize: '0.8rem' }}>
                      {a.department || ''}
                    </div>
                  </td>
                  <td>{a.internship_title || '—'}</td>
                  <td>{a.applied_date || '—'}</td>
                  <td>{a.pipeline_stage || 'applied'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button className="co-btn ghost co-btn-sm" type="button" onClick={() => openApplicant(a.id)}>
                        Open
                      </button>
                      <button
                        className="co-btn co-btn-sm"
                        type="button"
                        style={{ background: '#10b981', color: 'white', border: 'none' }}
                        onClick={() => setDecisionModal({ type: 'approve', applicantId: a.id })}
                      >
                        Approve
                      </button>
                      <button
                        className="co-btn ghost co-btn-sm"
                        type="button"
                        style={{ color: '#ef4444' }}
                        onClick={() => setDecisionModal({ type: 'reject', applicantId: a.id, reason: '' })}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderPost = () => (
    <div className="co-card">
      <h3>📋 Post Internship (AI-Assisted)</h3>
      <p className="co-muted">Fill in the details and submit for Super Admin approval.</p>
      <div className="co-steps">{[1,2,3,4,5,6].map((s)=>(<button key={s} className={`co-step-pill ${postStep===s?'on':''}`} onClick={()=>setPostStep(s)}>Step {s}</button>))}</div>
      {postStep===1&&(<div className="co-form-grid"><label>Title<input value={postDraft.title} onChange={(e)=>setPostDraft((d)=>({...d,title:e.target.value}))} placeholder="e.g. Software Developer Intern"/></label><label>Department/team focus<select value={postDraft.program_field} onChange={(e)=>setPostDraft((d)=>({...d,program_field:e.target.value}))}><option value="technology">Technology</option><option value="marketing">Marketing</option><option value="finance">Finance</option><option value="business">Business</option><option value="health">Health</option><option value="law">Law</option><option value="agriculture">Agriculture</option><option value="economics">Economics</option></select></label><label>Work modality<select value={postDraft.work_modality} onChange={(e)=>setPostDraft((d)=>({...d,work_modality:e.target.value}))}><option value="on-site">On-site</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option></select></label><label>Location<input value={postDraft.location} onChange={(e)=>setPostDraft((d)=>({...d,location:e.target.value}))} placeholder="e.g. Addis Ababa"/></label><label>Type<select value={postDraft.type} onChange={(e)=>setPostDraft((d)=>({...d,type:e.target.value}))}><option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option></select></label><label>Duration (weeks)<input type="number" value={postDraft.duration_weeks} onChange={(e)=>setPostDraft((d)=>({...d,duration_weeks:Number(e.target.value)}))}/></label><label>Start date<input type="date" value={postDraft.start_date} onChange={(e)=>setPostDraft((d)=>({...d,start_date:e.target.value}))}/></label><label>End date<input type="date" value={postDraft.end_date} onChange={(e)=>setPostDraft((d)=>({...d,end_date:e.target.value}))}/></label><label>Application deadline<input type="datetime-local" value={postDraft.sla_deadline_at} onChange={(e)=>setPostDraft((d)=>({...d,sla_deadline_at:e.target.value}))}/></label><label>Max applicants<input type="number" value={postDraft.max_applicants} onChange={(e)=>setPostDraft((d)=>({...d,max_applicants:Number(e.target.value)}))}/></label></div>)}
      {postStep===2&&(<label>Description<textarea rows={8} value={postDraft.description} onChange={(e)=>setPostDraft((d)=>({...d,description:e.target.value}))} placeholder="Describe the role, responsibilities, and what the intern will learn..."/></label>)}
      {postStep===3&&(<div className="co-form-grid"><label>Requirements<textarea value={postDraft.requirements} onChange={(e)=>setPostDraft((d)=>({...d,requirements:e.target.value}))} placeholder="e.g. Currently enrolled in CS program, CGPA 3.0+"/></label><label>Responsibilities<textarea value={postDraft.responsibilities} onChange={(e)=>setPostDraft((d)=>({...d,responsibilities:e.target.value}))}/></label><label>Required skills (comma separated)<input value={postDraft.required_skills} onChange={(e)=>setPostDraft((d)=>({...d,required_skills:e.target.value}))} placeholder="e.g. React, Node.js, MongoDB"/></label></div>)}
      {postStep===4&&(<div className="co-form-grid"><label>Stipend (optional)<input value={postDraft.stipend} onChange={(e)=>setPostDraft((d)=>({...d,stipend:e.target.value}))} placeholder="e.g. 8000"/></label></div>)}
      {postStep===5&&(<div><p className="co-muted">📊 Evaluation Criteria (Default IMS Rubric):</p><ul className="co-muted"><li>Technical Skills - 30%</li><li>Communication - 20%</li><li>Deliverables - 25%</li><li>Attendance & Punctuality - 15%</li><li>Teamwork - 10%</li></ul></div>)}
      {postStep===6&&(<div><p className="co-muted">🤖 AI Final Review: Check completeness, inclusivity, and predicted applicant volume.</p><button className="co-btn secondary co-btn-sm" onClick={optimizePosting}>🔍 Run AI Optimizer</button></div>)}
      <div style={{marginTop:20,display:'flex',gap:10,flexWrap:'wrap',alignItems:'center',paddingTop:16,borderTop:'1px solid #e5e7eb'}}>
        <button className="co-btn secondary co-btn-sm" onClick={()=>setPostStep((s)=>Math.max(1,s-1))}>← Back</button>
        <button className="co-btn secondary co-btn-sm" onClick={()=>setPostStep((s)=>Math.min(6,s+1))}>Next →</button>
        <div style={{flex:1}}/>
        <button className="co-btn secondary co-btn-sm" disabled={busy==='post'} onClick={submitPost}>💾 Save Draft</button>
        <button disabled={busy==='submit'} onClick={submitForApproval} style={{background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',fontWeight:700,padding:'10px 24px',borderRadius:'10px',cursor:busy==='submit'?'wait':'pointer',fontSize:'0.9rem',boxShadow:'0 4px 15px rgba(102,126,234,0.3)',transition:'all 0.3s ease'}}>{busy==='submit'?'⏳ Submitting...':'🚀 Submit for Approval'}</button>
        <button className="co-btn ghost co-btn-sm" onClick={generateDescription}>🤖 AI Generate Description</button>
      </div>
    </div>
  );

  const renderManage = () => (
    <div className="co-card">
      <h3>📝 Manage Internships</h3>
      <p className="co-muted">View and manage all your internship postings. Submit drafts for Super Admin approval.</p>
      <div className="co-table-wrap">
        <table className="co-table">
          <thead><tr><th>Title</th><th>Status</th><th>Submission</th><th>Applicants</th><th>Actions</th></tr></thead>
          <tbody>
            {internships.length === 0 ? (
              <tr><td colSpan={5} style={{textAlign:'center',padding:30,color:'#94a3b8'}}>No internships yet. Go to "Post Internship" to create one.</td></tr>
            ) : (
              internships.map((row) => (
                <tr key={row.id}>
                  <td><strong>{row.title}</strong></td>
                  <td><span className={`co-badge ${row.status==='active'?'active':'draft'}`}>{row.status}</span></td>
                  <td><span className={`co-badge ${row.submission_status==='approved'?'active':row.submission_status==='pending_review'?'pending':'draft'}`}>{row.submission_status}</span></td>
                  <td>{row.current_applicants || 0}</td>
                  <td>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      {row.submission_status !== 'approved' && (
                        <button className="co-btn co-btn-sm" style={{background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none'}} onClick={()=>submitExistingInternshipForApproval(row.id)}>Submit</button>
                      )}
                      <button className="co-btn ghost co-btn-sm" onClick={()=>deleteInternship(row.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderApplicants = () => (
    <div>
      <div className="co-card" style={{marginBottom:16}}>
        <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
          <h3>👨‍🎓 Applicants (ATS) ({applicants.length} total)</h3>
          <div>
            <button className={applicantView==='kanban'?'co-btn co-btn-sm':'co-btn ghost co-btn-sm'} onClick={()=>setApplicantView('kanban')}>Kanban</button>
            <button className={applicantView==='list'?'co-btn co-btn-sm':'co-btn ghost co-btn-sm'} onClick={()=>setApplicantView('list')}>List</button>
          </div>
        </div>
      </div>

      {applicants.length === 0 && !loading ? (
        <div className="co-card" style={{textAlign:'center',padding:40}}>
          <p className="co-muted">No applicants yet. Students will appear here after they apply to your internships.</p>
        </div>
      ) : applicantView === 'kanban' ? (
        <div className="co-kanban">
          {PIPELINE_COLS.map((col) => (
            <div key={col} className="co-kanban-col">
              <h4>{col} ({(applicantsByStage[col] || []).length})</h4>
              {(applicantsByStage[col] || []).map((a) => (
                <div key={a.id} className="co-kanban-card">
                  <strong>{a.first_name || 'Student'} {a.last_name || ''}</strong>
                  <div className="co-muted">{a.internship_title || 'N/A'}</div>
                  <div className="co-muted" style={{fontSize:'0.7rem'}}>Status: {a.status}</div>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginTop:6}}>
                    <div className="co-gauge" style={{'--pct':`${a.ai_match_score || 50}%`}}><span>{a.ai_match_score || '—'}</span></div>
                    <select value={PIPELINE_COLS.includes(a.pipeline_stage)?a.pipeline_stage:'applied'} onChange={(e)=>moveApplicantStage(a.id,e.target.value)}>
                      {PIPELINE_COLS.map((s)=>(<option key={s} value={s}>{s}</option>))}
                    </select>
                  </div>
                  <div style={{display:'flex',gap:4,marginTop:8,flexWrap:'wrap'}}>
                    <button className="co-btn ghost co-btn-sm" onClick={()=>openApplicant(a.id)}>Details</button>
                    {a.status !== 'approved' && (
                      <button className="co-btn co-btn-sm" style={{background:'#10b981',color:'white',border:'none',fontSize:'0.7rem',padding:'4px 8px'}}
                        onClick={()=>setDecisionModal({ type: 'approve', applicantId: a.id })}>
                        ✅ Approve
                      </button>
                    )}
                    {a.status !== 'rejected' && (
                      <button className="co-btn ghost co-btn-sm" style={{color:'#ef4444',fontSize:'0.7rem',padding:'4px 8px'}}
                        onClick={()=>setDecisionModal({ type: 'reject', applicantId: a.id, reason: '' })}>
                        ❌ Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="co-card co-table-wrap">
          <table className="co-table">
            <thead><tr><th>Candidate</th><th>Role</th><th>Stage</th><th>Status</th><th>AI</th><th>Actions</th></tr></thead>
            <tbody>
              {applicants.map((a) => (
                <tr key={a.id}>
                  <td>{a.first_name} {a.last_name}</td>
                  <td>{a.internship_title}</td>
                  <td>{a.pipeline_stage}</td>
                  <td><span className={`co-badge ${a.status==='approved'?'active':a.status==='rejected'?'danger':'draft'}`}>{a.status}</span></td>
                  <td>{a.ai_match_score}</td>
                  <td>
                    <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                      <button className="co-btn ghost co-btn-sm" onClick={()=>openApplicant(a.id)}>Open</button>
                      {a.status!=='approved'&&<button className="co-btn co-btn-sm" style={{background:'#10b981',color:'white',border:'none'}} onClick={()=>setDecisionModal({ type: 'approve', applicantId: a.id })}>✅</button>}
                      {a.status!=='rejected'&&<button className="co-btn ghost co-btn-sm" style={{color:'#ef4444'}} onClick={()=>setDecisionModal({ type: 'reject', applicantId: a.id, reason: '' })}>❌</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );

  const renderFind = () => (
    <div className="co-grid">
      <div className="co-card"><h3>🔍 Find Candidates</h3><input placeholder="Search skills, names, interests..." value={findQuery} onChange={(e)=>setFindQuery(e.target.value)} style={{width:'100%',maxWidth:420,padding:10,borderRadius:10,border:'1px solid #e5e7eb'}}/><div style={{marginTop:12}}><button className="co-btn co-btn-sm" disabled={busy==='find'} onClick={runFindSearch}>AI smart search</button></div></div>
      <div className="co-card"><h4>Results</h4><ul>{findResults.map((s)=>(<li key={s.id}>{s.name} · {s.department} · match {s.ai_match}<button className="co-btn ghost co-btn-sm" onClick={()=>saveToTalentPool(s.id)}>Save</button></li>))}</ul></div>
    </div>
  );

  const renderInterns = () => (
    <div className="co-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0 }}>👥 Current Interns</h3>
          <div className="co-muted" style={{ marginTop: 6 }}>
            Manage active interns: message, schedule, evaluate, or remove from the program.
          </div>
        </div>
        <button className="co-btn ghost co-btn-sm" type="button" onClick={() => loadCore()}>
          Refresh
        </button>
      </div>

      <div className="co-form-grid" style={{ marginTop: 12 }}>
        <label>
          Search intern
          <input
            value={internSearch}
            onChange={(e) => setInternSearch(e.target.value)}
            placeholder="Search by name or program…"
          />
        </label>
      </div>

      <div className="co-table-wrap" style={{ marginTop: 12 }}>
        <table className="co-table">
          <thead>
            <tr>
              <th>Intern</th>
              <th>Program</th>
              <th>Dates</th>
              <th>Status</th>
              <th style={{ width: 420 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(interns || [])
              .filter((row) => {
                const name = `${row.student?.first_name || ''} ${row.student?.last_name || ''}`.toLowerCase();
                const program = String(row.internship_title || '').toLowerCase();
                const q = String(internSearch || '').trim().toLowerCase();
                if (!q) return true;
                return name.includes(q) || program.includes(q);
              })
              .map((row) => (
                <tr key={row.application_id}>
                  <td>
                    <strong>
                      {row.student?.first_name} {row.student?.last_name}
                    </strong>
                    <div className="co-muted" style={{ fontSize: '0.8rem' }}>
                      {row.student?.department?.name || ''}
                    </div>
                  </td>
                  <td>{row.internship_title}</td>
                  <td className="co-muted" style={{ fontSize: '0.85rem' }}>
                    {row.start_date || '—'} → {row.end_date || '—'}
                  </td>
                  <td>
                    <span className={`co-badge ${row.status_label === 'active' ? 'active' : 'draft'}`}>{row.status_label}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        className="co-btn ghost co-btn-sm"
                        type="button"
                        onClick={() => {
                          setMsgDraft((d) => ({ ...d, student_id: String(row.student?.id || ''), body: d.body || '' }));
                          setActive('messages');
                        }}
                      >
                        Message
                      </button>
                      <button
                        className="co-btn ghost co-btn-sm"
                        type="button"
                        onClick={() => {
                          const dt = new Date(Date.now() + 24 * 60 * 60 * 1000);
                          const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                          setScheduleDraft((d) => ({
                            ...d,
                            application_id: String(row.application_id),
                            scheduled_at: d.scheduled_at || local,
                            notes: d.notes || `Interview / check-in with ${row.student?.first_name || 'intern'}`,
                          }));
                          setActive('schedule');
                        }}
                      >
                        Request interview
                      </button>
                      <button
                        className="co-btn ghost co-btn-sm"
                        type="button"
                        onClick={() => {
                          setEvalDraft((d) => ({
                            ...d,
                            student_id: String(row.student?.id || ''),
                            application_ref: String(row.application_id),
                          }));
                          setActive('evaluations');
                        }}
                      >
                        Evaluate
                      </button>
                      <button
                        className="co-btn ghost co-btn-sm"
                        type="button"
                        onClick={runInternRiskMonitor}
                      >
                        AI monitor
                      </button>
                      <button
                        className="co-btn ghost co-btn-sm"
                        type="button"
                        onClick={() => {
                          setInternActionNote('');
                          setInternAction({ type: 'complete', row });
                        }}
                      >
                        Complete
                      </button>
                      <button
                        className="co-btn ghost co-btn-sm"
                        type="button"
                        style={{ color: '#ef4444' }}
                        onClick={() => {
                          setInternActionNote('');
                          setInternAction({ type: 'terminate', row });
                        }}
                      >
                        Terminate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {(!interns || interns.length === 0) && (
          <div className="co-muted" style={{ padding: 18 }}>
            No interns yet. Approve a student request to assign them as an intern.
          </div>
        )}
      </div>
    </div>
  );

  const renderInternHistory = () => (
    <div className="co-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0 }}>🗂️ Intern History</h3>
          <div className="co-muted" style={{ marginTop: 6 }}>
            Completed and terminated placements for reporting and follow-up.
          </div>
        </div>
        <button className="co-btn ghost co-btn-sm" type="button" onClick={() => loadCore()}>
          Refresh
        </button>
      </div>

      <div className="co-form-grid" style={{ marginTop: 12 }}>
        <label>
          Search history
          <input
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            placeholder="Search by student, program, or reason…"
          />
        </label>
        <label>
          Status
          <select value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="terminated">Terminated</option>
          </select>
        </label>
      </div>

      <div className="co-table-wrap" style={{ marginTop: 12 }}>
        <table className="co-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Program</th>
              <th>Status</th>
              <th>Started</th>
              <th>Ended</th>
              <th>Note / Reason</th>
            </tr>
          </thead>
          <tbody>
            {(internHistory || [])
              .filter((row) => {
                const q = String(historySearch || '').trim().toLowerCase();
                const status = String(row.intern_status || '').toLowerCase();
                if (historyFilter !== 'all' && status !== historyFilter) return false;
                if (!q) return true;
                const text = [
                  row.student?.first_name,
                  row.student?.last_name,
                  row.internship_title,
                  row.intern_end_reason,
                ]
                  .filter(Boolean)
                  .join(' ')
                  .toLowerCase();
                return text.includes(q);
              })
              .map((row) => (
                <tr key={row.application_id}>
                  <td>
                    <strong>
                      {row.student?.first_name} {row.student?.last_name}
                    </strong>
                    <div className="co-muted" style={{ fontSize: '0.8rem' }}>
                      {row.student?.department?.name || ''}
                    </div>
                  </td>
                  <td>{row.internship_title || '—'}</td>
                  <td>
                    <span className={`co-badge ${row.intern_status === 'completed' ? 'active' : 'danger'}`}>
                      {row.intern_status || '—'}
                    </span>
                  </td>
                  <td>{row.intern_started_at ? new Date(row.intern_started_at).toLocaleDateString() : (row.start_date || '—')}</td>
                  <td>{row.intern_ended_at ? new Date(row.intern_ended_at).toLocaleDateString() : (row.end_date || '—')}</td>
                  <td className="co-muted">{row.intern_end_reason || '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {(!internHistory || internHistory.length === 0) && (
          <div className="co-muted" style={{ padding: 18 }}>
            No intern history records yet.
          </div>
        )}
      </div>
    </div>
  );

  const renderEvaluations = () => (
    <div className="co-card">
      <h3>📊 Intern Evaluations</h3>
      <div className="co-form-grid"><label>Student user ID<input value={evalDraft.student_id} onChange={(e)=>setEvalDraft((d)=>({...d,student_id:e.target.value}))}/></label><label>Type<select value={evalDraft.type} onChange={(e)=>setEvalDraft((d)=>({...d,type:e.target.value}))}><option value="midterm">Mid-term</option><option value="final">Final</option></select></label></div>
      <p className="co-muted">Ratings 0–100 per criterion.</p>
      <div className="co-form-grid">{['technical_skills','communication_skills','problem_solving','teamwork','time_management'].map((k)=>(<label key={k}>{k.replace(/_/g,' ')}<input type="number" value={evalDraft[k]} onChange={(e)=>setEvalDraft((d)=>({...d,[k]:Number(e.target.value)}))}/></label>))}</div>
      <label>Narrative strengths<textarea value={evalDraft.strengths} onChange={(e)=>setEvalDraft((d)=>({...d,strengths:e.target.value}))}/></label>
      <div style={{marginTop:12,display:'flex',gap:8}}>
        <button className="co-btn co-btn-sm" onClick={submitEvaluation}>Submit evaluation</button>
        <button className="co-btn ghost co-btn-sm" onClick={aiDraftEvaluation}>AI draft</button>
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="co-card">
      <h3>💬 Messages</h3>
      <div className="co-form-grid"><label>Student user ID<input value={msgDraft.student_id} onChange={(e)=>setMsgDraft((d)=>({...d,student_id:e.target.value}))}/></label></div>
      <textarea rows={4} value={msgDraft.body} onChange={(e)=>setMsgDraft((d)=>({...d,body:e.target.value}))} placeholder="Type your message..."/>
      <div style={{marginTop:8,display:'flex',gap:8}}><button className="co-btn co-btn-sm" onClick={sendMessageToStudent}>Send</button><button className="co-btn ghost co-btn-sm" onClick={aiSuggestReply}>AI suggest reply</button></div>
      <h4>Inbox</h4><ul>{messages.slice(0,20).map((m)=>(<li key={m.id}>{m.subject}: {m.body?.slice(0,80)}</li>))}</ul>
    </div>
  );

  const renderSchedule = () => (
    <div className="co-card">
      <h3>📅 Schedule</h3>
      <div className="co-form-grid"><label>Application ID<input value={scheduleDraft.application_id} onChange={(e)=>setScheduleDraft((d)=>({...d,application_id:e.target.value}))}/></label><label>When<input type="datetime-local" value={scheduleDraft.scheduled_at} onChange={(e)=>setScheduleDraft((d)=>({...d,scheduled_at:e.target.value}))}/></label></div>
      <textarea placeholder="Notes" value={scheduleDraft.notes} onChange={(e)=>setScheduleDraft((d)=>({...d,notes:e.target.value}))}/>
      <button className="co-btn co-btn-sm" style={{marginTop:10}} onClick={saveInterview}>Save interview</button>
    </div>
  );

  const renderAnalytics = () => (
    <div className="co-grid"><div className="co-card"><h3>📈 Analytics</h3><pre style={{background:'#f9fafb',padding:12,borderRadius:8}}>{JSON.stringify(analytics,null,2)}</pre><button className="co-btn co-btn-sm" onClick={queueRecruitmentReport}>Generate report</button></div></div>
  );

  const renderProfile = () => (
    <div className="co-card">
      <h3>🏢 Company Profile</h3>
      <p className="co-muted">Completeness: {profile?.profile_completeness??'—'}%</p>
      <div className="co-form-grid"><label>Name<input value={profileDraft.name} onChange={(e)=>setProfileDraft((d)=>({ ...d, name: e.target.value }))}/></label><label>Industry<input value={profileDraft.industry} onChange={(e)=>setProfileDraft((d)=>({ ...d, industry: e.target.value }))}/></label></div>
      <label>Description<textarea value={profileDraft.description} onChange={(e)=>setProfileDraft((d)=>({ ...d, description: e.target.value }))} rows={5}/></label>
      <button className="co-btn co-btn-sm" onClick={saveProfile}>Save profile</button>
    </div>
  );

  const renderAI = () => (
    <div className="co-card">
      <h3>🤖 AI Recruitment Co-Pilot</h3>
      <div className="co-chat">{aiChat.map((m,i)=>(<div key={i} className={`co-chat-bubble ${m.role==='user'?'user':'ai'}`}>{m.text}</div>))}</div>
      <div className="co-chat-input"><input value={aiInput} onChange={(e)=>setAiInput(e.target.value)} placeholder="Ask about hiring, interviews, retention..." onKeyDown={(e)=>e.key==='Enter'&&sendAi()}/><button className="co-btn co-btn-sm" onClick={sendAi}>Send</button></div>
      <button className="co-btn ghost co-btn-sm" onClick={showMarketInsights}>Market insights</button>
    </div>
  );

  const renderSettings = () => (
    <div className="co-card">
      <h3>⚙️ Settings</h3>
      <div className="co-form-grid">
        <label>AI level<select value={settings?.ai_assistance_level||'balanced'} onChange={(e)=>updateCompanySetting('ai_assistance_level', e.target.value)}><option value="minimal">Minimal</option><option value="balanced">Balanced</option><option value="maximum">Maximum</option></select></label>
        <label>AI communication style<select value={settings?.ai_communication_style||'balanced'} onChange={(e)=>updateCompanySetting('ai_communication_style', e.target.value)}><option value="formal">Formal</option><option value="balanced">Balanced</option><option value="friendly">Friendly</option></select></label>
      </div>
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #e5e7eb' }}>
        <h4 style={{ margin: 0 }}>Change password</h4>
        <div className="co-form-grid" style={{ marginTop: 10 }}>
          <label>Current password<input type="password" value={pwd.current_password} onChange={(e)=>setPwd((p)=>({ ...p, current_password: e.target.value }))} /></label>
          <label>New password<input type="password" value={pwd.new_password} onChange={(e)=>setPwd((p)=>({ ...p, new_password: e.target.value }))} /></label>
          <label>Confirm new password<input type="password" value={pwd.new_password_confirmation} onChange={(e)=>setPwd((p)=>({ ...p, new_password_confirmation: e.target.value }))} /></label>
        </div>
        <button
          className="co-btn co-btn-sm"
          onClick={async () => {
            try {
              await authAPI.changePassword(pwd);
              showToast('Password updated.');
              setPwd({ current_password: '', new_password: '', new_password_confirmation: '' });
            } catch (e) {
              showToast(e?.response?.data?.message || 'Password update failed.', 'error');
            }
          }}
        >
          Update password
        </button>
      </div>
    </div>
  );

  const content = {
    overview: renderOverview(), notifications: renderNotifications(), post: renderPost(), manage: renderManage(),
    requests: renderRequests(),
    applicants: renderApplicants(), find: renderFind(), interns: renderInterns(),
    'intern-history': renderInternHistory(),
    evaluations: renderEvaluations(), messages: renderMessages(), schedule: renderSchedule(),
    analytics: renderAnalytics(), profile: renderProfile(), ai: renderAI(), settings: renderSettings(),
  };

  return (
    <div className="co-layout">
      <aside className={`co-sidebar ${sidebarOpen?'open':''}`}>
        <div className="co-brand"><h2>ARU IMS</h2><p className="co-brand-sub">Company portal</p></div>
        <nav className="co-nav-wrap">
          {NAV.map((n)=>(
            <button key={n.id} className={`co-nav ${active===n.id?'active':''}`} onClick={()=>{setActive(n.id);setSidebarOpen(false);}}>
              <span>{n.icon}</span> {n.label}
              {n.id === 'notifications' && unreadNotificationCount > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: 12, background: '#ef4444', color: '#fff', borderRadius: 999, padding: '2px 8px' }}>
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          ))}
        </nav>
        <button className="co-nav co-logout" onClick={()=>router.post('/logout')}>🚪 Logout</button>
      </aside>
      <div className="co-shell">
        <header className="co-topbar">
          <button className="co-burger" onClick={()=>setSidebarOpen((o)=>!o)}>☰</button>
          <div style={{ flex: 1 }}>
            <h1 className="co-title">{NAV.find((x)=>x.id===active)?.label}</h1>
            <div className="co-muted" style={{ fontSize: '0.82rem' }}>{SECTION_SUBTITLE[active] || 'Company workspace'}</div>
          </div>
          <button className="co-btn ghost co-btn-sm" onClick={loadCore}>Refresh</button>
        </header>
        <main className="co-main">
          <div style={{ marginBottom: 12 }}>
            <MustChangePasswordBanner
              auth={auth}
              onGo={() => {
                const next = typeof window !== 'undefined' ? window.location.pathname : '';
                router.visit(`/force-password-change?next=${encodeURIComponent(next)}`);
              }}
            />
          </div>
          {loading ? <div className="co-card">Loading…</div> : content[active]}
        </main>
      </div>
      {toast&&<div className={`co-toast ${toast.type}`}>{toast.message}</div>}

      {selectedApplicant && (
        <div className="co-modal-overlay" role="dialog" onClick={() => setSelectedApplicant(null)}>
          <div className="co-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {selectedApplicant.application?.student?.first_name || selectedApplicant.application?.student?.full_name || 'Student'}{' '}
              {selectedApplicant.application?.student?.last_name || ''}
            </h3>
            <p className="co-muted">{selectedApplicant.ai_insights?.summary || 'No AI insights available.'}</p>
            <ul>
              <li>Skills match: {selectedApplicant.ai_insights?.skills_match || '—'}%</li>
              <li>Culture fit: {selectedApplicant.ai_insights?.culture_fit || '—'}%</li>
            </ul>
            <h4>Interview questions</h4>
            <ul>{(selectedApplicant.ai_insights?.interview_questions || []).map((q, i) => (<li key={i}>{q}</li>))}</ul>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              <button
                className="co-btn co-btn-sm"
                onClick={() =>
                  setDecisionModal({ type: 'approve', applicantId: selectedApplicant.application?.id || selectedApplicant.id })
                }
              >
                ✅ Approve
              </button>
              <button
                className="co-btn ghost co-btn-sm"
                style={{ color: '#ef4444' }}
                onClick={() =>
                  setDecisionModal({ type: 'reject', applicantId: selectedApplicant.application?.id || selectedApplicant.id, reason: '' })
                }
              >
                ❌ Reject
              </button>
              <button className="co-btn ghost co-btn-sm" onClick={() => setSelectedApplicant(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {decisionModal && (
        <div className="co-modal-overlay" role="dialog" onClick={() => setDecisionModal(null)}>
          <div className="co-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{decisionModal.type === 'approve' ? 'Approve applicant' : 'Reject applicant'}</h3>
            <p className="co-muted">
              {decisionModal.type === 'approve'
                ? 'Approving will assign this student as an intern.'
                : 'Optionally provide a reason for rejection.'}
            </p>
            {decisionModal.type === 'reject' && (
              <textarea
                rows={4}
                placeholder="Reason (optional)"
                value={decisionModal.reason || ''}
                onChange={(e) => setDecisionModal((p) => ({ ...p, reason: e.target.value }))}
              />
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              <button
                className="co-btn co-btn-sm"
                style={decisionModal.type === 'approve' ? { background: '#10b981', color: 'white', border: 'none' } : undefined}
                onClick={() => performDecision(decisionModal)}
              >
                {decisionModal.type === 'approve' ? 'Approve' : 'Reject'}
              </button>
              <button className="co-btn ghost co-btn-sm" onClick={() => setDecisionModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {internAction && (
        <div className="co-modal-overlay" role="dialog" onClick={() => setInternAction(null)}>
          <div className="co-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{internAction.type === 'complete' ? 'Complete internship' : 'Terminate internship'}</h3>
            <p className="co-muted">
              {internAction.type === 'complete'
                ? 'Mark this internship placement as completed. The student will move out of Current Interns.'
                : 'Terminate this internship placement. The student will move out of Current Interns.'}
            </p>
            <textarea
              rows={4}
              placeholder={internAction.type === 'complete' ? 'Completion note (optional)' : 'Termination reason (optional)'}
              value={internActionNote}
              onChange={(e) => setInternActionNote(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              <button
                className="co-btn co-btn-sm"
                style={
                  internAction.type === 'terminate'
                    ? { background: '#ef4444', color: 'white', border: 'none' }
                    : { background: '#10b981', color: 'white', border: 'none' }
                }
                onClick={async () => {
                  try {
                    const appId = internAction?.row?.application_id;
                    if (internAction.type === 'complete') {
                      await companyAPI.completeIntern(appId, internActionNote);
                      showToast('Marked as completed.');
                    } else {
                      await companyAPI.terminateIntern(appId, internActionNote);
                      showToast('Terminated.');
                    }
                    setInternAction(null);
                    await loadCore();
                  } catch (e) {
                    showToast(e?.response?.data?.error || 'Update failed.', 'error');
                  }
                }}
              >
                {internAction.type === 'complete' ? 'Complete' : 'Terminate'}
              </button>
              <button className="co-btn ghost co-btn-sm" onClick={() => setInternAction(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
