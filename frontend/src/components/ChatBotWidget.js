import React, { useMemo, useState } from 'react';
import { askChatBot } from '../services/aiChat';
import './ChatBotWidget.css';

function getStoredUserRole() {
  try {
    const raw = localStorage.getItem('user');
    const user = raw ? JSON.parse(raw) : null;
    return user?.role || '';
  } catch {
    return '';
  }
}

export default function ChatBotWidget({ context = 'app' }) {
  const role = useMemo(() => getStoredUserRole(), []);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      id: 'm0',
      by: 'bot',
      text:
        "Hi! I'm ARU Assistant. Ask me about internships, applications, reports, evaluations, or how to use the system.",
    },
  ]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const send = async () => {
    const q = text.trim();
    if (!q || sending) return;

    setError('');
    setSending(true);
    const userMsg = { id: `u-${Date.now()}`, by: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setText('');

    try {
      const data = await askChatBot({ question: q, role, context });
      const answer = data?.answer || 'Sorry, I could not answer that right now.';
      setMessages((prev) => [...prev, { id: `b-${Date.now()}`, by: 'bot', text: answer }]);
    } catch (e) {
      const msg = e?.message || 'Failed to send message';
      setError(msg);
      setMessages((prev) => [...prev, { id: `b-${Date.now()}`, by: 'bot', text: msg }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="aru-chatbot">
      {open && (
        <div className="aru-chatbot-panel" role="dialog" aria-label="ARU Assistant">
          <div className="aru-chatbot-header">
            <div className="title">
              <span className="dot" />
              ARU Assistant
              <span className="badge">{context}</span>
            </div>
            <button className="icon-btn" onClick={() => setOpen(false)} type="button" aria-label="Close">
              ✕
            </button>
          </div>

          <div className="aru-chatbot-messages">
            {messages.map((m) => (
              <div key={m.id} className={`msg ${m.by}`}>
                <div className="bubble">{m.text}</div>
              </div>
            ))}
          </div>

          <div className="aru-chatbot-input">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your question…"
              onKeyDown={(e) => {
                if (e.key === 'Enter') send();
              }}
              disabled={sending}
            />
            <button onClick={send} type="button" disabled={sending || !text.trim()}>
              {sending ? '...' : 'Send'}
            </button>
          </div>

          {error && <div className="aru-chatbot-error">{error}</div>}
        </div>
      )}

      <button className="aru-chatbot-fab" onClick={() => setOpen((v) => !v)} type="button" aria-label="Chatbot">
        💬
      </button>
    </div>
  );
}

