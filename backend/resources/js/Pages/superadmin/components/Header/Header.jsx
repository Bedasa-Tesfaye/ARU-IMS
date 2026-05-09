import React, { useState, useRef, useEffect } from 'react';
import './Header.css';

const Header = ({ 
  activeSection, 
  currentTime, 
  sidebarOpen, 
  onToggleSidebar,
  unreadNotifications = 0,
  notifications = [],
  onNotificationClick,
  onSearch,
  onAIBriefing,
  systemStatus = { api: 'healthy', database: 'healthy', storage: 67, sessions: 12, lastBackup: '2 hours ago' },
  adminName = 'Super Admin',
  adminRole = 'System Administrator',
  onLogout,
  onQuickRegister,
  onExportData
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAIBriefing, setShowAIBriefing] = useState(false);
  const [showStatusPanel, setShowStatusPanel] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [aiBriefingData, setAiBriefingData] = useState(null);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('aru_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  
  const searchRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const briefingRef = useRef(null);
  const statusPanelRef = useRef(null);
  const quickActionsRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.querySelector('input')?.focus();
      }
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowProfile(false);
        setShowAIBriefing(false);
        setShowStatusPanel(false);
        setShowQuickActions(false);
        setSearchFocused(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
      if (briefingRef.current && !briefingRef.current.contains(e.target)) {
        setShowAIBriefing(false);
      }
      if (statusPanelRef.current && !statusPanelRef.current.contains(e.target)) {
        setShowStatusPanel(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target)) {
        setShowQuickActions(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSectionTitle = () => {
    const titles = {
      overview: 'Dashboard Overview',
      student: 'Student Registration',
      company: 'Company Registration',
      examiner: 'Examiner Registration',
      advisor: 'Advisor Registration',
      'all-users': 'All Users Management',
      students: 'Student Management',
      examiners: 'Examiner Management',
      coordinators: 'Coordinator Management',
      companies: 'Company Management',
      advisors: 'Advisor Management',
      settings: 'System Settings',
      'pending-approvals': 'Pending Approvals',
      'assign': 'Assign Examiners & Advisors',
      'reports': 'Reports & Analytics',
      'reports-analytics': 'Reports & Analytics',
      'internship-grades': 'Internship composite grades',
      'ai-insights': 'AI Insights & Automation',
      'audit-logs': 'Audit Logs',
    };
    return titles[activeSection] || 'Super Admin Dashboard';
  };

  const getSectionIcon = () => {
    const icons = {
      overview: '📊',
      student: '🎓',
      company: '🏢',
      examiner: '👨‍🏫',
      advisor: '👨‍💼',
      'all-users': '👥',
      students: '🎓',
      examiners: '👨‍🏫',
      coordinators: '📋',
      companies: '🏢',
      advisors: '👨‍💼',
      settings: '⚙️',
      'pending-approvals': '⏳',
      'assign': '🧩',
      'reports': '📈',
      'reports-analytics': '📈',
      'internship-grades': '🎓',
      'ai-insights': '🤖',
      'audit-logs': '📋',
    };
    return icons[activeSection] || '👑';
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        generateSearchSuggestions(query);
      }, 300);
    } else {
      setSearchSuggestions([]);
    }
  };

  const generateSearchSuggestions = (query) => {
    const lowerQuery = query.toLowerCase();
    const suggestions = [];
    
    const patterns = [
      { keywords: ['student', 'unassigned', 'pending'], suggestion: 'Find unassigned students' },
      { keywords: ['company', 'partner', 'approval'], suggestion: 'Show pending partnership requests' },
      { keywords: ['examiner', 'workload', 'available'], suggestion: 'Find available examiners' },
      { keywords: ['internship', 'post', 'approve'], suggestion: 'Review internship posts for approval' },
      { keywords: ['report', 'analytics', 'statistics'], suggestion: 'Generate system report' },
      { keywords: ['inactive', 'suspended', 'user'], suggestion: 'Show inactive users' },
    ];

    patterns.forEach(pattern => {
      const matches = pattern.keywords.some(keyword => lowerQuery.includes(keyword));
      if (matches) suggestions.push(pattern.suggestion);
    });

    if (suggestions.length === 0) {
      suggestions.push(`Search for "${query}" across all users`);
      suggestions.push(`Search for "${query}" in approvals`);
      suggestions.push(`Search for "${query}" in audit logs`);
    }

    setSearchSuggestions(suggestions);
  };

  const executeSearch = (suggestion) => {
    const query = searchQuery || suggestion;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('aru_recent_searches', JSON.stringify(updated));

    if (onSearch) onSearch(query);

    setSearchQuery('');
    setSearchFocused(false);
    setSearchSuggestions([]);
  };

  const handleNotificationClick = (notification) => {
    if (onNotificationClick) onNotificationClick(notification);
    setShowNotifications(false);
  };

  const handleAIBriefing = () => {
    setShowAIBriefing(!showAIBriefing);
    if (!aiBriefingData) {
      const briefing = {
        date: new Date(),
        totalUsers: 156,
        newToday: 5,
        pendingApprovals: 12,
        urgentApprovals: 3,
        unassignedStudents: 8,
        systemHealth: 'All systems operational',
        predictions: '15 new registrations expected today',
        recommendations: [
          'Approve 3 partnership requests pending for 5+ days',
          '8 students unassigned - run AI auto-assignment',
          'System backup recommended within 24 hours'
        ]
      };
      setAiBriefingData(briefing);
      if (onAIBriefing) onAIBriefing(briefing);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'healthy': return 'green';
      case 'degraded': return 'yellow';
      case 'critical': return 'red';
      default: return 'green';
    }
  };

  const getSystemOverallStatus = () => {
    const statuses = [systemStatus.api, systemStatus.database];
    if (statuses.includes('critical')) return 'red';
    if (statuses.includes('degraded')) return 'yellow';
    return 'green';
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'urgent': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🟢';
      case 'ai-tip': return '💡';
      case 'success': return '✅';
      default: return '📌';
    }
  };

  return (
    <>
      <header className="sa-header">
        {/* ============================================ */}
        {/* TOP ROW: TITLE + TIME                        */}
        {/* ============================================ */}
        <div className="header-main">
          {/* Left: Sidebar Toggle + Title */}
          <div className="header-left">
            <button 
              className="sidebar-toggle" 
              onClick={onToggleSidebar}
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              <span className="toggle-icon">{sidebarOpen ? '✕' : '☰'}</span>
            </button>
            
            <div className="header-title">
              <div className="title-icon">{getSectionIcon()}</div>
              <div className="title-text">
                <h1>{getSectionTitle()}</h1>
                <p>Manage and monitor your internship ecosystem</p>
              </div>
            </div>
          </div>

          {/* Right: Time Display */}
          <div className="header-time">
            <span className="time-value">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="time-date">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* ============================================ */}
        {/* BOTTOM ROW: TOOLBAR                          */}
        {/* ============================================ */}
        <div className="header-toolbar">
          {/* Global Search */}
          <div className={`global-search ${searchFocused ? 'focused' : ''}`} ref={searchRef}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="AI Search: Find users, approvals, reports..."
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery) executeSearch();
              }}
              aria-label="Global search"
            />
            <span className="search-shortcut">⌘K</span>

            {/* Search Dropdown */}
            {searchFocused && (searchSuggestions.length > 0 || recentSearches.length > 0 || searchQuery) && (
              <div className="search-dropdown">
                {searchQuery && searchSuggestions.length > 0 && (
                  <div className="search-section">
                    <span className="section-label">AI Suggestions</span>
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="search-item ai-suggestion"
                        onClick={() => executeSearch(suggestion)}
                      >
                        <span className="item-icon">🤖</span>
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}

                {recentSearches.length > 0 && (
                  <div className="search-section">
                    <span className="section-label">Recent Searches</span>
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        className="search-item"
                        onClick={() => {
                          setSearchQuery(search);
                          executeSearch(search);
                        }}
                      >
                        <span className="item-icon">🕐</span>
                        <span>{search}</span>
                      </button>
                    ))}
                    <button
                      className="search-item clear-searches"
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem('aru_recent_searches');
                      }}
                    >
                      <span className="item-icon">🗑️</span>
                      <span>Clear recent searches</span>
                    </button>
                  </div>
                )}

                {!searchQuery && searchSuggestions.length === 0 && recentSearches.length === 0 && (
                  <div className="search-section">
                    <span className="section-label">Quick Searches</span>
                    <button className="search-item" onClick={() => executeSearch('Show pending approvals')}>
                      <span className="item-icon">⏳</span>
                      <span>Show pending approvals</span>
                    </button>
                    <button className="search-item" onClick={() => executeSearch('Find unassigned students')}>
                      <span className="item-icon">🎓</span>
                      <span>Find unassigned students</span>
                    </button>
                    <button className="search-item" onClick={() => executeSearch('Generate system report')}>
                      <span className="item-icon">📊</span>
                      <span>Generate system report</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side Icons */}
          <div className="header-right">
            {/* System Status */}
            <div className="system-status-wrapper" ref={statusPanelRef}>
              <button 
                className="system-status-btn" 
                title="System Status"
                onClick={() => setShowStatusPanel(!showStatusPanel)}
              >
                <span className={`status-dot ${getSystemOverallStatus()}`}></span>
              </button>

              {showStatusPanel && (
                <div className="status-panel">
                  <div className="status-header">
                    <h3>System Health</h3>
                    <span className={`status-badge ${getSystemOverallStatus()}`}>
                      {getSystemOverallStatus() === 'green' ? 'All Systems Operational' : 
                       getSystemOverallStatus() === 'yellow' ? 'Degraded Performance' : 'System Issues Detected'}
                    </span>
                  </div>
                  <div className="status-items">
                    <div className="status-item">
                      <span className="status-label">API Server</span>
                      <span className="status-indicator">
                        {systemStatus.api === 'healthy' ? '145ms ✅' : 
                         systemStatus.api === 'degraded' ? 'Slow ⚠️' : 'Down ❌'}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Database</span>
                      <span className="status-indicator">
                        {systemStatus.database === 'healthy' ? 'Healthy ✅' : 
                         systemStatus.database === 'degraded' ? 'Issues ⚠️' : 'Critical ❌'}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Storage</span>
                      <span className="status-indicator">
                        <div className="storage-bar">
                          <div className="storage-fill" style={{width: `${systemStatus.storage}%`}}></div>
                        </div>
                        <span>{systemStatus.storage}%</span>
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Active Sessions</span>
                      <span className="status-indicator">{systemStatus.sessions}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Last Backup</span>
                      <span className="status-indicator">{systemStatus.lastBackup}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-wrapper" ref={quickActionsRef}>
              <button 
                className="header-icon-btn" 
                title="Quick Actions"
                onClick={() => setShowQuickActions(!showQuickActions)}
              >
                ⚡
              </button>

              {showQuickActions && (
                <div className="quick-actions-dropdown">
                  <button onClick={() => { onQuickRegister?.('student'); setShowQuickActions(false); }}>
                    <span>🎓</span> Register Student
                  </button>
                  <button onClick={() => { onQuickRegister?.('company'); setShowQuickActions(false); }}>
                    <span>🏢</span> Register Company
                  </button>
                  <button onClick={() => { onQuickRegister?.('examiner'); setShowQuickActions(false); }}>
                    <span>👨‍🏫</span> Register Examiner
                  </button>
                  <button onClick={() => { onQuickRegister?.('advisor'); setShowQuickActions(false); }}>
                    <span>👨‍💼</span> Register Advisor
                  </button>
                  <div className="dropdown-divider"></div>
                  <button onClick={() => { onExportData?.('users'); setShowQuickActions(false); }}>
                    <span>📥</span> Export User Report
                  </button>
                  <button onClick={() => { onExportData?.('approvals'); setShowQuickActions(false); }}>
                    <span>📥</span> Export Approvals Report
                  </button>
                </div>
              )}
            </div>

            {/* AI Briefing */}
            <div ref={briefingRef} style={{ position: 'relative' }}>
              <button 
                className="ai-briefing-btn" 
                onClick={handleAIBriefing}
                title="AI Daily Briefing"
              >
                <span className="briefing-icon">✨</span>
                <span className="briefing-text">AI Briefing</span>
              </button>

              {showAIBriefing && aiBriefingData && (
                <div className="ai-briefing-panel">
                  <div className="briefing-header">
                    <div>
                      <h3>✨ AI Daily Briefing</h3>
                      <p>{aiBriefingData.date.toLocaleDateString()} - System Overview</p>
                    </div>
                    <button onClick={() => setShowAIBriefing(false)}>✕</button>
                  </div>
                  <div className="briefing-content">
                    <div className="briefing-stats">
                      <div className="briefing-stat">
                        <span className="stat-icon">📊</span>
                        <div>
                          <div className="stat-value">{aiBriefingData.totalUsers}</div>
                          <div className="stat-label">Total Users</div>
                        </div>
                      </div>
                      <div className="briefing-stat">
                        <span className="stat-icon">🆕</span>
                        <div>
                          <div className="stat-value">+{aiBriefingData.newToday}</div>
                          <div className="stat-label">New Today</div>
                        </div>
                      </div>
                      <div className="briefing-stat">
                        <span className="stat-icon">⏳</span>
                        <div>
                          <div className="stat-value">{aiBriefingData.pendingApprovals}</div>
                          <div className="stat-label">Pending</div>
                        </div>
                      </div>
                    </div>
                    <div className="briefing-alert urgent">
                      <span>🔴</span> {aiBriefingData.urgentApprovals} approvals need immediate attention
                    </div>
                    <div className="briefing-alert warning">
                      <span>🟡</span> {aiBriefingData.unassignedStudents} students unassigned
                    </div>
                    <div className="briefing-recommendations">
                      <h4>🤖 AI Recommendations</h4>
                      <ul>
                        {aiBriefingData.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="briefing-prediction">
                      <span>🔮</span> {aiBriefingData.predictions}
                    </div>
                  </div>
                  <div className="briefing-footer">
                    <button onClick={() => setShowAIBriefing(false)}>Dismiss</button>
                    <button onClick={() => {
                      setShowAIBriefing(false);
                      setTimeout(() => setShowAIBriefing(true), 14400000);
                    }}>Remind in 4 hours</button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="notification-wrapper" ref={notificationRef}>
              <button 
                className={`header-icon-btn notification-btn ${unreadNotifications > 0 ? 'has-notifications' : ''}`}
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
                aria-label={`Notifications ${unreadNotifications > 0 ? `(${unreadNotifications} unread)` : ''}`}
              >
                <span className="icon">🔔</span>
                {unreadNotifications > 0 && (
                  <span className="notification-badge">
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    <button className="mark-read-btn">Mark all read</button>
                  </div>
                  <div className="notification-list">
                    {notifications.length > 0 ? (
                      notifications.map((notif, index) => (
                        <div 
                          key={index} 
                          className={`notification-item ${notif.unread ? 'unread' : ''}`}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <span className="notif-icon">{getNotificationIcon(notif.type)}</span>
                          <div className="notif-content">
                            <p className="notif-message">{notif.message}</p>
                            <span className="notif-time">{formatRelativeTime(notif.timestamp)}</span>
                          </div>
                          {notif.action && (
                            <button className="notif-action">{notif.action}</button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="notification-empty">
                        <span>🎉</span>
                        <p>No new notifications</p>
                        <span className="empty-subtitle">You're all caught up!</span>
                      </div>
                    )}
                  </div>
                  <div className="notification-footer">
                    <button>View all notifications</button>
                    <button>Notification settings</button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="profile-wrapper" ref={profileRef}>
              <button 
                className="profile-btn" 
                onClick={() => setShowProfile(!showProfile)}
                title="Profile"
                aria-label="User profile menu"
              >
                <div className="avatar">
                  <span>SA</span>
                  <span className="avatar-crown">👑</span>
                </div>
                <span className="admin-name">{adminName}</span>
                <span className="dropdown-arrow">▾</span>
              </button>

              {showProfile && (
                <div className="profile-dropdown">
                  <div className="profile-header">
                    <div className="profile-avatar-large">
                      <span>SA</span>
                      <span className="avatar-crown-large">👑</span>
                    </div>
                    <div className="profile-info">
                      <h4>{adminName}</h4>
                      <p>{adminRole}</p>
                      <span className="active-status">
                        <span className="online-dot"></span> Online
                      </span>
                    </div>
                  </div>
                  <div className="profile-menu">
                    <button className="profile-menu-item">
                      <span>👤</span> My Profile
                    </button>
                    <button className="profile-menu-item">
                      <span>🔑</span> Change Password
                    </button>
                    <button className="profile-menu-item">
                      <span>⚙️</span> Quick Settings
                    </button>
                    <button className="profile-menu-item">
                      <span>🌙</span> Dark Mode
                    </button>
                    <button className="profile-menu-item">
                      <span>📖</span> Help & Documentation
                    </button>
                  </div>
                  <div className="profile-footer">
                    <button className="logout-btn" onClick={onLogout}>
                      <span>🚪</span> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {searchFocused && window.innerWidth < 768 && (
        <div className="mobile-search-overlay">
          <div className="mobile-search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search users, approvals, reports..."
              value={searchQuery}
              onChange={handleSearch}
              autoFocus
            />
            <button onClick={() => setSearchFocused(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
