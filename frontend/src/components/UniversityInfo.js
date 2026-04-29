import React, { useState, useEffect } from 'react';
import '../styles/UniversityInfo.css';

const UniversityInfo = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [animatedNumbers, setAnimatedNumbers] = useState({
    students: 0,
    programs: 0,
    companies: 0,
    successRate: 0
  });

  const targetNumbers = {
    students: 15000,
    programs: 45,
    companies: 200,
    successRate: 96
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setAnimatedNumbers(prev => {
          const newNumbers = {};
          let allComplete = true;

          Object.keys(targetNumbers).forEach(key => {
            const current = prev[key];
            const target = targetNumbers[key];
            const increment = Math.ceil((target - current) / 20);
            const next = Math.min(current + increment, target);
            
            newNumbers[key] = next;
            
            if (next < target) {
              allComplete = false;
            }
          });

          if (allComplete) {
            clearInterval(interval);
          }

          return newNumbers;
        });
      }, 50);

      return () => clearInterval(interval);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    {
      id: 'overview',
      title: 'University Overview',
      icon: '🏛️',
      content: {
        description: 'Arsi University is a premier institution of higher learning located in Asella, Ethiopia.',
        highlights: [
          'Established in 2014 as part of Ethiopia\'s higher education expansion',
          'Committed to excellence in teaching, research, and community service',
          'Home to over 15,000 students across various disciplines',
          'Strategic location in the heart of Arsi region'
        ]
      }
    },
    {
      id: 'department',
      title: 'IT Department',
      icon: '💻',
      content: {
        description: 'The Department of Information Technology leads innovation in digital education.',
        highlights: [
          'State-of-the-art computer labs and facilities',
          'Experienced faculty with industry expertise',
          'Industry partnerships with leading tech companies',
          'Focus on practical skills and real-world applications'
        ]
      }
    },
    {
      id: 'internship',
      title: 'Internship Program',
      icon: '🎓',
      content: {
        description: 'Our comprehensive internship program bridges academic learning with industry experience.',
        highlights: [
          'Mandatory internship for all IT students',
          'Partnerships with 200+ leading companies',
          'Structured evaluation and feedback system',
          '96% successful placement rate'
        ]
      }
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <section className="university-info">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Arsi University Excellence</h2>
          <p className="section-subtitle">Leading the way in technology education and industry partnership</p>
        </div>

        <div className="university-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-number">{animatedNumbers.students.toLocaleString()}+</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-number">{animatedNumbers.programs}+</div>
            <div className="stat-label">Academic Programs</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🤝</div>
            <div className="stat-number">{animatedNumbers.companies}+</div>
            <div className="stat-label">Partner Companies</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-number">{animatedNumbers.successRate}%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>

        <div className="info-tabs">
          <div className="tab-buttons">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-text">{tab.title}</span>
              </button>
            ))}
          </div>

          <div className="tab-content">
            <div className="content-header">
              <h3>{activeTabData.content.description}</h3>
            </div>
            <div className="highlights-list">
              {activeTabData.content.highlights.map((highlight, index) => (
                <div key={index} className="highlight-item">
                  <div className="highlight-icon">✨</div>
                  <p>{highlight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="university-features">
          <div className="feature-grid">
            <div className="university-feature">
              <div className="feature-visual">
                <div className="feature-icon">🌍</div>
              </div>
              <div className="feature-content">
                <h4>Global Recognition</h4>
                <p>Internationally accredited programs with global industry partnerships</p>
              </div>
            </div>
            <div className="university-feature">
              <div className="feature-visual">
                <div className="feature-icon">🔬</div>
              </div>
              <div className="feature-content">
                <h4>Research Excellence</h4>
                <p>Cutting-edge research facilities and innovation centers</p>
              </div>
            </div>
            <div className="university-feature">
              <div className="feature-visual">
                <div className="feature-icon">🏆</div>
              </div>
              <div className="feature-content">
                <h4>Award-winning Faculty</h4>
                <p>Recognized educators and industry experts leading our programs</p>
              </div>
            </div>
            <div className="university-feature">
              <div className="feature-visual">
                <div className="feature-icon">💡</div>
              </div>
              <div className="feature-content">
                <h4>Innovation Hub</h4>
                <p>Startup incubator and entrepreneurship development center</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UniversityInfo;
