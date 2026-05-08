import React, { useEffect, useMemo, useState } from 'react';
import Header from './superadmin/components/Header/Header';
import OverviewStats from './superadmin/components/OverviewStats';
import PendingApprovalsPanel from './superadmin/components/PendingApprovalsPanel/PendingApprovalsPanel';
import AssignPanel from './superadmin/components/AssignPanel/AssignPanel';
import RegistrationPanel from './superadmin/components/RegistrationPanel/RegistrationPanel';
import Sidebar from './superadmin/components/Sidebar';
import UserManagementPanel from './superadmin/components/UserManagementPanel';
import CredentialsModal from './superadmin/components/CredentialsModal';
import ReportsAnalyticsPanel from './superadmin/components/ReportsAnalyticsPanel';
import AIInsightsPanel from './superadmin/components/AIInsightsPanel';
import AuditLogsPanel from './superadmin/components/AuditLogsPanel';
import SettingsPanel from './superadmin/components/SettingsPanel';
import { normalizeUser } from './superadmin/utils/userHelpers';
import { superAdminAPI } from '../services/http';
import { Toaster, toast } from 'react-hot-toast';
import './superadmin/SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState([]);
  const [activeCredential, setActiveCredential] = useState(null);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [reportsDashboard, setReportsDashboard] = useState(null);
  const [activity, setActivity] = useState([
    { icon: '✅', message: 'Super Admin dashboard loaded', at: new Date().toISOString() },
  ]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [credentialPolicy, setCredentialPolicy] = useState(null);

  const loadData = async () => {
    setLoadingDashboard(true);
    try {
      const [usersRes, departmentsRes, approvalsRes, reportsRes] = await Promise.all([
        superAdminAPI.getUsers(),
        superAdminAPI.getDepartments(),
        superAdminAPI.getApprovalsSummary(),
        superAdminAPI.getReportsDashboard({}),
      ]);
      setUsers((usersRes.data || []).map(normalizeUser));
      setDepartments(departmentsRes.data || []);
      setPendingApprovalsCount(approvalsRes.data?.total_pending || 0);
      setReportsDashboard(reportsRes.data || null);
      try {
        const [logsRes, policyRes] = await Promise.all([
          superAdminAPI.getAuditLogs({}),
          superAdminAPI.getCredentialPolicy(),
        ]);
        setAuditLogs(logsRes.data?.data || []);
        setCredentialPolicy(policyRes.data || null);
      } catch (innerErr) {
        // Optional sections should not block dashboard load.
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load user management data.');
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await superAdminAPI.getApprovalsSummary();
        setPendingApprovalsCount(res.data?.total_pending || 0);
      } catch (e) {
        // keep silent; badge refresh shouldn't spam errors
      }
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    return {
      totalUsers: users.length,
      totalStudents: roleCounts.student || 0,
      totalExaminers: roleCounts.examiner || 0,
      totalCoordinators: roleCounts.coordinator || 0,
      totalCompanies: roleCounts.company || 0,
      totalAdvisors: roleCounts.advisor || 0,
    };
  }, [users]);

  const addActivity = (icon, message) => {
    setActivity((prev) => [{ icon, message, at: new Date().toISOString() }, ...prev.slice(0, 19)]);
  };

  const handleRegister = async (formData, role) => {
    setIsSubmitting(true);
    try {
      let res;
      if (role === 'student') res = await superAdminAPI.registerStudent({ ...formData, department_id: Number(formData.department_id), year: Number(formData.year), cgpa: Number(formData.cgpa) });
      if (role === 'company') res = await superAdminAPI.registerCompany(formData);
      if (role === 'examiner') res = await superAdminAPI.registerExaminer({ ...formData, department_id: Number(formData.department_id), years_of_experience: Number(formData.years_of_experience) });
      if (role === 'advisor') res = await superAdminAPI.registerAdvisor({ ...formData, department_id: Number(formData.department_id), years_of_experience: Number(formData.years_of_experience) });

      if (res?.data?.credentials) {
        const credential = { ...res.data.credentials, role };
        setGeneratedCredentials((prev) => [credential, ...prev].slice(0, 10));
        setActiveCredential(credential);
      }
      toast.success(`${role} registered successfully!`);
      addActivity('✅', `${role} registered successfully`);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to register ${role}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkRegister = async (bulkData, role) => {
    setIsSubmitting(true);
    try {
      const res = await superAdminAPI.registerStudentsBulk({ students: bulkData });
      
      if (res?.data?.credentials) {
        const normalized = (res.data.credentials || []).map((item) => ({ ...item, role }));
        setGeneratedCredentials((prev) => [...normalized, ...prev].slice(0, 10));
        if (normalized[0]) {
          setActiveCredential(normalized[0]);
        }
      }
      toast.success(`${bulkData.length} ${role}s registered successfully!`);
      addActivity('✅', `${bulkData.length} ${role}s registered successfully`);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to register ${role}s in bulk`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      const payload = {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        status: updatedUser.status,
        student_id: updatedUser.studentId || null,
        employee_id: updatedUser.employeeId || null,
      };
      if (updatedUser.department && departments.length > 0) {
        const match = departments.find((d) => d.name === updatedUser.department);
        if (match) payload.department_id = match.id;
      }
      const res = await superAdminAPI.updateUser(updatedUser.id, payload);
      const normalized = normalizeUser(res.data.user);
      setUsers((prev) => prev.map((user) => (user.id === normalized.id ? normalized : user)));
      addActivity('✏️', `User updated: ${normalized.name}`);
      toast.success('User updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user.');
    }
  };

  const handleSuspendUser = async (user, duration, reason) => {
    try {
      const res = await superAdminAPI.suspendUser(user.id, { duration, reason });
      const normalized = normalizeUser(res.data.user);
      setUsers((prev) => prev.map((u) => (u.id === normalized.id ? normalized : u)));
      const suffix = duration === 'permanent' ? 'permanently' : `for ${duration} days`;
      addActivity('⏸️', `User suspended: ${user.name} ${suffix}`);
      toast.success('User suspended successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to suspend user.');
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      await superAdminAPI.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      addActivity('🗑️', `User deleted: ${user.name}`);
      toast.success('User deleted successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleCredentialUpdated = async (payload) => {
    setIsSubmitting(true);
    try {
      await superAdminAPI.updateCredentialPolicy(payload);
      const res = await superAdminAPI.getCredentialPolicy();
      setCredentialPolicy(res.data);
      toast.success('Credential policy updated successfully.');
      addActivity('⚙️', 'Credential policy updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update credential policy.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (user) => {
    try {
      const res = await superAdminAPI.resetUserPassword(user.id);
      const credentials = { ...(res.data?.credentials || {}), name: user.name, role: user.role };
      setGeneratedCredentials((prev) => [credentials, ...prev].slice(0, 10));
      setActiveCredential(credentials);
      addActivity('🔑', `Password reset for: ${user.name}`);
      toast.success('Password reset successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password.');
    }
  };

  const renderContent = () => {
    if (activeSection === 'overview') {
      return (
        <OverviewStats
          stats={stats}
          pendingApprovalsCount={pendingApprovalsCount}
          reportsDashboard={reportsDashboard}
          activity={activity}
          loading={loadingDashboard}
          onNavigate={setActiveSection}
          onQuickAction={(action) => {
            if (action === 'backup') {
              toast.success('Backup request queued (server job wiring pending).');
              addActivity('💾', 'Manual backup requested');
              return;
            }
            if (action === 'announce') {
              toast('Announcements can be sent from Settings → Notifications (wiring pending).');
              addActivity('📣', 'Announcement draft opened');
              return;
            }
          }}
        />
      );
    }
    if (activeSection === 'pending-approvals') {
      return (
        <PendingApprovalsPanel
          onSuccess={(msg) => {
            toast.success(msg);
            loadData();
          }}
          onError={(msg) => {
            toast.error(msg);
          }}
          onActivity={addActivity}
          onCredentialsGenerated={(cred) => {
            const normalized = { ...cred, role: 'company' };
            setGeneratedCredentials((prev) => [normalized, ...prev].slice(0, 10));
            setActiveCredential(normalized);
          }}
        />
      );
    }
    if (activeSection === 'assign') {
      return (
        <AssignPanel
          allDepartments={departments}
          onSuccess={(msg) => {
            toast.success(msg);
          }}
          onError={(msg) => {
            toast.error(msg);
          }}
          onActivity={addActivity}
        />
      );
    }
    if (['student', 'company', 'examiner', 'advisor'].includes(activeSection)) {
      return (
        <RegistrationPanel
          activeSection={activeSection}
          departments={departments}
          onRegister={handleRegister}
          onBulkRegister={handleBulkRegister}
          isSubmitting={isSubmitting}
          onSelectType={setActiveSection}
        />
      );
    }
    if (['all-users', 'students', 'examiners', 'coordinators', 'companies', 'advisors'].includes(activeSection)) {
      return (
        <UserManagementPanel
          users={users}
          activeSection={activeSection}
          departments={departments.map((d) => d.name)}
          onUpdateUser={handleUpdateUser}
          onSuspendUser={handleSuspendUser}
          onDeleteUser={handleDeleteUser}
          onResetPassword={handleResetPassword}
        />
      );
    }
    if (activeSection === 'reports-analytics') {
      return <ReportsAnalyticsPanel departments={departments} />;
    }
    if (activeSection === 'ai-insights') {
      return <AIInsightsPanel stats={stats} pendingApprovalsCount={pendingApprovalsCount} />;
    }
    if (activeSection === 'audit-logs') {
      return <AuditLogsPanel initialLogs={auditLogs} />;
    }
    if (activeSection === 'settings') {
      return <SettingsPanel credentialPolicy={credentialPolicy} onCredentialUpdated={handleCredentialUpdated} />;
    }
    return (
      <div className="sa-empty-panel">
        <h3>Section</h3>
        <p>Select a menu item from the sidebar.</p>
      </div>
    );
  };

  return (
    <div className="sa-dashboard-container">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      <div className={`sa-main-content ${sidebarOpen ? 'expanded' : 'collapsed'}`}>
        <Header activeSection={activeSection} currentTime={currentTime} />

        <div className="sa-content-area">
          {renderContent()}
        </div>

        {generatedCredentials.length > 0 && ['student', 'company', 'examiner', 'advisor', 'pending-approvals'].includes(activeSection) && (
          <div className="sa-credentials-panel">
            <div className="credentials-header">
              <h3>📋 Recently Generated Credentials</h3>
              <button type="button" className="clear-credentials" onClick={() => setGeneratedCredentials([])}>Clear All</button>
            </div>
            <div className="credentials-list">
              {generatedCredentials.slice(0, 3).map((cred, idx) => (
                <div key={`${cred.email}-${idx}`} className="credential-item" onClick={() => setActiveCredential(cred)}>
                  <div className="cred-user">
                    <strong>{cred.name || cred.email}</strong>
                    <span className="cred-role">{activeSection}</span>
                  </div>
                  <div className="cred-details">
                    <code>{cred.email}</code>
                    <code className="password">{cred.password}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection !== 'overview' && (
          <section className="activity-panel">
            <h3>Recent Activities</h3>
            {activity.slice(0, 8).map((item, idx) => (
              <div key={`${item.message}-${idx}`} className="activity-item">
                <span>{item.icon}</span>
                <p>{item.message}</p>
                <small>{new Date(item.at || item.time || Date.now()).toLocaleString()}</small>
              </div>
            ))}
          </section>
        )}

        {activeCredential && (
          <CredentialsModal
            credential={activeCredential}
            onClose={() => setActiveCredential(null)}
            onRegisterAnother={(cred) => {
              const r = cred?.role;
              setActiveCredential(null);
              if (['student', 'company', 'examiner', 'advisor'].includes(r)) {
                setActiveSection(r);
              }
            }}
            onViewAllUsers={() => {
              setActiveCredential(null);
              setActiveSection('all-users');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
