import React, { useEffect, useMemo, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { Toaster, toast } from 'react-hot-toast';
import { aiAPI, authAPI, studentAPI } from '../services/http';
import './student/StudentDashboard.css';
import './student/components/StudentSidebar.css';
import './student/components/StudentCards.css';
import './student/components/StudentLists.css';
import './student/components/StudentForms.css';
import './student/components/StudentChat.css';
import './student/components/StudentStats.css';

const NAV = [
  { id: 'overview', label: 'Dashboard', icon: '🏠' },
  { id: 'browse', label: 'Browse Internships', icon: '🔍' },
  { id: 'applications', label: 'My Applications', icon: '📝' },
  { id: 'interviews', label: 'Interviews', icon: '📅' },
  { id: 'profile', label: 'My Profile', icon: '👤' },
  { id: 'messages', label: 'Messages', icon: '💬' },
  { id: 'documents', label: 'Documents', icon: '📄' },
  { id: 'progress', label: 'Progress Tracking', icon: '📈' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
  { id: 'ai-assistant', label: 'AI Assistant', icon: '🤖' },
];

const fmtDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return String(value);
  }
};

const fmtDateTime = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
};

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const diff = d.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const formatCountdown = (target) => {
  if (!target) return null;
  const d = new Date(target);
  if (Number.isNaN(d.getTime())) return null;
  const diff = d.getTime() - Date.now();
  if (diff <= 0) return '00:00:00';
  const total = Math.floor(diff / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const parseSkills = (text, limit = 6) => {
  const raw = String(text || '')
    .replace(/[\n\r]+/g, ' ')
    .replace(/[•·]/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
  if (!raw) return [];
  const parts = raw
    .split(/[,\|\/]/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => s.length <= 22);
  const unique = [];
  const seen = new Set();
  for (const p of parts) {
    const k = p.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    unique.push(p);
    if (unique.length >= limit) break;
  }
  return unique;
};

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function useNow(ms = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

function AnimatedNumber({ value, duration = 800 }) {
  const [v, setV] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const from = prev.current;
    const to = Number(value || 0);
    prev.current = to;

    const start = performance.now();
    let raf = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{v}</>;
}

function CircularMeter({ value = 0, label, size = 58, color = '#10b981' }) {
  const clamped = Math.max(0, Math.min(100, Number(value || 0)));
  const style = {
    width: size,
    height: size,
    background: `conic-gradient(${color} ${clamped}%, rgba(148,163,184,0.25) 0)`,
  };
  return (
    <div className="st-meter" style={style} title={`${label}: ${clamped}%`}>
      <span>{clamped}%</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = String(status || '').toLowerCase();
  const cls =
    s === 'accepted' || s === 'approved'
      ? 'accepted'
      : s === 'offer'
        ? 'accepted'
      : s === 'rejected'
        ? 'rejected'
        : s === 'interview'
          ? 'interview'
          : s === 'shortlisted'
            ? 'shortlisted'
            : s === 'under review' || s === 'under_review'
              ? 'review'
              : s === 'withdrawn'
                ? 'muted'
                : 'pending';
  const text =
    s === 'approved'
      ? 'Accepted'
      : s === 'offer'
        ? 'Offer'
      : s === 'pending'
        ? 'Pending'
        : s === 'rejected'
          ? 'Rejected'
          : s === 'withdrawn'
            ? 'Withdrawn'
            : status;

  return <span className={`st-status ${cls}`}>{text}</span>;
}

function ConfirmModal({ title, message, confirmLabel = 'Confirm', danger = false, onCancel, onConfirm, loading }) {
  return (
    <div className="st-modal-overlay" role="dialog" aria-modal="true">
      <div className="st-modal">
        <div className="st-modal-header">
          <h3>{title}</h3>
          <button type="button" className="st-modal-close" onClick={onCancel} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="st-modal-body">
          <p>{message}</p>
        </div>
        <div className="st-modal-footer">
          <button type="button" className="st-btn secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="button" className={`st-btn ${danger ? 'danger' : ''}`} onClick={onConfirm} disabled={loading}>
            {loading ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ title, onClose, children, footer }) {
  return (
    <div className="st-modal-overlay" role="dialog" aria-modal="true">
      <div className="st-modal st-modal-lg">
        <div className="st-modal-header">
          <h3>{title}</h3>
          <button type="button" className="st-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="st-modal-body">{children}</div>
        {footer && <div className="st-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function SkeletonCard({ lines = 3 }) {
  return (
    <div className="st-card">
      <div className="st-skel skel-title" />
      <div className="st-skel skel-line" />
      {Array.from({ length: Math.max(0, lines - 1) }).map((_, i) => (
        <div key={i} className="st-skel skel-line" />
      ))}
    </div>
  );
}

const StudentDashboard = () => {
  const [active, setActive] = useState('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const achievementSent = useRef(new Set());

  const [data, setData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [profile, setProfile] = useState(null);

  const [internshipsPayload, setInternshipsPayload] = useState(null);
  const [internshipsLoading, setInternshipsLoading] = useState(false);

  const [applicationsPayload, setApplicationsPayload] = useState(null);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  const [chatInput, setChatInput] = useState('');
  const [chat, setChat] = useState([
    { role: 'ai', text: "Hi! I'm your ARU Career AI Assistant. Ask me about internships, resumes, interviews, and career planning." },
  ]);
  const [aiError, setAiError] = useState('');

  const [interviews, setInterviews] = useState([]);
  const [messages, setMessages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [progress, setProgress] = useState(null);
  const [settings, setSettings] = useState(null);

  // Cross-page helpers (e.g., "Upload Documents" should open Documents with the right tab/title)
  const [documentsTab, setDocumentsTab] = useState('resume');
  const [documentsPrefill, setDocumentsPrefill] = useState(null); // { tab, title }

  // Allow "Contact Company" to open a specific thread in Messages
  const [messagesThreadKey, setMessagesThreadKey] = useState(null);
  const [messagesDraftPrefill, setMessagesDraftPrefill] = useState('');

  const [browseFilters, setBrowseFilters] = useState({
    q: '',
    department_id: '',
    type: '',
    duration_min: '',
    duration_max: '',
    location: '',
    stipend_min: '',
    stipend_max: '',
    sort: 'ai',
    view: 'grid',
    page: 1,
    per_page: 9,
  });

  const [savedIds, setSavedIds] = useState(() => {
    try {
      const raw = localStorage.getItem('aru_student_saved_internships');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [applicationTab, setApplicationTab] = useState('all');
  const [withdrawModal, setWithdrawModal] = useState(null);
  const [applicationDetail, setApplicationDetail] = useState(null);

  const persistSaved = (next) => {
    setSavedIds(next);
    localStorage.setItem('aru_student_saved_internships', JSON.stringify(Array.from(next)));
  };

  const loadCore = async () => {
    try {
      const [overviewRes, deptRes, profileRes, settingsRes] = await Promise.all([
        studentAPI.getOverview(),
        studentAPI.getDepartments(),
        studentAPI.getProfile(),
        studentAPI.getSettings(),
      ]);
      setData(overviewRes.data || null);
      setDepartments(deptRes.data || []);
      setProfile(profileRes.data || null);
      setSettings(settingsRes.data || null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load student dashboard.');
    }
  };

  const loadApplications = async () => {
    setApplicationsLoading(true);
    try {
      const res = await studentAPI.getApplications({ page: 1 });
      setApplicationsPayload(res.data || null);
    } catch {
      setApplicationsPayload({ data: [], current_page: 1, last_page: 1, total: 0 });
    } finally {
      setApplicationsLoading(false);
    }
  };

  const loadBrowse = async (nextFilters = browseFilters) => {
    setInternshipsLoading(true);
    try {
      const { view, ...params } = nextFilters;
      const res = await studentAPI.getInternships(params);
      setInternshipsPayload(res.data || null);
    } catch {
      setInternshipsPayload({ data: [], current_page: 1, last_page: 1, total: 0 });
    } finally {
      setInternshipsLoading(false);
    }
  };

  const loadEverything = async () => {
    await loadCore();
    try {
      const [interviewsRes, messagesRes, docsRes, progressRes] = await Promise.all([
        studentAPI.getInterviews(),
        studentAPI.getMessages({}),
        studentAPI.getDocuments(),
        studentAPI.getProgress(),
      ]);
      setInterviews(interviewsRes.data || []);
      setMessages(messagesRes.data || []);
      setDocuments(docsRes.data || []);
      setProgress(progressRes.data || null);
    } catch {
      // non-blocking
    }
    await Promise.all([loadBrowse(), loadApplications()]);
  };

  useEffect(() => {
    loadEverything();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = settings?.theme || 'system';
    const theme =
      t === 'system'
        ? window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : t;
    document.documentElement.dataset.stTheme = theme;
    document.documentElement.style.setProperty('--st-font-scale', `${settings?.font_scale || 100}%`);
  }, [settings?.theme, settings?.font_scale]);

  const studentName = useMemo(() => profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : data?.student?.name || 'Student', [profile, data]);

  const stats = useMemo(
    () =>
      data?.stats || {
        total_applications: 0,
        active_applications: 0,
        ai_matched: 0,
        upcoming_interviews: 0,
        offers_received: 0,
      },
    [data]
  );

  const profileStrength = useMemo(() => {
    const pd = profile?.profile_data || data?.student?.profile_data || {};
    const fields = [
      !!profile?.phone,
      !!pd.year,
      !!pd.cgpa,
      Array.isArray(pd.skills) && pd.skills.length >= 3,
      documents.length > 0,
      !!pd.photo_url,
    ];
    const pct = Math.round((fields.filter(Boolean).length / fields.length) * 100);
    return pct;
  }, [profile, data, documents.length]);

  const assignedCards = useMemo(() => {
    const staff = data?.assigned_staff || {};
    const examiner = staff.examiner
      ? {
          role: 'Examiner',
          name: `${staff.examiner.first_name} ${staff.examiner.last_name}`.trim(),
          email: staff.examiner.email,
        }
      : null;
    const advisor = staff.advisor
      ? {
          role: 'Advisor',
          name: `${staff.advisor.first_name} ${staff.advisor.last_name}`.trim(),
          email: staff.advisor.email,
          badge: staff.advisor_assignment_source === 'assigned' ? 'Assigned' : staff.advisor_assignment_source === 'department' ? 'Dept' : null,
        }
      : null;
    return [examiner, advisor].filter(Boolean);
  }, [data]);

  const recentActivity = useMemo(() => {
    const items = [];
    const apps = applicationsPayload?.data || [];
    if (apps.length) {
      apps.slice(0, 5).forEach((a) => {
        items.push({
          icon: '📝',
          title: `Applied to ${a.internship?.title || 'internship'}`,
          at: a.applied_date || a.created_at,
        });
      });
    }
    interviews.slice(0, 3).forEach((it) => {
      items.push({
        icon: '📅',
        title: `Interview scheduled: ${it.company_name} (${it.position_title})`,
        at: it.scheduled_at,
      });
    });
    messages.slice(0, 3).forEach((m) => {
      items.push({
        icon: m.sentiment === 'urgent' ? '🚨' : '💬',
        title: `Message: ${m.subject || 'Update'} from ${m.from_name}`,
        at: m.created_at,
      });
    });
    return items
      .filter((x) => x.at)
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 8);
  }, [applicationsPayload, interviews, messages]);

  const derivedDeadlines = useMemo(() => {
    const list = (data?.deadlines || []).map((d) => {
      const left = daysUntil(d.deadline);
      const urgency = left == null ? 'green' : left <= 2 ? 'red' : left <= 7 ? 'orange' : 'green';
      return { ...d, days_left: left, urgency };
    });
    return list;
  }, [data]);

  const computeMatchScore = (internship) => {
    const base = 65;
    const pd = profile?.profile_data || data?.student?.profile_data || {};
    const skills = new Set((pd.skills || []).map((s) => String(s).toLowerCase()));
    const req = String(internship?.required_skills || internship?.requirements || '').toLowerCase();
    let bonus = 0;
    if (skills.size && req) {
      skills.forEach((s) => {
        if (s && req.includes(s)) bonus += 4;
      });
    }
    if (internship?.routing_department_id && String(internship.routing_department_id) === String(profile?.department_id || data?.student?.department_id)) {
      bonus += 10;
    }
    if (internship?.type && internship.type.includes('full')) bonus += 2;
    return Math.max(45, Math.min(99, base + bonus));
  };

  const internships = useMemo(() => (internshipsPayload?.data || []).map((i) => ({ ...i, _match: computeMatchScore(i) })), [internshipsPayload]);

  const sortedInternships = useMemo(() => {
    const list = [...internships];
    const s = browseFilters.sort || 'ai';
    if (s === 'ai') return list.sort((a, b) => (b._match || 0) - (a._match || 0));
    if (s === 'newest')
      return list.sort((a, b) => {
        const ad = new Date(a.created_at || a.posted_at || a.start_date || 0).getTime();
        const bd = new Date(b.created_at || b.posted_at || b.start_date || 0).getTime();
        return bd - ad;
      });
    if (s === 'deadline')
      return list.sort((a, b) => {
        const ad = new Date(a.end_date || a.deadline || '2100-01-01').getTime();
        const bd = new Date(b.end_date || b.deadline || '2100-01-01').getTime();
        return ad - bd;
      });
    if (s === 'stipend')
      return list.sort((a, b) => {
        const av = num(a.stipend) ?? -1;
        const bv = num(b.stipend) ?? -1;
        return bv - av;
      });
    return list;
  }, [internships, browseFilters.sort]);

  // Auto-award achievements/badges as students progress.
  useEffect(() => {
    const totalApps = applicationsPayload?.total ?? (applicationsPayload?.data || []).length ?? 0;
    const hasInterview = (interviews || []).length > 0;
    const hasOffer = (stats?.offers_received || 0) > 0;

    const targets = [
      { code: 'profile_completed', title: 'Profile Completed', when: profileStrength >= 100 },
      { code: 'ten_applications', title: '10 Applications', when: totalApps >= 10 },
      { code: 'first_interview', title: 'First Interview', when: hasInterview },
      { code: 'offer_received', title: 'Offer Received', when: hasOffer },
    ].filter((x) => x.when);

    if (!targets.length) return;

    (async () => {
      for (const a of targets) {
        if (achievementSent.current.has(a.code)) continue;
        achievementSent.current.add(a.code);
        try {
          // eslint-disable-next-line no-await-in-loop
          await studentAPI.addAchievement({
            code: a.code,
            title: a.title,
            description: 'Automatically awarded based on your dashboard progress.',
          });
          // eslint-disable-next-line no-await-in-loop
          const res = await studentAPI.getProgress();
          setProgress(res.data || null);
        } catch {
          // Keep silent; achievement can be attempted again in a later session.
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileStrength, applicationsPayload?.total, applicationsPayload?.data?.length, interviews?.length, stats?.offers_received]);

  const quickApply = async (internshipId) => {
    const already = (applicationsPayload?.data || []).some(
      (a) => Number(a.internship_id) === Number(internshipId) && a.status !== 'withdrawn'
    );
    if (already) {
      toast('You already applied to this internship.');
      setActive('applications');
      return;
    }
    try {
      await studentAPI.applyInternship(internshipId, { cover_letter: 'Generated via quick apply.', resume_path: null });
      toast.success('Application submitted.');
      await loadApplications();
      await loadCore();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to apply.');
    }
  };

  const toggleSaved = (internshipId) => {
    const next = new Set(savedIds);
    if (next.has(internshipId)) next.delete(internshipId);
    else next.add(internshipId);
    persistSaved(next);
    toast.success(next.has(internshipId) ? 'Saved internship.' : 'Removed from saved.');
  };

  const shareInternship = async (internship) => {
    const text = `${internship?.title} @ ${internship?.company?.name || 'Company'} (${internship?.location || 'N/A'})`;
    try {
      if (navigator.share) {
        await navigator.share({ title: internship?.title || 'Internship', text });
        toast.success('Shared.');
        return;
      }
    } catch {
      // fallback below
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard.');
    } catch {
      toast('Share not available on this device.');
    }
  };

  const sendChat = async () => {
    const message = chatInput.trim();
    if (!message) return;
    setChat((prev) => [...prev, { role: 'user', text: message }]);
    setChatInput('');
    try {
      const res = await aiAPI.careerChat({ message });
      setChat((prev) => [...prev, { role: 'ai', text: res.data?.reply || 'I can help with that.' }]);
    } catch {
      setAiError('AI assistant is temporarily unavailable. You can continue using standard dashboard features.');
      setChat((prev) => [...prev, { role: 'ai', text: 'AI assistant is temporarily unavailable.' }]);
    }
  };

  const generateICS = (it) => {
    const start = new Date(it.scheduled_at);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const dt = (d) =>
      d
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}Z$/, 'Z');
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ARU//IMS//EN',
      'BEGIN:VEVENT',
      `UID:aru-${it.id}@aru-ims`,
      `DTSTAMP:${dt(new Date())}`,
      `DTSTART:${dt(start)}`,
      `DTEND:${dt(end)}`,
      `SUMMARY:${it.company_name} - ${it.position_title} interview`,
      `DESCRIPTION:Format: ${it.format}${it.location ? `\\nLocation/Link: ${it.location}` : ''}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');
    const blob = new Blob([lines], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview_${it.id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const derivedApplications = useMemo(() => {
    const apps = applicationsPayload?.data || [];
    return apps.map((a) => {
      const stage = String(a.pipeline_stage || '').toLowerCase();
      const hasInterview = interviews.some((it) => Number(it.application_id) === Number(a.id));
      const stageIsOffer = stage === 'offer' || stage === 'hired';
      const stageIsInterview = stage === 'interview';
      const stageIsShortlisted = stage === 'shortlisted';
      const stageIsReview = stage === 'screening';
      const derivedStatus =
        a.status === 'approved'
          ? 'accepted'
          : a.status === 'rejected'
            ? 'rejected'
            : a.status === 'withdrawn'
              ? 'withdrawn'
              : stageIsOffer
                ? 'offer'
                : hasInterview || stageIsInterview
                  ? 'interview'
                  : stageIsShortlisted
                    ? 'shortlisted'
                    : a.coordinator_id || stageIsReview
                      ? 'under_review'
                      : 'pending';
      return { ...a, _derivedStatus: derivedStatus, _pipeline_stage: stage || 'applied', _hasInterview: hasInterview };
    });
  }, [applicationsPayload, interviews]);

  const filteredApplications = useMemo(() => {
    if (applicationTab === 'all') return derivedApplications;
    if (applicationTab === 'accepted') return derivedApplications.filter((a) => ['accepted', 'offer'].includes(a._derivedStatus));
    return derivedApplications.filter((a) => a._derivedStatus === applicationTab);
  }, [derivedApplications, applicationTab]);

  const buildApplicationHistory = (a) => {
    const appliedAt = a.applied_date || a.created_at;
    const interview = interviews
      .filter((it) => Number(it.application_id) === Number(a.id))
      .slice()
      .sort((x, y) => new Date(x.scheduled_at) - new Date(y.scheduled_at))[0];

    const list = [
      { key: 'submitted', label: 'Submitted', at: appliedAt, icon: '📝' },
      { key: 'review', label: 'Review', at: a.coordinator_id ? a.updated_at : null, icon: '🔎' },
      { key: 'shortlisted', label: 'Shortlisted', at: a._pipeline_stage === 'shortlisted' ? a.updated_at : null, icon: '⭐' },
      { key: 'interview', label: 'Interview', at: interview?.scheduled_at || null, icon: '📅' },
      { key: 'offer', label: 'Offer', at: a.approved_date || (a.status === 'approved' ? a.updated_at : null), icon: '🎉' },
    ];

    const st = a._derivedStatus;
    const doneMap = {
      submitted: true,
      review: st !== 'pending',
      shortlisted: ['shortlisted', 'interview', 'offer', 'accepted'].includes(st),
      interview: ['interview', 'offer', 'accepted'].includes(st),
      offer: ['offer', 'accepted'].includes(st),
    };
    return list.map((step) => ({ ...step, done: Boolean(doneMap[step.key]) }));
  };

  const withdrawApplication = async () => {
    if (!withdrawModal) return;
    setBusy(true);
    try {
      await studentAPI.withdrawApplication(withdrawModal.id);
      toast.success('Application withdrawn.');
      setWithdrawModal(null);
      await loadApplications();
      await loadCore();
    } catch {
      toast.error('Unable to withdraw application.');
    } finally {
      setBusy(false);
    }
  };

  const updateSettings = async (patch) => {
    try {
      const res = await studentAPI.updateSettings(patch);
      setSettings(res.data?.settings || settings);
      toast.success('Settings updated.');
    } catch {
      toast.error('Could not update settings.');
    }
  };

  const logout = async () => {
    setBusy(true);
    try {
      await authAPI.logout();
      router.visit('/login');
    } finally {
      setBusy(false);
      setLogoutOpen(false);
    }
  };

  const Overview = () => (
    <div className="st-page">
      <section className="st-card st-hero">
        <div className="st-hero-left">
          <h2>
            Welcome back, <span className="st-hero-name">{studentName}</span>!
          </h2>
          <p className="st-muted">{data?.insights?.[0] || 'AI is preparing recommendations for you.'}</p>
          <div className="st-hero-meta">
            <span>Student ID: {profile?.student_id || data?.student?.student_id || '—'}</span>
            <span>Department: {profile?.department_id || data?.student?.department_id || '—'}</span>
          </div>
          <div className="st-quick-actions">
            <button className="st-btn" onClick={() => setActive('browse')}>
              Browse Internships
            </button>
            <button className="st-btn secondary" onClick={() => setActive('applications')}>
              My Applications
            </button>
            <button
              className="st-btn secondary"
              onClick={() => {
                setDocumentsTab('resume');
                setDocumentsPrefill({ tab: 'resume', title: 'My CV' });
                setActive('documents');
              }}
            >
              Upload Documents
            </button>
          </div>
        </div>
        <div className="st-hero-right">
          <div className="st-hero-meter">
            <CircularMeter value={profileStrength} label="Profile completeness" size={78} />
            <div>
              <strong>{profileStrength}%</strong>
              <div className="st-muted">Profile completion</div>
            </div>
          </div>
          <div className="st-hero-staff">
            {assignedCards.length ? (
              assignedCards.map((c) => (
                <div key={c.role} className="st-mini-card">
                  <div className="st-mini-title">
                    <strong>{c.role}</strong>
                    {c.badge && <span className="st-pill">{c.badge}</span>}
                  </div>
                  <div className="st-muted">{c.name}</div>
                  {c.email && (
                    <a className="st-link" href={`mailto:${c.email}`}>
                      {c.email}
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="st-mini-card">
                <strong>Assigned staff</strong>
                <div className="st-muted">Pending assignment</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="st-stat-row">
        <div className="st-stat">
          <strong>
            <AnimatedNumber value={stats.total_applications} />
          </strong>
          <span>Total Applications</span>
        </div>
        <div className="st-stat">
          <strong>
            <AnimatedNumber value={stats.active_applications} />
          </strong>
          <span>Active</span>
        </div>
        <div className="st-stat">
          <strong>
            <AnimatedNumber value={stats.upcoming_interviews} />
          </strong>
          <span>Interviews</span>
        </div>
        <div className="st-stat">
          <strong>
            <AnimatedNumber value={stats.offers_received} />
          </strong>
          <span>Offers</span>
        </div>
      </section>

      <div className="st-grid-2">
        <section className="st-card">
          <div className="st-card-head">
            <h3>AI-matched internships</h3>
            <button className="st-btn secondary" onClick={() => setActive('browse')}>
              View all
            </button>
          </div>
          <div className="st-carousel">
            {(data?.matches || []).length ? (
              (data?.matches || []).slice(0, 8).map((m) => (
                <div key={m.id} className="st-carousel-card">
                  <div className="st-carousel-top">
                    <div>
                      <strong>{m.title}</strong>
                      <div className="st-muted">
                        {m.company} · {m.location || 'N/A'}
                      </div>
                    </div>
                    <span className="st-pill green">{m.match_score}%</span>
                  </div>
                  <div className="st-muted st-small">{(m.why_match || []).slice(0, 2).join(' · ')}</div>
                  <div className="st-carousel-actions">
                    <button className="st-btn" onClick={() => quickApply(m.id)}>
                      Apply Now
                    </button>
                    <button className="st-btn secondary" onClick={() => toggleSaved(m.id)}>
                      {savedIds.has(m.id) ? '♥ Saved' : '♡ Save'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="st-empty">No recommendations yet.</div>
            )}
          </div>
        </section>

        <section className="st-card">
          <h3>Upcoming deadlines</h3>
          {derivedDeadlines.length ? (
            <div className="st-list">
              {derivedDeadlines.map((d) => (
                <div key={d.application_id} className={`st-deadline ${d.urgency}`}>
                  <div>
                    <strong>{d.title}</strong>
                    <div className="st-muted">
                      Deadline: {fmtDate(d.deadline)} {d.days_left != null ? `· ${d.days_left} day(s)` : ''}
                    </div>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="st-empty">No upcoming deadlines.</div>
          )}
        </section>
      </div>

      <section className="st-card">
        <h3>Recent activity</h3>
        {recentActivity.length ? (
          <div className="st-timeline">
            {recentActivity.map((a, idx) => (
              <div key={idx} className="st-timeline-item">
                <span className="st-timeline-icon">{a.icon}</span>
                <div>
                  <strong>{a.title}</strong>
                  <div className="st-muted">{fmtDateTime(a.at)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="st-empty">No activity yet.</div>
        )}
      </section>
    </div>
  );

  const BrowseInternships = () => (
    <div className="st-page">
      <section className="st-card">
        <div className="st-card-head">
          <h3>Browse internships</h3>
          <div className="st-view-toggle">
            <button
              type="button"
              className={`st-pill-btn ${browseFilters.view === 'grid' ? 'active' : ''}`}
              onClick={() => setBrowseFilters((p) => ({ ...p, view: 'grid' }))}
            >
              Grid
            </button>
            <button
              type="button"
              className={`st-pill-btn ${browseFilters.view === 'list' ? 'active' : ''}`}
              onClick={() => setBrowseFilters((p) => ({ ...p, view: 'list' }))}
            >
              List
            </button>
          </div>
        </div>

        <div className="st-filter-grid">
          <input
            value={browseFilters.q}
            onChange={(e) => setBrowseFilters((p) => ({ ...p, q: e.target.value }))}
            placeholder="Search title/company/field…"
          />
          <select value={browseFilters.department_id} onChange={(e) => setBrowseFilters((p) => ({ ...p, department_id: e.target.value }))}>
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <select value={browseFilters.type} onChange={(e) => setBrowseFilters((p) => ({ ...p, type: e.target.value }))}>
            <option value="">Type</option>
            <option value="full-time">Full-time</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="part-time">Part-time</option>
          </select>
          <input
            value={browseFilters.location}
            onChange={(e) => setBrowseFilters((p) => ({ ...p, location: e.target.value }))}
            placeholder="Location"
          />
          <input
            type="number"
            value={browseFilters.duration_min}
            onChange={(e) => setBrowseFilters((p) => ({ ...p, duration_min: e.target.value }))}
            placeholder="Min weeks"
          />
          <input
            type="number"
            value={browseFilters.duration_max}
            onChange={(e) => setBrowseFilters((p) => ({ ...p, duration_max: e.target.value }))}
            placeholder="Max weeks"
          />
          <input
            type="number"
            value={browseFilters.stipend_min}
            onChange={(e) => setBrowseFilters((p) => ({ ...p, stipend_min: e.target.value }))}
            placeholder="Min stipend"
          />
          <input
            type="number"
            value={browseFilters.stipend_max}
            onChange={(e) => setBrowseFilters((p) => ({ ...p, stipend_max: e.target.value }))}
            placeholder="Max stipend"
          />
          <select value={browseFilters.sort} onChange={(e) => setBrowseFilters((p) => ({ ...p, sort: e.target.value }))}>
            <option value="ai">AI Recommended</option>
            <option value="newest">Newest</option>
            <option value="deadline">Deadline</option>
            <option value="stipend">Stipend</option>
          </select>
        </div>

        <div className="st-filter-actions">
          <button
            type="button"
            className="st-btn"
            onClick={() => {
              const next = { ...browseFilters, page: 1 };
              setBrowseFilters(next);
              loadBrowse(next);
            }}
          >
            Search
          </button>
          <button
            type="button"
            className="st-btn secondary"
            onClick={() => {
              const next = { ...browseFilters, q: '', department_id: '', type: '', duration_min: '', duration_max: '', location: '', stipend_min: '', stipend_max: '', sort: 'ai', page: 1 };
              setBrowseFilters(next);
              loadBrowse(next);
            }}
          >
            Reset
          </button>
        </div>
      </section>

      {internshipsLoading ? (
        <div className="st-grid-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : sortedInternships.length ? (
        <div className={browseFilters.view === 'grid' ? 'st-grid-3' : 'st-list'}>
          {sortedInternships.map((job) => (
            <InternshipCard
              key={job.id}
              job={job}
              view={browseFilters.view}
              saved={savedIds.has(job.id)}
              onSave={() => toggleSaved(job.id)}
              onShare={() => shareInternship(job)}
              onApply={() => quickApply(job.id)}
            />
          ))}
        </div>
      ) : (
        <div className="st-card">
          <div className="st-empty">No internships found for your filters.</div>
        </div>
      )}

      <div className="st-pagination">
        <button
          type="button"
          className="st-btn secondary"
          disabled={(internshipsPayload?.current_page || 1) <= 1 || internshipsLoading}
          onClick={() => {
            const next = { ...browseFilters, page: Math.max(1, (internshipsPayload?.current_page || 1) - 1) };
            setBrowseFilters(next);
            loadBrowse(next);
          }}
        >
          Prev
        </button>
        <div className="st-muted">
          Page {internshipsPayload?.current_page || 1} / {internshipsPayload?.last_page || 1} · {internshipsPayload?.total || 0} results
        </div>
        <button
          type="button"
          className="st-btn secondary"
          disabled={(internshipsPayload?.current_page || 1) >= (internshipsPayload?.last_page || 1) || internshipsLoading}
          onClick={() => {
            const next = { ...browseFilters, page: Math.min((internshipsPayload?.last_page || 1), (internshipsPayload?.current_page || 1) + 1) };
            setBrowseFilters(next);
            loadBrowse(next);
          }}
        >
          Next
        </button>
      </div>
    </div>
  );

  const InternshipCard = ({ job, view, saved, onSave, onApply, onShare }) => {
    const [open, setOpen] = useState(false);
    const deadlineAt = job?.end_date ? new Date(`${job.end_date}T23:59:59`) : null;
    const left = daysUntil(deadlineAt || job?.end_date);
    const urgency = left == null ? 'green' : left <= 2 ? 'red' : left <= 7 ? 'orange' : 'green';
    const countdown = deadlineAt ? formatCountdown(deadlineAt) : null;
    const logoUrl = job.company?.meta?.logo_url || job.company?.meta?.logo || job.company?.logo_url;
    const positionsLeft =
      job.max_applicants != null ? Math.max(0, Number(job.max_applicants) - Number(job.current_applicants || 0)) : null;
    const skills = useMemo(
      () => parseSkills(job.required_skills || job.requirements || job.responsibilities || '', 7),
      [job.required_skills, job.requirements, job.responsibilities]
    );

    return (
      <div className={`st-job ${view} ${open ? 'open' : ''}`}>
        <div className="st-job-top">
          <div className="st-job-brand">
            <div className="st-logo" aria-label="Company logo">
              {logoUrl ? (
                <img src={logoUrl} alt={job.company?.name || 'Company'} />
              ) : (
                (job.company?.name || 'C').slice(0, 1).toUpperCase()
              )}
            </div>
            <div>
              <strong>{job.title}</strong>
              <div className="st-muted">
                {job.company?.name || 'Company'} · {job.location || 'N/A'}
              </div>
            </div>
          </div>
          <div className="st-job-meta">
            <CircularMeter value={job._match} label="AI match" />
            <div className="st-job-badges">
              <span className="st-pill">{job.type || '—'}</span>
              <span className={`st-pill ${urgency}`}>{left == null ? 'No deadline' : `${left}d left`}</span>
            </div>
          </div>
        </div>

        <div className="st-job-row">
          <span className="st-muted">Duration:</span> {job.duration_weeks ? `${job.duration_weeks} weeks` : '—'}
          <span className="st-dot">•</span>
          <span className="st-muted">Stipend:</span> {job.stipend != null ? job.stipend : '—'}
          <span className="st-dot">•</span>
          <span className="st-muted">Deadline:</span> {fmtDate(job.end_date)}
          {countdown && (
            <>
              <span className="st-dot">•</span>
              <span className="st-muted">Countdown:</span> {countdown}
            </>
          )}
          {positionsLeft != null && (
            <>
              <span className="st-dot">•</span>
              <span className="st-muted">Positions:</span> {positionsLeft}/{job.max_applicants}
            </>
          )}
        </div>

        {skills.length > 0 && (
          <div className="st-skill-tags st-skill-tags-compact" aria-label="Skill tags">
            {skills.map((s) => (
              <span key={s} className="st-tag">
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="st-job-actions">
          <button className="st-btn" onClick={onApply}>
            Apply Now
          </button>
          <button className="st-btn secondary" onClick={onSave}>
            {saved ? '♥ Saved' : '♡ Save'}
          </button>
          <button className="st-btn secondary" onClick={onShare}>
            Share
          </button>
          <button className="st-btn ghost" onClick={() => setOpen((v) => !v)}>
            {open ? 'Hide details' : 'View details'}
          </button>
        </div>

        {open && (
          <div className="st-job-details">
            <div className="st-muted st-small">{job.description || 'No description available.'}</div>
            <div className="st-details-grid">
              <div>
                <strong>Requirements</strong>
                <div className="st-muted st-small">{job.requirements || job.required_skills || '—'}</div>
                {positionsLeft != null && (
                  <div className="st-muted st-small" style={{ marginTop: 8 }}>
                    <strong>Positions available:</strong> {positionsLeft}/{job.max_applicants}
                  </div>
                )}
              </div>
              <div>
                <strong>Company overview</strong>
                <div className="st-muted st-small">{job.company?.description || '—'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const Applications = () => (
    <div className="st-page">
      <section className="st-card">
        <div className="st-card-head">
          <h3>My applications</h3>
          <button className="st-btn secondary" onClick={loadApplications} disabled={applicationsLoading}>
            Refresh
          </button>
        </div>
        <div className="st-tabs">
          {[
            ['all', 'All'],
            ['pending', 'Pending'],
            ['under_review', 'Under Review'],
            ['shortlisted', 'Shortlisted'],
            ['interview', 'Interview'],
            ['accepted', 'Accepted'],
            ['rejected', 'Rejected'],
            ['withdrawn', 'Withdrawn'],
          ].map(([id, label]) => (
            <button key={id} className={`st-tab ${applicationTab === id ? 'active' : ''}`} onClick={() => setApplicationTab(id)}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {applicationsLoading ? (
        <div className="st-grid-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredApplications.length ? (
        <div className="st-grid-2">
          {filteredApplications.map((a) => (
            <div key={a.id} className="st-card st-app-card">
              <div className="st-card-head">
                <div>
                  <strong>{a.internship?.title || 'Internship'}</strong>
                  <div className="st-muted">{a.internship?.company?.name || 'Company'}</div>
                </div>
                <StatusBadge status={a._derivedStatus} />
              </div>
              <div className="st-muted">Applied: {fmtDate(a.applied_date || a.created_at)}</div>
              <div className="st-progress">
                {['Submitted', 'Review', 'Shortlisted', 'Interview', 'Offer'].map((step, idx) => {
                  const st = a._derivedStatus;
                  const done =
                    idx === 0 ||
                    (idx === 1 && ['under_review', 'shortlisted', 'interview', 'offer', 'accepted', 'rejected', 'withdrawn'].includes(st)) ||
                    (idx === 2 && ['shortlisted', 'interview', 'offer', 'accepted'].includes(st)) ||
                    (idx === 3 && ['interview', 'offer', 'accepted'].includes(st)) ||
                    (idx === 4 && ['offer', 'accepted'].includes(st));
                  return (
                    <div key={step} className={`st-progress-step ${done ? 'done' : ''}`}>
                      <span />
                      <small>{step}</small>
                    </div>
                  );
                })}
              </div>
              <div className="st-app-actions">
                <button className="st-btn secondary" onClick={() => setApplicationDetail(a)}>
                  View details
                </button>
                <button
                  className="st-btn secondary"
                  onClick={() => {
                    const companyId = a.internship?.company?.id || a.internship?.company_id || a.internship_id;
                    const key = `company-${companyId}`;
                    setMessagesThreadKey(key);
                    setMessagesDraftPrefill(`Hello ${a.internship?.company?.name || ''}, I have a question about my application for "${a.internship?.title || 'the internship'}".`);
                    setActive('messages');
                  }}
                >
                  Contact company
                </button>
                <button
                  className="st-btn secondary"
                  onClick={() => {
                    setDocumentsTab('resume');
                    setDocumentsPrefill({ tab: 'resume', title: `Resume - ${a.internship?.company?.name || 'Application'}` });
                    setActive('documents');
                  }}
                >
                  Upload documents
                </button>
                {a.status !== 'withdrawn' && a.status !== 'approved' && (
                  <button className="st-btn danger" onClick={() => setWithdrawModal(a)}>
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="st-card">
          <div className="st-empty">No applications found.</div>
        </div>
      )}
    </div>
  );

  const Interviews = () => {
    const upcoming = interviews.filter((i) => i.scheduled_at && new Date(i.scheduled_at) >= new Date()).sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    const past = interviews.filter((i) => i.scheduled_at && new Date(i.scheduled_at) < new Date()).sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));
    const [showPast, setShowPast] = useState(false);
    const [mock, setMock] = useState(null);
    const [prep, setPrep] = useState(null); // { it, loading, tips }
    useNow(1000); // triggers re-render for countdowns

    return (
      <div className="st-page">
        <section className="st-card">
          <div className="st-card-head">
            <h3>Upcoming interviews</h3>
            <button
              className="st-btn secondary"
              onClick={async () => {
                try {
                  const res = await aiAPI.mockInterview({});
                  setMock(res.data);
                  toast.success('Mock interview generated.');
                } catch {
                  toast.error('Mock interview unavailable.');
                }
              }}
            >
              AI mock interview
            </button>
          </div>

          {upcoming.length ? (
            <div className="st-list">
              {upcoming.map((it) => {
                const left = daysUntil(it.scheduled_at);
                const countdown = formatCountdown(it.scheduled_at);
                return (
                  <div key={it.id} className="st-list-item">
                    <div>
                      <strong>
                        {it.company_name} · {it.position_title}
                      </strong>
                      <small>
                        {fmtDateTime(it.scheduled_at)} · {it.format} {it.location ? `· ${it.location}` : ''}
                        {left != null ? ` · ${left} day(s)` : ''}
                      </small>
                      {countdown && <small>Countdown: {countdown}</small>}
                      {it.interviewer_name && <small>Interviewer: {it.interviewer_name}</small>}
                    </div>
                    <div className="st-actions">
                      {it.format === 'video' && it.location && (
                        <a className="st-btn" href={it.location} target="_blank" rel="noreferrer">
                          Join interview
                        </a>
                      )}
                      <button className="st-btn secondary" onClick={() => generateICS(it)}>
                        Add to calendar
                      </button>
                      <button
                        className="st-btn secondary"
                        onClick={async () => {
                          setPrep({ it, loading: true, tips: null });
                          try {
                            const res = await aiAPI.interviewPrep({ company: it.company_name, role: it.position_title });
                            setPrep({ it, loading: false, tips: res.data });
                            toast.success('Prep tips ready.');
                          } catch {
                            setPrep({ it, loading: false, tips: { tips: ['Review the job requirements', 'Prepare STAR examples', 'Research the company'] } });
                            toast.error('AI prep tips unavailable (showing defaults).');
                          }
                        }}
                      >
                        Prep tips
                      </button>
                      <button
                        className="st-btn secondary"
                        onClick={async () => {
                          await studentAPI.sendMessage({
                            thread_key: `reschedule-${it.id}`,
                            subject: `Reschedule request: ${it.company_name}`,
                            from_name: studentName,
                            body: `Hello, I would like to request rescheduling for the interview (${fmtDateTime(it.scheduled_at)}). Thank you.`,
                            category: 'follow_up',
                            sentiment: 'neutral',
                          });
                          toast.success('Reschedule request sent.');
                          const res = await studentAPI.getMessages({});
                          setMessages(res.data || []);
                        }}
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="st-empty">No upcoming interviews scheduled yet.</div>
          )}
        </section>

        {prep && (
          <DetailModal
            title={`Interview prep: ${prep.it?.company_name || ''}`}
            onClose={() => setPrep(null)}
            footer={
              <button className="st-btn secondary" type="button" onClick={() => setPrep(null)}>
                Close
              </button>
            }
          >
            {prep.loading ? (
              <div className="st-empty">Generating tips…</div>
            ) : (
              <>
                <div className="st-muted">Role: {prep.it?.position_title}</div>
                <ul className="st-muted" style={{ marginTop: 10 }}>
                  {(prep.tips?.tips || prep.tips?.points || prep.tips?.questions || []).slice(0, 10).map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </>
            )}
          </DetailModal>
        )}

        {mock && (
          <section className="st-card">
            <h3>Mock interview</h3>
            <div className="st-muted">Score: {mock.score}%</div>
            <ul className="st-muted">
              {(mock.questions || []).map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
            <ul className="st-muted">
              {(mock.feedback || []).map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="st-card">
          <div className="st-card-head">
            <h3>Past interviews</h3>
            <button className="st-btn secondary" onClick={() => setShowPast((v) => !v)}>
              {showPast ? 'Hide' : 'Show'}
            </button>
          </div>
          {showPast ? (
            past.length ? (
              <div className="st-list">
                {past.map((it) => (
                  <div key={it.id} className="st-list-item">
                    <div>
                      <strong>
                        {it.company_name} · {it.position_title}
                      </strong>
                      <small>{fmtDateTime(it.scheduled_at)}</small>
                    </div>
                    <button
                      className="st-btn secondary"
                      onClick={async () => {
                        const feedback = window.prompt('Post interview feedback (optional):', it.post_interview_feedback || '');
                        if (feedback == null) return;
                        await studentAPI.saveInterviewFeedback(it.id, { post_interview_feedback: feedback, confidence_score: 80 });
                        toast.success('Feedback saved.');
                        const res = await studentAPI.getInterviews();
                        setInterviews(res.data || []);
                      }}
                    >
                      Add feedback
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="st-empty">No past interviews.</div>
            )
          ) : (
            <div className="st-muted">Collapsed.</div>
          )}
        </section>
      </div>
    );
  };

  const Profile = () => {
    const pd = profile?.profile_data || {};
    const [form, setForm] = useState({
      phone: profile?.phone || '',
      cgpa: pd.cgpa || '',
      year: pd.year || '',
      skills: Array.isArray(pd.skills) ? pd.skills : [],
    });
    const [skillInput, setSkillInput] = useState('');
    const [pwd, setPwd] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
    const [insights, setInsights] = useState(null);
    const [docTab, setDocTab] = useState('resume');
    const [docDraft, setDocDraft] = useState({ title: '', file: null });
    const [docPreview, setDocPreview] = useState(null);

    useEffect(() => {
      setForm({
        phone: profile?.phone || '',
        cgpa: (profile?.profile_data || {}).cgpa || '',
        year: (profile?.profile_data || {}).year || '',
        skills: Array.isArray((profile?.profile_data || {}).skills) ? (profile?.profile_data || {}).skills : [],
      });
    }, [profile]);

    const addSkill = (skill) => {
      const s = String(skill || '').trim();
      if (!s) return;
      if (form.skills.some((x) => String(x).toLowerCase() === s.toLowerCase())) return;
      setForm((p) => ({ ...p, skills: [...p.skills, s].slice(0, 30) }));
      setSkillInput('');
    };

    const profileDocs = useMemo(() => documents.filter((d) => d.type === docTab).slice(0, 6), [documents, docTab]);

    const uploadProfileDoc = async () => {
      if (!docDraft.title.trim()) {
        toast.error('Document name required.');
        return;
      }
      if (!docDraft.file) {
        toast.error('Choose a file first.');
        return;
      }
      const fd = new FormData();
      fd.append('type', docTab);
      fd.append('title', docDraft.title);
      fd.append('file', docDraft.file);
      try {
        await studentAPI.saveDocument(fd);
        const res = await studentAPI.getDocuments();
        setDocuments(res.data || []);
        setDocDraft({ title: '', file: null });
        toast.success('Document uploaded.');
      } catch {
        toast.error('Upload failed.');
      }
    };

    const previewProfileDoc = async (doc) => {
      setDocPreview({ loading: true, doc });
      try {
        const res = await studentAPI.viewDocumentFile(doc.id);
        const url = URL.createObjectURL(new Blob([res.data]));
        setDocPreview({ loading: false, doc, url });
      } catch {
        setDocPreview({ loading: false, doc, url: null });
      }
    };

    return (
      <div className="st-page">
        <section className="st-card">
          <div className="st-card-head">
            <h3>My profile</h3>
            <div className="st-actions">
              <button
                className="st-btn secondary"
                type="button"
                onClick={async () => {
                  try {
                    const res = await aiAPI.profileInsights();
                    setInsights(res.data);
                    toast.success('AI profile suggestions loaded.');
                  } catch {
                    toast.error('AI suggestions unavailable.');
                  }
                }}
              >
                AI optimize
              </button>
              <div className="st-hero-meter">
                <CircularMeter value={profileStrength} label="Profile strength" />
                <div className="st-muted">Strength</div>
              </div>
            </div>
          </div>

          <div className="st-filter-grid" style={{ marginTop: 0 }}>
            <label>
              Full name
              <input value={studentName} disabled />
            </label>
            <label>
              Student ID
              <input value={profile?.student_id || data?.student?.student_id || '—'} disabled />
            </label>
            <label>
              Email
              <input value={profile?.email || '—'} disabled />
            </label>
            <label>
              Department
              <input
                value={
                  departments.find((d) => String(d.id) === String(profile?.department_id))?.name ||
                  profile?.department_id ||
                  '—'
                }
                disabled
              />
            </label>
            <label>
              Phone
              <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            </label>
            <label>
              Year
              <input value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} placeholder="e.g., Year 3" />
            </label>
            <label>
              CGPA
              <input value={form.cgpa} onChange={(e) => setForm((p) => ({ ...p, cgpa: e.target.value }))} placeholder="e.g., 3.45" />
            </label>
            <label>
              Photo
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append('photo', file);
                  try {
                    const res = await studentAPI.updateProfile(fd);
                    setProfile(res.data?.profile || null);
                    toast.success('Photo uploaded.');
                  } catch {
                    toast.error('Photo upload failed.');
                  }
                }}
              />
            </label>
          </div>

          <div className="st-skill-box">
            <div className="st-card-head">
              <h4>Skills</h4>
              <button
                className="st-btn secondary"
                onClick={async () => {
                  try {
                    const res = await aiAPI.skillGapAnalysis({});
                    const suggested = (res.data?.required_skills || []).slice(0, 6);
                    toast.success('AI suggestions loaded.');
                    suggested.forEach((s) => addSkill(s));
                  } catch {
                    toast.error('AI suggestions unavailable.');
                  }
                }}
              >
                AI suggest
              </button>
            </div>
            <div className="st-skill-input">
              <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add a skill (press Enter)" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }} />
              <button className="st-btn" onClick={() => addSkill(skillInput)}>
                Add
              </button>
            </div>
            <div className="st-skill-tags">
              {form.skills.length ? (
                form.skills.map((s) => (
                  <button key={s} type="button" className="st-tag" onClick={() => setForm((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }))} title="Remove">
                    {s} ✕
                  </button>
                ))
              ) : (
                <div className="st-muted">No skills yet.</div>
              )}
            </div>
          </div>

          <div className="st-card" style={{ marginTop: 14, boxShadow: 'none' }}>
            <div className="st-card-head">
              <h4>Documents</h4>
              <button
                className="st-btn secondary"
                type="button"
                onClick={() => {
                  setDocumentsTab(docTab);
                  setActive('documents');
                }}
              >
                Manage all
              </button>
            </div>

            <div className="st-tabs" style={{ marginTop: 10 }}>
              {[
                ['resume', 'CV/Resume'],
                ['cover_letter', 'Cover letter'],
                ['academic', 'Transcript'],
                ['certificates', 'Certificates'],
              ].map(([id, label]) => (
                <button key={id} className={`st-tab ${docTab === id ? 'active' : ''}`} onClick={() => setDocTab(id)}>
                  {label}
                </button>
              ))}
            </div>

            <div className="st-filter-grid" style={{ marginTop: 10 }}>
              <label>
                Document name
                <input value={docDraft.title} onChange={(e) => setDocDraft((p) => ({ ...p, title: e.target.value }))} placeholder="e.g., My CV" />
              </label>
              <label>
                File
                <input type="file" onChange={(e) => setDocDraft((p) => ({ ...p, file: e.target.files?.[0] || null }))} />
              </label>
              <div style={{ display: 'grid', alignContent: 'end' }}>
                <button className="st-btn" type="button" onClick={uploadProfileDoc}>
                  Upload
                </button>
              </div>
            </div>

            {profileDocs.length ? (
              <div className="st-list" style={{ marginTop: 10 }}>
                {profileDocs.map((d) => (
                  <div key={d.id} className="st-list-item">
                    <div>
                      <strong>{d.title}</strong>
                      <small>v{d.version}</small>
                    </div>
                    <div className="st-actions">
                      {d.file_path && (
                        <button className="st-btn secondary" type="button" onClick={() => previewProfileDoc(d)}>
                          Preview
                        </button>
                      )}
                      <button
                        className="st-btn danger"
                        type="button"
                        onClick={async () => {
                          if (!window.confirm(`Delete "${d.title}"?`)) return;
                          try {
                            await studentAPI.deleteDocument(d.id);
                            const res = await studentAPI.getDocuments();
                            setDocuments(res.data || []);
                            toast.success('Deleted.');
                          } catch {
                            toast.error('Delete failed.');
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="st-empty" style={{ marginTop: 10 }}>
                No documents uploaded for this category yet.
              </div>
            )}
          </div>

          {insights && (
            <div className="st-ai-suggestions">
              <div className="st-card-head">
                <h4>AI profile optimization</h4>
                <button className="st-btn secondary" type="button" onClick={() => setInsights(null)}>
                  Clear
                </button>
              </div>
              <ul className="st-muted" style={{ marginTop: 10 }}>
                {(insights?.suggestions || insights?.insights || insights?.tips || []).slice(0, 8).map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="st-filter-actions">
            <button
              className="st-btn"
              onClick={async () => {
                if (form.cgpa && Number.isNaN(Number(form.cgpa))) {
                  toast.error('CGPA must be a number.');
                  return;
                }
                const fd = new FormData();
                fd.append('phone', form.phone);
                fd.append('profile_data[cgpa]', form.cgpa);
                fd.append('profile_data[year]', form.year);
                form.skills.forEach((s, i) => fd.append(`profile_data[skills][${i}]`, s));
                try {
                  const res = await studentAPI.updateProfile(fd);
                  setProfile(res.data?.profile || null);
                  toast.success('Profile updated.');
                  await loadCore();
                } catch {
                  toast.error('Failed to save profile.');
                }
              }}
            >
              Save profile
            </button>
          </div>
        </section>

        <section className="st-card">
          <h3>Change password</h3>
          <input
            type="password"
            placeholder="Current password"
            value={pwd.current_password}
            onChange={(e) => setPwd((p) => ({ ...p, current_password: e.target.value }))}
          />
          <input
            type="password"
            placeholder="New password (min 8)"
            value={pwd.new_password}
            onChange={(e) => setPwd((p) => ({ ...p, new_password: e.target.value }))}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={pwd.new_password_confirmation}
            onChange={(e) => setPwd((p) => ({ ...p, new_password_confirmation: e.target.value }))}
          />
          <button
            className="st-btn"
            onClick={async () => {
              try {
                await studentAPI.changePassword(pwd);
                toast.success('Password updated.');
                setPwd({ current_password: '', new_password: '', new_password_confirmation: '' });
              } catch (e) {
                toast.error(e?.response?.data?.message || 'Password update failed.');
              }
            }}
          >
            Update password
          </button>
        </section>

        {docPreview && (
          <div className="st-modal-overlay" role="dialog" aria-modal="true">
            <div className="st-modal st-doc-modal">
              <div className="st-modal-header">
                <h3>Preview: {docPreview.doc?.title}</h3>
                <button
                  className="st-modal-close"
                  onClick={() => {
                    if (docPreview.url) URL.revokeObjectURL(docPreview.url);
                    setDocPreview(null);
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="st-modal-body">
                {docPreview.loading ? (
                  <div className="st-empty">Loading…</div>
                ) : docPreview.url ? (
                  <iframe title="preview" src={docPreview.url} style={{ width: '100%', height: 520, border: 0, borderRadius: 12 }} />
                ) : (
                  <div className="st-empty">Preview not available (download instead).</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const Messages = () => {
    const [threadKey, setThreadKey] = useState(messagesThreadKey);
    const [draft, setDraft] = useState('');
    const [prompt, setPrompt] = useState('');
    const [attach, setAttach] = useState(null);
    const [showEmoji, setShowEmoji] = useState(false);

    useEffect(() => {
      if (messagesThreadKey) setThreadKey(messagesThreadKey);
    }, [messagesThreadKey]);

    useEffect(() => {
      if (!messagesDraftPrefill) return;
      setDraft(messagesDraftPrefill);
      setMessagesDraftPrefill('');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messagesDraftPrefill]);

    const threads = useMemo(() => {
      const by = new Map();
      (messages || []).forEach((m) => {
        const key = m.thread_key || 'general';
        if (!by.has(key)) by.set(key, []);
        by.get(key).push(m);
      });
      const items = Array.from(by.entries()).map(([key, arr]) => ({
        key,
        last: arr[0],
        unread: arr.some((x) => !x.read_at),
        count: arr.length,
      }));
      items.sort((a, b) => new Date(b.last.created_at).getTime() - new Date(a.last.created_at).getTime());
      return items;
    }, [messages]);

    const contacts = useMemo(() => {
      const list = [];

      // Assigned staff (advisor/examiner)
      assignedCards.forEach((c) => {
        const key = `staff-${String(c.role || '').toLowerCase()}`;
        list.push({
          key,
          name: c.name,
          subtitle: c.role,
        });
      });

      // Companies from applications
      derivedApplications.forEach((a) => {
        const companyId = a.internship?.company?.id || a.internship?.company_id;
        const companyName = a.internship?.company?.name;
        if (!companyId) return;
        list.push({
          key: `company-${companyId}`,
          name: companyName || `Company ${companyId}`,
          subtitle: 'Company HR',
        });
      });

      // Any other existing threads
      threads.forEach((t) => {
        if (!list.some((x) => x.key === t.key)) {
          list.push({ key: t.key, name: t.last.subject || t.key, subtitle: t.last.from_name || 'Contact' });
        }
      });

      // Deduplicate
      const seen = new Set();
      return list.filter((c) => {
        if (seen.has(c.key)) return false;
        seen.add(c.key);
        return true;
      });
    }, [assignedCards, derivedApplications, threads]);

    const activeKey = threadKey || messagesThreadKey || contacts[0]?.key || threads[0]?.key || 'general';

    const current = useMemo(
      () => (messages || []).filter((m) => (m.thread_key || 'general') === activeKey).slice().reverse(),
      [messages, activeKey]
    );

    const lastByThread = useMemo(() => {
      const map = new Map();
      threads.forEach((t) => map.set(t.key, t.last));
      return map;
    }, [threads]);

    const openAttachment = async (m, mode = 'open') => {
      try {
        const res = await studentAPI.viewMessageAttachment(m.id);
        const blob = res.data instanceof Blob ? res.data : new Blob([res.data], { type: m.attachment_mime || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        if (mode === 'download') {
          const a = document.createElement('a');
          a.href = url;
          a.download = m.attachment_name || `attachment_${m.id}`;
          a.click();
          URL.revokeObjectURL(url);
          return;
        }
        window.open(url, '_blank', 'noopener,noreferrer');
        // Let the new tab load first.
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      } catch {
        toast.error('Unable to open attachment.');
      }
    };

    return (
      <div className="st-chat-layout">
        <section className="st-card st-chat-left">
          <div className="st-card-head">
            <h3>Contacts</h3>
          </div>
          <input placeholder="Search threads…" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <div className="st-chat-threads">
            {contacts
              .filter((c) => !prompt || c.name.toLowerCase().includes(prompt.toLowerCase()) || c.subtitle.toLowerCase().includes(prompt.toLowerCase()))
              .map((c) => {
                const last = lastByThread.get(c.key);
                const isOnline = last?.created_at ? Date.now() - new Date(last.created_at).getTime() < 10 * 60 * 1000 : false;
                const unread = threads.find((t) => t.key === c.key)?.unread;
                return (
                  <button
                    key={c.key}
                    className={`st-thread ${activeKey === c.key ? 'active' : ''}`}
                    onClick={() => {
                      setThreadKey(c.key);
                      setMessagesThreadKey(c.key);
                    }}
                  >
                    <div>
                      <div className="st-contact-row">
                        <strong>{c.name}</strong>
                        <span className={`st-online ${isOnline ? 'on' : 'off'}`} title={isOnline ? 'Online' : 'Offline'} />
                      </div>
                      <div className="st-muted st-small">{c.subtitle}</div>
                      {last?.body && <div className="st-muted st-small st-ellipsis">{String(last.body).slice(0, 46)}</div>}
                    </div>
                    {unread && <span className="st-dot-unread" />}
                  </button>
                );
              })}
          </div>
        </section>

        <section className="st-card st-chat-mid">
          <div className="st-card-head">
            <h3>Chat</h3>
            <button
              className="st-btn secondary"
              onClick={async () => {
                const unread = current.filter((m) => !m.read_at);
                for (const m of unread) {
                  // eslint-disable-next-line no-await-in-loop
                  await studentAPI.markMessageRead(m.id);
                }
                const res = await studentAPI.getMessages({});
                setMessages(res.data || []);
                toast.success('Marked as read.');
              }}
            >
              Mark read
            </button>
          </div>

          <div className="st-chat-window">
            {current.length ? (
              current.map((m) => (
                <div key={m.id} className={`st-msg ${m.from_name === studentName ? 'me' : ''}`}>
                  <div className="st-msg-bubble">
                    <strong>{m.from_name}</strong>
                    <div className="st-muted st-small">{fmtDateTime(m.created_at)}</div>
                    <div className="st-msg-body">{m.body}</div>
                    {(m.attachment_url || m.attachment_name) && (
                      <div className="st-attachment">
                        <div className="st-muted st-small">
                          Attachment: <strong>{m.attachment_name || 'file'}</strong>
                          {m.attachment_size ? ` · ${Math.round(Number(m.attachment_size) / 1024)} KB` : ''}
                        </div>
                        <div className="st-actions-inline">
                          <button className="st-btn secondary" type="button" onClick={() => openAttachment(m, 'open')}>
                            View
                          </button>
                          <button className="st-btn secondary" type="button" onClick={() => openAttachment(m, 'download')}>
                            Download
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="st-empty">No messages in this thread.</div>
            )}
          </div>

          <div className="st-chat-compose">
            <textarea className="st-textarea" placeholder="Type a message…" value={draft} onChange={(e) => setDraft(e.target.value)} />
            <div className="st-actions-inline">
              <button
                className="st-btn"
                onClick={async () => {
                  if (!draft.trim()) return;
                  const fd = new FormData();
                  fd.append('thread_key', activeKey);
                  fd.append('subject', activeKey);
                  fd.append('from_name', studentName);
                  fd.append('body', draft);
                  fd.append('category', 'general');
                  fd.append('sentiment', 'neutral');
                  if (attach) fd.append('attachment', attach);
                  await studentAPI.sendMessage(fd);
                  setDraft('');
                  setAttach(null);
                  const res = await studentAPI.getMessages({});
                  setMessages(res.data || []);
                  toast.success('Sent.');
                }}
              >
                Send
              </button>
              <label className="st-btn secondary" style={{ cursor: 'pointer' }}>
                Attach
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => setAttach(e.target.files?.[0] || null)}
                />
              </label>
              <button className="st-btn secondary" type="button" onClick={() => setShowEmoji((v) => !v)}>
                Emoji
              </button>
            </div>
            {showEmoji && (
              <div className="st-emoji">
                {['👍', '✅', '🙏', '🙂', '🎉', '📎', '📅'].map((e) => (
                  <button key={e} type="button" className="st-emoji-btn" onClick={() => { setDraft((p) => `${p} ${e}`); setShowEmoji(false); }}>
                    {e}
                  </button>
                ))}
              </div>
            )}
            {attach && <div className="st-muted st-small">Attachment: {attach.name}</div>}
          </div>
        </section>

        <section className="st-card st-chat-right">
          <div className="st-card-head">
            <h3>AI Assistant</h3>
          </div>
          <button
            className="st-btn secondary"
            onClick={async () => {
              try {
                const res = await aiAPI.smartReply({ message: draft || 'Hello, thank you for your update.' });
                setDraft(res.data?.reply || draft);
                toast.success('Draft improved by AI.');
              } catch {
                toast.error('AI assistant unavailable.');
              }
            }}
          >
            Suggest reply
          </button>
          <button
            className="st-btn secondary"
            onClick={async () => {
              try {
                const res = await aiAPI.careerChat({ message: 'Help me write a professional message to a company HR.' });
                setDraft((res.data?.reply || '').slice(0, 500));
                toast.success('Message template generated.');
              } catch {
                toast.error('AI assistant unavailable.');
              }
            }}
          >
            Quick prompt
          </button>
          <div className="st-muted st-small" style={{ marginTop: 10 }}>
            Tips: be concise, confirm availability, and ask about next steps.
          </div>
        </section>
      </div>
    );
  };

  const Documents = () => {
    const [tab, setTab] = useState(documentsTab || 'resume');
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [previewDoc, setPreviewDoc] = useState(null);

    useEffect(() => {
      setTab(documentsTab || 'resume');
    }, [documentsTab]);

    useEffect(() => {
      if (!documentsPrefill) return;
      setTab(documentsPrefill.tab || 'resume');
      setDocumentsTab(documentsPrefill.tab || 'resume');
      if (documentsPrefill.title) setTitle(documentsPrefill.title);
      setDocumentsPrefill(null);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [documentsPrefill]);

    const byType = useMemo(() => documents.filter((d) => d.type === tab), [documents, tab]);
    const versions = useMemo(() => {
      const map = new Map();
      documents.forEach((d) => {
        const key = d.title || `doc-${d.id}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(d);
      });
      map.forEach((arr) => arr.sort((a, b) => (b.version || 0) - (a.version || 0)));
      return map;
    }, [documents]);

    const upload = async () => {
      if (!title.trim()) {
        toast.error('Title required.');
        return;
      }
      const fd = new FormData();
      fd.append('type', tab);
      fd.append('title', title);
      if (content) fd.append('content', content);
      if (file) fd.append('file', file);
      try {
        await studentAPI.saveDocument(fd);
        setTitle('');
        setContent('');
        setFile(null);
        const res = await studentAPI.getDocuments();
        setDocuments(res.data || []);
        toast.success('Document uploaded.');
      } catch {
        toast.error('Upload failed.');
      }
    };

    const previewFile = async (doc) => {
      setPreviewDoc({ loading: true, doc });
      try {
        const res = await studentAPI.viewDocumentFile(doc.id);
        const blob = new Blob([res.data]);
        const url = URL.createObjectURL(blob);
        setPreviewDoc({ loading: false, doc, url });
      } catch {
        setPreviewDoc({ loading: false, doc, url: null });
      }
    };

    return (
      <div className="st-page">
        <section className="st-card">
          <div className="st-card-head">
            <h3>Documents</h3>
            <div className="st-tabs">
              {[
                ['resume', 'CV/Resume'],
                ['cover_letter', 'Cover letters'],
                ['academic', 'Academic'],
                ['certificates', 'Certificates'],
                ['other', 'Other'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  className={`st-tab ${tab === id ? 'active' : ''}`}
                  onClick={() => {
                    setTab(id);
                    setDocumentsTab(id);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="st-dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) {
                setFile(f);
                toast.success('File selected.');
              }
            }}
          >
            Drag & drop a file here, or choose one.
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <input placeholder="Document name" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="st-textarea" placeholder="Optional notes/content…" value={content} onChange={(e) => setContent(e.target.value)} />
          <div className="st-actions-inline">
            <button className="st-btn" onClick={upload}>
              Upload
            </button>
            <button
              className="st-btn secondary"
              onClick={async () => {
                try {
                  const res = await aiAPI.resumeAnalyze({});
                  toast.success(`Resume score: ${res.data?.score} (ATS ${res.data?.ats_score})`);
                } catch {
                  toast.error('AI analyzer unavailable.');
                }
              }}
            >
              AI resume analyzer
            </button>
            <button
              className="st-btn secondary"
              onClick={async () => {
                try {
                  const res = await aiAPI.coverLetterGenerate({ company: 'Company', role: 'Intern' });
                  setContent(res.data?.content || '');
                  toast.success('Cover letter drafted.');
                } catch {
                  toast.error('Cover letter generator unavailable.');
                }
              }}
            >
              AI cover letter generator
            </button>
          </div>
        </section>

        <section className="st-card">
          <h3>{tab} files</h3>
          {byType.length ? (
            <div className="st-list">
              {byType.map((d) => (
                <div key={d.id} className="st-list-item">
                  <div>
                    <strong>{d.title}</strong>
                    <small>
                      v{d.version} · AI score: {d.ai_review?.score ?? '—'}
                    </small>
                  </div>
                  <div className="st-actions">
                    {d.file_path && (
                      <button className="st-btn secondary" onClick={() => previewFile(d)}>
                        Preview
                      </button>
                    )}
                    <button
                      className="st-btn secondary"
                      onClick={async () => {
                        const res = await studentAPI.downloadDocument(d.id);
                        const blob = new Blob([res.data]);
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${(d.title || 'document').replace(/\s+/g, '_')}`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Download
                    </button>
                    <button
                      className="st-btn danger"
                      onClick={async () => {
                        if (!window.confirm(`Delete "${d.title}"?`)) return;
                        try {
                          await studentAPI.deleteDocument(d.id);
                          const res = await studentAPI.getDocuments();
                          setDocuments(res.data || []);
                          toast.success('Deleted.');
                        } catch {
                          toast.error('Delete failed.');
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="st-empty">No documents in this category.</div>
          )}
        </section>

        <section className="st-card">
          <h3>Version history</h3>
          <div className="st-list">
            {Array.from(versions.entries())
              .slice(0, 10)
              .map(([name, arr]) => (
                <div key={name} className="st-list-item">
                  <div>
                    <strong>{name}</strong>
                    <small>{arr.map((x) => `v${x.version}`).join(', ')}</small>
                  </div>
                  <span className="st-muted">{arr[0]?.type}</span>
                </div>
              ))}
          </div>
        </section>

        {previewDoc && (
          <div className="st-modal-overlay" role="dialog" aria-modal="true">
            <div className="st-modal st-doc-modal">
              <div className="st-modal-header">
                <h3>Preview: {previewDoc.doc?.title}</h3>
                <button className="st-modal-close" onClick={() => { if (previewDoc.url) URL.revokeObjectURL(previewDoc.url); setPreviewDoc(null); }}>
                  ✕
                </button>
              </div>
              <div className="st-modal-body">
                {previewDoc.loading ? (
                  <div className="st-empty">Loading…</div>
                ) : previewDoc.url ? (
                  <iframe title="preview" src={previewDoc.url} style={{ width: '100%', height: 520, border: 0, borderRadius: 12 }} />
                ) : (
                  <div className="st-empty">Preview not available (download instead).</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const Progress = () => {
    const funnel = progress?.funnel || {};
    const goals = progress?.goals || {};
    const ftGoals = settings?.feature_toggles?.goals || {};
    const [goalTarget, setGoalTarget] = useState(ftGoals.target_monthly_applications ?? goals.target_monthly_applications ?? 15);

    useEffect(() => {
      setGoalTarget(ftGoals.target_monthly_applications ?? goals.target_monthly_applications ?? 15);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings?.feature_toggles, progress?.goals?.target_monthly_applications]);

    const skillMatch = useMemo(() => {
      const pd = profile?.profile_data || {};
      const mySkills = new Set((pd.skills || []).map((s) => String(s).toLowerCase().trim()).filter(Boolean));
      const apps = derivedApplications || [];
      if (!apps.length || !mySkills.size) return { avg: 0, items: [] };
      const items = apps.slice(0, 8).map((a) => {
        const req = String(a.internship?.requirements || a.internship?.responsibilities || '').toLowerCase();
        let hit = 0;
        mySkills.forEach((s) => {
          if (s && req.includes(s)) hit += 1;
        });
        const pct = Math.min(100, Math.round((hit / Math.max(1, mySkills.size)) * 100));
        return { id: a.id, title: a.internship?.title || 'Internship', company: a.internship?.company?.name || 'Company', pct };
      });
      const avg = Math.round(items.reduce((sum, x) => sum + x.pct, 0) / Math.max(1, items.length));
      return { avg, items };
    }, [profile, derivedApplications]);

    return (
      <div className="st-page">
        <section className="st-card">
          <div className="st-card-head">
            <h3>Progress overview</h3>
            <button
              className="st-btn secondary"
              onClick={async () => {
                const res = await studentAPI.getProgress();
                setProgress(res.data || null);
                toast.success('Progress refreshed.');
              }}
            >
              Refresh
            </button>
          </div>
          <div className="st-muted">{progress?.prediction?.summary}</div>

          <div className="st-grid-2" style={{ marginTop: 12 }}>
            <div className="st-card" style={{ boxShadow: 'none' }}>
              <div className="st-card-head">
                <h4>Profile completion</h4>
                <CircularMeter value={profileStrength} label="Profile completion" size={72} />
              </div>
              <div className="st-muted">Keep improving your profile to boost AI match accuracy.</div>
            </div>
            <div className="st-card" style={{ boxShadow: 'none' }}>
              <div className="st-card-head">
                <h4>Skills match</h4>
                <CircularMeter value={skillMatch.avg} label="Average skills match" size={72} />
              </div>
              <div className="st-muted st-small">Average match across your recent applications.</div>
            </div>
          </div>

          <div className="st-stat-row">
            <div className="st-stat">
              <strong>{funnel.applications ?? 0}</strong>
              <span>Applied</span>
            </div>
            <div className="st-stat">
              <strong>{funnel.shortlisted ?? 0}</strong>
              <span>Shortlisted</span>
            </div>
            <div className="st-stat">
              <strong>{funnel.interviews ?? 0}</strong>
              <span>Interviewed</span>
            </div>
            <div className="st-stat">
              <strong>{funnel.offers ?? 0}</strong>
              <span>Offers</span>
            </div>
          </div>
          <div className="st-goals">
            <div className="st-card-head">
              <strong>Goals</strong>
              <button
                className="st-btn secondary"
                type="button"
                onClick={async () => {
                  try {
                    const res = await aiAPI.applicationPredictions();
                    const suggested = Number(res.data?.suggested_monthly_applications || 15);
                    setGoalTarget(suggested);
                    toast.success('AI goal suggestion applied.');
                  } catch {
                    setGoalTarget(15);
                    toast.error('AI suggestions unavailable (using default).');
                  }
                }}
              >
                AI suggest goals
              </button>
            </div>
            <div className="st-filter-grid" style={{ marginTop: 10 }}>
              <label>
                Target monthly applications
                <input type="number" min="1" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} />
              </label>
              <div style={{ display: 'grid', alignContent: 'end' }}>
                <button
                  className="st-btn"
                  type="button"
                  onClick={async () => {
                    const nextTarget = Math.max(1, Number(goalTarget || 15));
                    const ft = settings?.feature_toggles || {};
                    await updateSettings({ feature_toggles: { ...ft, goals: { ...(ft.goals || {}), target_monthly_applications: nextTarget } } });
                  }}
                >
                  Save goals
                </button>
              </div>
            </div>
            <div className="st-muted" style={{ marginTop: 8 }}>
              Current month: {goals.current_monthly_applications ?? 0}/{(goalTarget || goals.target_monthly_applications || 0)}{' '}
              {goals.on_track ? '· On track' : '· Behind'}
            </div>
          </div>

          {skillMatch.items.length > 0 && (
            <div className="st-card" style={{ marginTop: 12, boxShadow: 'none' }}>
              <h4>Skills match by application</h4>
              <div className="st-list">
                {skillMatch.items.map((x) => (
                  <div key={x.id} className="st-list-item">
                    <div>
                      <strong>{x.title}</strong>
                      <small>{x.company}</small>
                    </div>
                    <span className="st-pill green">{x.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="st-badges">
            {(progress?.achievements || []).map((a) => (
              <span key={a.id} className="st-pill green">
                {a.title}
              </span>
            ))}
          </div>
        </section>
      </div>
    );
  };

  const Settings = () => (
    <div className="st-page">
      <section className="st-card">
        <h3>Notifications</h3>
        <div className="st-toggle-row">
          <label>
            <input
              type="checkbox"
              checked={settings?.notify_new_matches ?? true}
              onChange={(e) => updateSettings({ notify_new_matches: e.target.checked })}
            />{' '}
            New matches
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings?.notify_status_changes ?? true}
              onChange={(e) => updateSettings({ notify_status_changes: e.target.checked })}
            />{' '}
            Status changes
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings?.notify_interview_reminders ?? true}
              onChange={(e) => updateSettings({ notify_interview_reminders: e.target.checked })}
            />{' '}
            Interview reminders
          </label>
        </div>
      </section>

      <section className="st-card">
        <h3>Privacy</h3>
        <label>Profile visibility</label>
        <select
          value={settings?.privacy_profile_visibility || 'department'}
          onChange={(e) => updateSettings({ privacy_profile_visibility: e.target.value })}
        >
          <option value="public">Public</option>
          <option value="department">Department</option>
          <option value="private">Private</option>
        </select>
        <label>Document visibility</label>
        <select
          value={settings?.privacy_document_visibility || 'advisor_examiner'}
          onChange={(e) => updateSettings({ privacy_document_visibility: e.target.value })}
        >
          <option value="private">Private</option>
          <option value="advisor_examiner">Advisor + Examiner</option>
          <option value="companies">Companies (when applying)</option>
        </select>
      </section>

      <section className="st-card">
        <h3>Appearance</h3>
        <label>Theme</label>
        <div className="st-tabs" style={{ marginBottom: 10 }}>
          {[
            ['light', 'Light'],
            ['dark', 'Dark'],
            ['system', 'System'],
          ].map(([id, label]) => (
            <button key={id} type="button" className={`st-tab ${(settings?.theme || 'system') === id ? 'active' : ''}`} onClick={() => updateSettings({ theme: id })}>
              {label}
            </button>
          ))}
        </div>
        <label>Font scale</label>
        <input
          type="range"
          min="80"
          max="140"
          value={settings?.font_scale || 100}
          onChange={(e) => updateSettings({ font_scale: Number(e.target.value) })}
        />
      </section>

      <section className="st-card">
        <h3>Language</h3>
        <select value={settings?.language || 'en'} onChange={(e) => updateSettings({ language: e.target.value })}>
          <option value="en">English</option>
          <option value="am">Amharic</option>
          <option value="om">Oromo</option>
        </select>
      </section>

      <section className="st-card">
        <h3>Account</h3>
        <button
          className="st-btn danger"
          onClick={async () => {
            if (!window.confirm('Deactivate your account?')) return;
            try {
              await studentAPI.deactivateAccount();
              toast.success('Account deactivated.');
              await logout();
            } catch {
              toast.error('Deactivation failed.');
            }
          }}
        >
          Deactivate account
        </button>
      </section>
    </div>
  );

  const AIAssistant = () => (
    <div className="st-page">
      <section className="st-card">
        <div className="st-card-head">
          <h3>AI career assistant</h3>
          <button
            className="st-btn secondary"
            onClick={async () => {
              try {
                const res = await aiAPI.dailyBriefing();
                const msg = (res.data?.briefing || []).join('\n');
                setChat((p) => [...p, { role: 'ai', text: `Daily briefing:\n${msg}` }]);
                toast.success('Briefing added.');
              } catch {
                toast.error('Briefing unavailable.');
              }
            }}
          >
            Daily briefing
          </button>
        </div>
        {aiError && (
          <div className="st-ai-warning">
            <strong>AI Service Notice:</strong> {aiError}
            <button className="st-btn secondary" onClick={() => setAiError('')}>
              Dismiss
            </button>
          </div>
        )}
        <div className="st-chat">
          {chat.map((m, i) => (
            <div key={i} className={`st-chat-bubble ${m.role}`}>
              {m.text}
            </div>
          ))}
        </div>
        <div className="st-chat-input">
          <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask AI anything about internships…" />
          <button className="st-btn" onClick={sendChat}>
            Send
          </button>
        </div>
      </section>
    </div>
  );

  const content = {
    overview: <Overview />,
    browse: <BrowseInternships />,
    applications: <Applications />,
    interviews: <Interviews />,
    profile: <Profile />,
    messages: <Messages />,
    documents: <Documents />,
    progress: <Progress />,
    settings: <Settings />,
    'ai-assistant': <AIAssistant />,
  };

  const unreadCount = useMemo(() => messages.filter((m) => !m.read_at).length, [messages]);

  return (
    <div className="st-layout">
      <Toaster position="bottom-right" toastOptions={{ duration: 2600 }} />

      <header className="st-topbar">
        <button className="st-hamburger" type="button" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
          ☰
        </button>
        <div className="st-topbar-title">
          <strong>Student Portal</strong>
          <span className="st-muted">{NAV.find((n) => n.id === active)?.label}</span>
        </div>
        <div className="st-topbar-right">
          <button className="st-top-pill" type="button" onClick={() => setActive('messages')}>
            💬 {unreadCount}
          </button>
          <button className="st-top-pill" type="button" onClick={() => setLogoutOpen(true)}>
            Logout
          </button>
        </div>
      </header>

      <aside className={`st-sidebar ${mobileNavOpen ? 'open' : ''}`}>
        <div className="st-sidebar-head">
          <h2>Student Portal</h2>
          <button className="st-hamburger" type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
            ✕
          </button>
        </div>
        <nav>
          {NAV.map((item) => (
            <button
              key={item.id}
              className={`st-nav ${active === item.id ? 'active' : ''}`}
              onClick={() => {
                setActive(item.id);
                setMobileNavOpen(false);
              }}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="st-main">
        {!data && (
          <div className="st-grid-2">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}
        {data && content[active]}
      </main>

      {logoutOpen && (
        <ConfirmModal
          title="Confirm logout"
          message="Are you sure you want to logout?"
          confirmLabel="Logout"
          danger
          loading={busy}
          onCancel={() => setLogoutOpen(false)}
          onConfirm={logout}
        />
      )}

      {withdrawModal && (
        <ConfirmModal
          title="Withdraw application"
          message={`Withdraw application for "${withdrawModal.internship?.title || 'this internship'}"?`}
          confirmLabel="Withdraw"
          danger
          loading={busy}
          onCancel={() => setWithdrawModal(null)}
          onConfirm={withdrawApplication}
        />
      )}

      {applicationDetail && (
        <DetailModal
          title={`Application: ${applicationDetail.internship?.title || 'Internship'}`}
          onClose={() => setApplicationDetail(null)}
          footer={
            <>
              <button className="st-btn secondary" type="button" onClick={() => setApplicationDetail(null)}>
                Close
              </button>
              <button
                className="st-btn secondary"
                type="button"
                onClick={() => {
                  const companyId = applicationDetail.internship?.company?.id || applicationDetail.internship?.company_id || applicationDetail.internship_id;
                  setMessagesThreadKey(`company-${companyId}`);
                  setActive('messages');
                  setApplicationDetail(null);
                }}
              >
                Contact
              </button>
              <button
                className="st-btn secondary"
                type="button"
                onClick={() => {
                  setDocumentsTab('resume');
                  setDocumentsPrefill({ tab: 'resume', title: `Resume - ${applicationDetail.internship?.company?.name || 'Application'}` });
                  setActive('documents');
                  setApplicationDetail(null);
                }}
              >
                Upload documents
              </button>
            </>
          }
        >
          <div className="st-card-head">
            <div>
              <div className="st-muted">{applicationDetail.internship?.company?.name || 'Company'}</div>
              <div className="st-muted st-small">Applied: {fmtDate(applicationDetail.applied_date || applicationDetail.created_at)}</div>
            </div>
            <StatusBadge status={applicationDetail._derivedStatus || applicationDetail.status} />
          </div>

          <div className="st-timeline" style={{ marginTop: 12 }}>
            {buildApplicationHistory(applicationDetail).map((h) => (
              <div key={h.key} className="st-timeline-item">
                <span className="st-timeline-icon">{h.icon}</span>
                <div>
                  <strong>{h.label}</strong>
                  <div className="st-muted">{h.at ? fmtDateTime(h.at) : '—'}</div>
                </div>
                {h.done && <span className="st-pill green">Done</span>}
              </div>
            ))}
          </div>

          {applicationDetail.status !== 'withdrawn' && applicationDetail.status !== 'approved' && (
            <div style={{ marginTop: 14 }}>
              <button className="st-btn danger" type="button" onClick={() => { setWithdrawModal(applicationDetail); setApplicationDetail(null); }}>
                Withdraw application
              </button>
            </div>
          )}
        </DetailModal>
      )}
    </div>
  );
};

export default StudentDashboard;
