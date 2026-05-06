import React from 'react';
import { advisorAPI, aiAdvisorAPI } from '../../../../services/http';
import { reviewPriority } from '../../utils';
import './ApplicationReviews.css';

export default function ApplicationReviews({
  reviewQueue,
  bulkIds,
  toggleBulk,
  runBulkFeedback,
  busyKey,
  setReviewFocus,
  setReviewAi,
  setBusyKey,
  reviewFocus,
  reviewAi,
  showToast,
  loadAll,
}) {
  return (
    <div className="adv-reviews-page">
      <section className="adv-card">
        <div className="adv-toolbar-row">
          <h3>AI-assisted application reviews</h3>
          <button type="button" className="adv-btn secondary adv-btn-sm" onClick={runBulkFeedback} disabled={busyKey === 'bulk'}>
            Bulk request changes ({bulkIds.size})
          </button>
        </div>
        <p className="adv-muted">Queue ordered by submission date — AI prioritizes deadlines under 48 hours.</p>
        <div className="adv-list">
          {reviewQueue.length === 0 && <div className="adv-empty">No pending reviews.</div>}
          {reviewQueue.map((app) => {
            const pr = reviewPriority(app);
            return (
              <div key={app.id} className={`adv-list-item adv-review-row pri-${pr.level}`}>
                <input type="checkbox" checked={bulkIds.has(app.id)} onChange={() => toggleBulk(app.id)} aria-label="Select for bulk" />
                <div className="adv-review-main">
                  <div className="adv-review-who">
                    <strong>
                      {app.student?.first_name} {app.student?.last_name}
                    </strong>
                    <span className={`adv-pri ${pr.level}`}>{pr.label}</span>
                  </div>
                  <small>
                    {app.internship?.company?.name} — {app.internship?.title}
                  </small>
                  <small>Applied {app.applied_date ? new Date(app.applied_date).toLocaleDateString() : '—'}</small>
                </div>
                <div className="adv-inline-actions">
                  <button
                    type="button"
                    className="adv-btn secondary adv-btn-sm"
                    onClick={async () => {
                      setReviewFocus(app);
                      setReviewAi(null);
                      setBusyKey(`rv-${app.id}`);
                      try {
                        const ai = await aiAdvisorAPI.applicationReview({ application_id: app.id });
                        setReviewAi(ai.data);
                      } finally {
                        setBusyKey('');
                      }
                    }}
                  >
                    AI review assistant
                  </button>
                  <button
                    type="button"
                    className="adv-btn adv-btn-sm"
                    onClick={async () => {
                      await advisorAPI.reviewApplication(app.id, {
                        decision: 'approve_notes',
                        advisor_feedback: 'Strong submission — proceed before deadline.',
                      });
                      showToast('Review recorded.');
                      loadAll();
                    }}
                  >
                    Approve notes
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="adv-card">
        <h4>Review history & consistency</h4>
        <p className="adv-muted">AI tracks your review patterns — you typically spend ~12 minutes per review; AI-assisted drafts can reduce time.</p>
      </section>

      {reviewFocus && (
        <div className="adv-modal-overlay" role="dialog" aria-modal="true">
          <div className="adv-modal adv-split-modal">
            <header>
              <h3>Review assistant</h3>
              <button type="button" className="adv-icon-close" onClick={() => setReviewFocus(null)}>
                ×
              </button>
            </header>
            <div className="adv-split">
              <div className="adv-split-left">
                <h4>Application documents</h4>
                <p className="adv-muted">Resume path: {reviewFocus.resume_path || 'On file'}</p>
                <p>{reviewFocus.cover_letter ? `${reviewFocus.cover_letter.slice(0, 480)}…` : 'No cover letter text.'}</p>
              </div>
              <div className="adv-split-right">
                <h4>AI analysis</h4>
                {!reviewAi && <p className="adv-processing">Running AI pre-review…</p>}
                {reviewAi && (
                  <>
                    <p>
                      Resume match: <strong>{reviewAi.resume_match_pct}%</strong>
                    </p>
                    <p>Missing keywords: {(reviewAi.missing_keywords || []).join(', ')}</p>
                    <p>{reviewAi.cover_letter_quality}</p>
                    <ul>
                      {(reviewAi.suggested_improvements || []).map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                    <textarea className="adv-feedback-draft" defaultValue={reviewAi.draft_feedback || ''} rows={5} />
                    <button type="button" className="adv-btn" onClick={() => showToast('Feedback copied to clipboard (demo).')}>
                      Use draft feedback
                    </button>
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
