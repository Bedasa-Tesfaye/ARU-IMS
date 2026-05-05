import React, { useMemo, useState } from 'react';
import { superAdminAPI } from '../../../services/http';

const PORTAL_URL = 'https://aru-ims.edu.et/login';

const CredentialsModal = ({ credential, onClose, onRegisterAnother, onViewAllUsers }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');

  const roleLabel = credential?.role || 'user';

  const emailBody = useMemo(() => {
    const name = credential?.name || 'User';
    const email = credential?.email || '';
    const password = credential?.password || '';
    return `Dear ${name},

Your account has been created on the Arsi University Internship Management System.

━━━━━━━━━━━━━━━━━━━━━━
YOUR LOGIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━

🔗 Portal: ${PORTAL_URL}
📧 Email: ${email}
🔑 Password: ${password}

━━━━━━━━━━━━━━━━━━━━━━

⚠️ IMPORTANT:
• Change your password on first login
• Password expires in 90 days
• Do not share your credentials

📞 Need Help?
it.support@arsi.edu.et | +251-XXX-XXXXXX

Best regards,
ARU IMS Administration`;
  }, [credential]);

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text);
    setStatus('Copied to clipboard.');
  };

  const copyAllBlock = async () => {
    await navigator.clipboard.writeText(emailBody);
    setStatus('Full credential brief copied.');
  };

  const downloadTxt = () => {
    const blob = new Blob([emailBody], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(credential?.name || 'credentials').replace(/\s+/g, '_').toLowerCase()}_aru_ims_credentials.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printCredentials = () => {
    const w = window.open('', '_blank', 'width=760,height=640');
    if (!w) return;
    w.document.write(
      `<!DOCTYPE html><html><head><title>ARU IMS Credentials</title>
      <style>body{font-family:system-ui,sans-serif;padding:24px;color:#0f172a} pre{white-space:pre-wrap;font-size:14px}</style>
      </head><body><pre>${emailBody.replace(/</g, '&lt;')}</pre></body></html>`
    );
    w.document.close();
    w.focus();
    w.print();
  };

  const openMailto = () => {
    const subject = encodeURIComponent('Your ARU IMS Account Credentials 🎓');
    const body = encodeURIComponent(emailBody);
    window.location.href = `mailto:${credential?.email || ''}?subject=${subject}&body=${body}`;
    setStatus('Opened your email client with a pre-filled message.');
  };

  const sendServerEmail = async () => {
    setSending(true);
    setStatus('');
    try {
      await superAdminAPI.sendCredentialsEmail({
        name: credential?.name,
        email: credential?.email,
        password: credential?.password,
      });
      setStatus('Credential email queued successfully.');
    } catch (error) {
      setStatus(error?.response?.data?.message || 'Server email failed — try Email client.');
    } finally {
      setSending(false);
    }
  };

  if (!credential) return null;

  const dept = credential?.department || credential?.department_name || '—';
  const studentId = credential?.student_id || credential?.studentId || '—';
  const expiry =
    credential?.password_expires_at || credential?.password_expiry || '90 days (policy)';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container credentials-modal sa-credentials-premium" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header sa-cred-header">
          <div>
            <h3>✅ Registration Successful!</h3>
            <p className="sa-cred-sub">Securely share these details with the new account holder.</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body sa-cred-body">
          <section className="sa-cred-card">
            <h4 className="sa-cred-card-title">👤 User details</h4>
            <dl className="sa-cred-dl">
              <div>
                <dt>Name</dt>
                <dd>{credential.name || '—'}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd style={{ textTransform: 'capitalize' }}>{roleLabel}</dd>
              </div>
              <div>
                <dt>Department</dt>
                <dd>{dept}</dd>
              </div>
              <div>
                <dt>Student ID</dt>
                <dd>{studentId}</dd>
              </div>
            </dl>
          </section>

          <section className="sa-cred-card sa-cred-card-accent">
            <h4 className="sa-cred-card-title">🔑 Login credentials</h4>
            <div className="sa-cred-field">
              <span className="sa-cred-label">📧 Email</span>
              <div className="sa-cred-value-row">
                <code>{credential.email}</code>
                <button type="button" className="btn-secondary sa-cred-mini" onClick={() => copyText(credential.email)}>
                  📋 Copy
                </button>
              </div>
            </div>
            <div className="sa-cred-field">
              <span className="sa-cred-label">🔒 Password</span>
              <div className="sa-cred-value-row">
                <code>{showPassword ? credential.password : '••••••••••••'}</code>
                <button type="button" className="btn-secondary sa-cred-mini" onClick={() => setShowPassword((p) => !p)}>
                  {showPassword ? '🙈 Hide' : '👁️ Show'}
                </button>
                <button type="button" className="btn-secondary sa-cred-mini" onClick={() => copyText(credential.password)}>
                  📋 Copy
                </button>
              </div>
            </div>
            <ul className="sa-cred-notes">
              <li>⚠️ Password expires in {typeof expiry === 'string' && expiry.includes('T') ? '90 days' : expiry}</li>
              <li>🔄 Force password change on first login</li>
            </ul>
          </section>

          <section className="sa-cred-card">
            <h4 className="sa-cred-card-title">📤 Quick actions</h4>
            <div className="sa-cred-actions">
              <button type="button" className="btn-secondary" onClick={openMailto}>
                📧 Email client
              </button>
              <button type="button" className="btn-secondary" onClick={sendServerEmail} disabled={sending}>
                {sending ? 'Sending…' : '📤 Send via server'}
              </button>
              <button type="button" className="btn-secondary" onClick={downloadTxt}>
                📥 Download .txt
              </button>
              <button type="button" className="btn-secondary" onClick={copyAllBlock}>
                📋 Copy all
              </button>
              <button type="button" className="btn-secondary" onClick={printCredentials}>
                🖨️ Print
              </button>
            </div>
          </section>

          {status && <p className="credentials-status sa-cred-status">{status}</p>}

          <div className="sa-cred-footer-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                const cred = credential;
                onClose?.();
                onRegisterAnother?.(cred);
              }}
            >
              Register another
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                onClose?.();
                onViewAllUsers?.();
              }}
            >
              View all users
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CredentialsModal;
