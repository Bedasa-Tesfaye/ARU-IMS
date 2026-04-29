import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getNavItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    ];

    if (user?.role === 'student') {
      baseItems.push(
        { path: '/internships', label: 'Internships', icon: '💼' },
        { path: '/applications', label: 'My Applications', icon: '📋' },
        { path: '/reports', label: 'Reports', icon: '📄' }
      );
    }

    if (user?.role === 'coordinator') {
      baseItems.push(
        { path: '/internships', label: 'Internships', icon: '💼' },
        { path: '/applications', label: 'Applications', icon: '📋' },
        { path: '/reports', label: 'Reports', icon: '📄' },
        { path: '/evaluations', label: 'Evaluations', icon: '📝' }
      );
    }

    if (user?.role === 'company') {
      baseItems.push(
        { path: '/internships', label: 'My Internships', icon: '💼' },
        { path: '/applications', label: 'Applications', icon: '📋' },
        { path: '/evaluations', label: 'Evaluations', icon: '📝' }
      );
    }

    if (user?.role === 'examiner') {
      baseItems.push(
        { path: '/reports', label: 'Reports', icon: '📄' },
        { path: '/evaluations', label: 'Evaluations', icon: '📝' }
      );
    }

    if (user?.role === 'admin') {
      baseItems.push(
        { path: '/internships', label: 'Internships', icon: '💼' },
        { path: '/applications', label: 'Applications', icon: '📋' },
        { path: '/reports', label: 'Reports', icon: '📄' },
        { path: '/evaluations', label: 'Evaluations', icon: '📝' }
      );
    }

    return baseItems;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="d-flex">
      <div className="sidebar p-3" style={{ width: '250px' }}>
        <div className="mb-4">
          <h5 className="text-center">ARU Internship</h5>
        </div>
        
        <Nav className="flex-column">
          {getNavItems().map((item) => (
            <Nav.Link
              key={item.path}
              as={Link}
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              <span className="me-2">{item.icon}</span>
              {item.label}
            </Nav.Link>
          ))}
        </Nav>

        <Nav className="flex-column mt-auto">
          <Nav.Link as={Link} to="/profile">
            <span className="me-2">👤</span>
            Profile
          </Nav.Link>
          <Nav.Link onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <span className="me-2">🚪</span>
            Logout
          </Nav.Link>
        </Nav>
      </div>

      <div className="main-content flex-grow-1">
        <Container fluid>
          <Row className="mb-4">
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="mb-0">Welcome, {user?.first_name}!</h2>
                  <p className="text-muted mb-0">
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Dashboard
                  </p>
                </div>
                <div className="text-end">
                  <small className="text-muted">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </small>
                </div>
              </div>
            </Col>
          </Row>
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default Layout;
