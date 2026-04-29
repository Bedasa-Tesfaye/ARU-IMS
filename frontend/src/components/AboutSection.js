import React from 'react';
import '../styles/AboutSection.css';

const AboutSection = () => {
  const values = [
    {
      icon: '🎯',
      title: 'Mission',
      description: 'To bridge the gap between academic learning and real-world professional experience, empowering students to launch successful careers.'
    },
    {
      icon: '👁️',
      title: 'Vision',
      description: 'Become the leading internship management platform that connects talent with opportunity, fostering meaningful career pathways.'
    },
    {
      icon: '💎',
      title: 'Values',
      description: 'Integrity, excellence, and innovation guide everything we do in supporting students and partner organizations.'
    }
  ];

  const team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Director of Career Services',
      image: '👩‍💼'
    },
    {
      name: 'Michael Chen',
      role: 'Industry Partnerships Lead',
      image: '👨‍💻'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Student Success Manager',
      image: '👩‍🎓'
    },
    {
      name: 'David Kim',
      role: 'Technology Coordinator',
      image: '👨‍🔧'
    }
  ];

  return (
    <section className="about-section" id="about">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">About Us</span>
          <h2 className="section-title">Empowering Future Professionals</h2>
          <p className="section-subtitle">
            The ARU Internship Management System connects students with leading companies 
            to create meaningful career pathways through structured internship programs.
          </p>
        </div>

        <div className="values-grid">
          {values.map((value, index) => (
            <div className="value-card" key={index}>
              <div className="value-icon">{value.icon}</div>
              <h3 className="value-title">{value.title}</h3>
              <p className="value-description">{value.description}</p>
            </div>
          ))}
        </div>

        <div className="about-content">
          <div className="about-text">
            <h3>Our Story</h3>
            <p>
              Founded in 2020, the ARU Internship Management System was created to address 
              the growing need for structured internship programs that benefit both students 
              and employers. We understand that real-world experience is crucial for career 
              success, and we've built a platform that makes finding and managing internships 
              seamless and effective.
            </p>
            <p>
              Our team consists of education professionals, technology experts, and industry 
              leaders who are passionate about helping the next generation of professionals 
              succeed. We work closely with universities and companies to ensure every 
              internship opportunity provides genuine value.
            </p>
          </div>
          <div className="about-stats">
            <div className="about-stat">
              <span className="stat-number">500+</span>
              <span className="stat-text">Partner Companies</span>
            </div>
            <div className="about-stat">
              <span className="stat-number">10,000+</span>
              <span className="stat-text">Students Placed</span>
            </div>
            <div className="about-stat">
              <span className="stat-number">95%</span>
              <span className="stat-text">Success Rate</span>
            </div>
            <div className="about-stat">
              <span className="stat-number">50+</span>
              <span className="stat-text">Universities</span>
            </div>
          </div>
        </div>

        <div className="team-section">
          <h3 className="team-title">Meet Our Team</h3>
          <div className="team-grid">
            {team.map((member, index) => (
              <div className="team-card" key={index}>
                <div className="team-avatar">{member.image}</div>
                <h4 className="team-name">{member.name}</h4>
                <p className="team-role">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;