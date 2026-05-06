import React from 'react';
import { router } from '@inertiajs/react';
import { NAV } from '../../constants';
import './AdvisorSidebar.css';

export default function AdvisorSidebar({ active, sidebarOpen, onNavigate }) {
  return (
    <aside className={`adv-sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="adv-brand">
        <h2>ARU IMS</h2>
        <p className="adv-brand-sub">Advisor workspace</p>
      </div>
      <nav className="adv-nav-wrap">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`adv-nav ${active === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="adv-nav-ico">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <button type="button" className="adv-nav adv-logout" onClick={() => router.post('/logout')}>
        <span className="adv-nav-ico">🚪</span> Logout
      </button>
    </aside>
  );
}
