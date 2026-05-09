import React, { useMemo, useState } from 'react';
import { advisorAPI, aiAdvisorAPI } from '../../../../services/http';
import './AdvisorMessages.css';

export default function AdvisorMessages({
  threads,
  studentLookup,
  msgThreadKey,
  setMsgThreadKey,
  messages,
  chatDraft,
  setChatDraft,
  showToast,
  loadAll,
  setActive,
  advisorUserId,
  advisorEmail,
}) {
  const [inboxSearch, setInboxSearch] = useState('');
  const activeThread = threads.find((t) => t.student_id === msgThreadKey) || threads[0];
  const sid = msgThreadKey || activeThread?.student_id;
  const threadMsgs = (messages || [])
    .filter((m) => m.student_id === sid && m.id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const peer = studentLookup.get(sid);
  const threadKey = advisorUserId ? `advisor-${advisorUserId}` : null;

  const fromAdvisor = (m) => advisorEmail && (m.from_email || '').toLowerCase() === advisorEmail;

  const filteredThreads = useMemo(() => {
    const q = inboxSearch.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((th) => {
      const stu = studentLookup.get(th.student_id);
      const name = stu ? `${stu.first_name || ''} ${stu.last_name || ''}`.toLowerCase() : '';
      const snippet = (th.last?.body || '').toLowerCase();
      return name.includes(q) || snippet.includes(q) || String(th.student_id).includes(q);
    });
  }, [threads, inboxSearch, studentLookup]);

  return (
    <div className="adv-messages-layout">
      <aside className="adv-msg-col">
        <h4>Advisee inbox</h4>
        <p className="adv-muted adv-msg-hint">Threads use the same keys as the student app ({threadKey || 'advisor-…'}).</p>
        <input
          className="adv-msg-search"
          type="search"
          placeholder="Search students…"
          value={inboxSearch}
          onChange={(e) => setInboxSearch(e.target.value)}
        />
        <div className="adv-msg-filters" aria-hidden>
          <span className="adv-chip">All advisees</span>
        </div>
        <div className="adv-msg-threads">
          {filteredThreads.map((th) => {
            const stu = studentLookup.get(th.student_id);
            const label = stu ? `${stu.first_name} ${stu.last_name}` : `Student #${th.student_id}`;
            const initials = label
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase())
              .join('');
            return (
              <button
                key={th.student_id}
                type="button"
                className={`adv-msg-thread ${msgThreadKey === th.student_id ? 'active' : ''}`}
                onClick={() => setMsgThreadKey(th.student_id)}
              >
                <span className="adv-msg-avatar">{initials}</span>
                <div className="adv-msg-thread-body">
                  <strong>{label}</strong>
                  <small>{th.last.body?.slice(0, 72)}{th.last.body?.length > 72 ? '…' : ''}</small>
                </div>
                <div className="adv-msg-thread-meta">
                  {th.unread > 0 && <span className="adv-msg-unread">{th.unread}</span>}
                  <span className="adv-sent" title="Last sentiment">
                    {th.last.sentiment === 'positive' ? '🙂' : th.last.sentiment === 'urgent' ? '⚠️' : '💬'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>
      <section className="adv-msg-chat">
        <header className="adv-msg-chat-head">
          <div>
            <h4>{peer ? `${peer.first_name} ${peer.last_name}` : 'Conversation'}</h4>
            <p className="adv-muted adv-msg-sub">
              {peer?.student_id ? `ID ${peer.student_id}` : ''}
              {peer?.department?.name ? ` · ${peer.department.name}` : ''}
            </p>
          </div>
        </header>
        <div className="adv-chat-scroll">
          {threadMsgs.length === 0 && (
            <div className="adv-chat-empty">No messages yet. Send an introduction to open this thread.</div>
          )}
          {threadMsgs.map((m) => (
            <div key={m.id} className={`adv-chat-row ${fromAdvisor(m) ? 'out' : 'in'}`}>
              <div className="adv-chat-bubble">
                <div className="adv-chat-bubble-head">
                  <strong>{m.from_name || '—'}</strong>
                  {m.subject && <span className="adv-chat-subject">{m.subject}</span>}
                </div>
                <div className="adv-chat-body">{m.body}</div>
              </div>
              <small className="adv-chat-time">{new Date(m.created_at).toLocaleString()}</small>
            </div>
          ))}
        </div>
        <div className="adv-chat-compose">
          <textarea placeholder="Write a message to your advisee…" value={chatDraft} onChange={(e) => setChatDraft(e.target.value)} rows={3} />
          <div className="adv-inline-actions">
            <button
              type="button"
              className="adv-btn"
              onClick={async () => {
                if (!sid || !chatDraft.trim()) {
                  showToast('Pick a student and enter a message.', 'error');
                  return;
                }
                if (!threadKey) {
                  showToast('Session incomplete — refresh and try again.', 'error');
                  return;
                }
                await advisorAPI.sendMessage({
                  student_id: sid,
                  subject: 'Advisor message',
                  body: chatDraft,
                  thread_key: threadKey,
                });
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
            <button type="button" className="adv-btn ghost" onClick={() => showToast('Thread summary: use AI suggest for a quick draft.', 'success')}>
              Tips
            </button>
          </div>
        </div>
      </section>
      <aside className="adv-msg-ai">
        <h4>AI assistant</h4>
        <p className="adv-muted">Draft replies, meeting follow-ups, and next-step nudges for this cohort.</p>
        <button type="button" className="adv-btn secondary adv-btn-sm" onClick={() => setActive('ai')}>
          Open full copilot
        </button>
      </aside>
    </div>
  );
}
