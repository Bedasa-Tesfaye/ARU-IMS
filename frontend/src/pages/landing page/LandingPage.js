import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ChatBotWidget from '../../components/ChatBotWidget';
import './LandingPage.css';

// Assets from public folder
const universityLogo = '/assets/image.png';
const heroVideo = '/assets/hero-bg-2.mp4';

// --- Helper Component: Animated Number Counter ---
const AnimatedCounter = ({ end, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const countRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTimestamp = null;
          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease-out cubic formula
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * end));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(end);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return <h3 ref={countRef}>{count}{suffix}</h3>;
};

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    setIsMobileMenuOpen(false); // Close mobile menu on click
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Track mouse for 3D Parallax effect on Hero
  const handleMouseMove = (e) => {
    const x = (window.innerWidth / 2 - e.clientX) / 25;
    const y = (window.innerHeight / 2 - e.clientY) / 25;
    setMousePos({ x, y });
  };

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [contactStatus, setContactStatus] = useState('');

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const mailtoSubject = encodeURIComponent(contactForm.subject || 'Message from ARU IMS landing page');
    const mailtoBody = encodeURIComponent(
      `Name: ${contactForm.name}\nEmail: ${contactForm.email}\n\n${contactForm.message}`
    );
    window.location.href = `mailto:support@aru.edu.et?subject=${mailtoSubject}&body=${mailtoBody}`;
    setContactStatus('Your message is ready to send in your email client. Please complete and send it to support@aru.edu.et.');
  };

  // Scroll and Observer effects
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.15 });

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="landing-page" onMouseMove={handleMouseMove}>

      {/* Premium Floating Navbar */}
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container">
          <div className="logo" onClick={() => scrollToSection('home')}>
            <img src={universityLogo} alt="Arsi University" className="logo-image" onError={(e) => e.target.style.display = 'none'} />
            <div className="logo-text">
              <h2>Arsi University</h2>
              <span>Internship Portal</span>
            </div>
          </div>

          {/* Desktop Links */}
          <div className="nav-links desktop-only">
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
            <a href="#internships" onClick={(e) => { e.preventDefault(); scrollToSection('internships'); }}>Internships</a>
            <a href="#partnership" onClick={(e) => { e.preventDefault(); scrollToSection('partnership'); }}>Partnerships</a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>Process</a>
            <a href="#benefits" onClick={(e) => { e.preventDefault(); scrollToSection('partnership'); }}>Benefits</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact Us</a>
            <div className="nav-divider"></div>
            <Link to="/login" className="btn-login-ghost">Sign In</Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={`mobile-menu-btn ${isMobileMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <div className={`mobile-sidebar ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-sidebar-content">
          <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
          <a href="#internships" onClick={(e) => { e.preventDefault(); scrollToSection('internships'); }}>Internships</a>
          <a href="#partnership" onClick={(e) => { e.preventDefault(); scrollToSection('partnership'); }}>Partnerships</a>
          <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>Workflow</a>
          <a href="#benefits" onClick={(e) => { e.preventDefault(); scrollToSection('partnership'); }}>Benefits</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact Us</a>
          <hr className="mobile-divider" />
          <Link to="/login" className="btn-secondary full-width">Sign In</Link>
        </div>
      </div>

      {/* Interactive Hero Section */}
      <section id="home" className="hero">
        <div className="hero-video-bg">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="hero-video"
            onLoadedData={() => console.log('Video loaded successfully')}
            onError={() => console.log('Video loading error')}
          >
            <source src={heroVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="hero-overlay"></div>
        </div>

        <div className="container">
          <div className="hero-content reveal">
            <div className="hero-badge shadow-pop">
              <span className="badge-icon">✨</span>
              <span className="badge-text">Next-Gen Placement Platform</span>
            </div>
            <h1 className="hero-title">
              Bridge the Gap Between <br />
              <span className="text-gradient">Education</span> & <span className="text-gradient">Industry</span>
            </h1>
            <p className="hero-description">
              A premium digital ecosystem orchestrating internship placements, real-time progress tracking, evaluations, and seamless stakeholder communication.
            </p>
            <div className="hero-buttons">
              <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} className="btn-primary btn-large magnetic">
                Learn More <span>→</span>
              </a>
              <Link to="/login" className="btn-secondary btn-large">
                Portal Access
              </Link>
            </div>

            {/* Animated Counters */}
            <div className="stats reveal delay-2">
              <div className="stat glass-panel">
                <AnimatedCounter end={500} suffix="+" />
                <p>Placements</p>
              </div>
              <div className="stat glass-panel">
                <AnimatedCounter end={120} suffix="+" />
                <p>Partners</p>
              </div>
              <div className="stat glass-panel">
                <AnimatedCounter end={100} suffix="%" />
                <p>Digitalized</p>
              </div>
            </div>
          </div>

          {/* 3D Parallax Preview */}
          <div className="hero-image reveal delay-1">
            <div
              className="preview-parallax parallax-element"
              style={{ transform: `rotateX(${mousePos.y}deg) rotateY(${-mousePos.x}deg)` }}
            >
              <div className="preview-glow"></div>
              <div className="preview-top-bar">
                <div className="window-dots"><span></span><span></span><span></span></div>
                <div className="window-title">Internship Portal</div>
              </div>
              <div className="preview-header">
                <span className="pulse-dot"></span> System Active
              </div>
              <div className="preview-content">
                <div className="preview-item skeleton-load">
                  <div className="sk-icon"></div>
                  <div className="sk-text">
                    <div className="sk-line w-100"></div>
                    <div className="sk-line w-60"></div>
                  </div>
                </div>
                <div className="preview-item">📝 Application Submitted</div>
                <div className="preview-item">⭐ Company Partnership</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Textured Features Section */}
      <section id="features" className="features pattern-bg">
        <div className="container">
          <div className="reveal">
            <h2 className="section-title">The Complete <span className="text-gradient">Ecosystem</span></h2>
            <p className="section-subtitle">Purpose-built interfaces engineered for every role</p>
          </div>

          <div className="features-grid">
            {[
              { icon: '🎓', title: 'For Participants', desc: 'Apply for opportunities, track progress, and manage your journey seamlessly.', features: ['Smart Matching', 'Digital Tracking', 'Progress Reports'] },
              { icon: '👨‍🏫', title: 'For Mentors', desc: 'Monitor progress, review submissions, and provide guidance and evaluations.', features: ['Review System', 'Direct Messaging', 'Progress Tracking'] },
              { icon: '🏢', title: 'For Organizations', desc: 'Source talent, post opportunities, and manage partnership programs easily.', features: ['Talent Pools', 'Custom Programs', 'Partnership Management'] },
              { icon: '📋', title: 'System Features', desc: 'Comprehensive platform with powerful tools and data analytics.', features: ['Real-time Analytics', 'Export Reports', 'System Management'] }
            ].map((card, idx) => (
              <div key={idx} className={`feature-card reveal delay-${idx + 1}`}>
                <div className="feature-icon"><span className="icon-emoji">{card.icon}</span></div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
                <ul className="feature-list">
                  {card.features.map((f, i) => <li key={i}><i>✓</i> {f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section with Progress Line */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <div className="reveal">
            <h2 className="section-title">Streamlined <span className="text-gradient">Workflow</span></h2>
            <p className="section-subtitle">From onboarding to graduation in four intuitive steps</p>
          </div>

          <div className="steps-wrapper reveal delay-1">
            <div className="steps-progress-line"></div>
            <div className="steps">
              {[
                { num: '1', title: 'Profile Setup', desc: 'Build your academic portfolio' },
                { num: '2', title: 'Smart Match', desc: 'Connect with industry leaders' },
                { num: '3', title: 'Log Progress', desc: 'Submit weekly milestone reports' },
                { num: '4', title: 'Earn Credits', desc: 'Final review and completion' }
              ].map((step, idx) => (
                <div key={idx} className="step card-hover">
                  <div className="step-number">{step.num}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section reveal">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Contact</span>
            <h2 className="section-title">Send a Message to Support</h2>
            <p className="section-subtitle">Thank you for reaching out to our support team for assistance, account access, or program information.</p>
          </div>

          <div className="contact-grid">
            <div className="contact-card">
              <h3>Need help from support?</h3>
              <p>
                Use this form to send a direct message to our support team. They will receive your inquiry and respond to your email address.
              </p>
              <ul className="contact-benefits">
                <li>Request portal access</li>
                <li>Report issues or bugs</li>
                <li>Ask about internships</li>
                <li>Partner with Arsi University</li>
              </ul>
            </div>

            <form className="contact-form" onSubmit={handleContactSubmit}>
              {contactStatus && <div className="contact-status">{contactStatus}</div>}

              <div className="input-group">
                <label htmlFor="contact-name">Full Name</label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  className="form-input"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="contact-email">Email Address</label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  className="form-input"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="contact-subject">Subject</label>
                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleContactChange}
                  className="form-input"
                  placeholder="Subject"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  className="form-input"
                  placeholder="Write your message here"
                  rows="6"
                  required
                />
              </div>

              <button type="submit" className="btn-primary contact-submit">
                Send Message
              </button>
              <p className="contact-note">
                This will open your default email client and prepare a message to support@aru.edu.et.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Ultimate CTA Section */}
      <section className="cta reveal">
        <div className="cta-background-animations">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>
        <div className="container relative-z glass-cta">
          <h2>Ready to <span className="text-highlight">Accelerate</span> Your Future?</h2>
          <p>Join thousands of participants and leading organizations in the digital revolution.</p>
          <div className="cta-buttons">
            <a href="mailto:support@aru.edu.et" className="btn-primary btn-large">Contact Support</a>
            <span className="cta-or">or</span>
            <Link to="/login" className="btn-login-ghost ghost-light">Access Existing Portal</Link>
          </div>
        </div>
      </section>

      {/* Minimalist Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-bottom flex-between">
            <div className="footer-logo-small">
              <img src={universityLogo} alt="Logo" onError={(e) => e.target.style.display = 'none'} />
              <span>Arsi University Systems</span>
            </div>
            <p>&copy; 2026 Digital Internship Platform. Crafted with precision.</p>
          </div>
        </div>
      </footer>

      <ChatBotWidget context="landing" />
    </div>
  );
};

export default LandingPage;