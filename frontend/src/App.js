import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Internships from './pages/Internships';
import Applications from './pages/Applications';
import Reports from './pages/Reports';
import Evaluations from './pages/Evaluations';
import Profile from './pages/Profile';
import DashboardLayout from './layouts/DashboardLayout';
import RequireAuth from './components/RequireAuth';
import RequirePermission from './components/RequirePermission';
import CoordinatorLayoutPage from './pages/coordinator/CoordinatorLayoutPage';
import CoordinatorDashboardPage from './pages/coordinator/CoordinatorDashboardPage';
import DepartmentAdminUserRegistrationPage from './pages/DepartmentAdminUserRegistrationPage';
import CoordinatorUserManagementPage from './pages/coordinator/CoordinatorUserManagementPage';
import CoordinatorAssignmentsPage from './pages/coordinator/CoordinatorAssignmentsPage';
import CoordinatorReportsPage from './pages/coordinator/CoordinatorReportsPage';
import CoordinatorApprovalsPage from './pages/coordinator/CoordinatorApprovalsPage';
import CoordinatorSettingsPage from './pages/coordinator/CoordinatorSettingsPage';
import UniversityAdminLayoutPage from './pages/admin/UniversityAdminLayoutPage';
import UniversityAdminDashboardPage from './pages/admin/UniversityAdminDashboardPage';
import UniversityAdminUserRegistrationPage from './pages/admin/UniversityAdminUserRegistrationPage';
import UniversityAdminUserManagementPage from './pages/admin/UniversityAdminUserManagementPage';
import UniversityAdminMonitoringPage from './pages/admin/UniversityAdminMonitoringPage';
import UniversityAdminReportsPage from './pages/admin/UniversityAdminReportsPage';
import UniversityAdminApprovalsPage from './pages/admin/UniversityAdminApprovalsPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/dashboard/admin"
              element={
                <RequireAuth>
                  <RequirePermission permission="users.viewAny">
                    <UniversityAdminLayoutPage />
                  </RequirePermission>
                </RequireAuth>
              }
            >
              <Route index element={<UniversityAdminDashboardPage />} />
              <Route path="registration" element={<UniversityAdminUserRegistrationPage />} />
              <Route path="users" element={<UniversityAdminUserManagementPage />} />
              <Route path="monitoring" element={<UniversityAdminMonitoringPage />} />
              <Route path="reports" element={<UniversityAdminReportsPage />} />
              <Route path="approvals" element={<UniversityAdminApprovalsPage />} />
            </Route>

            <Route
              path="/dashboard/coordinator"
              element={
                <RequireAuth>
                  <RequirePermission permission="users.viewAny">
                    <CoordinatorLayoutPage />
                  </RequirePermission>
                </RequireAuth>
              }
            >
              <Route index element={<CoordinatorDashboardPage />} />
              <Route path="registration" element={<DepartmentAdminUserRegistrationPage />} />
              <Route path="users" element={<CoordinatorUserManagementPage />} />
              <Route path="assignments" element={<CoordinatorAssignmentsPage />} />
              <Route path="reports" element={<CoordinatorReportsPage />} />
              <Route path="approvals" element={<CoordinatorApprovalsPage />} />
              <Route path="settings" element={<CoordinatorSettingsPage />} />
            </Route>

            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="internships" element={<Internships />} />
              <Route path="applications" element={<Applications />} />
              <Route path="reports" element={<Reports />} />
              <Route path="evaluations" element={<Evaluations />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
