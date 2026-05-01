import React, { useMemo, useState } from 'react';
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
    if (!text.trim() || sending) return;
    const q = text.trim();
    setText('');
    setSending(true);
    setError(null);
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, by: 'user', text: q }]);
    
    // Simple mock response
    setTimeout(() => {
      const responses = [
        'Thank you for your message! Our support team will get back to you soon.',
        'I understand your question. Please contact support@aru.edu.et for more assistance.',
        'This is a demo chatbot. For real support, please email our team.',
        'Your message has been noted. We\'ll respond as soon as possible.',
        'Thanks for reaching out! Check your email for a response from our team.'
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [...prev, { id: `b-${Date.now()}`, by: 'bot', text: randomResponse }]);
      setSending(false);
    }, 1000);
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

