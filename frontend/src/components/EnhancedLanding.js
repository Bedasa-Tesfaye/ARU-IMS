import React from 'react';
import VideoHero from './VideoHero';
import AboutSection from './AboutSection';
import PartnershipSection from './PartnershipSection';
import FeaturesSection from './FeaturesSection';
import StatsSection from './StatsSection';
import '../styles/EnhancedLanding.css';

const EnhancedLanding = () => {
  // All your existing logic stays exactly the same
  // Only UI enhancements via CSS

  return (
    <div className="enhanced-landing">
      {/* Hero Section - Your existing VideoHero component */}
      <VideoHero />
      
      {/* About Section - Your existing component */}
      <AboutSection />
      
      {/* Partnership Section - Your existing component */}
      <PartnershipSection />
      
      {/* Features Section - Your existing component */}
      <FeaturesSection />
      
      {/* Stats Section - Your existing component */}
      <StatsSection />
      
      {/* Enhanced CTA Section - Visual improvements only */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">
              Ready to Transform Your Internship Experience?
            </h2>
            <p className="cta-subtitle">
              Join thousands of students and companies already benefiting from our 
              comprehensive internship management platform.
            </p>
            <div className="cta-buttons">
              <button className="btn btn-primary btn-lg">
                <span>🚀</span> Get Started Now
              </button>
              <button className="btn btn-outline-light btn-lg">
                <span>📹</span> Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Enhanced Footer - Visual improvements only */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>ARU Internship Management</h3>
              <p>Empowering students and companies through innovative internship solutions.</p>
              <p style={{ marginTop: '15px', fontSize: '0.85rem' }}>
                <span>📍</span> Arsi University, Asella, Ethiopia
              </p>
            </div>
            
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#features"><span>→</span> Features</a></li>
                <li><a href="#stats"><span>→</span> Impact</a></li>
                <li><a href="#contact"><span>→</span> Contact</a></li>
                <li><a href="#support"><span>→</span> Support</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Resources</h4>
              <ul>
                <li><a href="#documentation"><span>📄</span> Documentation</a></li>
                <li><a href="#api"><span>🔌</span> API Reference</a></li>
                <li><a href="#tutorials"><span>🎓</span> Tutorials</a></li>
                <li><a href="#blog"><span>📝</span> Blog</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Connect</h4>
              <ul>
                <li><a href="#twitter"><span>🐦</span> Twitter</a></li>
                <li><a href="#linkedin"><span>💼</span> LinkedIn</a></li>
                <li><a href="#github"><span>💻</span> GitHub</a></li>
                <li><a href="#email"><span>📧</span> Email</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 ARU Internship Management System. All rights reserved.</p>
            <p style={{ marginTop: '10px', fontSize: '0.8rem', color: '#505050' }}>
              Developed by Department of Information Technology | Arsi University
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedLanding;