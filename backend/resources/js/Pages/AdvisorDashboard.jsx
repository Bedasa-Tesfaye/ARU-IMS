import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { advisorAPI, aiAdvisorAPI } from '../services/http';
import { interpretNlSearch, normalizePaginated } from './advisor/utils';
import './advisor/AdvisorDashboard.css';
import AdvisorSidebar from './advisor/components/AdvisorSidebar/AdvisorSidebar';
import AdvisorHeader from './advisor/components/AdvisorHeader/AdvisorHeader';
import AdvisorOverview from './advisor/components/AdvisorOverview/AdvisorOverview';
import MyAdvisees from './advisor/components/MyAdvisees/MyAdvisees';
import ApplicationReviews from './advisor/components/ApplicationReviews/ApplicationReviews';
import MeetingSchedule from './advisor/components/MeetingSchedule/MeetingSchedule';
import StudentProgress from './advisor/components/StudentProgress/StudentProgress';
import AdvisorMessages from './advisor/components/AdvisorMessages/AdvisorMessages';
import DocumentReviews from './advisor/components/DocumentReviews/DocumentReviews';
import AdvisorAnalytics from './advisor/components/AdvisorAnalytics/AdvisorAnalytics';
import AIAssistant from './advisor/components/AIAssistant/AIAssistant';
import AdvisorSettings from './advisor/components/AdvisorSettings/AdvisorSettings';

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

  const handleStudentSegment = (filter) => {
    setStudentFilters((f) => ({ ...f, ...filter }));
    setActive('students');
  };

  const content = {
    overview: (
      <AdvisorOverview
        dashboard={dashboard}
        stats={stats}
        breakdown={breakdown}
        segmentTotal={segmentTotal}
        tipRotate={tipRotate}
        showToast={showToast}
        onStudentSegment={handleStudentSegment}
        onOpenTab={setActive}
      />
    ),
    students: (
      <MyAdvisees
        students={students}
        studentMeta={studentMeta}
        studentView={studentView}
        setStudentView={setStudentView}
        nlSearch={nlSearch}
        setNlSearch={setNlSearch}
        applyNlSearch={applyNlSearch}
        studentFilters={studentFilters}
        setStudentFilters={setStudentFilters}
        kanbanBuckets={kanbanBuckets}
        openStudent={openStudent}
        selectedStudentId={selectedStudentId}
        studentDetail={studentDetail}
        detailTab={detailTab}
        setDetailTab={setDetailTab}
        setActive={setActive}
        showToast={showToast}
        setBusyKey={setBusyKey}
      />
    ),
    reviews: (
      <ApplicationReviews
        reviewQueue={reviewQueue}
        bulkIds={bulkIds}
        toggleBulk={toggleBulk}
        runBulkFeedback={runBulkFeedback}
        busyKey={busyKey}
        setReviewFocus={setReviewFocus}
        setReviewAi={setReviewAi}
        setBusyKey={setBusyKey}
        reviewFocus={reviewFocus}
        reviewAi={reviewAi}
        showToast={showToast}
        loadAll={loadAll}
      />
    ),
    meetings: (
      <MeetingSchedule
        calendarMode={calendarMode}
        setCalendarMode={setCalendarMode}
        meetingDraft={meetingDraft}
        setMeetingDraft={setMeetingDraft}
        students={students}
        meetings={meetings}
        showToast={showToast}
        loadAll={loadAll}
      />
    ),
    progress: <StudentProgress progress={progress} showToast={showToast} />,
    messages: (
      <AdvisorMessages
        threads={threads}
        studentLookup={studentLookup}
        msgThreadKey={msgThreadKey}
        setMsgThreadKey={setMsgThreadKey}
        messages={messages}
        chatDraft={chatDraft}
        setChatDraft={setChatDraft}
        showToast={showToast}
        loadAll={loadAll}
        setActive={setActive}
      />
    ),
    documents: (
      <DocumentReviews
        documents={documents}
        docFocus={docFocus}
        setDocFocus={setDocFocus}
        docAi={docAi}
        setDocAi={setDocAi}
        showToast={showToast}
        loadAll={loadAll}
      />
    ),
    reports: <AdvisorAnalytics reports={reports} showToast={showToast} />,
    ai: <AIAssistant aiChat={aiChat} setAiChat={setAiChat} aiInput={aiInput} setAiInput={setAiInput} sendAi={sendAi} busyKey={busyKey} />,
    settings: (
      <AdvisorSettings
        settingsDraft={settingsDraft}
        setSettingsDraft={setSettingsDraft}
        settings={settings}
        setSettings={setSettings}
        showToast={showToast}
      />
    ),
  };

  return (
    <div className="adv-layout">
      <AdvisorSidebar
        active={active}
        sidebarOpen={sidebarOpen}
        onNavigate={(id) => {
          setActive(id);
          setSidebarOpen(false);
        }}
      />
      <div className="adv-shell">
        <AdvisorHeader
          active={active}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          notificationsOpen={notificationsOpen}
          onToggleNotifications={() => setNotificationsOpen((v) => !v)}
          notificationDigest={dashboard?.notification_digest}
        />
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
