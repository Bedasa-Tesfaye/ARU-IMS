import React, { useState } from 'react';
import '../styles/SuccessStories.css';

const SuccessStories = () => {
  const [activeStory, setActiveStory] = useState(0);
  
  const stories = [
    {
      id: 1,
      name: "Bedasa Tadesse",
      role: "Software Developer at Ethio Telecom",
      image: "👨‍💻",
      company: "Ethio Telecom",
      graduation: "2023",
      department: "Information Technology",
      quote: "The internship program at Arsi University was transformative. It gave me hands-on experience and direct exposure to industry challenges. I was hired immediately after completing my internship.",
      achievements: [
        "Led development of mobile banking app",
        "Promoted to Senior Developer within 1 year",
        "Mentoring current Arsi University interns"
      ],
      stats: {
        salary: "ETB 25,000/month",
        team: "15 developers",
        projects: "5+ major projects"
      }
    },
    {
      id: 2,
      name: "Haweltu Kassa",
      role: "Data Scientist at Commercial Bank of Ethiopia",
      image: "👩‍💼",
      company: "Commercial Bank of Ethiopia",
      graduation: "2022",
      department: "Information Technology",
      quote: "The structured internship program helped me bridge academic knowledge with practical skills. The mentorship I received was invaluable for my career growth.",
      achievements: [
        "Implemented AI-powered fraud detection system",
        "Reduced processing time by 40%",
        "Published research papers on ML applications"
      ],
      stats: {
        salary: "ETB 22,000/month",
        team: "8 data scientists",
        projects: "10+ ML models"
      }
    },
    {
      id: 3,
      name: "Kaleb Bekele",
      role: "IT Manager at Ethiopian Airlines",
      image: "👨‍✈️",
      company: "Ethiopian Airlines",
      graduation: "2021",
      department: "Information Technology",
      quote: "Arsi University's internship program gave me the foundation to succeed in the competitive aviation industry. The practical experience was unmatched.",
      achievements: [
        "Managed airline reservation system upgrade",
        "Improved system uptime by 99.9%",
        "Leading digital transformation initiatives"
      ],
      stats: {
        salary: "ETB 35,000/month",
        team: "25 IT professionals",
        projects: "3 major system overhauls"
      }
    }
  ];

  const currentStory = stories[activeStory];

  return (
    <section className="success-stories">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Success Stories</h2>
          <p className="section-subtitle">Our graduates making remarkable impact in Ethiopia's tech industry</p>
        </div>

        <div className="stories-showcase">
          <div className="story-selector">
            {stories.map((story, index) => (
              <button
                key={story.id}
                className={`story-tab ${activeStory === index ? 'active' : ''}`}
                onClick={() => setActiveStory(index)}
              >
                <div className="tab-avatar">{story.image}</div>
                <div className="tab-info">
                  <h4>{story.name}</h4>
                  <p>{story.company}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="story-content">
            <div className="story-main">
              <div className="story-header">
                <div className="story-avatar">{currentStory.image}</div>
                <div className="story-info">
                  <h3>{currentStory.name}</h3>
                  <p className="story-role">{currentStory.role}</p>
                  <p className="story-company">{currentStory.company}</p>
                  <div className="story-meta">
                    <span className="graduation">Class of {currentStory.graduation}</span>
                    <span className="department">{currentStory.department}</span>
                  </div>
                </div>
              </div>

              <div className="story-quote">
                <blockquote>
                  "{currentStory.quote}"
                </blockquote>
              </div>

              <div className="story-achievements">
                <h4>Key Achievements</h4>
                <ul>
                  {currentStory.achievements.map((achievement, index) => (
                    <li key={index}>
                      <span className="achievement-icon">🏆</span>
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="story-stats">
              <h4>Career Highlights</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-icon">💰</div>
                  <div className="stat-value">{currentStory.stats.salary}</div>
                  <div className="stat-label">Monthly Salary</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">👥</div>
                  <div className="stat-value">{currentStory.stats.team}</div>
                  <div className="stat-label">Team Size</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">📊</div>
                  <div className="stat-value">{currentStory.stats.projects}</div>
                  <div className="stat-label">Projects Led</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="success-metrics">
          <h3>Program Impact Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-number">96%</div>
              <div className="metric-label">Employment Rate</div>
              <div className="metric-description">Graduates employed within 6 months</div>
            </div>
            <div className="metric-card">
              <div className="metric-number">85%</div>
              <div className="metric-label">Industry Retention</div>
              <div className="metric-description">Still with first employer after 2 years</div>
            </div>
            <div className="metric-card">
              <div className="metric-number">ETB 18K</div>
              <div className="metric-label">Average Starting Salary</div>
              <div className="metric-description">Above industry average</div>
            </div>
            <div className="metric-card">
              <div className="metric-number">200+</div>
              <div className="metric-label">Partner Companies</div>
              <div className="metric-description">Active internship providers</div>
            </div>
          </div>
        </div>

        <div className="alumni-network">
          <div className="network-header">
            <h3>Join Our Growing Alumni Network</h3>
            <p>Connect with 500+ successful graduates working across Ethiopia</p>
          </div>
          <div className="network-stats">
            <div className="network-item">
              <span className="network-number">500+</span>
              <span className="network-label">Alumni</span>
            </div>
            <div className="network-item">
              <span className="network-number">50+</span>
              <span className="network-label">Companies</span>
            </div>
            <div className="network-item">
              <span className="network-number">15+</span>
              <span className="network-label">Industries</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;
