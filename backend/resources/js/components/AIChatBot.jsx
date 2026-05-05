import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import {
  generateResponse,
  getDefaultSuggestions,
  getSuggestionChips,
  getWelcomeMessage,
} from './aiChatBotResponses';
import './AIChatBot.css';

const EMOJI_QUICK = ['😊', '👍', '🙏', '💡', '🎉', '✅', '📌', '⭐'];

const FAQ_BY_CONTEXT = {
  student: [
    { q: 'Where do I see my applications?', a: 'Open your student dashboard → **My Applications** for statuses and updates.' },
    { q: 'Can I edit my profile after applying?', a: 'Yes. Keep your CV and skills updated — some companies may review refreshed profiles.' },
    { q: 'Who do I contact for technical issues?', a: 'Email **support@aru.edu.et** with your student ID and a screenshot if possible.' },
  ],
  landing: [
    { q: 'How do students get access?', a: 'Students sign in with credentials issued by the university. Use **Login** from the home page.' },
    { q: 'How do companies partner?', a: 'Submit a partnership request through the portal; admins review and activate accounts.' },
    { q: 'Is the AI assistant a real person?', a: 'No — it gives instant guidance. For official decisions, use your coordinator or admin.' },
  ],
  company: [
    { q: 'Why is my post pending?', a: 'Internships often need **admin approval** before students see them. Check **Manage Internships**.' },
    { q: 'How do I message a student?', a: 'Use **Messages** in the company dashboard when the workflow allows contact.' },
    { q: 'Can I edit a live posting?', a: 'Use **Manage Internships** to update; major changes may need re-approval depending on policy.' },
  ],
  examiner: [
    { q: 'Where do I enter grades?', a: 'Use **Grade Management** and evaluation forms linked from your examiner dashboard.' },
    { q: 'Can I revise feedback after submit?', a: 'Depends on policy; if unlocked, use the evaluation update flow in your queue.' },
    { q: 'How do I use AI safely?', a: 'Treat AI as a draft assistant — you remain responsible for final marks and comments.' },
  ],
  advisor: [
    { q: 'How do I see at-risk students?', a: 'Use cohort views, filters, and AI hints in **My Students** / progress areas.' },
    { q: 'How are meetings logged?', a: 'Create or update meetings in **Meeting Schedule** so notes stay with the advisee record.' },
    { q: 'Can I message all advisees?', a: 'Use **Messages** per student or cohort tools if your deployment includes them.' },
  ],
  superadmin: [
    { q: 'Where are pending partnerships?', a: '**Pending Approvals** (or equivalent) lists partner and content queues.' },
    { q: 'How do I assign staff?', a: 'Use **Assign** tools: pick department, then match examiners/advisors to students.' },
    { q: 'How do I export data?', a: 'Open **Reports** / analytics modules and export CSV or PDF where available.' },
  ],
};

function formatLine(line) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function MessageContent({ text }) {
  const blocks = text.split(/\n\n+/);
  return (
    <div className="aru-ai-chat__formatted">
      {blocks.map((block, bi) => (
        <div key={bi} style={{ marginBottom: bi < blocks.length - 1 ? '0.65em' : 0 }}>
          {block.split('\n').map((line, li) => (
            <React.Fragment key={li}>
              {li > 0 && <br />}
              {formatLine(line)}
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
}

function detectContext(page) {
  const path = (page?.url || '').split('?')[0] || '';
  const user = page?.props?.auth;
  const role = user && typeof user === 'object' ? user.role : null;

  if (role === 'super_admin') return 'superadmin';
  if (role === 'student') return 'student';
  if (role === 'company') return 'company';
  if (role === 'examiner') return 'examiner';
  if (role === 'advisor') return 'advisor';

  if (path.includes('student-dashboard')) return 'student';
  if (path.includes('company-dashboard')) return 'company';
  if (path.includes('examiner-dashboard')) return 'examiner';
  if (path.includes('advisor-dashboard')) return 'advisor';
  if (path.includes('superadmin')) return 'superadmin';

  return 'landing';
}

function nowTimeLabel() {
  return new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function loadSettings() {
  try {
    const raw = localStorage.getItem('aru-ai-chat-settings');
    return raw
      ? JSON.parse(raw)
      : { showSuggestionChips: true, showCharCounter: true, compactInput: false };
  } catch {
    return { showSuggestionChips: true, showCharCounter: true, compactInput: false };
  }
}

function saveSettings(s) {
  try {
    localStorage.setItem('aru-ai-chat-settings', JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export default function AIChatBot() {
  const page = usePage();
  const context = useMemo(
    () => detectContext(page),
    [page.url, page.props?.auth?.role, page.props?.auth?.id]
  );

  const [open, setOpen] = useState(false);
  const [panelView, setPanelView] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState(() => getSuggestionChips(context));
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [settings, setSettings] = useState(loadSettings);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const welcomeSeedRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, open, scrollToBottom]);

  useEffect(() => {
    setSuggestions(getSuggestionChips(context));
  }, [context]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const seedWelcome = useCallback(() => {
    const welcomeText = getWelcomeMessage(context);
    setMessages([
      {
        id: `w-${Date.now()}`,
        role: 'bot',
        text: welcomeText,
        time: nowTimeLabel(),
      },
    ]);
    setSuggestions(getSuggestionChips(context));
  }, [context]);

  useEffect(() => {
    if (open && !welcomeSeedRef.current && messages.length === 0) {
      welcomeSeedRef.current = true;
      seedWelcome();
    }
  }, [open, messages.length, seedWelcome]);

  const pushBotResponse = useCallback(
    (text, nextSuggestions) => {
      setTyping(true);
      const delay = 450 + Math.random() * 400;
      window.setTimeout(() => {
        setTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            role: 'bot',
            text,
            time: nowTimeLabel(),
          },
        ]);
        if (nextSuggestions?.length) {
          setSuggestions(nextSuggestions);
        }
        if (!open) {
          setHasUnread(true);
        }
      }, delay);
    },
    [open]
  );

  const sendMessage = useCallback(
    (rawText) => {
      const text = rawText.trim();
      if (!text || typing) return;

      setMessages((prev) => [
        ...prev,
        {
          id: `u-${Date.now()}`,
          role: 'user',
          text,
          time: nowTimeLabel(),
        },
      ]);
      setInput('');
      setShowEmoji(false);

      const { text: reply, suggestions: sug } = generateResponse(text, context);
      pushBotResponse(reply, sug || getDefaultSuggestions(context));
    },
    [context, typing, pushBotResponse]
  );

  const handleOpen = () => {
    setOpen(true);
    setHasUnread(false);
    setPanelView('chat');
  };

  const handleClose = () => {
    setOpen(false);
    setShowEmoji(false);
  };

  const clearChat = () => {
    welcomeSeedRef.current = true;
    seedWelcome();
    setPanelView('chat');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const onAttach = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput((prev) => `${prev}${prev ? ' ' : ''}[Attachment: ${file.name} — upload workflow coming soon]`.trim());
    }
    e.target.value = '';
  };

  const charCount = input.length;
  const maxChars = 2000;

  const faqItems = FAQ_BY_CONTEXT[context] || FAQ_BY_CONTEXT.landing;

  return (
    <div className="aru-ai-chat" aria-live="polite">
      {open && (
        <div className="aru-ai-chat__panel" role="dialog" aria-label="ARU AI Assistant chat">
          <header className="aru-ai-chat__header">
            <div className="aru-ai-chat__header-top">
              <div className="aru-ai-chat__avatar" aria-hidden>
                🤖
              </div>
              <div className="aru-ai-chat__titles">
                <h2>ARU AI Assistant</h2>
                <p>Here to help you 24/7 ✨</p>
                <div className="aru-ai-chat__status">
                  <span className="aru-ai-chat__status-dot" />
                  Online
                </div>
              </div>
              <button type="button" className="aru-ai-chat__close" onClick={handleClose} aria-label="Close chat">
                ✕
              </button>
            </div>
            <div className="aru-ai-chat__quick-row">
              <button type="button" className="aru-ai-chat__quick-btn" onClick={clearChat}>
                🗑️ Clear Chat
              </button>
              <button
                type="button"
                className="aru-ai-chat__quick-btn"
                onClick={() => setPanelView(panelView === 'faq' ? 'chat' : 'faq')}
              >
                📋 FAQ
              </button>
              <button
                type="button"
                className="aru-ai-chat__quick-btn"
                onClick={() => setPanelView(panelView === 'settings' ? 'chat' : 'settings')}
              >
                ⚙️ Settings
              </button>
            </div>
          </header>

          {panelView === 'chat' && (
            <>
              {settings.showSuggestionChips && suggestions.length > 0 && (
                <div className="aru-ai-chat__chips">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="aru-ai-chat__chip"
                      onClick={() => sendMessage(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div className="aru-ai-chat__messages">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`aru-ai-chat__row ${m.role === 'user' ? 'aru-ai-chat__row--user' : ''}`}
                  >
                    {m.role === 'bot' && (
                      <div className="aru-ai-chat__row-avatar" aria-hidden>
                        🤖
                      </div>
                    )}
                    <div>
                      <div
                        className={`aru-ai-chat__bubble ${
                          m.role === 'user' ? 'aru-ai-chat__bubble--user' : 'aru-ai-chat__bubble--bot'
                        }`}
                      >
                        <MessageContent text={m.text} />
                      </div>
                      <div className="aru-ai-chat__time">{m.time}</div>
                    </div>
                  </div>
                ))}

                {typing && (
                  <div className="aru-ai-chat__row">
                    <div className="aru-ai-chat__row-avatar" aria-hidden>
                      🤖
                    </div>
                    <div className="aru-ai-chat__typing" aria-label="Assistant is typing">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="aru-ai-chat__input-wrap">
                <div className="aru-ai-chat__input-row">
                  <div className="aru-ai-chat__input-tools">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="aru-ai-chat__sr-only"
                      tabIndex={-1}
                      onChange={onAttach}
                      aria-hidden
                    />
                    <button
                      type="button"
                      className="aru-ai-chat__icon-btn"
                      title="Attach file (coming soon)"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      📎
                    </button>
                    <button
                      type="button"
                      className="aru-ai-chat__icon-btn"
                      title="Emoji"
                      onClick={() => setShowEmoji((v) => !v)}
                    >
                      😊
                    </button>
                    {showEmoji && (
                      <div className="aru-ai-chat__emoji-pop">
                        {EMOJI_QUICK.map((em) => (
                          <button
                            key={em}
                            type="button"
                            onClick={() => {
                              setInput((prev) => `${prev}${em}`);
                              setShowEmoji(false);
                            }}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <textarea
                    className="aru-ai-chat__textarea"
                    placeholder="Type your message..."
                    rows={settings.compactInput ? 1 : 2}
                    value={input}
                    maxLength={maxChars}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    disabled={typing}
                  />
                  <button
                    type="button"
                    className="aru-ai-chat__send"
                    disabled={typing || !input.trim()}
                    onClick={() => sendMessage(input)}
                    aria-label="Send message"
                  >
                    ➤
                  </button>
                </div>
                {settings.showCharCounter && (
                  <div className="aru-ai-chat__input-meta">
                    <span>
                      Shift+Enter for new line · Enter to send
                    </span>
                    <span>
                      {charCount}/{maxChars}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {panelView === 'faq' && (
            <div className="aru-ai-chat__secondary">
              <button type="button" className="aru-ai-chat__back" onClick={() => setPanelView('chat')}>
                ← Back to chat
              </button>
              <h3>Frequently asked questions</h3>
              {faqItems.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p style={{ margin: '8px 0 0', color: '#64748b' }}>{item.a}</p>
                </details>
              ))}
            </div>
          )}

          {panelView === 'settings' && (
            <div className="aru-ai-chat__secondary">
              <button type="button" className="aru-ai-chat__back" onClick={() => setPanelView('chat')}>
                ← Back to chat
              </button>
              <h3>Assistant settings</h3>
              <div className="aru-ai-chat__setting-row">
                <label htmlFor="aru-ai-suggestions">Show suggestion chips</label>
                <input
                  id="aru-ai-suggestions"
                  type="checkbox"
                  checked={settings.showSuggestionChips}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, showSuggestionChips: e.target.checked }))
                  }
                />
              </div>
              <div className="aru-ai-chat__setting-row">
                <label htmlFor="aru-ai-counter">Character counter</label>
                <input
                  id="aru-ai-counter"
                  type="checkbox"
                  checked={settings.showCharCounter}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, showCharCounter: e.target.checked }))
                  }
                />
              </div>
              <div className="aru-ai-chat__setting-row">
                <label htmlFor="aru-ai-compact">Compact input (1 row)</label>
                <input
                  id="aru-ai-compact"
                  type="checkbox"
                  checked={settings.compactInput}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, compactInput: e.target.checked }))
                  }
                />
              </div>
              <p style={{ marginTop: 16, fontSize: '0.82rem', color: '#94a3b8' }}>
                Context: <strong>{context}</strong> (auto-detected from your account or page)
              </p>
            </div>
          )}
        </div>
      )}

      <div className="aru-ai-chat__fab-wrap">
        <span className="aru-ai-chat__tooltip">Need help?</span>
        <button
          type="button"
          className="aru-ai-chat__fab"
          onClick={() => (open ? handleClose() : handleOpen())}
          aria-expanded={open}
          aria-label={open ? 'Close ARU AI Assistant' : 'Open ARU AI Assistant'}
        >
          <span className="aru-ai-chat__fab-icon">🤖</span>
          {hasUnread && <span className="aru-ai-chat__badge">!</span>}
        </button>
      </div>
    </div>
  );
}
