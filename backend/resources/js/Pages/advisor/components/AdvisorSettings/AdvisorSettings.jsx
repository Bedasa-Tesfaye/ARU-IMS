import React, { useState } from 'react';
import { advisorAPI, authAPI } from '../../../../services/http';
import './AdvisorSettings.css';

export default function AdvisorSettings({ settingsDraft, setSettingsDraft, settings, setSettings, showToast }) {
  const [pwd, setPwd] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  return (
    <section className="adv-card adv-settings">
      <h3>Settings & preferences</h3>
      <div className="adv-settings-grid">
        <label>
          AI assistance level
          <select value={settingsDraft.ai_assistance_level} onChange={(e) => setSettingsDraft((s) => ({ ...s, ai_assistance_level: e.target.value }))}>
            <option value="minimal">Minimal</option>
            <option value="balanced">Balanced</option>
            <option value="maximum">Maximum</option>
          </select>
        </label>
        <label>
          Office hours
          <input value={settingsDraft.office_hours} onChange={(e) => setSettingsDraft((s) => ({ ...s, office_hours: e.target.value }))} />
        </label>
        <label>
          Meeting preference
          <select value={settingsDraft.meeting_preference} onChange={(e) => setSettingsDraft((s) => ({ ...s, meeting_preference: e.target.value }))}>
            <option value="virtual">Virtual</option>
            <option value="in_person">In person</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </label>
        <label>
          AI digest frequency
          <select value={settingsDraft.notify_digest} onChange={(e) => setSettingsDraft((s) => ({ ...s, notify_digest: e.target.value }))}>
            <option value="off">Off</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </label>
        <label className="adv-span-2">
          Expertise tags (comma separated)
          <input value={settingsDraft.expertise} onChange={(e) => setSettingsDraft((s) => ({ ...s, expertise: e.target.value }))} />
        </label>
      </div>
      <div className="adv-inline-actions">
        <button
          type="button"
          className="adv-btn"
          onClick={async () => {
            const payload = {
              ai_assistance_level: settingsDraft.ai_assistance_level,
              office_hours: settingsDraft.office_hours,
              meeting_preference: settingsDraft.meeting_preference,
              notify_digest: settingsDraft.notify_digest,
              expertise: settingsDraft.expertise
                .split(',')
                .map((x) => x.trim())
                .filter(Boolean),
            };
            const r = await advisorAPI.updateSettings(payload);
            setSettings(r.data?.settings || settings);
            showToast('Settings saved.');
          }}
        >
          Save settings
        </button>
      </div>
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #e5e7eb' }}>
        <h4 style={{ margin: 0 }}>Change password</h4>
        <div className="adv-settings-grid" style={{ marginTop: 10 }}>
          <label>
            Current password
            <input type="password" value={pwd.current_password} onChange={(e) => setPwd((p) => ({ ...p, current_password: e.target.value }))} />
          </label>
          <label>
            New password
            <input type="password" value={pwd.new_password} onChange={(e) => setPwd((p) => ({ ...p, new_password: e.target.value }))} />
          </label>
          <label>
            Confirm new password
            <input type="password" value={pwd.new_password_confirmation} onChange={(e) => setPwd((p) => ({ ...p, new_password_confirmation: e.target.value }))} />
          </label>
        </div>
        <div className="adv-inline-actions">
          <button
            type="button"
            className="adv-btn"
            onClick={async () => {
              try {
                await authAPI.changePassword(pwd);
                showToast('Password updated.');
                setPwd({ current_password: '', new_password: '', new_password_confirmation: '' });
              } catch (e) {
                showToast(e?.response?.data?.message || 'Password update failed.', 'error');
              }
            }}
          >
            Update password
          </button>
        </div>
      </div>
      <p className="adv-muted">Quiet hours, calendar sync (Google/Outlook), and mobile push — configure in institutional SSO settings.</p>
    </section>
  );
}
