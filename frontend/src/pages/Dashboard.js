import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentDashboard from '../components/StudentDashboard';
import CompanyDashboard from '../components/CompanyDashboard';
import ExaminerDashboard from '../components/ExaminerDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get user info from localStorage
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      const role = user.role || 'student';
      setUserRole(role);

      // Coordinators should use the new Coordinator Portal only.
      if (role === 'coordinator') {
        navigate('/dashboard/coordinator', { replace: true });
        return;
      }

      // University Admin (Admin/Super Admin) should use the new University Admin Portal only.
      if (role === 'admin' || role === 'super_admin') {
        navigate('/dashboard/admin', { replace: true });
        return;
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to load user information');
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="dashboard-loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="dashboard-error">
          <div className="error-container">
            <span className="error-icon">⚠️</span>
            <h3>Error Loading Dashboard</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      );
    }

    switch (userRole) {
      case 'student':
        return <StudentDashboard onLogout={handleLogout} />;
      case 'company':
        return <CompanyDashboard onLogout={handleLogout} />;
      case 'coordinator':
        return null;
      case 'examiner':
        return <ExaminerDashboard onLogout={handleLogout} />;
      case 'advisor':
        // Advisor workflow is closest to examiner (assigned students/reports/evaluations).
        return <ExaminerDashboard onLogout={handleLogout} />;
      case 'admin':
      case 'super_admin':
        return null;
      default:
        return <StudentDashboard onLogout={handleLogout} />;
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <span className="welcome-text">Welcome to ARU Internship Management System</span>
            <span className="user-role">{userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <span className="logout-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>

      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
