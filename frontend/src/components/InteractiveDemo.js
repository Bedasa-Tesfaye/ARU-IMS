import React, { useState } from 'react';
import '../styles/InteractiveDemo.css';

const InteractiveDemo = () => {
  const [activeDemo, setActiveDemo] = useState('dashboard');
  const [currentStep, setCurrentStep] = useState(0);

  const demos = [
    {
      id: 'dashboard',
      title: 'Student Dashboard',
      icon: '📊',
      description: 'Comprehensive dashboard for tracking internship progress',
      steps: [
        { title: 'Login', description: 'Secure authentication with role-based access' },
        { title: 'Dashboard Overview', description: 'View internship status, reports, and notifications' },
        { title: 'Progress Tracking', description: 'Monitor weekly progress and milestones' },
        { title: 'Report Submission', description: 'Submit weekly reports with file attachments' }
      ]
    },
    {
      id: 'application',
      title: 'Internship Application',
      icon: '📝',
      description: 'Streamlined application process for internship opportunities',
      steps: [
        { title: 'Browse Opportunities', description: 'Explore available internship positions' },
        { title: 'Apply Online', description: 'Submit application with required documents' },
        { title: 'Track Status', description: 'Monitor application progress in real-time' },
        { title: 'Receive Notifications', description: 'Get updates on application decisions' }
      ]
    },
    {
      id: 'evaluation',
      title: 'Evaluation System',
      icon: '⭐',
      description: 'Comprehensive evaluation and feedback system',
      steps: [
        { title: 'Supervisor Review', description: 'Regular performance evaluations by supervisors' },
        { title: 'Company Feedback', description: 'Company assessment of student performance' },
        { title: 'Peer Reviews', description: 'Collaborative feedback from fellow interns' },
        { title: 'Final Assessment', description: 'Comprehensive final evaluation report' }
      ]
    },
    {
      id: 'communication',
      title: 'Communication Hub',
      icon: '💬',
      description: 'Seamless communication between all stakeholders',
      steps: [
        { title: 'Direct Messaging', description: 'Chat with supervisors and coordinators' },
        { title: 'Announcement Board', description: 'Important updates and notifications' },
        { title: 'Document Sharing', description: 'Share files and resources securely' },
        { title: 'Video Conferencing', description: 'Virtual meetings and consultations' }
      ]
    }
  ];

  const currentDemo = demos.find(demo => demo.id === activeDemo);

  const nextStep = () => {
    if (currentStep < currentDemo.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetDemo = () => {
    setCurrentStep(0);
  };

  return (
    <section className="interactive-demo">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Experience the Platform</h2>
          <p className="section-subtitle">Interactive walkthrough of our comprehensive internship management system</p>
        </div>

        <div className="demo-selector">
          <div className="demo-tabs">
            {demos.map(demo => (
              <button
                key={demo.id}
                className={`demo-tab ${activeDemo === demo.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveDemo(demo.id);
                  setCurrentStep(0);
                }}
              >
                <span className="demo-icon">{demo.icon}</span>
                <div className="demo-info">
                  <h4>{demo.title}</h4>
                  <p>{demo.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="demo-content">
          <div className="demo-visual">
            <div className="demo-screen">
              <div className="screen-header">
                <div className="screen-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="screen-title">{currentDemo.title}</div>
              </div>
              
              <div className="screen-content">
                <div className="step-content">
                  <div className="step-number">{currentStep + 1}</div>
                  <h3>{currentDemo.steps[currentStep].title}</h3>
                  <p>{currentDemo.steps[currentStep].description}</p>
                  
                  <div className="demo-illustration">
                    {activeDemo === 'dashboard' && (
                      <div className="dashboard-preview">
                        <div className="dashboard-header">
                          <div className="user-profile">👤</div>
                          <div className="user-info">
                            <h4>John Doe</h4>
                            <p>IT Student</p>
                          </div>
                        </div>
                        <div className="dashboard-stats">
                          <div className="stat">
                            <span className="stat-value">85%</span>
                            <span className="stat-label">Progress</span>
                          </div>
                          <div className="stat">
                            <span className="stat-value">12</span>
                            <span className="stat-label">Weeks</span>
                          </div>
                          <div className="stat">
                            <span className="stat-value">4.5</span>
                            <span className="stat-label">Rating</span>
                          </div>
                        </div>
                        <div className="dashboard-actions">
                          <button className="action-btn">📄 Submit Report</button>
                          <button className="action-btn">💬 Messages</button>
                          <button className="action-btn">📊 View Progress</button>
                        </div>
                      </div>
                    )}
                    
                    {activeDemo === 'application' && (
                      <div className="application-preview">
                        <div className="job-card">
                          <div className="job-header">
                            <h4>Software Developer Intern</h4>
                            <span className="company">Ethio Telecom</span>
                          </div>
                          <div className="job-details">
                            <div className="detail">
                              <span className="label">Duration:</span>
                              <span className="value">3 Months</span>
                            </div>
                            <div className="detail">
                              <span className="label">Location:</span>
                              <span className="value">Addis Ababa</span>
                            </div>
                            <div className="detail">
                              <span className="label">Stipend:</span>
                              <span className="value">ETB 3,000/month</span>
                            </div>
                          </div>
                          <div className="job-actions">
                            <button className="apply-btn">Apply Now</button>
                            <button className="save-btn">Save for Later</button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {activeDemo === 'evaluation' && (
                      <div className="evaluation-preview">
                        <div className="evaluation-form">
                          <div className="form-section">
                            <h4>Performance Metrics</h4>
                            <div className="metric">
                              <label>Technical Skills</label>
                              <div className="rating">
                                <span className="star">⭐</span>
                                <span className="star">⭐</span>
                                <span className="star">⭐</span>
                                <span className="star">⭐</span>
                                <span className="star">☆</span>
                              </div>
                            </div>
                            <div className="metric">
                              <label>Communication</label>
                              <div className="rating">
                                <span className="star">⭐</span>
                                <span className="star">⭐</span>
                                <span className="star">⭐</span>
                                <span className="star">⭐</span>
                                <span className="star">⭐</span>
                              </div>
                            </div>
                          </div>
                          <div className="feedback-section">
                            <label>Comments</label>
                            <textarea placeholder="Enter your feedback..."></textarea>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {activeDemo === 'communication' && (
                      <div className="communication-preview">
                        <div className="chat-interface">
                          <div className="chat-header">
                            <div className="chat-user">👨‍🏫 Dr. Birhanu</div>
                            <span className="chat-status">Online</span>
                          </div>
                          <div className="chat-messages">
                            <div className="message received">
                              <p>How is your internship progressing?</p>
                              <span className="time">10:30 AM</span>
                            </div>
                            <div className="message sent">
                              <p>It's going well! I'm learning a lot about web development.</p>
                              <span className="time">10:32 AM</span>
                            </div>
                          </div>
                          <div className="chat-input">
                            <input type="text" placeholder="Type your message..." />
                            <button className="send-btn">📤</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="demo-controls">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((currentStep + 1) / currentDemo.steps.length) * 100}%` }}></div>
            </div>
            
            <div className="step-indicators">
              {currentDemo.steps.map((_, index) => (
                <button
                  key={index}
                  className={`step-indicator ${index === currentStep ? 'active' : index < currentStep ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="control-buttons">
              <button 
                className="control-btn prev" 
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                ← Previous
              </button>
              <button className="control-btn reset" onClick={resetDemo}>
                🔄 Reset
              </button>
              <button 
                className="control-btn next" 
                onClick={nextStep}
                disabled={currentStep === currentDemo.steps.length - 1}
              >
                Next →
              </button>
            </div>

            <div className="demo-features">
              <h4>Key Features</h4>
              <ul>
                <li>🔐 Secure authentication system</li>
                <li>📱 Mobile-responsive design</li>
                <li>⚡ Real-time notifications</li>
                <li>📊 Comprehensive analytics</li>
                <li>💾 Cloud-based storage</li>
                <li>🌍 Multi-language support</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="demo-cta">
          <h3>Ready to Get Started?</h3>
          <p>Experience the full power of our internship management platform</p>
          <div className="cta-buttons">
            <button className="btn-primary">Start Free Trial</button>
            <button className="btn-secondary">Schedule Demo</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;
