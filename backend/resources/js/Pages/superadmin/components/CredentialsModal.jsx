import React, { useMemo, useState } from 'react';
import { superAdminAPI } from '../../../services/http';

const CredentialsModal = ({ credential, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');

  const lines = useMemo(() => ([
    `User: ${credential?.name || 'N/A'}`,
    `Role: ${credential?.role || 'N/A'}`,
    `Department: ${credential?.department || 'N/A'}`,
    `Email: ${credential?.email || ''}`,
    `Password: ${credential?.password || ''}`,
    `Password expires: ${credential?.password_expires_at || '90 days policy'}`,
  ]), [credential]);

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text);
    setStatus('Copied to clipboard.');
  };

  const downloadTxt = () => {
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(credential?.name || 'credentials').replace(/\s+/g, '_').toLowerCase()}_credentials.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printCredentials = () => {
    const printWindow = window.open('', '_blank', 'width=700,height=500');
    if (!printWindow) return;
    printWindow.document.write(`<pre>${lines.join('\n')}</pre>`);
    printWindow.document.close();
    printWindow.print();
  };

  const sendEmail = async () => {
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
      setStatus(error?.response?.data?.message || 'Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  if (!credential) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container credentials-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Registration Successful</h3>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p><strong>User:</strong> {credential.name} | <strong>Role:</strong> {credential.role || 'user'}</p>
          <p><strong>Department:</strong> {credential.department || 'N/A'}</p>
          <div className="credential-box">
            <label>Email</label>
            <div className="credential-row">
              <code>{credential.email}</code>
              <button type="button" onClick={() => copyText(credential.email)}>Copy</button>
            </div>
            <label>Password</label>
            <div className="credential-row">
              <code>{showPassword ? credential.password : '••••••••••••'}</code>
              <button type="button" onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
              <button type="button" onClick={() => copyText(credential.password)}>Copy</button>
            </div>
          </div>
          <p className="security-warning">Password expires in 90 days and must be changed on first login.</p>
          {status && <p className="credentials-status">{status}</p>}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={() => copyText(lines.join('\n'))}>Copy All</button>
          <button type="button" className="btn-secondary" onClick={downloadTxt}>Download</button>
          <button type="button" className="btn-secondary" onClick={printCredentials}>Print</button>
          <button type="button" className="btn-secondary" onClick={sendEmail} disabled={sending}>
            {sending ? 'Sending...' : 'Send Email'}
          </button>
          <button type="button" className="btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default CredentialsModal;
