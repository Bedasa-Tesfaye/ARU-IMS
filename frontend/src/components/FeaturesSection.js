import React from 'react';
import '../styles/FeaturesSection.css';

const FeaturesSection = () => {
  const features = [
    {
      icon: '🎓',
      title: 'For Students',
      description: 'Apply for internships, track progress, submit reports, and receive valuable feedback from industry professionals.',
      color: '#667eea'
    },
    {
      icon: '🏢',
      title: 'For Companies',
      description: 'Post internship opportunities, review applications, evaluate performance, and find the best talent.',
      color: '#764ba2'
    },
    {
      icon: '👨‍🏫',
      title: 'For Coordinators',
      description: 'Manage student applications, assign examiners, oversee internship progress, and ensure quality standards.',
      color: '#f093fb'
    },
    {
      icon: '📊',
      title: 'For Examiners',
      description: 'Evaluate student performance, provide feedback, review reports, and contribute to academic excellence.',
      color: '#4facfe'
    },
    {
      icon: '⚙️',
      title: 'For Administrators',
      description: 'Generate comprehensive reports, monitor system activities, manage users, and ensure smooth operations.',
      color: '#43e97b'
    },
    {
      icon: '🤖',
      title: 'AI-Powered Insights',
      description: 'Smart recommendations, risk detection, performance analytics, and predictive modeling for better outcomes.',
      color: '#fa709a'
    }
  ];

  return (
    <section className="features-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Comprehensive Internship Management</h2>
          <p className="section-subtitle">
            Powerful features designed for every stakeholder in the internship ecosystem
          </p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: feature.color }}>
                <span className="icon-emoji">{feature.icon}</span>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
