import React, { useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { authAPI } from '../services/http';

const roleHome = (role) => {
  if (role === 'student') return '/student-dashboard';
  if (role === 'company') return '/company-dashboard';
  if (role === 'examiner') return '/examiner-dashboard';
  if (role === 'advisor') return '/advisor-dashboard';
  if (role === 'super_admin' || role === 'admin' || role === 'coordinator') return '/superadmin';
  return '/';
};

export default function ForcePasswordChange() {
  const { props } = usePage();
  const auth = props?.auth || null;
  const next = (props?.next || '').trim();
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const destination = useMemo(() => (next ? next : roleHome(auth?.role)), [next, auth?.role]);

  const submit = async () => {
    setError('');
    if (!form.current_password || !form.new_password || !form.new_password_confirmation) {
      setError('Please fill all password fields.');
      return;
    }
    if (form.new_password.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (form.new_password !== form.new_password_confirmation) {
      setError('New password and confirmation do not match.');
      return;
    }

    setBusy(true);
    try {
      await authAPI.changePassword({
        current_password: form.current_password,
        new_password: form.new_password,
        new_password_confirmation: form.new_password_confirmation,
      });
      router.visit(destination);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f8fafc' }}>
      <div style={{ width: '100%', maxWidth: 520, background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb' }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>Change your password</h2>
        <p style={{ marginTop: 8, color: '#64748b' }}>
          For security, you must change your one-time password before continuing.
        </p>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: 12, borderRadius: 12, marginTop: 12 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
          <input
            type="password"
            placeholder="Current password"
            value={form.current_password}
            onChange={(e) => setForm((p) => ({ ...p, current_password: e.target.value }))}
            style={{ padding: 12, borderRadius: 12, border: '1px solid #e5e7eb' }}
          />
          <input
            type="password"
            placeholder="New password (min 8)"
            value={form.new_password}
            onChange={(e) => setForm((p) => ({ ...p, new_password: e.target.value }))}
            style={{ padding: 12, borderRadius: 12, border: '1px solid #e5e7eb' }}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={form.new_password_confirmation}
            onChange={(e) => setForm((p) => ({ ...p, new_password_confirmation: e.target.value }))}
            style={{ padding: 12, borderRadius: 12, border: '1px solid #e5e7eb' }}
          />
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={busy}
          style={{
            marginTop: 14,
            width: '100%',
            padding: 12,
            borderRadius: 12,
            border: 'none',
            fontWeight: 700,
            color: 'white',
            background: busy ? '#94a3b8' : 'linear-gradient(135deg,#667eea,#764ba2)',
            cursor: busy ? 'wait' : 'pointer',
          }}
        >
          {busy ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </div>
  );
}

