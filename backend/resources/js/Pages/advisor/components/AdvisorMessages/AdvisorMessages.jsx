import React from 'react';
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
}) {
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
            {peer ? `${peer.first_name} ${peer.last_name}` : 'Conversation'} · <span className="adv-muted">sentiment hints</span>
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
}
