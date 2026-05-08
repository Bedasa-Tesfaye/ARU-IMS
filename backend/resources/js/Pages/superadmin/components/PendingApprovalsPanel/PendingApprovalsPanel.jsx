import React, { useEffect, useMemo, useState } from 'react';
import { internshipAPI, superAdminAPI } from '../../../../services/http';
import './PendingApprovalsPanel.css';

const TABS = {
  partners: { id: 'partners', label: 'Become Partner Requests', icon: '🤝' },
  internships: { id: 'internships', label: 'Internship Post Requests', icon: '🧾' },
};

const safe = (v, fallback = '—') => (v === null || v === undefined || v === '' ? fallback : v);

const PendingApprovalsPanel = ({ onSuccess, onError, onActivity, onCredentialsGenerated }) => {
  const [activeTab, setActiveTab] = useState(TABS.partners.id);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState(null);

  const [partnerRequests, setPartnerRequests] = useState([]);
  const [partnerPagination, setPartnerPagination] = useState(null);
  const [selectedPartnerIds, setSelectedPartnerIds] = useState(() => new Set());

  const [internshipQueue, setInternshipQueue] = useState([]);
  const [internshipPagination, setInternshipPagination] = useState(null);
  const [selectedInternshipIds, setSelectedInternshipIds] = useState(() => new Set());

  const [selected, setSelected] = useState(null); // { type, data }
  const [rejectDialog, setRejectDialog] = useState(null); // { type, data }
  const [rejectReason, setRejectReason] = useState('');
  const [approveNotes, setApproveNotes] = useState('');
  const [editDialog, setEditDialog] = useState(null); // { type, data }
  const [editNotes, setEditNotes] = useState('');

  const partnerPendingCount = useMemo(() => (partnerPagination?.total ?? partnerRequests.length), [partnerPagination, partnerRequests.length]);
  const internshipPendingCount = useMemo(() => (internshipPagination?.total ?? internshipQueue.length), [internshipPagination, internshipQueue.length]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await superAdminAPI.getApprovalsHistory({ days: 30 });
      setHistory(res.data || null);
    } catch (err) {
      setHistory(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadPartnerRequests = async (page = 1) => {
    const res = await superAdminAPI.getPartnerRequests({ status: 'pending', page });
    const payload = res.data;
    setPartnerRequests(payload?.data || []);
    setPartnerPagination({
      total: payload?.total,
      current_page: payload?.current_page,
      last_page: payload?.last_page,
    });
    setSelectedPartnerIds(new Set());
  };

  const loadInternshipQueue = async (page = 1) => {
    const res = await internshipAPI.getApprovalQueue({ page });
    const payload = res.data;
    setInternshipQueue(payload?.data || []);
    setInternshipPagination({
      total: payload?.total,
      current_page: payload?.current_page,
      last_page: payload?.last_page,
    });
    setSelectedInternshipIds(new Set());
  };

  const reloadActive = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPartnerRequests(partnerPagination?.current_page || 1),
        loadInternshipQueue(internshipPagination?.current_page || 1),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadActive();
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approvePartner = async (request) => {
    setLoading(true);
    try {
      const res = await superAdminAPI.approvePartnerRequest(request.id, { notes: approveNotes || undefined });
      const creds = res.data?.credentials;
      if (creds?.email && creds?.password && typeof onCredentialsGenerated === 'function') {
        onCredentialsGenerated({
          name: request.contact_person || request.company_name,
          email: creds.email,
          password: creds.password,
        });
      }
      if (typeof onSuccess === 'function') onSuccess('Partner request approved successfully.');
      if (typeof onActivity === 'function') onActivity('✅', `Partner approved: ${request.company_name}`);
      setSelected(null);
      setApproveNotes('');
      await loadHistory();
      await loadPartnerRequests(partnerPagination?.current_page || 1);
    } catch (err) {
      if (typeof onError === 'function') onError(err.response?.data?.message || 'Failed to approve partner request.');
    } finally {
      setLoading(false);
    }
  };

  const rejectPartner = async (request, reason) => {
    setLoading(true);
    try {
      await superAdminAPI.rejectPartnerRequest(request.id, { reason });
      if (typeof onSuccess === 'function') onSuccess('Partner request rejected successfully.');
      if (typeof onActivity === 'function') onActivity('🚫', `Partner rejected: ${request.company_name}`);
      setRejectDialog(null);
      setRejectReason('');
      setSelected(null);
      await loadHistory();
      await loadPartnerRequests(partnerPagination?.current_page || 1);
    } catch (err) {
      if (typeof onError === 'function') onError(err.response?.data?.message || 'Failed to reject partner request.');
    } finally {
      setLoading(false);
    }
  };

  const approveInternship = async (internship) => {
    setLoading(true);
    try {
      await internshipAPI.reviewSubmission(internship.id, { action: 'approve' });
      if (typeof onSuccess === 'function') onSuccess('Internship post approved and published.');
      if (typeof onActivity === 'function') onActivity('✅', `Internship approved: ${internship.title}`);
      setSelected(null);
      await loadHistory();
      await loadInternshipQueue(internshipPagination?.current_page || 1);
    } catch (err) {
      if (typeof onError === 'function') onError(err.response?.data?.message || 'Failed to approve internship post.');
    } finally {
      setLoading(false);
    }
  };

  const rejectInternship = async (internship, reason) => {
    setLoading(true);
    try {
      await internshipAPI.reviewSubmission(internship.id, { action: 'reject', review_notes: reason });
      if (typeof onSuccess === 'function') onSuccess('Internship post rejected.');
      if (typeof onActivity === 'function') onActivity('🚫', `Internship rejected: ${internship.title}`);
      setRejectDialog(null);
      setRejectReason('');
      setSelected(null);
      await loadHistory();
      await loadInternshipQueue(internshipPagination?.current_page || 1);
    } catch (err) {
      if (typeof onError === 'function') onError(err.response?.data?.message || 'Failed to reject internship post.');
    } finally {
      setLoading(false);
    }
  };

  const openReject = (type, data) => {
    setRejectDialog({ type, data });
    setRejectReason('');
  };

  const openBulkReject = (type) => {
    const ids = type === 'partner' ? Array.from(selectedPartnerIds) : Array.from(selectedInternshipIds);
    if (!ids.length) return;
    setRejectDialog({ type: `${type}_bulk`, data: ids });
    setRejectReason('');
  };

  const openEdit = (type, data) => {
    setEditDialog({ type, data });
    setEditNotes('');
  };

  const requestPartnerEdit = async (request, notes) => {
    setLoading(true);
    try {
      await superAdminAPI.requestPartnerEdit(request.id, { notes });
      onSuccess?.('Edit request sent to partner.');
      onActivity?.('✉️', `Edit requested: ${request.company_name}`);
      setEditDialog(null);
      setEditNotes('');
      setSelected(null);
      await loadPartnerRequests(partnerPagination?.current_page || 1);
    } catch (err) {
      onError?.(err.response?.data?.message || 'Failed to request partner edit.');
    } finally {
      setLoading(false);
    }
  };

  const requestInternshipEdit = async (internship, notes) => {
    setLoading(true);
    try {
      await internshipAPI.reviewSubmission(internship.id, { action: 'improvement', review_notes: notes });
      onSuccess?.('Improvement request sent to company.');
      onActivity?.('✉️', `Improvement requested: ${internship.title}`);
      setEditDialog(null);
      setEditNotes('');
      setSelected(null);
      await loadInternshipQueue(internshipPagination?.current_page || 1);
    } catch (err) {
      onError?.(err.response?.data?.message || 'Failed to request internship edit.');
    } finally {
      setLoading(false);
    }
  };

  const partnerScore = (r) => {
    let score = 40;
    if (r.company_email) score += 10;
    if (r.website) score += 10;
    if (r.phone) score += 8;
    if (r.contact_person) score += 10;
    if (r.field_of_interest) score += 8;
    if (r.city) score += 7;
    if (r.country_region) score += 7;
    return Math.min(100, score);
  };

  const partnerAnalysis = (r) => {
    const score = partnerScore(r);
    const strengths = [];
    const gaps = [];
    if (r.company_email) strengths.push('Has a reachable company email');
    else gaps.push('Missing company email');
    if (r.website) strengths.push('Includes website');
    else gaps.push('Missing website');
    if (r.phone) strengths.push('Has phone contact');
    else gaps.push('Missing phone contact');
    if (r.contact_person) strengths.push('Has named contact person');
    else gaps.push('Missing contact person');
    if (r.field_of_interest) strengths.push('Industry field provided');
    else gaps.push('Missing industry field');
    if (r.city) strengths.push('City provided');
    else gaps.push('Missing city');
    const verdict = score >= 85 ? 'Approve' : score >= 70 ? 'Review' : 'Caution';
    return { score, verdict, strengths, gaps };
  };

  const internshipScore = (i) => {
    let score = 35;
    if (i.title) score += 10;
    if (i.company?.name) score += 8;
    if (i.program_field) score += 10;
    if (i.work_modality) score += 7;
    if (i.type) score += 6;
    if (i.description && String(i.description).length >= 120) score += 14;
    if (i.requirements && String(i.requirements).length >= 40) score += 10;
    return Math.min(100, score);
  };

  const internshipAnalysis = (i) => {
    const score = internshipScore(i);
    const strengths = [];
    const gaps = [];
    if (i.title) strengths.push('Title present');
    else gaps.push('Missing title');
    if (i.program_field) strengths.push('Program field provided');
    else gaps.push('Missing program field');
    if (i.description && String(i.description).length >= 120) strengths.push('Description is detailed');
    else gaps.push('Description is too short');
    if (i.requirements && String(i.requirements).length >= 40) strengths.push('Requirements provided');
    else gaps.push('Missing or short requirements');
    const verdict = score >= 85 ? 'Approve' : score >= 70 ? 'Review' : 'Caution';
    return { score, verdict, strengths, gaps };
  };

  const togglePartner = (id) => {
    setSelectedPartnerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleInternship = (id) => {
    setSelectedInternshipIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllPartners = () => {
    const ids = partnerRequests.map((r) => r.id);
    setSelectedPartnerIds((prev) => {
      const allSelected = ids.length && ids.every((id) => prev.has(id));
      return allSelected ? new Set() : new Set(ids);
    });
  };

  const toggleAllInternships = () => {
    const ids = internshipQueue.map((i) => i.id);
    setSelectedInternshipIds((prev) => {
      const allSelected = ids.length && ids.every((id) => prev.has(id));
      return allSelected ? new Set() : new Set(ids);
    });
  };

  const bulkApprovePartners = async () => {
    const ids = Array.from(selectedPartnerIds);
    if (!ids.length) return;
    setLoading(true);
    try {
      for (const id of ids) {
        const res = await superAdminAPI.approvePartnerRequest(id, {});
        const creds = res.data?.credentials;
        if (creds?.email && creds?.password && typeof onCredentialsGenerated === 'function') {
          const row = partnerRequests.find((r) => r.id === id);
          onCredentialsGenerated({
            name: row?.contact_person || row?.company_name || creds.email,
            email: creds.email,
            password: creds.password,
          });
        }
      }
      onSuccess?.(`Approved ${ids.length} partner request(s).`);
      onActivity?.('✅', `Bulk approved ${ids.length} partners`);
      await loadHistory();
      await loadPartnerRequests(partnerPagination?.current_page || 1);
    } catch (err) {
      onError?.(err.response?.data?.message || 'Bulk approve failed.');
    } finally {
      setLoading(false);
    }
  };

  const bulkApproveInternships = async () => {
    const ids = Array.from(selectedInternshipIds);
    if (!ids.length) return;
    setLoading(true);
    try {
      await Promise.all(ids.map((id) => internshipAPI.reviewSubmission(id, { action: 'approve' })));
      onSuccess?.(`Approved ${ids.length} internship post(s).`);
      onActivity?.('✅', `Bulk approved ${ids.length} internships`);
      await loadHistory();
      await loadInternshipQueue(internshipPagination?.current_page || 1);
    } catch (err) {
      onError?.(err.response?.data?.message || 'Bulk approve failed.');
    } finally {
      setLoading(false);
    }
  };

  const renderPartnerList = () => (
    <div className="sa-approvals-list">
      <div className="sa-approvals-toolbar">
        <div className="sa-approvals-title">
          <h3>🤝 Become Partner Requests</h3>
          <p>Review company partnership requests submitted from the landing page.</p>
        </div>
        <div className="sa-approvals-actions">
          {selectedPartnerIds.size > 0 && (
            <>
              <button type="button" className="sa-btn-secondary" onClick={bulkApprovePartners} disabled={loading}>
                Approve selected ({selectedPartnerIds.size})
              </button>
              <button type="button" className="sa-btn-danger" onClick={() => openBulkReject('partner')} disabled={loading}>
                Reject selected
              </button>
            </>
          )}
          <button type="button" className="sa-btn-secondary" onClick={reloadActive} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {partnerRequests.length === 0 ? (
        <div className="sa-empty-panel">
          <h3>No pending partner requests</h3>
          <p>When companies submit partnership requests, they’ll appear here for review.</p>
        </div>
      ) : (
        <>
          <div className="sa-approvals-selectall">
            <label>
              <input
                type="checkbox"
                checked={partnerRequests.length > 0 && partnerRequests.every((r) => selectedPartnerIds.has(r.id))}
                onChange={toggleAllPartners}
              />
              Select all on page
            </label>
          </div>
          <div className="sa-approvals-cards">
            {partnerRequests.map((r) => {
              const score = partnerScore(r);
              const tone = score >= 85 ? 'good' : score >= 70 ? 'warn' : 'danger';
              const rec = score >= 85 ? 'Approve' : score >= 70 ? 'Review' : 'Caution';
              return (
                <div key={r.id} className="sa-approval-card">
                  <div className="sa-approval-main">
                    <div className="sa-approval-heading">
                      <strong>{safe(r.company_name)}</strong>
                      <span className="sa-approval-meta">{safe(r.company_email)}</span>
                    </div>
                    <div className="sa-approval-ai">
                      <span className={`sa-ai-score ${tone}`}>AI score: {score}</span>
                      <span className={`sa-ai-badge ${tone}`}>{rec}</span>
                    </div>
                    <div className="sa-approval-grid">
                      <div><span>Contact</span><b>{safe(r.contact_person)}</b></div>
                      <div><span>Phone</span><b>{safe(r.phone)}</b></div>
                      <div><span>City</span><b>{safe(r.city)}</b></div>
                      <div><span>Industry</span><b>{safe(r.field_of_interest)}</b></div>
                    </div>
                  </div>

                  <div className="sa-approval-actions">
                    <label className="sa-select-box">
                      <input type="checkbox" checked={selectedPartnerIds.has(r.id)} onChange={() => togglePartner(r.id)} />
                      Select
                    </label>
                    <button type="button" className="sa-btn-secondary" onClick={() => setSelected({ type: 'partner', data: r })}>
                      View
                    </button>
                    <button type="button" className="sa-btn-secondary" onClick={() => openEdit('partner', r)} disabled={loading}>
                      Request Edit
                    </button>
                    <button type="button" className="sa-btn-primary" onClick={() => approvePartner(r)} disabled={loading}>
                      Approve
                    </button>
                    <button type="button" className="sa-btn-danger" onClick={() => openReject('partner', r)} disabled={loading}>
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  const renderInternshipList = () => (
    <div className="sa-approvals-list">
      <div className="sa-approvals-toolbar">
        <div className="sa-approvals-title">
          <h3>🧾 Internship Post Requests</h3>
          <p>Review internship listings submitted by partner companies before publishing.</p>
        </div>
        <div className="sa-approvals-actions">
          {selectedInternshipIds.size > 0 && (
            <>
              <button type="button" className="sa-btn-secondary" onClick={bulkApproveInternships} disabled={loading}>
                Approve selected ({selectedInternshipIds.size})
              </button>
              <button type="button" className="sa-btn-danger" onClick={() => openBulkReject('internship')} disabled={loading}>
                Reject selected
              </button>
            </>
          )}
          <button type="button" className="sa-btn-secondary" onClick={reloadActive} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {internshipQueue.length === 0 ? (
        <div className="sa-empty-panel">
          <h3>No pending internship posts</h3>
          <p>New internship posts will appear here until approved.</p>
        </div>
      ) : (
        <>
          <div className="sa-approvals-selectall">
            <label>
              <input
                type="checkbox"
                checked={internshipQueue.length > 0 && internshipQueue.every((r) => selectedInternshipIds.has(r.id))}
                onChange={toggleAllInternships}
              />
              Select all on page
            </label>
          </div>
          <div className="sa-approvals-cards">
            {internshipQueue.map((i) => {
              const score = internshipScore(i);
              const tone = score >= 85 ? 'good' : score >= 70 ? 'warn' : 'danger';
              const rec = score >= 85 ? 'Approve' : score >= 70 ? 'Review' : 'Caution';
              return (
                <div key={i.id} className="sa-approval-card">
                  <div className="sa-approval-main">
                    <div className="sa-approval-heading">
                      <strong>{safe(i.title)}</strong>
                      <span className="sa-approval-meta">{safe(i.company?.name, 'Company')}</span>
                    </div>
                    <div className="sa-approval-ai">
                      <span className={`sa-ai-score ${tone}`}>AI score: {score}</span>
                      <span className={`sa-ai-badge ${tone}`}>{rec}</span>
                    </div>
                    <div className="sa-approval-grid">
                      <div><span>Field</span><b>{safe(i.program_field)}</b></div>
                      <div><span>Modality</span><b>{safe(i.work_modality)}</b></div>
                      <div><span>Type</span><b>{safe(i.type)}</b></div>
                      <div><span>Status</span><b>{safe(i.submission_status)}</b></div>
                    </div>
                  </div>

                  <div className="sa-approval-actions">
                    <label className="sa-select-box">
                      <input type="checkbox" checked={selectedInternshipIds.has(i.id)} onChange={() => toggleInternship(i.id)} />
                      Select
                    </label>
                    <button type="button" className="sa-btn-secondary" onClick={() => setSelected({ type: 'internship', data: i })}>
                      View
                    </button>
                    <button type="button" className="sa-btn-secondary" onClick={() => openEdit('internship', i)} disabled={loading}>
                      Request Edit
                    </button>
                    <button type="button" className="sa-btn-primary" onClick={() => approveInternship(i)} disabled={loading}>
                      Approve
                    </button>
                    <button type="button" className="sa-btn-danger" onClick={() => openReject('internship', i)} disabled={loading}>
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  const timelineRows = useMemo(() => {
    const rows = Array.isArray(history?.timeline) ? history.timeline : [];
    return rows.slice(-14);
  }, [history]);

  const totals = history?.totals || {};
  const metrics = history?.metrics || {};
  const reasons = history?.top_reasons || {};

  return (
    <div className="sa-approvals">
      <div className="sa-approvals-tabs">
        <button
          type="button"
          className={`sa-tab ${activeTab === TABS.partners.id ? 'active' : ''}`}
          onClick={() => setActiveTab(TABS.partners.id)}
        >
          <span className="sa-tab-icon">{TABS.partners.icon}</span>
          <span className="sa-tab-label">{TABS.partners.label}</span>
          <span className="sa-tab-badge">{partnerPendingCount}</span>
        </button>
        <button
          type="button"
          className={`sa-tab ${activeTab === TABS.internships.id ? 'active' : ''}`}
          onClick={() => setActiveTab(TABS.internships.id)}
        >
          <span className="sa-tab-icon">{TABS.internships.icon}</span>
          <span className="sa-tab-label">{TABS.internships.label}</span>
          <span className="sa-tab-badge">{internshipPendingCount}</span>
        </button>
      </div>

      <div className="sa-approvals-content">
        {activeTab === TABS.partners.id ? renderPartnerList() : renderInternshipList()}
      </div>

      <section className="sa-approvals-history">
        <div className="sa-approvals-history-head">
          <div>
            <h3>📈 Approval history &amp; analytics</h3>
            <p>Last 30 days overview (partners + internships).</p>
          </div>
          <button type="button" className="sa-btn-secondary" onClick={loadHistory} disabled={historyLoading}>
            {historyLoading ? 'Loading…' : 'Refresh analytics'}
          </button>
        </div>

        {historyLoading ? (
          <div className="sa-history-skeleton">
            <div className="sa-skel-row" />
            <div className="sa-skel-row" />
            <div className="sa-skel-row" />
          </div>
        ) : (
          <>
            <div className="sa-history-kpis">
              <div className="sa-kpi">
                <span>Partners approved</span>
                <strong>{totals.partner_approved ?? 0}</strong>
              </div>
              <div className="sa-kpi">
                <span>Partners rejected</span>
                <strong>{totals.partner_rejected ?? 0}</strong>
              </div>
              <div className="sa-kpi">
                <span>Internships approved</span>
                <strong>{totals.internship_approved ?? 0}</strong>
              </div>
              <div className="sa-kpi">
                <span>Internships rejected</span>
                <strong>{totals.internship_rejected ?? 0}</strong>
              </div>
            </div>

            <div className="sa-history-kpis">
              <div className="sa-kpi">
                <span>Avg partner review (hrs)</span>
                <strong>{metrics.avg_partner_review_hours ?? '—'}</strong>
              </div>
              <div className="sa-kpi">
                <span>Avg internship review (hrs)</span>
                <strong>{metrics.avg_internship_review_hours ?? '—'}</strong>
              </div>
              <div className="sa-kpi">
                <span>Internship improvement requests</span>
                <strong>{totals.internship_improvement ?? 0}</strong>
              </div>
              <div className="sa-kpi">
                <span>Window</span>
                <strong>{history?.window_days ?? 30} days</strong>
              </div>
            </div>

            <div className="sa-history-charts">
              <div className="sa-history-chart">
                <h4>Daily decisions (last 14 days)</h4>
                {!timelineRows.length ? (
                  <div className="sa-muted">No history in this window.</div>
                ) : (
                  <div className="sa-mini-bars" aria-label="Daily approval counts">
                    {timelineRows.map((r) => {
                      const total = (r.partner_approved || 0) + (r.partner_rejected || 0) + (r.internship_approved || 0) + (r.internship_rejected || 0) + (r.internship_improvement || 0);
                      const h = Math.min(100, (total / Math.max(1, history?.max_daily_total || 1)) * 100);
                      return (
                        <div key={r.date} className="sa-mini-bar-wrap" title={`${r.date}: ${total}`}>
                          <div className="sa-mini-bar" style={{ height: `${h}%` }} />
                          <span className="sa-mini-label">{String(r.date).slice(5)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="sa-history-chart">
                <h4>Top rejection reasons (partners)</h4>
                <ul className="sa-history-reasons">
                  {(reasons.partner || []).slice(0, 5).map((x, idx) => (
                    <li key={`${x.reason}-${idx}`}>
                      <span>{x.reason}</span>
                      <b>{x.count}</b>
                    </li>
                  ))}
                  {(!reasons.partner || reasons.partner.length === 0) && <li className="sa-muted">No partner rejections recorded.</li>}
                </ul>
              </div>
            </div>
          </>
        )}
      </section>

      {selected && (
        <div className="sa-modal-overlay" onClick={() => setSelected(null)} role="dialog" aria-modal="true">
          <div className="sa-modal sa-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3>{selected.type === 'partner' ? 'Partner Request Details' : 'Internship Post Details'}</h3>
              <button type="button" className="sa-modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="sa-modal-body">
              {selected.type === 'partner' ? (
                <>
                  <div className="sa-detail-grid">
                    <div><span>Company</span><b>{safe(selected.data.company_name)}</b></div>
                    <div><span>Email</span><b>{safe(selected.data.company_email)}</b></div>
                    <div><span>Contact</span><b>{safe(selected.data.contact_person)}</b></div>
                    <div><span>Phone</span><b>{safe(selected.data.phone)}</b></div>
                    <div><span>Website</span><b>{safe(selected.data.website)}</b></div>
                    <div><span>Location</span><b>{[selected.data.city, selected.data.state, selected.data.country_region].filter(Boolean).join(', ') || '—'}</b></div>
                    <div><span>Field</span><b>{safe(selected.data.field_of_interest)}</b></div>
                  </div>
                  <div className="sa-detail-block">
                    <label>AI analysis</label>
                    {(() => {
                      const a = partnerAnalysis(selected.data);
                      return (
                        <div className="sa-detail-text">
                          <div style={{ fontWeight: 900, marginBottom: '0.35rem' }}>
                            Score: {a.score}/100 · Recommendation: {a.verdict}
                          </div>
                          <div style={{ display: 'grid', gap: '0.25rem' }}>
                            {a.gaps.slice(0, 4).map((g) => <div key={g}>⚠️ {g}</div>)}
                            {a.strengths.slice(0, 3).map((s) => <div key={s}>✅ {s}</div>)}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="sa-detail-block">
                    <label>Approval notes (optional)</label>
                    <textarea
                      className="sa-textarea"
                      rows={4}
                      value={approveNotes}
                      onChange={(e) => setApproveNotes(e.target.value)}
                      placeholder="Optional notes for audit..."
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="sa-detail-grid">
                    <div><span>Title</span><b>{safe(selected.data.title)}</b></div>
                    <div><span>Company</span><b>{safe(selected.data.company?.name)}</b></div>
                    <div><span>Field</span><b>{safe(selected.data.program_field)}</b></div>
                    <div><span>Type</span><b>{safe(selected.data.type)}</b></div>
                    <div><span>Work modality</span><b>{safe(selected.data.work_modality)}</b></div>
                    <div><span>Submission status</span><b>{safe(selected.data.submission_status)}</b></div>
                  </div>
                  <div className="sa-detail-block">
                    <label>Description</label>
                    <div className="sa-detail-text">{safe(selected.data.description)}</div>
                  </div>
                  <div className="sa-detail-block">
                    <label>Requirements</label>
                    <div className="sa-detail-text">{safe(selected.data.requirements)}</div>
                  </div>
                  <div className="sa-detail-block">
                    <label>AI analysis</label>
                    {(() => {
                      const a = internshipAnalysis(selected.data);
                      return (
                        <div className="sa-detail-text">
                          <div style={{ fontWeight: 900, marginBottom: '0.35rem' }}>
                            Score: {a.score}/100 · Recommendation: {a.verdict}
                          </div>
                          <div style={{ display: 'grid', gap: '0.25rem' }}>
                            {a.gaps.slice(0, 4).map((g) => <div key={g}>⚠️ {g}</div>)}
                            {a.strengths.slice(0, 3).map((s) => <div key={s}>✅ {s}</div>)}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </>
              )}
            </div>
            <div className="sa-modal-footer">
              {selected.type === 'partner' ? (
                <>
                  <button type="button" className="sa-btn-secondary" onClick={() => setSelected(null)}>Close</button>
                  <button type="button" className="sa-btn-secondary" onClick={() => openEdit('partner', selected.data)} disabled={loading}>
                    Request Edit
                  </button>
                  <button type="button" className="sa-btn-danger" onClick={() => openReject('partner', selected.data)} disabled={loading}>
                    Reject
                  </button>
                  <button type="button" className="sa-btn-primary" onClick={() => approvePartner(selected.data)} disabled={loading}>
                    Approve
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="sa-btn-secondary" onClick={() => setSelected(null)}>Close</button>
                  <button type="button" className="sa-btn-secondary" onClick={() => openEdit('internship', selected.data)} disabled={loading}>
                    Request Edit
                  </button>
                  <button type="button" className="sa-btn-danger" onClick={() => openReject('internship', selected.data)} disabled={loading}>
                    Reject
                  </button>
                  <button type="button" className="sa-btn-primary" onClick={() => approveInternship(selected.data)} disabled={loading}>
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {rejectDialog && (
        <div className="sa-modal-overlay" onClick={() => setRejectDialog(null)} role="dialog" aria-modal="true">
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3>
                Reject{' '}
                {rejectDialog.type === 'partner' || rejectDialog.type === 'partner_bulk'
                  ? 'Partner Request'
                  : 'Internship Post'}
              </h3>
              <button type="button" className="sa-modal-close" onClick={() => setRejectDialog(null)}>✕</button>
            </div>
            <div className="sa-modal-body">
              <p className="sa-reject-hint">A rejection reason is required and will be saved for audit purposes.</p>
              <textarea
                className="sa-textarea"
                rows={5}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Write the rejection reason..."
              />
            </div>
            <div className="sa-modal-footer">
              <button type="button" className="sa-btn-secondary" onClick={() => setRejectDialog(null)}>Cancel</button>
              <button
                type="button"
                className="sa-btn-danger"
                disabled={loading || rejectReason.trim().length === 0}
                onClick={() => {
                  const reason = rejectReason.trim();
                  if (rejectDialog.type === 'partner') rejectPartner(rejectDialog.data, reason);
                  else if (rejectDialog.type === 'internship') rejectInternship(rejectDialog.data, reason);
                  else if (rejectDialog.type === 'partner_bulk') {
                    const ids = Array.isArray(rejectDialog.data) ? rejectDialog.data : [];
                    setLoading(true);
                    Promise.all(ids.map((id) => superAdminAPI.rejectPartnerRequest(id, { reason })))
                      .then(async () => {
                        onSuccess?.(`Rejected ${ids.length} partner request(s).`);
                        onActivity?.('🚫', `Bulk rejected ${ids.length} partners`);
                        setRejectDialog(null);
                        setRejectReason('');
                        await loadHistory();
                        await loadPartnerRequests(partnerPagination?.current_page || 1);
                      })
                      .catch((e) => onError?.(e.response?.data?.message || 'Bulk reject failed.'))
                      .finally(() => setLoading(false));
                  } else if (rejectDialog.type === 'internship_bulk') {
                    const ids = Array.isArray(rejectDialog.data) ? rejectDialog.data : [];
                    setLoading(true);
                    Promise.all(ids.map((id) => internshipAPI.reviewSubmission(id, { action: 'reject', review_notes: reason })))
                      .then(async () => {
                        onSuccess?.(`Rejected ${ids.length} internship post(s).`);
                        onActivity?.('🚫', `Bulk rejected ${ids.length} internships`);
                        setRejectDialog(null);
                        setRejectReason('');
                        await loadHistory();
                        await loadInternshipQueue(internshipPagination?.current_page || 1);
                      })
                      .catch((e) => onError?.(e.response?.data?.message || 'Bulk reject failed.'))
                      .finally(() => setLoading(false));
                  }
                }}
              >
                {loading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editDialog && (
        <div className="sa-modal-overlay" onClick={() => setEditDialog(null)} role="dialog" aria-modal="true">
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3>Request edits</h3>
              <button type="button" className="sa-modal-close" onClick={() => setEditDialog(null)}>✕</button>
            </div>
            <div className="sa-modal-body">
              <p className="sa-reject-hint">Write the changes required. This message will be saved for audit and shared with the submitter.</p>
              <textarea
                className="sa-textarea"
                rows={6}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Describe what needs to be fixed..."
              />
            </div>
            <div className="sa-modal-footer">
              <button type="button" className="sa-btn-secondary" onClick={() => setEditDialog(null)} disabled={loading}>Cancel</button>
              <button
                type="button"
                className="sa-btn-primary"
                disabled={loading || editNotes.trim().length < 5}
                onClick={() => {
                  const notes = editNotes.trim();
                  if (editDialog.type === 'partner') requestPartnerEdit(editDialog.data, notes);
                  else requestInternshipEdit(editDialog.data, notes);
                }}
              >
                {loading ? 'Sending...' : 'Send request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApprovalsPanel;

