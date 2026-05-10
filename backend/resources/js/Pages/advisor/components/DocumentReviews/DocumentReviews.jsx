import React from 'react';
import { advisorAPI, aiAdvisorAPI } from '../../../../services/http';
import './DocumentReviews.css';

export default function DocumentReviews({
  documents,
  docFocus,
  setDocFocus,
  docAi,
  setDocAi,
  showToast,
  loadAll,
}) {
  return (
    <div className="adv-doc-page">
      <section className="adv-card">
        <h3>Document review queue</h3>
        <div className="adv-list">
          {documents.length === 0 && <div className="adv-empty">No documents.</div>}
          {documents.map((d) => (
            <div key={d.id} className="adv-list-item">
              <div>
                <strong>{d.title}</strong>
                <small>{d.type}</small>
              </div>
              <div className="adv-inline-actions">
                <button
                  type="button"
                  className="adv-btn secondary adv-btn-sm"
                  onClick={async () => {
                    setDocFocus(d);
                    setDocAi(null);
                    const r = await aiAdvisorAPI.documentReview({ document_id: d.id });
                    setDocAi(r.data);
                  }}
                >
                  AI analysis
                </button>
                <button
                  type="button"
                  className="adv-btn ghost adv-btn-sm"
                  onClick={async () => {
                    try {
                      const res = await advisorAPI.viewDocumentFile(d.id);
                      const type = res.headers?.['content-type'] || 'application/octet-stream';
                      const blob = new Blob([res.data], { type });
                      const url = URL.createObjectURL(blob);
                      window.open(url, '_blank', 'noopener,noreferrer');
                      setTimeout(() => URL.revokeObjectURL(url), 3000);
                    } catch {
                      showToast('Preview not available.', 'error');
                    }
                  }}
                >
                  Preview
                </button>
                <button
                  type="button"
                  className="adv-btn ghost adv-btn-sm"
                  onClick={async () => {
                    try {
                      const res = await advisorAPI.downloadDocument(d.id);
                      const type = res.headers?.['content-type'] || 'application/octet-stream';
                      const blob = new Blob([res.data], { type });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${(d.title || 'document').replace(/\s+/g, '_')}`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      setTimeout(() => URL.revokeObjectURL(url), 0);
                    } catch {
                      showToast('Download failed.', 'error');
                    }
                  }}
                >
                  Download
                </button>
                <button
                  type="button"
                  className="adv-btn adv-btn-sm"
                  onClick={async () => {
                    await advisorAPI.documentFeedback(d.id, { feedback: 'Please tighten summary and add metrics.', status: 'revision_requested' });
                    showToast('Feedback saved.');
                    loadAll();
                  }}
                >
                  Save feedback
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      {docFocus && (
        <div className="adv-modal-overlay" role="dialog">
          <div className="adv-modal adv-split-modal">
            <header>
              <h3>Document AI review</h3>
              <button type="button" className="adv-icon-close" onClick={() => setDocFocus(null)}>
                ×
              </button>
            </header>
            <div className="adv-split">
              <div>
                <p>{docFocus.title}</p>
                <p className="adv-muted">Version tracking & compare available in full IMS module.</p>
              </div>
              <div>
                {!docAi && <p className="adv-processing">Analyzing…</p>}
                {docAi && (
                  <>
                    <p>
                      Score: <strong>{docAi.overall_score}</strong>
                    </p>
                    <p>{docAi.grammar_spelling}</p>
                    <ul>
                      {(docAi.sections || []).map((s) => (
                        <li key={s.name}>
                          {s.name}: {s.score} — {s.tip}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
