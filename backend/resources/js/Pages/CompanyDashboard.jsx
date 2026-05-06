import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { aiCompanyAPI, companyAPI } from '../services/http';
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
  { id: 'post', label: 'Post Internship', icon: '📋' },
  { id: 'manage', label: 'Manage Internships', icon: '📝' },
  { id: 'applicants', label: 'Applicants', icon: '👨‍🎓' },
  { id: 'find', label: 'Find Candidates', icon: '🔍' },
  { id: 'interns', label: 'Current Interns', icon: '👥' },
  { id: 'evaluations', label: 'Intern Evaluations', icon: '📊' },
  { id: 'messages', label: 'Messages/Chat', icon: '💬' },
  { id: 'schedule', label: 'Schedule', icon: '📅' },
  { id: 'analytics', label: 'Analytics & Reports', icon: '📈' },
  { id: 'profile', label: 'Company Profile', icon: '🏢' },
  { id: 'ai', label: 'AI Assistant', icon: '🤖' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

const PIPELINE_COLS = ['applied', 'screening', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'];

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

const CompanyDashboard = () => {
  const [active, setActive] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [internships, setInternships] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [interns, setInterns] = useState([]);
  const [messages, setMessages] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
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
      const [dashRes, intsRes, appsRes, internsRes, msgRes, anaRes, profRes, setRes] = await Promise.all([
        companyAPI.getDashboardStats(),
        companyAPI.getInternships({ per_page: 50 }),
        companyAPI.getApplicants({ per_page: 100 }),
        companyAPI.getInterns({ per_page: 50 }),
        companyAPI.getMessages({}),
        companyAPI.getAnalytics(),
        companyAPI.getProfile(),
        companyAPI.getSettings(),
      ]);
      setDashboard(dashRes.data);
      setInternships(normalizePaginated(intsRes).data);
      setApplicants(normalizePaginated(appsRes).data);
      setInterns(normalizePaginated(internsRes).data);
      setMessages(normalizePaginated(msgRes).data);
      setAnalytics(anaRes.data);
      setProfile(profRes.data);
      setSettings(setRes.data);
    } catch (e) {
      showToast(e?.response?.data?.message || 'Failed to load company workspace.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCore();
  }, [loadCore]);

  const stats = dashboard?.stats || {};

  const funnel = dashboard?.recruitment_funnel || {};

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
      showToast('Draft internship saved. Submit for approval from Manage.');
      setPostStep(1);
      loadCore();
    } catch (e) {
      showToast('Validation failed — check required fields.', 'error');
    } finally {
      setBusy('');
    }
  };

  const runFindSearch = async () => {
    setBusy('find');
    try {
      const res = await companyAPI.searchStudents({ q: findQuery, per_page: 30 });
      setFindResults(normalizePaginated(res).data);
    } finally {
      setBusy('');
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

      <section className="co-card">
        <h3>AI priority alerts</h3>
        <ul className="co-alert-list">
          {(dashboard?.ai_priority_alerts || []).map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </section>

      <section className="co-card">
        <h3>Recruitment funnel</h3>
        <div className="co-funnel">
          {['views', 'applications', 'shortlisted', 'interviewed', 'offered', 'accepted'].map((k) => (
            <div key={k} className="co-funnel-step">
              <span>{k}</span>
              <strong>{funnel[k] ?? '—'}</strong>
            </div>
          ))}
        </div>
        <p className="co-muted">{funnel.offer_acceptance_note}</p>
        <p className="co-muted">{funnel.bottleneck_note}</p>
      </section>

      <section className="co-card">
        <h3>Active internship performance</h3>
        <div className="co-posting-cards">
          {(dashboard?.posting_cards || []).map((p) => (
            <div key={p.id} className="co-posting-card">
              <strong>{p.title}</strong>
              <p className="co-muted">
                {p.days_active}d active · AI pool score {p.ai_quality_score}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                <button type="button" className="co-btn co-btn-sm" onClick={() => setActive('applicants')}>
                  Applicants
                </button>
                <button type="button" className="co-btn ghost co-btn-sm" onClick={() => setActive('manage')}>
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="co-card">
        <h3>Upcoming schedule</h3>
        <ul>
          {(dashboard?.upcoming_schedule || []).map((s) => (
            <li key={s.id}>
              {s.title} · {s.scheduled_at ? new Date(s.scheduled_at).toLocaleString() : ''}
              <div className="co-muted">{s.ai_brief}</div>
            </li>
          ))}
        </ul>
        <button type="button" className="co-btn ghost co-btn-sm" onClick={() => showToast('Optimizer: cluster interviews Tue/Thu AM.')}>
          AI schedule optimizer
        </button>
      </section>

      <section className="co-card">
        <h3>Recent activity</h3>
        <ul>
          {(dashboard?.recent_activity || []).map((a, i) => (
            <li key={i}>
              {a.summary} · {a.at ? new Date(a.at).toLocaleString() : ''}
            </li>
          ))}
        </ul>
      </section>

      <section className="co-card">
        <h3>AI recruitment insights</h3>
        <ul>
          {(dashboard?.ai_recruitment_insights || []).map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </section>
    </div>
  );

  const renderPost = () => (
    <div className="co-card">
      <h3>Post internship (AI-assisted)</h3>
      <div className="co-steps">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <button key={s} type="button" className={`co-step-pill ${postStep === s ? 'on' : ''}`} onClick={() => setPostStep(s)}>
            Step {s}
          </button>
        ))}
      </div>

      {postStep === 1 && (
        <div className="co-form-grid">
          <label>
            Title
            <input value={postDraft.title} onChange={(e) => setPostDraft((d) => ({ ...d, title: e.target.value }))} />
          </label>
          <label>
            Department / team focus
            <select value={postDraft.program_field} onChange={(e) => setPostDraft((d) => ({ ...d, program_field: e.target.value }))}>
              <option value="technology">Technology</option>
              <option value="marketing">Marketing</option>
              <option value="finance">Finance</option>
            </select>
          </label>
          <label>
            Work modality
            <select value={postDraft.work_modality} onChange={(e) => setPostDraft((d) => ({ ...d, work_modality: e.target.value }))}>
              <option value="on-site">On-site</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </label>
          <label>
            Location
            <input value={postDraft.location} onChange={(e) => setPostDraft((d) => ({ ...d, location: e.target.value }))} />
          </label>
          <label>
            Type
            <select value={postDraft.type} onChange={(e) => setPostDraft((d) => ({ ...d, type: e.target.value }))}>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
            </select>
          </label>
          <label>
            Duration (weeks)
            <input
              type="number"
              value={postDraft.duration_weeks}
              onChange={(e) => setPostDraft((d) => ({ ...d, duration_weeks: Number(e.target.value) }))}
            />
          </label>
          <label>
            Start date
            <input type="date" value={postDraft.start_date} onChange={(e) => setPostDraft((d) => ({ ...d, start_date: e.target.value }))} />
          </label>
          <label>
            End date
            <input type="date" value={postDraft.end_date} onChange={(e) => setPostDraft((d) => ({ ...d, end_date: e.target.value }))} />
          </label>
          <label>
            Application SLA / deadline
            <input
              type="datetime-local"
              value={postDraft.sla_deadline_at}
              onChange={(e) => setPostDraft((d) => ({ ...d, sla_deadline_at: e.target.value }))}
            />
          </label>
          <label>
            Max applicants
            <input
              type="number"
              value={postDraft.max_applicants}
              onChange={(e) => setPostDraft((d) => ({ ...d, max_applicants: Number(e.target.value) }))}
            />
          </label>
        </div>
      )}

      {postStep === 2 && (
        <label>
          Description
          <textarea rows={8} value={postDraft.description} onChange={(e) => setPostDraft((d) => ({ ...d, description: e.target.value }))} />
        </label>
      )}

      {postStep === 3 && (
        <div className="co-form-grid">
          <label>
            Requirements
            <textarea value={postDraft.requirements} onChange={(e) => setPostDraft((d) => ({ ...d, requirements: e.target.value }))} />
          </label>
          <label>
            Responsibilities
            <textarea value={postDraft.responsibilities} onChange={(e) => setPostDraft((d) => ({ ...d, responsibilities: e.target.value }))} />
          </label>
          <label>
            Required skills (comma separated)
            <input value={postDraft.required_skills} onChange={(e) => setPostDraft((d) => ({ ...d, required_skills: e.target.value }))} />
          </label>
        </div>
      )}

      {postStep === 4 && (
        <div className="co-form-grid">
          <label>
            Stipend (optional)
            <input value={postDraft.stipend} onChange={(e) => setPostDraft((d) => ({ ...d, stipend: e.target.value }))} />
          </label>
        </div>
      )}

      {postStep === 5 && (
        <p className="co-muted">Evaluation weights: use balanced rubric — technical, communication, deliverables, attendance (defaults in IMS).</p>
      )}

      {postStep === 6 && (
        <div>
          <p className="co-muted">AI final review: completeness, inclusivity, predicted applicant volume (demo).</p>
          <button type="button" className="co-btn secondary co-btn-sm" onClick={() => aiCompanyAPI.optimizePosting({}).then((r) => showToast(r.data?.keywords?.join(', ') || 'Optimized'))}>
            Run AI optimizer
          </button>
        </div>
      )}

      <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="co-btn secondary co-btn-sm" onClick={() => setPostStep((s) => Math.max(1, s - 1))}>
          Back
        </button>
        <button type="button" className="co-btn secondary co-btn-sm" onClick={() => setPostStep((s) => Math.min(6, s + 1))}>
          Next
        </button>
        <button type="button" className="co-btn co-btn-sm" disabled={busy === 'post'} onClick={submitPost}>
          Save draft internship
        </button>
        <button
          type="button"
          className="co-btn ghost co-btn-sm"
          onClick={() => aiCompanyAPI.generateJobDescription({ role_type: postDraft.title }).then((r) => setPostDraft((d) => ({ ...d, description: r.data?.description || d.description })))}
        >
          AI generate description
        </button>
      </div>
    </div>
  );

  const renderManage = () => (
    <div className="co-card">
      <h3>Manage internships</h3>
      <div className="co-table-wrap">
        <table className="co-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Submission</th>
              <th>Applicants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {internships.map((row) => (
              <tr key={row.id}>
                <td>{row.title}</td>
                <td>
                  <span className={`co-badge ${row.status === 'active' ? 'active' : 'draft'}`}>{row.status}</span>
                </td>
                <td>{row.submission_status}</td>
                <td>{row.current_applicants}</td>
                <td>
                  <button type="button" className="co-btn ghost co-btn-sm" onClick={() => companyAPI.submitInternshipForApproval(row.id).then(() => loadCore())}>
                    Submit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderApplicants = () => (
    <div>
      <div className="co-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <h3>Applicants (ATS)</h3>
          <div>
            <button type="button" className={applicantView === 'kanban' ? 'co-btn co-btn-sm' : 'co-btn ghost co-btn-sm'} onClick={() => setApplicantView('kanban')}>
              Kanban
            </button>
            <button type="button" className={applicantView === 'list' ? 'co-btn co-btn-sm' : 'co-btn ghost co-btn-sm'} onClick={() => setApplicantView('list')}>
              List
            </button>
          </div>
        </div>
      </div>

      {applicantView === 'kanban' && (
        <div className="co-kanban">
          {PIPELINE_COLS.map((col) => (
            <div key={col} className="co-kanban-col">
              <h4>{col}</h4>
              {(applicantsByStage[col] || []).map((a) => (
                <div key={a.id} className="co-kanban-card">
                  <strong>
                    {a.first_name} {a.last_name}
                  </strong>
                  <div className="co-muted">{a.internship_title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <div className="co-gauge" style={{ '--pct': `${a.ai_match_score || 0}%` }}>
                      <span>{a.ai_match_score}</span>
                    </div>
                    <select
                      value={PIPELINE_COLS.includes(a.pipeline_stage) ? a.pipeline_stage : 'applied'}
                      onChange={(e) => moveApplicantStage(a.id, e.target.value)}
                      aria-label="Move stage"
                    >
                      {PIPELINE_COLS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="button" className="co-btn ghost co-btn-sm" onClick={() => openApplicant(a.id)}>
                    Details
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {applicantView === 'list' && (
        <div className="co-card co-table-wrap">
          <table className="co-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Role</th>
                <th>Stage</th>
                <th>AI</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {applicants.map((a) => (
                <tr key={a.id}>
                  <td>
                    {a.first_name} {a.last_name}
                  </td>
                  <td>{a.internship_title}</td>
                  <td>{a.pipeline_stage}</td>
                  <td>{a.ai_match_score}</td>
                  <td>
                    <button type="button" className="co-btn ghost co-btn-sm" onClick={() => openApplicant(a.id)}>
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedApplicant && (
        <div className="co-modal-overlay" role="dialog">
          <div className="co-modal">
            <h3>
              {selectedApplicant.application?.student?.first_name} {selectedApplicant.application?.student?.last_name}
            </h3>
            <p className="co-muted">{selectedApplicant.ai_insights?.summary}</p>
            <ul>
              <li>Skills match: {selectedApplicant.ai_insights?.skills_match}%</li>
              <li>Culture fit: {selectedApplicant.ai_insights?.culture_fit}%</li>
            </ul>
            <h4>Interview questions</h4>
            <ul>
              {(selectedApplicant.ai_insights?.interview_questions || []).map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="co-btn co-btn-sm" onClick={() => companyAPI.shortlistApplicant(selectedApplicant.application?.id).then(() => loadCore())}>
                Shortlist
              </button>
              <button
                type="button"
                className="co-btn secondary co-btn-sm"
                onClick={() =>
                  aiCompanyAPI.screenCandidate({ application_id: selectedApplicant.application?.id }).then((r) => showToast(`Fit ${r.data?.fit_score}`))
                }
              >
                AI screen
              </button>
              <button type="button" className="co-btn ghost co-btn-sm" onClick={() => setSelectedApplicant(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderFind = () => (
    <div className="co-grid">
      <div className="co-card">
        <h3>Find candidates</h3>
        <input
          placeholder="Search skills, names, interests..."
          value={findQuery}
          onChange={(e) => setFindQuery(e.target.value)}
          style={{ width: '100%', maxWidth: 420, padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }}
        />
        <div style={{ marginTop: 12 }}>
          <button type="button" className="co-btn co-btn-sm" disabled={busy === 'find'} onClick={runFindSearch}>
            AI smart search
          </button>
        </div>
      </div>
      <div className="co-card">
        <h4>Results</h4>
        <ul>
          {findResults.map((s) => (
            <li key={s.id}>
              {s.name} · {s.department} · match {s.ai_match}
              <button type="button" className="co-btn ghost co-btn-sm" onClick={() => companyAPI.addTalentPool({ student_id: s.id }).then(() => showToast('Saved to talent pool'))}>
                Save
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderInterns = () => (
    <div className="co-card co-table-wrap">
      <h3>Current interns</h3>
      <table className="co-table">
        <thead>
          <tr>
            <th>Intern</th>
            <th>Program</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {interns.map((row) => (
            <tr key={row.application_id}>
              <td>
                {row.student?.first_name} {row.student?.last_name}
              </td>
              <td>{row.internship_title}</td>
              <td>{row.status_label}</td>
              <td>
                <button type="button" className="co-btn ghost co-btn-sm" onClick={() => aiCompanyAPI.internPerformancePredict({}).then((r) => showToast(`Risk ${r.data?.risk_score}`))}>
                  AI monitor
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderEvaluations = () => (
    <div className="co-card">
      <h3>Intern evaluations</h3>
      <div className="co-form-grid">
        <label>
          Student user ID
          <input value={evalDraft.student_id} onChange={(e) => setEvalDraft((d) => ({ ...d, student_id: e.target.value }))} />
        </label>
        <label>
          Type
          <select value={evalDraft.type} onChange={(e) => setEvalDraft((d) => ({ ...d, type: e.target.value }))}>
            <option value="midterm">Mid-term</option>
            <option value="final">Final</option>
          </select>
        </label>
      </div>
      <p className="co-muted">Ratings 0–100 per criterion.</p>
      <div className="co-form-grid">
        {['technical_skills', 'communication_skills', 'problem_solving', 'teamwork', 'time_management'].map((k) => (
          <label key={k}>
            {k.replace(/_/g, ' ')}
            <input
              type="number"
              value={evalDraft[k]}
              onChange={(e) => setEvalDraft((d) => ({ ...d, [k]: Number(e.target.value) }))}
            />
          </label>
        ))}
      </div>
      <label>
        Narrative strengths
        <textarea value={evalDraft.strengths} onChange={(e) => setEvalDraft((d) => ({ ...d, strengths: e.target.value }))} />
      </label>
      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          className="co-btn co-btn-sm"
          onClick={() =>
            companyAPI
              .evaluateIntern(Number(evalDraft.student_id), {
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
              })
              .then(() => showToast('Evaluation saved'))
          }
        >
          Submit evaluation
        </button>
        <button type="button" className="co-btn ghost co-btn-sm" onClick={() => aiCompanyAPI.generateEvaluation({}).then((r) => setEvalDraft((d) => ({ ...d, strengths: r.data?.draft || d.strengths })))}>
          AI draft
        </button>
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="co-card">
      <h3>Messages</h3>
      <div className="co-form-grid">
        <label>
          Student user ID
          <input value={msgDraft.student_id} onChange={(e) => setMsgDraft((d) => ({ ...d, student_id: e.target.value }))} />
        </label>
      </div>
      <textarea rows={4} value={msgDraft.body} onChange={(e) => setMsgDraft((d) => ({ ...d, body: e.target.value }))} />
      <div style={{ marginTop: 8 }}>
        <button type="button" className="co-btn co-btn-sm" onClick={() => companyAPI.sendMessage({ student_id: Number(msgDraft.student_id), body: msgDraft.body }).then(() => showToast('Sent'))}>
          Send
        </button>
        <button type="button" className="co-btn ghost co-btn-sm" onClick={() => aiCompanyAPI.suggestReply({}).then((r) => setMsgDraft((d) => ({ ...d, body: r.data?.suggested_reply || d.body })))}>
          AI suggest reply
        </button>
      </div>
      <h4>Inbox</h4>
      <ul>
        {messages.slice(0, 20).map((m) => (
          <li key={m.id}>
            {m.subject}: {m.body?.slice(0, 80)}
          </li>
        ))}
      </ul>
    </div>
  );

  const renderSchedule = () => (
    <div className="co-card">
      <h3>Schedule</h3>
      <div className="co-form-grid">
        <label>
          Application ID
          <input value={scheduleDraft.application_id} onChange={(e) => setScheduleDraft((d) => ({ ...d, application_id: e.target.value }))} />
        </label>
        <label>
          When
          <input type="datetime-local" value={scheduleDraft.scheduled_at} onChange={(e) => setScheduleDraft((d) => ({ ...d, scheduled_at: e.target.value }))} />
        </label>
      </div>
      <textarea placeholder="Notes" value={scheduleDraft.notes} onChange={(e) => setScheduleDraft((d) => ({ ...d, notes: e.target.value }))} />
      <button
        type="button"
        className="co-btn co-btn-sm"
        style={{ marginTop: 10 }}
        onClick={() =>
          companyAPI
            .createSchedule({
              application_id: Number(scheduleDraft.application_id),
              scheduled_at: scheduleDraft.scheduled_at,
              notes: scheduleDraft.notes,
            })
            .then(() => showToast('Scheduled'))
        }
      >
        Save interview
      </button>
      <p className="co-muted">Interview slots sync with applicant scheduling. Check Dashboard for upcoming items.</p>
    </div>
  );

  const renderAnalytics = () => (
    <div className="co-grid">
      <div className="co-card">
        <h3>Analytics</h3>
        <pre style={{ background: '#f9fafb', padding: 12, borderRadius: 8 }}>{JSON.stringify(analytics, null, 2)}</pre>
        <button type="button" className="co-btn co-btn-sm" onClick={() => companyAPI.generateReport({ type: 'recruitment' }).then(() => showToast('Report queued'))}>
          Generate report
        </button>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="co-card">
      <h3>Company profile</h3>
      <p className="co-muted">Completeness: {profile?.profile_completeness ?? '—'}%</p>
      <div className="co-form-grid">
        <label>
          Name
          <input defaultValue={profile?.company?.name} id="co-name" />
        </label>
        <label>
          Industry
          <input defaultValue={profile?.company?.industry} id="co-industry" />
        </label>
      </div>
      <label>
        Description
        <textarea defaultValue={profile?.company?.description} id="co-desc" rows={5} />
      </label>
      <button
        type="button"
        className="co-btn co-btn-sm"
        onClick={() => {
          const name = document.getElementById('co-name')?.value;
          const industry = document.getElementById('co-industry')?.value;
          const description = document.getElementById('co-desc')?.value;
          companyAPI.updateProfile({ name, industry, description }).then(() => showToast('Profile saved'));
        }}
      >
        Save profile
      </button>
    </div>
  );

  const renderAI = () => (
    <div className="co-card">
      <h3>AI recruitment co-pilot</h3>
      <div className="co-chat">
        {aiChat.map((m, i) => (
          <div key={i} className={`co-chat-bubble ${m.role === 'user' ? 'user' : 'ai'}`}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="co-chat-input">
        <input value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="Ask about hiring, interviews, retention..." onKeyDown={(e) => e.key === 'Enter' && sendAi()} />
        <button type="button" className="co-btn co-btn-sm" onClick={sendAi}>
          Send
        </button>
      </div>
      <button type="button" className="co-btn ghost co-btn-sm" onClick={() => aiCompanyAPI.marketInsights().then((r) => showToast(r.data?.stipend_benchmark?.slice(0, 80)))}>
        Market insights
      </button>
    </div>
  );

  const renderSettings = () => (
    <div className="co-card">
      <h3>Settings</h3>
      <div className="co-form-grid">
        <label>
          AI level
          <select
            value={settings?.ai_assistance_level || 'balanced'}
            onChange={(e) => companyAPI.updateSettings({ ai_assistance_level: e.target.value }).then((r) => setSettings(r.data?.settings ?? settings))}
          >
            <option value="minimal">Minimal</option>
            <option value="balanced">Balanced</option>
            <option value="maximum">Maximum</option>
          </select>
        </label>
        <label>
          AI communication style
          <select
            value={settings?.ai_communication_style || 'balanced'}
            onChange={(e) => companyAPI.updateSettings({ ai_communication_style: e.target.value }).then((r) => setSettings(r.data?.settings ?? settings))}
          >
            <option value="formal">Formal</option>
            <option value="balanced">Balanced</option>
            <option value="friendly">Friendly</option>
          </select>
        </label>
      </div>
    </div>
  );

  const content = {
    overview: renderOverview(),
    post: renderPost(),
    manage: renderManage(),
    applicants: renderApplicants(),
    find: renderFind(),
    interns: renderInterns(),
    evaluations: renderEvaluations(),
    messages: renderMessages(),
    schedule: renderSchedule(),
    analytics: renderAnalytics(),
    profile: renderProfile(),
    ai: renderAI(),
    settings: renderSettings(),
  };

  return (
    <div className="co-layout">
      <aside className={`co-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="co-brand">
          <h2>ARU IMS</h2>
          <p className="co-brand-sub">Company portal</p>
        </div>
        <nav className="co-nav-wrap">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`co-nav ${active === n.id ? 'active' : ''}`}
              onClick={() => {
                setActive(n.id);
                setSidebarOpen(false);
              }}
            >
              <span>{n.icon}</span> {n.label}
            </button>
          ))}
        </nav>
        <button type="button" className="co-nav co-logout" onClick={() => router.post('/logout')}>
          🚪 Logout
        </button>
      </aside>
      <div className="co-shell">
        <header className="co-topbar">
          <button type="button" className="co-burger" onClick={() => setSidebarOpen((o) => !o)}>
            ☰
          </button>
          <h1 className="co-title">{NAV.find((x) => x.id === active)?.label}</h1>
        </header>
        <main className="co-main">{loading ? <div className="co-card">Loading…</div> : content[active]}</main>
      </div>
      {toast && <div className={`co-toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
};

export default CompanyDashboard;
