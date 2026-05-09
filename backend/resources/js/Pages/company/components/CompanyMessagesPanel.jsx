import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { aiCompanyAPI, companyAPI } from '../../../services/http';
import { normalizePaginated } from '../../advisor/utils';
import './CompanyMessages.css';

function buildCandidates(applicants, interns) {
  const map = new Map();
  (applicants || []).forEach((a) => {
    const sid = a.student_id;
    if (!sid) return;
    const name = [a.first_name, a.last_name].filter(Boolean).join(' ') || `Student #${sid}`;
    map.set(sid, {
      id: sid,
      name,
      subtitle: a.internship_title || a.pipeline_stage || 'Applicant',
      student_code: a.student_code,
    });
  });
  (interns || []).forEach((row) => {
    const s = row.student;
    if (!s?.id) return;
    const name = [s.first_name, s.last_name].filter(Boolean).join(' ') || `Student #${s.id}`;
    map.set(s.id, {
      id: s.id,
      name,
      subtitle: row.internship_title || 'Current intern',
      student_code: s.student_id,
    });
  });
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export default function CompanyMessagesPanel({
  messages,
  applicants,
  interns,
  profile,
  showToast,
  onRefresh,
  userEmail,
  focusStudentId,
  onFocusStudentConsumed,
}) {
  const companyId = profile?.company?.id;
  const companyName = profile?.company?.name || 'Your company';
  const candidates = useMemo(() => buildCandidates(applicants, interns), [applicants, interns]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const emailLc = (userEmail || '').toLowerCase();
  const threadEndRef = useRef(null);

  useEffect(() => {
    if (!focusStudentId) return;
    setSelectedId(focusStudentId);
    onFocusStudentConsumed?.();
  }, [focusStudentId, onFocusStudentConsumed]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        String(c.id).includes(q) ||
        (c.student_code && String(c.student_code).toLowerCase().includes(q)),
    );
  }, [candidates, search]);

  const lastByStudent = useMemo(() => {
    const map = new Map();
    (messages || []).forEach((m) => {
      if (!m.student_id) return;
      const prev = map.get(m.student_id);
      const t = new Date(m.created_at).getTime();
      if (!prev || t > new Date(prev.created_at).getTime()) map.set(m.student_id, m);
    });
    return map;
  }, [messages]);

  const threadKey = companyId && selectedId ? `company-${companyId}-${selectedId}` : null;
  const active = candidates.find((c) => c.id === selectedId) || null;

  const threadMessages = useMemo(() => {
    if (!selectedId) return [];
    const rows = messages || [];
    const filtered = threadKey
      ? rows.filter((m) => m.student_id === selectedId && (m.thread_key || '') === threadKey)
      : rows.filter((m) => m.student_id === selectedId && String(m.thread_key || '').startsWith('company-'));
    return filtered.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }, [messages, selectedId, threadKey]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages.length, selectedId]);

  const hasUnread = threadMessages.some((m) => !m.read_at && (m.from_email || '').toLowerCase() !== emailLc);

  const isFromCompanyUser = (m) => emailLc && (m.from_email || '').toLowerCase() === emailLc;

  const refreshMessages = useCallback(async () => {
    const res = await companyAPI.getMessages({});
    onRefresh(normalizePaginated(res).data);
  }, [onRefresh]);

  const markThreadRead = async () => {
    if (!selectedId) return;
    const unread = threadMessages.filter((m) => !m.read_at && !isFromCompanyUser(m));
    if (!unread.length) {
      showToast('No unread messages from this student.', 'info');
      return;
    }
    try {
      for (const m of unread) {
        // eslint-disable-next-line no-await-in-loop
        await companyAPI.markMessageRead(m.id);
      }
      await refreshMessages();
      showToast('Marked as read.');
    } catch (e) {
      showToast(e?.response?.data?.message || 'Could not update read status.', 'error');
    }
  };

  const openAttachment = async (m, mode = 'open') => {
    try {
      const res = await companyAPI.viewMessageAttachment(m.id);
      const blob =
        res.data instanceof Blob ? res.data : new Blob([res.data], { type: m.attachment_mime || 'application/octet-stream' });
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
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch {
      showToast('Unable to open attachment.', 'error');
    }
  };

  const send = async () => {
    const sid = selectedId;
    if (!sid || !body.trim()) {
      showToast('Select a student and enter a message.', 'error');
      return;
    }
    try {
      await companyAPI.sendMessage({
        student_id: sid,
        body: body.trim(),
        subject: subject.trim() || undefined,
      });
      showToast('Message sent.');
      setBody('');
      await refreshMessages();
    } catch (e) {
      showToast(e?.response?.data?.message || e?.response?.data?.error || 'Send failed.', 'error');
    }
  };

  const aiSuggest = async () => {
    try {
      const r = await aiCompanyAPI.suggestReply({});
      setBody(r.data?.suggested_reply || body);
    } catch (e) {
      showToast(e?.response?.data?.error || 'AI suggestion failed.', 'error');
    }
  };

  return (
    <div className="co-msg-layout">
      <aside className="co-msg-sidebar">
        <div className="co-msg-sidebar-head">
          <h3>Inbox</h3>
          <p className="co-muted co-msg-lead">
            Chats with students who applied or intern with {companyName}. Same thread as their student portal.
          </p>
        </div>
        <input
          className="co-msg-search"
          type="search"
          placeholder="Search by name, user ID, or student code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="co-msg-candidate-list">
          {filtered.map((c) => {
            const initials = c.name
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase())
              .join('');
            const tk = companyId ? `company-${companyId}-${c.id}` : '';
            const rowUnread = (messages || []).some((m) => {
              if (m.student_id !== c.id || m.read_at) return false;
              if ((m.from_email || '').toLowerCase() === emailLc) return false;
              if (tk) return (m.thread_key || '') === tk;
              return String(m.thread_key || '').startsWith('company-');
            });
            const last = lastByStudent.get(c.id);
            return (
              <button
                key={c.id}
                type="button"
                className={`co-msg-candidate ${selectedId === c.id ? 'active' : ''}`}
                onClick={() => setSelectedId(c.id)}
              >
                <span className="co-msg-av">{initials}</span>
                <div className="co-msg-cand-body">
                  <strong>{c.name}</strong>
                  <small className="co-msg-cand-meta">
                    #{c.id}
                    {c.student_code ? ` · ${c.student_code}` : ''} · {c.subtitle}
                  </small>
                  {last?.body && (
                    <span className="co-msg-cand-preview">{String(last.body).slice(0, 56)}{last.body.length > 56 ? '…' : ''}</span>
                  )}
                </div>
                {rowUnread && <span className="co-msg-dot" title="Unread from student" />}
              </button>
            );
          })}
          {filtered.length === 0 && <div className="co-msg-empty">No matching students.</div>}
        </div>
      </aside>

      <section className="co-msg-main">
        <div className="co-msg-head">
          <div className="co-msg-head-text">
            {active ? (
              <>
                <span className="co-msg-pill">Company ↔ student</span>
                <h3>{active.name}</h3>
                <p className="co-muted co-msg-sub">
                  {active.subtitle}
                  {threadKey && (
                    <span className="co-msg-tech" title="Thread id (student app uses the same)">
                      · {threadKey}
                    </span>
                  )}
                </p>
              </>
            ) : (
              <>
                <h3>Messages</h3>
                <p className="co-muted co-msg-sub">Select someone in the list to view the conversation.</p>
              </>
            )}
          </div>
          {active && (
            <div className="co-msg-head-actions">
              {hasUnread && (
                <span className="co-msg-unread-badge" aria-live="polite">
                  Unread
                </span>
              )}
              <button type="button" className="co-btn ghost co-btn-sm" onClick={markThreadRead} disabled={!selectedId}>
                Mark read
              </button>
            </div>
          )}
        </div>

        <div className="co-msg-thread">
          {!selectedId && (
            <div className="co-msg-empty co-msg-empty--soft">
              <p>Select a student to see messages.</p>
              <p className="co-muted co-msg-empty-hint">Use Applicants or Interns to jump here with someone pre-selected.</p>
            </div>
          )}
          {selectedId && threadMessages.length === 0 && (
            <div className="co-msg-empty co-msg-empty--soft">
              <p>No messages yet in this thread.</p>
              <p className="co-muted co-msg-empty-hint">Introduce your team, share interview details, or ask a follow-up question.</p>
            </div>
          )}
          {threadMessages.map((m) => (
            <div key={m.id} className={`co-msg-row ${isFromCompanyUser(m) ? 'me' : 'them'}`}>
              <div className="co-msg-bubble">
                <div className="co-msg-meta">
                  <strong>{m.from_name || '—'}</strong>
                  {m.subject && <span className="co-msg-sub">{m.subject}</span>}
                </div>
                <div className="co-msg-body">{m.body}</div>
                {(m.attachment_url || m.attachment_name) && (
                  <div className="co-msg-attach">
                    <span className="co-msg-attach-label">
                      {m.attachment_name || 'Attachment'}
                      {m.attachment_size ? ` · ${Math.round(Number(m.attachment_size) / 1024)} KB` : ''}
                    </span>
                    <div className="co-msg-attach-actions">
                      <button type="button" className="co-btn ghost co-btn-sm" onClick={() => openAttachment(m, 'open')}>
                        View
                      </button>
                      <button type="button" className="co-btn ghost co-btn-sm" onClick={() => openAttachment(m, 'download')}>
                        Download
                      </button>
                    </div>
                  </div>
                )}
                <div className="co-msg-time">{new Date(m.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
          <div ref={threadEndRef} />
        </div>

        <div className="co-msg-compose">
          <label className="co-msg-label">
            Subject <span className="co-msg-optional">(optional)</span>
            <input
              type="text"
              placeholder="e.g. Interview follow-up"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={!selectedId}
            />
          </label>
          <label className="co-msg-label">
            Message
            <textarea
              placeholder={
                selectedId ? 'Write a clear, professional message…' : 'Choose a student on the left first.'
              }
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={!selectedId}
              rows={4}
            />
          </label>
          <div className="co-msg-compose-row">
            <button className="co-btn co-btn-sm" type="button" onClick={send} disabled={!selectedId}>
              Send
            </button>
            <button className="co-btn ghost co-btn-sm" type="button" onClick={aiSuggest} disabled={!selectedId}>
              AI suggest
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
