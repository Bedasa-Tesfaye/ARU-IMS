import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import './SettingsPanel.css';

export default function SettingsPanel({ credentialPolicy, onCredentialUpdated }) {
  const [general, setGeneral] = useState({
    systemName: 'Arsi University IMS',
    timezone: 'Africa/Addis_Ababa',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12-hour',
    language: 'en',
    maintenance: false,
    maintenanceMessage: '',
  });

  const [notifications, setNotifications] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    fromName: 'ARU IMS',
    alertRegistration: true,
    alertApproval: true,
    alertErrors: true,
    alertBackup: true,
    alertSecurity: true,
    weeklyDigest: false,
    smsEnabled: false,
  });

  const [backup, setBackup] = useState({
    daily: true,
    weekly: true,
    monthly: true,
    retentionDays: 90,
    storageUsedGb: 2.4,
    storageTotalGb: 10,
  });

  const [integration, setIntegration] = useState({
    calendar: 'Google Calendar',
    emailProvider: 'SendGrid',
    storageProvider: 'AWS S3',
    bucket: 'aru-ims-storage',
  });

  const [cred, setCred] = useState({
    password_length: 12,
    require_uppercase: true,
    require_lowercase: true,
    require_numbers: true,
    require_special: true,
    password_expiry_days: 90,
    force_password_change: true,
    user_email_domain: '',
    partner_email_domain: '',
    failed_login_limit: 5,
    lockout_minutes: 30,
  });

  useEffect(() => {
    if (!credentialPolicy) return;
    setCred((prev) => ({
      ...prev,
      password_length: credentialPolicy.password_length ?? prev.password_length,
      require_uppercase: !!credentialPolicy.require_uppercase,
      require_lowercase: !!credentialPolicy.require_lowercase,
      require_numbers: !!credentialPolicy.require_numbers,
      require_special: !!credentialPolicy.require_special,
      password_expiry_days: credentialPolicy.password_expiry_days ?? prev.password_expiry_days,
      force_password_change: !!credentialPolicy.force_password_change,
      user_email_domain: credentialPolicy.user_email_domain || '',
      partner_email_domain: credentialPolicy.partner_email_domain || '',
      failed_login_limit: credentialPolicy.failed_login_limit ?? prev.failed_login_limit,
      lockout_minutes: credentialPolicy.lockout_minutes ?? prev.lockout_minutes,
    }));
  }, [credentialPolicy]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aru_sa_settings');
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.general) setGeneral((p) => ({ ...p, ...saved.general }));
      if (saved.notifications) setNotifications((p) => ({ ...p, ...saved.notifications }));
      if (saved.backup) setBackup((p) => ({ ...p, ...saved.backup }));
      if (saved.integration) setIntegration((p) => ({ ...p, ...saved.integration }));
    } catch {
      // ignore
    }
  }, []);

  const persist = (patch) => {
    try {
      const raw = localStorage.getItem('aru_sa_settings');
      const current = raw ? JSON.parse(raw) : {};
      const next = { ...current, ...patch };
      localStorage.setItem('aru_sa_settings', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const saveCredentials = async () => {
    await onCredentialUpdated?.(cred);
  };

  return (
    <div className="sa-settings-panel">
      <section className="sa-settings-card">
        <h2>⚙️ General settings</h2>
        <label>
          System name
          <input value={general.systemName} onChange={(e) => setGeneral({ ...general, systemName: e.target.value })} />
        </label>
        <label>
          Timezone
          <select value={general.timezone} onChange={(e) => setGeneral({ ...general, timezone: e.target.value })}>
            <option value="Africa/Addis_Ababa">Africa/Addis_Ababa</option>
            <option value="UTC">UTC</option>
          </select>
        </label>
        <label>
          Date format
          <select value={general.dateFormat} onChange={(e) => setGeneral({ ...general, dateFormat: e.target.value })}>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </label>
        <label className="sa-check">
          <input
            type="checkbox"
            checked={general.maintenance}
            onChange={(e) => setGeneral({ ...general, maintenance: e.target.checked })}
          />
          Maintenance mode
        </label>
        <label>
          Maintenance message
          <textarea
            rows={2}
            value={general.maintenanceMessage}
            onChange={(e) => setGeneral({ ...general, maintenanceMessage: e.target.value })}
          />
        </label>
        <button
          type="button"
          className="sa-btn-secondary"
          onClick={() => {
            persist({ general });
            toast.success('General settings saved (local).');
          }}
        >
          Save general settings
        </button>
      </section>

      <section className="sa-settings-card">
        <h2>🔒 Security settings</h2>
        <p className="sa-muted">Login lockout and password rules below sync with the live credential policy where fields match.</p>
        <label>
          Minimum length
          <input
            type="number"
            value={cred.password_length}
            onChange={(e) => setCred({ ...cred, password_length: Number(e.target.value) })}
          />
        </label>
        <label className="sa-check">
          <input
            type="checkbox"
            checked={cred.require_uppercase}
            onChange={(e) => setCred({ ...cred, require_uppercase: e.target.checked })}
          />
          Require uppercase
        </label>
        <label className="sa-check">
          <input
            type="checkbox"
            checked={cred.require_lowercase}
            onChange={(e) => setCred({ ...cred, require_lowercase: e.target.checked })}
          />
          Require lowercase
        </label>
        <label className="sa-check">
          <input
            type="checkbox"
            checked={cred.require_numbers}
            onChange={(e) => setCred({ ...cred, require_numbers: e.target.checked })}
          />
          Require numbers
        </label>
        <label className="sa-check">
          <input
            type="checkbox"
            checked={cred.require_special}
            onChange={(e) => setCred({ ...cred, require_special: e.target.checked })}
          />
          Require special characters
        </label>
        <label>
          Password expiry (days)
          <input
            type="number"
            value={cred.password_expiry_days}
            onChange={(e) => setCred({ ...cred, password_expiry_days: Number(e.target.value) })}
          />
        </label>
        <label>
          Max failed attempts
          <input
            type="number"
            value={cred.failed_login_limit}
            onChange={(e) => setCred({ ...cred, failed_login_limit: Number(e.target.value) })}
          />
        </label>
        <label>
          Lockout (minutes)
          <input
            type="number"
            value={cred.lockout_minutes}
            onChange={(e) => setCred({ ...cred, lockout_minutes: Number(e.target.value) })}
          />
        </label>
        <label className="sa-check">
          <input
            type="checkbox"
            checked={cred.force_password_change}
            onChange={(e) => setCred({ ...cred, force_password_change: e.target.checked })}
          />
          Force password change on first login
        </label>
        <label>
          Student/staff email domain
          <input value={cred.user_email_domain} onChange={(e) => setCred({ ...cred, user_email_domain: e.target.value })} />
        </label>
        <label>
          Partner email domain
          <input value={cred.partner_email_domain} onChange={(e) => setCred({ ...cred, partner_email_domain: e.target.value })} />
        </label>
        <button type="button" className="sa-btn-primary" onClick={saveCredentials}>
          Save security / credential policy
        </button>
      </section>

      <section className="sa-settings-card">
        <h2>🔔 Notification settings</h2>
        <label>
          SMTP host
          <input value={notifications.smtpHost} onChange={(e) => setNotifications({ ...notifications, smtpHost: e.target.value })} />
        </label>
        <label>
          Port
          <input
            type="number"
            value={notifications.smtpPort}
            onChange={(e) => setNotifications({ ...notifications, smtpPort: Number(e.target.value) })}
          />
        </label>
        <label className="sa-check">
          <input
            type="checkbox"
            checked={notifications.alertRegistration}
            onChange={(e) => setNotifications({ ...notifications, alertRegistration: e.target.checked })}
          />
          New registration alert
        </label>
        <button
          type="button"
          className="sa-btn-secondary"
          onClick={() => {
            persist({ notifications });
            toast.success('Notification settings saved (local).');
          }}
        >
          Save notification settings
        </button>
      </section>

      <section className="sa-settings-card">
        <h2>💾 Backup &amp; recovery</h2>
        <label className="sa-check">
          <input type="checkbox" checked={backup.daily} onChange={(e) => setBackup({ ...backup, daily: e.target.checked })} />
          Daily backup
        </label>
        <p>
          Storage used: {backup.storageUsedGb} GB / {backup.storageTotalGb} GB (demo)
        </p>
        <div className="sa-ai-actions">
          <button
            type="button"
            className="sa-btn-secondary"
            onClick={() => {
              persist({ backup });
              toast.success('Backup settings saved (local).');
            }}
          >
            Save backup settings
          </button>
          <button type="button" className="sa-btn-primary" onClick={() => toast('Manual backup request queued (wiring pending).')}>
            Create manual backup
          </button>
        </div>
      </section>

      <section className="sa-settings-card">
        <h2>🔗 Integration settings</h2>
        <p>
          Calendar: {integration.calendar} — Email: {integration.emailProvider} — Storage: {integration.storageProvider} ({integration.bucket})
        </p>
        <button
          type="button"
          className="sa-btn-secondary"
          onClick={() => {
            persist({ integration });
            toast.success('Integration settings saved (local).');
          }}
        >
          Save integration settings
        </button>
      </section>

      <section className="sa-settings-card">
        <h2>👥 Role &amp; permissions</h2>
        <p className="sa-muted">Managed via Spatie permissions and authority config — extend UI when role CRUD is exposed.</p>
        <table className="sa-table sa-table-compact">
          <thead>
            <tr>
              <th>Role</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Super Admin</td>
              <td>Full portal access</td>
            </tr>
            <tr>
              <td>Coordinator</td>
              <td>Operational approvals</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
