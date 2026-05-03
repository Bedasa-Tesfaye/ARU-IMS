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

  const [partnerRequests, setPartnerRequests] = useState([]);
  const [partnerPagination, setPartnerPagination] = useState(null);

  const [internshipQueue, setInternshipQueue] = useState([]);
  const [internshipPagination, setInternshipPagination] = useState(null);

  const [selected, setSelected] = useState(null); // { type, data }
  const [rejectDialog, setRejectDialog] = useState(null); // { type, data }
  const [rejectReason, setRejectReason] = useState('');
  const [approveNotes, setApproveNotes] = useState('');

  const partnerPendingCount = useMemo(() => (partnerPagination?.total ?? partnerRequests.length), [partnerPagination, partnerRequests.length]);
  const internshipPendingCount = useMemo(() => (internshipPagination?.total ?? internshipQueue.length), [internshipPagination, internshipQueue.length]);

  const loadPartnerRequests = async (page = 1) => {
    const res = await superAdminAPI.getPartnerRequests({ status: 'pending', page });
    const payload = res.data;
    setPartnerRequests(payload?.data || []);
    setPartnerPagination({
      total: payload?.total,
      current_page: payload?.current_page,
      last_page: payload?.last_page,
    });
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

  const renderPartnerList = () => (
    <div className="sa-approvals-list">
      <div className="sa-approvals-toolbar">
        <div className="sa-approvals-title">
          <h3>🤝 Become Partner Requests</h3>
          <p>Review company partnership requests submitted from the landing page.</p>
        </div>
        <button type="button" className="btn-secondary" onClick={reloadActive} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {partnerRequests.length === 0 ? (
        <div className="sa-empty-panel">
          <h3>No pending partner requests</h3>
          <p>When companies submit partnership requests, they’ll appear here for review.</p>
        </div>
      ) : (
        <div className="sa-approvals-cards">
          {partnerRequests.map((r) => (
            <div key={r.id} className="sa-approval-card">
              <div className="sa-approval-main">
                <div className="sa-approval-heading">
                  <strong>{safe(r.company_name)}</strong>
                  <span className="sa-approval-meta">{safe(r.company_email)}</span>
                </div>
                <div className="sa-approval-grid">
                  <div><span>Contact</span><b>{safe(r.contact_person)}</b></div>
                  <div><span>Phone</span><b>{safe(r.phone)}</b></div>
                  <div><span>City</span><b>{safe(r.city)}</b></div>
                  <div><span>Industry</span><b>{safe(r.field_of_interest)}</b></div>
                </div>
              </div>

              <div className="sa-approval-actions">
                <button type="button" className="btn-secondary" onClick={() => setSelected({ type: 'partner', data: r })}>
                  View
                </button>
                <button type="button" className="btn-primary" onClick={() => approvePartner(r)} disabled={loading}>
                  Approve
                </button>
                <button type="button" className="btn-danger" onClick={() => openReject('partner', r)} disabled={loading}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
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
        <button type="button" className="btn-secondary" onClick={reloadActive} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {internshipQueue.length === 0 ? (
        <div className="sa-empty-panel">
          <h3>No pending internship posts</h3>
          <p>New internship posts will appear here until approved.</p>
        </div>
      ) : (
        <div className="sa-approvals-cards">
          {internshipQueue.map((i) => (
            <div key={i.id} className="sa-approval-card">
              <div className="sa-approval-main">
                <div className="sa-approval-heading">
                  <strong>{safe(i.title)}</strong>
                  <span className="sa-approval-meta">{safe(i.company?.name, 'Company')}</span>
                </div>
                <div className="sa-approval-grid">
                  <div><span>Field</span><b>{safe(i.program_field)}</b></div>
                  <div><span>Modality</span><b>{safe(i.work_modality)}</b></div>
                  <div><span>Type</span><b>{safe(i.type)}</b></div>
                  <div><span>Status</span><b>{safe(i.submission_status)}</b></div>
                </div>
              </div>

              <div className="sa-approval-actions">
                <button type="button" className="btn-secondary" onClick={() => setSelected({ type: 'internship', data: i })}>
                  View
                </button>
                <button type="button" className="btn-primary" onClick={() => approveInternship(i)} disabled={loading}>
                  Approve
                </button>
                <button type="button" className="btn-danger" onClick={() => openReject('internship', i)} disabled={loading}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

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

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected.type === 'partner' ? 'Partner Request Details' : 'Internship Post Details'}</h3>
              <button type="button" className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
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
                </>
              )}
            </div>
            <div className="modal-footer">
              {selected.type === 'partner' ? (
                <>
                  <button type="button" className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
                  <button type="button" className="btn-danger" onClick={() => openReject('partner', selected.data)} disabled={loading}>
                    Reject
                  </button>
                  <button type="button" className="btn-primary" onClick={() => approvePartner(selected.data)} disabled={loading}>
                    Approve
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
                  <button type="button" className="btn-danger" onClick={() => openReject('internship', selected.data)} disabled={loading}>
                    Reject
                  </button>
                  <button type="button" className="btn-primary" onClick={() => approveInternship(selected.data)} disabled={loading}>
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {rejectDialog && (
        <div className="modal-overlay" onClick={() => setRejectDialog(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header suspend">
              <h3>Reject {rejectDialog.type === 'partner' ? 'Partner Request' : 'Internship Post'}</h3>
              <button type="button" className="modal-close" onClick={() => setRejectDialog(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="sa-reject-hint">A rejection reason is required and will be saved for audit purposes.</p>
              <textarea
                className="sa-textarea"
                rows={5}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Write the rejection reason..."
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setRejectDialog(null)}>Cancel</button>
              <button
                type="button"
                className="btn-danger"
                disabled={loading || rejectReason.trim().length === 0}
                onClick={() => {
                  const reason = rejectReason.trim();
                  if (rejectDialog.type === 'partner') rejectPartner(rejectDialog.data, reason);
                  else rejectInternship(rejectDialog.data, reason);
                }}
              >
                {loading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApprovalsPanel;

