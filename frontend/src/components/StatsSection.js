import React, { useState, useEffect } from 'react';
import '../styles/StatsSection.css';

const StatsSection = () => {
  const [counters, setCounters] = useState({
    companies: 0,
    students: 0,
    internships: 0,
    successRate: 0
  });

  const targetStats = {
    companies: 500,
    students: 10000,
    internships: 2500,
    successRate: 95
  };

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    const timer = setInterval(() => {
      setCounters(prev => {
        const newCounters = {};
        let allComplete = true;

        Object.keys(targetStats).forEach(key => {
          const current = prev[key];
          const target = targetStats[key];
          const increment = (target - current) / (steps - 1);
          const next = Math.min(current + increment, target);
          
          newCounters[key] = next;
          
          if (next < target) {
            allComplete = false;
          }
        });

        if (allComplete) {
          clearInterval(timer);
        }

        return newCounters;
      });
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      number: Math.round(counters.companies),
      label: 'Partner Companies',
      icon: '🏢',
      color: '#667eea'
    },
    {
      number: Math.round(counters.students).toLocaleString(),
      label: 'Active Students',
      icon: '🎓',
      color: '#764ba2'
    },
    {
      number: Math.round(counters.internships).toLocaleString(),
      label: 'Internships Completed',
      icon: '📋',
      color: '#f093fb'
    },
    {
      number: Math.round(counters.successRate) + '%',
      label: 'Success Rate',
      icon: '📈',
      color: '#43e97b'
    }
  ];

  return (
    <section className="stats-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Impact & Achievements</h2>
          <p className="section-subtitle">
            Transforming internship experiences through technology and innovation
          </p>
        </div>
        
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                <span className="icon-emoji">{stat.icon}</span>
              </div>
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
        
        <div className="achievements-grid">
          <div className="achievement-card">
            <div className="achievement-icon">🏆</div>
            <h3>Industry Recognition</h3>
            <p>Awarded "Best Internship Platform" by Educational Technology Association 2023</p>
          </div>
          
          <div className="achievement-card">
            <div className="achievement-icon">🌟</div>
            <h3>Student Success</h3>
            <p>85% of interns receive job offers from their internship companies</p>
          </div>
          
          <div className="achievement-card">
            <div className="achievement-icon">🤝</div>
            <h3>Partnership Network</h3>
            <p>Collaborating with Fortune 500 companies and leading startups worldwide</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
