import React, { useState, useEffect } from 'react';
import './SystemSettings.css';

const SystemSettings = ({ onBack }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Simulate API call for settings data
    setTimeout(() => {
      const mockSettings = generateMockSettings();
      setSettings(mockSettings);
      setLoading(false);
    }, 1000);
  }, []);

  const generateMockSettings = () => {
    return {
      general: {
        systemName: 'ARU Internship Management System',
        systemEmail: 'admin@aru.edu.et',
        systemPhone: '+251 11 123 4567',
        systemAddress: 'Arsi University, Robe Campus, Ethiopia',
        timezone: 'Africa/Addis_Ababa',
        language: 'English',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24-hour',
        maintenanceMode: false,
        debugMode: false
      },
      security: {
        sessionTimeout: '30',
        passwordMinLength: '8',
        passwordRequireUppercase: true,
        passwordRequireNumbers: true,
        passwordRequireSpecialChars: true,
        twoFactorAuth: false,
        loginAttempts: '5',
        lockoutDuration: '15',
        forcePasswordChange: '90',
        enableCaptcha: true,
        apiRateLimit: '1000'
      },
      email: {
        smtpHost: 'smtp.gmail.com',
        smtpPort: '587',
        smtpUsername: 'noreply@aru.edu.et',
        smtpPassword: '••••••••',
        smtpEncryption: 'TLS',
        emailFromName: 'ARU IMS',
        emailFromAddress: 'noreply@aru.edu.et',
        enableEmailQueue: true,
        bulkEmailLimit: '500',
        emailRetryAttempts: '3'
      },
      storage: {
        maxFileSize: '10',
        allowedFileTypes: 'pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png',
        storageLocation: 'local',
        cloudProvider: 'none',
        cloudBucket: '',
        cloudAccessKey: '',
        cloudSecretKey: '',
        backupEnabled: true,
        backupFrequency: 'daily',
        backupRetention: '30'
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        applicationAlerts: true,
        reportAlerts: true,
        systemAlerts: true,
        maintenanceAlerts: true,
        securityAlerts: true,
        digestFrequency: 'weekly'
      },
      integrations: {
        ldapEnabled: false,
        ldapServer: '',
        ldapPort: '389',
        ldapBaseDN: '',
        ldapBindDN: '',
        samlEnabled: false,
        samlIdpUrl: '',
        samlEntityId: '',
        apiEnabled: true,
        apiRateLimit: '1000',
        webhookUrl: '',
        webhookSecret: ''
      }
    };
  };

  const handleSettingChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      addNotification('Settings saved successfully!', 'success');
    }, 1500);
  };

  const handleResetSettings = (category) => {
    if (window.confirm(`Are you sure you want to reset ${category} settings to defaults?`)) {
      const mockSettings = generateMockSettings();
      setSettings(prev => ({
        ...prev,
        [category]: mockSettings[category]
      }));
      addNotification(`${category} settings reset to defaults`, 'info');
    }
  };

  const addNotification = (message, type) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3>General Configuration</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label>System Name</label>
          <input
            type="text"
            value={settings.general?.systemName || ''}
            onChange={(e) => handleSettingChange('general', 'systemName', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>System Email</label>
          <input
            type="email"
            value={settings.general?.systemEmail || ''}
            onChange={(e) => handleSettingChange('general', 'systemEmail', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>System Phone</label>
          <input
            type="tel"
            value={settings.general?.systemPhone || ''}
            onChange={(e) => handleSettingChange('general', 'systemPhone', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>System Address</label>
          <input
            type="text"
            value={settings.general?.systemAddress || ''}
            onChange={(e) => handleSettingChange('general', 'systemAddress', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>Timezone</label>
          <select
            value={settings.general?.timezone || ''}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
          >
            <option value="Africa/Addis_Ababa">Africa/Addis_Ababa</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </div>
        <div className="setting-item">
          <label>Language</label>
          <select
            value={settings.general?.language || ''}
            onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
          >
            <option value="English">English</option>
            <option value="Amharic">Amharic</option>
            <option value="Oromo">Oromo</option>
          </select>
        </div>
        <div className="setting-item">
          <label>Date Format</label>
          <select
            value={settings.general?.dateFormat || ''}
            onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <div className="setting-item">
          <label>Time Format</label>
          <select
            value={settings.general?.timeFormat || ''}
            onChange={(e) => handleSettingChange('general', 'timeFormat', e.target.value)}
          >
            <option value="24-hour">24-hour</option>
            <option value="12-hour">12-hour</option>
          </select>
        </div>
        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.general?.maintenanceMode || false}
              onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
            />
            Maintenance Mode
          </label>
          <small>Enable to put system in maintenance mode</small>
        </div>
        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.general?.debugMode || false}
              onChange={(e) => handleSettingChange('general', 'debugMode', e.target.checked)}
            />
            Debug Mode
          </label>
          <small>Enable debug logging and error reporting</small>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings-section">
      <h3>Security Configuration</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label>Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.security?.sessionTimeout || ''}
            onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>Password Minimum Length</label>
          <input
            type="number"
            value={settings.security?.passwordMinLength || ''}
            onChange={(e) => handleSettingChange('security', 'passwordMinLength', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>Maximum Login Attempts</label>
          <input
            type="number"
            value={settings.security?.loginAttempts || ''}
            onChange={(e) => handleSettingChange('security', 'loginAttempts', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>Lockout Duration (minutes)</label>
          <input
            type="number"
            value={settings.security?.lockoutDuration || ''}
            onChange={(e) => handleSettingChange('security', 'lockoutDuration', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>Force Password Change (days)</label>
          <input
            type="number"
            value={settings.security?.forcePasswordChange || ''}
            onChange={(e) => handleSettingChange('security', 'forcePasswordChange', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>API Rate Limit (requests/hour)</label>
          <input
            type="number"
            value={settings.security?.apiRateLimit || ''}
            onChange={(e) => handleSettingChange('security', 'apiRateLimit', e.target.value)}
          />
        </div>
        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.security?.passwordRequireUppercase || false}
              onChange={(e) => handleSettingChange('security', 'passwordRequireUppercase', e.target.checked)}
            />
            Require Uppercase Letters
          </label>
        </div>
        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.security?.passwordRequireNumbers || false}
              onChange={(e) => handleSettingChange('security', 'passwordRequireNumbers', e.target.checked)}
            />
            Require Numbers
          </label>
        </div>
        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.security?.passwordRequireSpecialChars || false}
              onChange={(e) => handleSettingChange('security', 'passwordRequireSpecialChars', e.target.checked)}
            />
            Require Special Characters
          </label>
        </div>
        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.security?.twoFactorAuth || false}
              onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
            />
            Two-Factor Authentication
          </label>
        </div>
        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.security?.enableCaptcha || false}
              onChange={(e) => handleSettingChange('security', 'enableCaptcha', e.target.checked)}
            />
            Enable CAPTCHA
          </label>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="settings-section">
      <h3>Email Configuration</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label>SMTP Host</label>
          <input
            type="text"
            value={settings.email?.smtpHost || ''}
            onChange={(e) => handleSettingChange('email', 'smtpHost', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>SMTP Port</label>
          <input
            type="number"
            value={settings.email?.smtpPort || ''}
            onChange={(e) => handleSettingChange('email', 'smtpPort', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>SMTP Username</label>
          <input
            type="text"
            value={settings.email?.smtpUsername || ''}
            onChange={(e) => handleSettingChange('email', 'smtpUsername', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>SMTP Password</label>
          <input
            type="password"
            value={settings.email?.smtpPassword || ''}
            onChange={(e) => handleSettingChange('email', 'smtpPassword', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>SMTP Encryption</label>
          <select
            value={settings.email?.smtpEncryption || ''}
            onChange={(e) => handleSettingChange('email', 'smtpEncryption', e.target.value)}
          >
            <option value="TLS">TLS</option>
            <option value="SSL">SSL</option>
            <option value="none">None</option>
          </select>
        </div>
        <div className="setting-item">
          <label>From Name</label>
          <input
            type="text"
            value={settings.email?.emailFromName || ''}
            onChange={(e) => handleSettingChange('email', 'emailFromName', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>From Address</label>
          <input
            type="email"
            value={settings.email?.emailFromAddress || ''}
            onChange={(e) => handleSettingChange('email', 'emailFromAddress', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>Bulk Email Limit</label>
          <input
            type="number"
            value={settings.email?.bulkEmailLimit || ''}
            onChange={(e) => handleSettingChange('email', 'bulkEmailLimit', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>Email Retry Attempts</label>
          <input
            type="number"
            value={settings.email?.emailRetryAttempts || ''}
            onChange={(e) => handleSettingChange('email', 'emailRetryAttempts', e.target.value)}
          />
        </div>
        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.email?.enableEmailQueue || false}
              onChange={(e) => handleSettingChange('email', 'enableEmailQueue', e.target.checked)}
            />
            Enable Email Queue
          </label>
        </div>
      </div>
    </div>
  );

  const renderStorageSettings = () => (
    <div className="settings-section">
      <h3>Storage Configuration</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label>Maximum File Size (MB)</label>
          <input
            type="number"
            value={settings.storage?.maxFileSize || ''}
            onChange={(e) => handleSettingChange('storage', 'maxFileSize', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>Allowed File Types</label>
          <input
            type="text"
            value={settings.storage?.allowedFileTypes || ''}
            onChange={(e) => handleSettingChange('storage', 'allowedFileTypes', e.target.value)}
          />
          <small>Comma-separated file extensions</small>
        </div>
        <div className="setting-item">
          <label>Storage Location</label>
          <select
            value={settings.storage?.storageLocation || ''}
            onChange={(e) => handleSettingChange('storage', 'storageLocation', e.target.value)}
          >
            <option value="local">Local Storage</option>
            <option value="cloud">Cloud Storage</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <div className="setting-item">
          <label>Cloud Provider</label>
          <select
            value={settings.storage?.cloudProvider || ''}
            onChange={(e) => handleSettingChange('storage', 'cloudProvider', e.target.value)}
          >
            <option value="none">None</option>
            <option value="aws">AWS S3</option>
            <option value="google">Google Cloud</option>
            <option value="azure">Azure Blob</option>
          </select>
        </div>
        <div className="setting-item">
          <label>Cloud Bucket</label>
          <input
            type="text"
            value={settings.storage?.cloudBucket || ''}
            onChange={(e) => handleSettingChange('storage', 'cloudBucket', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>Backup Frequency</label>
          <select
            value={settings.storage?.backupFrequency || ''}
            onChange={(e) => handleSettingChange('storage', 'backupFrequency', e.target.value)}
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="setting-item">
          <label>Backup Retention (days)</label>
          <input
            type="number"
            value={settings.storage?.backupRetention || ''}
            onChange={(e) => handleSettingChange('storage', 'backupRetention', e.target.value)}
          />
        </div>
        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.storage?.backupEnabled || false}
              onChange={(e) => handleSettingChange('storage', 'backupEnabled', e.target.checked)}
            />
            Enable Automatic Backup
          </label>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <h3>Notification Configuration</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label>Digest Frequency</label>
          <select
            value={settings.notifications?.digestFrequency || ''}
            onChange={(e) => handleSettingChange('notifications', 'digestFrequency', e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="never">Never</option>
          </select>
        </div>
        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications?.emailNotifications || false}
              onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
            />
            Email Notifications
          </label>
        </div>
        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications?.smsNotifications || false}
              onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
            />
            SMS Notifications
          </label>
        </div>
        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications?.pushNotifications || false}
              onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
            />
            Push Notifications
          </label>
        </div>
        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications?.applicationAlerts || false}
              onChange={(e) => handleSettingChange('notifications', 'applicationAlerts', e.target.checked)}
            />
            Application Alerts
          </label>
        </div>
        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications?.reportAlerts || false}
              onChange={(e) => handleSettingChange('notifications', 'reportAlerts', e.target.checked)}
            />
            Report Alerts
          </label>
        </div>
        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications?.systemAlerts || false}
              onChange={(e) => handleSettingChange('notifications', 'systemAlerts', e.target.checked)}
            />
            System Alerts
          </label>
        </div>
        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications?.maintenanceAlerts || false}
              onChange={(e) => handleSettingChange('notifications', 'maintenanceAlerts', e.target.checked)}
            />
            Maintenance Alerts
          </label>
        </div>
        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications?.securityAlerts || false}
              onChange={(e) => handleSettingChange('notifications', 'securityAlerts', e.target.checked)}
            />
            Security Alerts
          </label>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className="settings-section">
      <h3>Integration Configuration</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label>LDAP Server</label>
          <input
            type="text"
            value={settings.integrations?.ldapServer || ''}
            onChange={(e) => handleSettingChange('integrations', 'ldapServer', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>LDAP Port</label>
          <input
            type="number"
            value={settings.integrations?.ldapPort || ''}
            onChange={(e) => handleSettingChange('integrations', 'ldapPort', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>LDAP Base DN</label>
          <input
            type="text"
            value={settings.integrations?.ldapBaseDN || ''}
            onChange={(e) => handleSettingChange('integrations', 'ldapBaseDN', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>SAML IdP URL</label>
          <input
            type="url"
            value={settings.integrations?.samlIdpUrl || ''}
            onChange={(e) => handleSettingChange('integrations', 'samlIdpUrl', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>SAML Entity ID</label>
          <input
            type="text"
            value={settings.integrations?.samlEntityId || ''}
            onChange={(e) => handleSettingChange('integrations', 'samlEntityId', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>API Rate Limit (requests/hour)</label>
          <input
            type="number"
            value={settings.integrations?.apiRateLimit || ''}
            onChange={(e) => handleSettingChange('integrations', 'apiRateLimit', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>Webhook URL</label>
          <input
            type="url"
            value={settings.integrations?.webhookUrl || ''}
            onChange={(e) => handleSettingChange('integrations', 'webhookUrl', e.target.value)}
          />
        </div>
        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.integrations?.ldapEnabled || false}
              onChange={(e) => handleSettingChange('integrations', 'ldapEnabled', e.target.checked)}
            />
            Enable LDAP Authentication
          </label>
        </div>
        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.integrations?.samlEnabled || false}
              onChange={(e) => handleSettingChange('integrations', 'samlEnabled', e.target.checked)}
            />
            Enable SAML Authentication
          </label>
        </div>
        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.integrations?.apiEnabled || false}
              onChange={(e) => handleSettingChange('integrations', 'apiEnabled', e.target.checked)}
            />
            Enable API Access
          </label>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'email':
        return renderEmailSettings();
      case 'storage':
        return renderStorageSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'integrations':
        return renderIntegrationsSettings();
      default:
        return renderGeneralSettings();
    }
  };

  if (loading) {
    return (
      <div className="system-settings-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading system settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="system-settings">
      <div className="settings-header">
        <div className="header-content">
          <button className="back-btn" onClick={onBack}>
            <span>←</span> Back to Dashboard
          </button>
          <h1>⚙️ System Settings</h1>
          <p>Configure system-wide settings and preferences</p>
        </div>
        <div className="header-actions">
          <button 
            className="reset-btn"
            onClick={() => handleResetSettings(activeTab)}
          >
            <span>🔄</span> Reset {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </button>
          <button 
            className="save-btn"
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="btn-spinner"></div>
                Saving...
              </>
            ) : (
              <>
                <span>💾</span> Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="settings-tabs">
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <span>🏠</span> General
          </button>
          <button
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <span>🔒</span> Security
          </button>
          <button
            className={`tab-btn ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
          >
            <span>📧</span> Email
          </button>
          <button
            className={`tab-btn ${activeTab === 'storage' ? 'active' : ''}`}
            onClick={() => setActiveTab('storage')}
          >
            <span>💾</span> Storage
          </button>
          <button
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <span>🔔</span> Notifications
          </button>
          <button
            className={`tab-btn ${activeTab === 'integrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('integrations')}
          >
            <span>🔗</span> Integrations
          </button>
        </div>
      </div>

      {/* Settings Content */}
      <div className="settings-content">
        {renderTabContent()}
      </div>

      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map(notification => (
          <div key={notification.id} className={`notification ${notification.type}`}>
            <span>{notification.message}</span>
            <button onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}>
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemSettings;
