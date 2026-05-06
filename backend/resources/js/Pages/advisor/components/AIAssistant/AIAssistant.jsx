import React from 'react';
import { aiAdvisorAPI } from '../../../../services/http';
import './AIAssistant.css';

export default function AIAssistant({ aiChat, setAiChat, aiInput, setAiInput, sendAi, busyKey }) {
  return (
    <section className="adv-card adv-ai-page">
      <h3>Advisor AI co-pilot</h3>
      <p className="adv-muted">Prepare meetings, draft feedback, analyze cohorts, and curate resources.</p>
      <div className="adv-ai-quick">
        {['Weekly cohort summary', 'Mock interview outline', 'Email to nudge inactive students'].map((q) => (
          <button key={q} type="button" className="adv-chip" onClick={() => setAiInput(q)}>
            {q}
          </button>
        ))}
      </div>
      <div className="adv-chat">
        {aiChat.map((m, i) => (
          <div key={i} className={`adv-chat-bubble ${m.role === 'user' ? 'user' : 'ai'}`}>
            {m.text}
          </div>
        ))}
        {busyKey === 'ai-chat' && <div className="adv-processing">AI is thinking…</div>}
      </div>
      <div className="adv-chat-input">
        <input value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="Ask your advisor AI…" onKeyDown={(e) => e.key === 'Enter' && sendAi()} />
        <button type="button" className="adv-btn" onClick={sendAi}>
          Send
        </button>
      </div>
      <div className="adv-inline-actions">
        <button
          type="button"
          className="adv-btn secondary"
          onClick={async () => {
            const s = await aiAdvisorAPI.mentoringStrategy({});
            setAiChat((p) => [...p, { role: 'ai', text: (s.data?.strategies || []).join('\n') }]);
          }}
        >
          Mentoring strategies
        </button>
        <button
          type="button"
          className="adv-btn secondary"
          onClick={async () => {
            const t = await aiAdvisorAPI.trends();
            setAiChat((p) => [...p, { role: 'ai', text: `Trending skills: ${(t.data?.skills_in_demand || []).join(', ')}` }]);
          }}
        >
          Industry trends
        </button>
      </div>
    </section>
  );
}
