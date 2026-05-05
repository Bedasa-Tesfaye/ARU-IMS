import React, { useState, useEffect, useRef } from 'react';
import './LandingPage.css';

// Assets from public folder
// Use a safe existing asset for the logo (fallback to favicon) to avoid 404s
const universityLogo = '/favicon.ico';
// Actual video files in public/videos are named hero-bg-1.mp4, hero-bg-2.mp4, etc.
const heroVideos = [
  '/videos/hero-bg-1.mp4',
  '/videos/hero-bg-2.mp4',
  '/videos/hero-bg-3.mp4',
  '/videos/hero-bg-4.mp4',
];

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
  const [showHeroVideo, setShowHeroVideo] = useState(false);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  const scrollToSection = (sectionId) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

  // Internships Data
  const internshipListings = [
    { id: 1, company: 'Ethio Telecom', initials: 'ET', color: '#2196f3', department: 'Computer Science', title: 'Software Development Intern', location: 'Addis Ababa', type: 'Full-time', duration: '3-4 months', stipend: 'ETB 8,000/month', deadline: '2025-12-15', skills: ['React', 'Node.js', 'MongoDB', 'Git'], posted: '2 days ago', description: 'Join our development team and work on real-world projects building next-generation telecom solutions.', requirements: ['Currently enrolled in CS/IT program', 'CGPA 3.0+', 'Knowledge of JavaScript', 'Git experience'], positions: 3, verified: true },
    { id: 2, company: 'Commercial Bank of Ethiopia', initials: 'CB', color: '#4caf50', department: 'Accounting', title: 'Banking Operations Intern', location: 'Addis Ababa', type: 'Full-time', duration: '5-6 months', stipend: 'ETB 6,500/month', deadline: '2025-12-30', skills: ['Accounting', 'Excel', 'Financial Analysis', 'Communication'], posted: '5 days ago', description: 'Gain hands-on experience in banking operations, financial analysis, and customer service.', requirements: ['Accounting/Finance major', 'CGPA 3.2+', 'Strong analytical skills'], positions: 5, verified: true },
    { id: 3, company: 'Ethiopian Airlines', initials: 'EA', color: '#ff9800', department: 'Engineering', title: 'Engineering Intern', location: 'Addis Ababa', type: 'On-site', duration: '4-5 months', stipend: 'ETB 10,000/month', deadline: '2025-12-20', skills: ['Mechanical Engineering', 'CAD', 'Problem Solving', 'Teamwork'], posted: '1 week ago', description: 'Work alongside experienced engineers on aircraft maintenance and engineering projects.', requirements: ['Engineering major', 'CGPA 3.0+', 'CAD proficiency'], positions: 2, verified: true },
    { id: 4, company: 'DHL Ethiopia', initials: 'DH', color: '#ff5722', department: 'Business Administration', title: 'Logistics Intern', location: 'Addis Ababa', type: 'Full-time', duration: '3-4 months', stipend: 'ETB 7,000/month', deadline: '2026-01-01', skills: ['Supply Chain', 'Excel', 'Communication', 'Problem Solving'], posted: '3 days ago', description: 'Learn about global logistics and supply chain management in a fast-paced environment.', requirements: ['Business/Logistics major', 'CGPA 3.0+', 'Interest in operations'], positions: 4, verified: true },
    { id: 5, company: 'Safaricom', initials: 'SF', color: '#9c27b0', department: 'Information Technology', title: 'Telecom Intern', location: 'Addis Ababa', type: 'Hybrid', duration: '4-5 months', stipend: 'ETB 9,000/month', deadline: '2025-12-25', skills: ['Telecommunications', 'Customer Service', 'Data Analysis', 'Networking'], posted: '1 week ago', description: 'Explore the telecom industry and customer experience management.', requirements: ['IT/Engineering major', 'CGPA 3.0+', 'Communication skills'], positions: 3, verified: true },
    { id: 6, company: 'Awash International Bank', initials: 'AI', color: '#3f51b5', department: 'Accounting', title: 'Finance Intern', location: 'Addis Ababa', type: 'Full-time', duration: '5-6 months', stipend: 'ETB 7,500/month', deadline: '2026-01-10', skills: ['Finance', 'Excel', 'Financial Modeling', 'Analysis'], posted: '4 days ago', description: 'Work in financial analysis and banking operations at a leading private bank.', requirements: ['Finance/Economics major', 'CGPA 3.2+', 'Quantitative skills'], positions: 2, verified: true }
  ];

  const partnersList = [
    { name: 'Ethio Telecom', logo: '📡', industry: 'Telecommunications', internships: 45, description: 'Leading telecommunications provider offering digital transformation internships', focusAreas: 'Technology, Innovation, Digital Transformation' },
    { name: 'Commercial Bank of Ethiopia', logo: '🏦', industry: 'Banking & Finance', internships: 38, description: 'Premier banking institution providing financial services and banking internships', focusAreas: 'Finance, Banking, Customer Service' },
    { name: 'Ethiopian Airlines', logo: '✈️', industry: 'Aviation', internships: 25, description: 'National carrier offering aviation, logistics, and operations internships', focusAreas: 'Aviation, Engineering, Logistics' },
    { name: 'Dashen Bank', logo: '💰', industry: 'Banking & Finance', internships: 32, description: 'Innovative banking solutions and financial technology internship programs', focusAreas: 'FinTech, Banking, Digital Services' },
    { name: 'Ministry of Education', logo: '🎓', industry: 'Government', internships: 20, description: 'Government ministry overseeing education policy and internship coordination', focusAreas: 'Policy, Research, Administration' }
  ];

  const [expandedInternship, setExpandedInternship] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedPartner, setExpandedPartner] = useState(null);
  const ITEMS_PER_PAGE = 6;

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

    const videoTimer = window.setTimeout(() => setShowHeroVideo(true), 400);

    // Cycle hero videos every 8 seconds
    const cycleInterval = window.setInterval(() => {
      setActiveHeroIndex((i) => (i + 1) % heroVideos.length);
    }, 8000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      revealElements.forEach((el) => observer.unobserve(el));
      window.clearTimeout(videoTimer);
      window.clearInterval(cycleInterval);
    };
  }, []);

  const totalPages = Math.ceil(internshipListings.length / ITEMS_PER_PAGE);
  const paginatedInternships = internshipListings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getDaysLeft = (deadline) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(deadline);
    target.setHours(0, 0, 0, 0);
    const diff = target - today;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getDeadlineUrgency = (deadline) => {
    const days = getDaysLeft(deadline);
    if (days <= 3) return 'urgent';
    if (days <= 10) return 'soon';
    return 'normal';
  };

  if (false) {
    return (
      <div className="landing-page">
        <div className="page-loader">
          <div className="loader-spinner"></div>
          <p>Loading ARU Internship Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page" onMouseMove={handleMouseMove}>
      {/* Toast Container */}
      <div className="toast-container">
        {/* Toasts would go here */}
      </div>

      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container">
          <div className="logo" onClick={() => scrollToSection('home')}>
            <img src={universityLogo} alt="Arsi University" className="logo-image" onError={(e) => { e.target.style.display = 'none'; }} />
            <div className="logo-text">
              <h2>Arsi University</h2>
              <span>Internship Portal</span>
            </div>
          </div>

          <div className="nav-links desktop-only">
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
            <a href="#internships" onClick={(e) => { e.preventDefault(); scrollToSection('internships'); }}>Internships</a>
            <a href="#partnership" onClick={(e) => { e.preventDefault(); scrollToSection('partnership'); }}>Partners</a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>Process</a>
            <a href="#testimonials" onClick={(e) => { e.preventDefault(); scrollToSection('testimonials'); }}>Stories</a>
            <div className="nav-divider"></div>
            <a href="/login" className="btn-login-ghost">Sign In</a>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-sidebar-content">
          <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
          <a href="#internships" onClick={(e) => { e.preventDefault(); scrollToSection('internships'); }}>Internships</a>
          <a href="#partnership" onClick={(e) => { e.preventDefault(); scrollToSection('partnership'); }}>Partners</a>
          <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>Process</a>
          <a href="#testimonials" onClick={(e) => { e.preventDefault(); scrollToSection('testimonials'); }}>Stories</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>
          <hr className="mobile-divider" />
          <a href="/login" className="btn-secondary full-width">Sign In</a>
        </div>
      </div>

      {/* HERO SECTION */}
      <section id="home" className="hero">
        <div className="hero-video-bg">
          {showHeroVideo ? (
            <video autoPlay muted playsInline preload="metadata" className="hero-video" key={activeHeroIndex}>
              <source src={heroVideos[activeHeroIndex]} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="hero-video-fallback" />
          )}
          <div className="hero-overlay"></div>
        </div>
        <div className="container">
          <div className="hero-content reveal">
            <div className="hero-badge shadow-pop">
              <span className="badge-icon">✨</span>
              <span className="badge-text">Next-Gen Placement Platform</span>
            </div>
            <h1 className="hero-title">Bridge the Gap Between <br /><span className="text-gradient">Education</span> & <span className="text-gradient">Industry</span></h1>
            <p className="hero-description">A premium digital ecosystem orchestrating internship placements, real-time progress tracking, evaluations, and seamless stakeholder communication.</p>
            <div className="hero-buttons">
              <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} className="btn-primary btn-large magnetic">Explore Features <span>→</span></a>
              <a href="/login" className="btn-secondary btn-large">Portal Access</a>
            </div>
            <div className="stats reveal delay-2">
              <div className="stat glass-panel"><AnimatedCounter end={500} suffix="+" /><p>Placements</p></div>
              <div className="stat glass-panel"><AnimatedCounter end={120} suffix="+" /><p>Partners</p></div>
              <div className="stat glass-panel"><AnimatedCounter end={100} suffix="%" /><p>Digitalized</p></div>
            </div>
          </div>
          <div className="hero-image reveal delay-1">
            <div className="hero-video-card parallax-element" style={{ transform: `rotateX(${mousePos.y}deg) rotateY(${-mousePos.x}deg)` }}>
              <video autoPlay loop muted playsInline preload="metadata" className="hero-preview-video">
                <source src={heroVideos[activeHeroIndex]} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="hero-video-card-overlay">
                <span className="hero-video-badge">Live Demo</span>
                <p>Watch the internship portal in action</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="features pattern-bg">
        <div className="container">
          <div className="reveal">
            <h2 className="section-title">The Complete <span className="text-gradient">Ecosystem</span></h2>
            <p className="section-subtitle">Purpose-built interfaces engineered for every role</p>
          </div>
          <div className="features-grid">
            {[ { icon: '🎓', title: 'For Participants', desc: 'Apply for opportunities, track progress, and manage your journey seamlessly.', features: ['Smart Matching', 'Digital Tracking', 'Progress Reports'] }, { icon: '👨‍🏫', title: 'For Mentors', desc: 'Monitor progress, review submissions, and provide guidance and evaluations.', features: ['Review System', 'Direct Messaging', 'Progress Tracking'] }, { icon: '🏢', title: 'For Organizations', desc: 'Source talent, post opportunities, and manage partnership programs easily.', features: ['Talent Pools', 'Custom Programs', 'Partnership Management'] }, { icon: '📋', title: 'System Features', desc: 'Comprehensive platform with powerful tools and data analytics.', features: ['Real-time Analytics', 'Export Reports', 'System Management'] } ].map((card, idx) => (
              <div key={idx} className={`feature-card reveal delay-${idx + 1}`}>
                <div className="feature-icon"><span className="icon-emoji">{card.icon}</span></div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
                <ul className="feature-list">{card.features.map((f, i) => <li key={i}><i>✓</i> {f}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERNSHIPS SECTION */}
      <section id="internships" className="internships-section">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag">Opportunities</span>
            <h2 className="section-title">Internship <span className="text-gradient">Programs</span></h2>
            <p className="section-subtitle">Current internship postings by our partner companies and admin</p>
          </div>

          <div className="internships-posting-space reveal delay-1">
            <div className="posting-header">
              <h3>Active Internship Postings</h3>
              <p>Browse and apply to available internship programs posted by our partner companies</p>
            </div>

            {paginatedInternships.length === 0 ? (
              <div className="empty-state reveal">
                <div className="empty-icon">📋</div>
                <h3>No internship postings available</h3>
                <p>Check back later for new opportunities</p>
              </div>
            ) : (
              <>
                <div className="internships-grid">
                  {paginatedInternships.map((internship) => {
                    const isExpanded = expandedInternship === internship.id;
                    const daysLeft = getDaysLeft(internship.deadline);
                    const urgency = getDeadlineUrgency(internship.deadline);
                    return (
                      <div key={internship.id} className={`internship-card reveal ${isExpanded ? 'expanded' : ''}`}>
                        <div className="card-top-row">
                          <div className="company-logo" style={{ backgroundColor: internship.color }}>{internship.initials}</div>
                        </div>
                        <h3 className="internship-title">{internship.title}</h3>
                        <p className="internship-company">{internship.company} {internship.verified && <span className="verified-badge" title="Verified Partner">✓</span>}</p>
                        <div className="internship-meta">
                          <span className="meta-item">📍 {internship.location}</span>
                          <span className={`meta-item type-badge type-${internship.type.toLowerCase().replace(' ', '-')}`}>{internship.type}</span>
                          <span className="meta-item">⏱️ {internship.duration}</span>
                          <span className="meta-item">💰 {internship.stipend}</span>
                        </div>
                        <div className="internship-skills">
                          {internship.skills.map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
                        </div>
                        <div className="internship-footer">
                          <span className={`deadline-badge deadline-${urgency}`}>
                            {daysLeft === 0 ? '🔴 Deadline Today' : `⏳ ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                          </span>
                          <div className="footer-actions">
                            <button className="learn-more-btn" onClick={() => setExpandedInternship(isExpanded ? null : internship.id)}>
                              {isExpanded ? 'Show Less ▲' : 'Learn More ▼'}
                            </button>
                            <a href="/login" className="btn-primary btn-sm">Apply Now</a>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="internship-details">
                            <div className="details-section">
                              <h5>📋 Job Description</h5>
                              <p>{internship.description}</p>
                            </div>
                            <div className="details-section">
                              <h5>✅ Requirements</h5>
                              <ul className="requirements-list">
                                {internship.requirements.map((req, i) => <li key={i}>{req}</li>)}
                              </ul>
                            </div>
                            <div className="details-meta-row">
                              <span>🔄 {internship.positions} position{internship.positions !== 1 ? 's' : ''} available</span>
                              <span>📅 Deadline: {new Date(internship.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                              <span>📅 Posted: {internship.posted}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {totalPages > 1 && (
                  <div className="pagination">
                    <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>← Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button key={page} className={`page-btn ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
                    ))}
                    <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <div className="reveal">
            <h2 className="section-title">Streamlined <span className="text-gradient">Workflow</span></h2>
            <p className="section-subtitle">From onboarding to graduation in four intuitive steps</p>
          </div>
          <div className="steps-wrapper reveal delay-1">
            <div className="steps-progress-line"></div>
            <div className="steps">
              {[ { num: '1', title: 'Profile Setup', desc: 'Build your academic portfolio' }, { num: '2', title: 'Smart Match', desc: 'Connect with industry leaders' }, { num: '3', title: 'Log Progress', desc: 'Submit weekly milestone reports' }, { num: '4', title: 'Earn Credits', desc: 'Final review and completion' } ].map((step, idx) => (
                <div key={idx} className="step card-hover">
                  <div className="step-number">{step.num}</div>
                  <span className="step-icon">{step.icon}</span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="testimonials-section">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag">Testimonials</span>
            <h2 className="section-title">Success <span className="text-gradient">Stories</span></h2>
            <p className="section-subtitle">Hear from participants who transformed their careers</p>
          </div>
          <div className="testimonials-grid reveal delay-1">
            {[ { name: 'Bedasa Tadesse', initials: 'BT', role: 'Software Developer at Ethio Telecom', company: 'Ethio Telecom', class: 'Class of 2023 · IT', quote: 'The internship program was transformative. Hands-on experience and direct industry exposure led to immediate employment.', stars: 5 }, { name: 'Haweltu Kassa', initials: 'HK', role: 'Banking Officer at CBE', company: 'Commercial Bank of Ethiopia', class: 'Class of 2023 · Accounting', quote: 'Skills gained during internship prepared me for the real world. I was promoted within my first year.', stars: 5 }, { name: 'Kaleb Bekele', initials: 'KB', role: 'Junior Engineer at Ethiopian Airlines', company: 'Ethiopian Airlines', class: 'Class of 2024 · Mech Eng', quote: 'Smart matching connected me with the right company. Now I work on international projects.', stars: 5 } ].map((t, idx) => (
              <div key={idx} className="testimonial-card reveal delay-${idx + 1}" style={{ borderTopColor: ['#667eea', '#4caf50', '#ff9800'][idx] }}>
                <div className="testimonial-quote-icon">&ldquo;</div>
                <div className="testimonial-header">
                  <div className="testimonial-avatar" style={{ background: ['#667eea', '#4caf50', '#ff9800'][idx] }}>{t.initials}</div>
                  <div><h4>{t.name}</h4><span className="testimonial-role">{t.role}</span><span className="testimonial-class">{t.class}</span></div>
                </div>
                <div className="testimonial-stars">{'⭐'.repeat(t.stars)}</div>
                <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERSHIP SECTION */}
      <section id="partnership" className="partnership-section">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag">Partners</span>
            <h2 className="section-title">Become a <span className="text-gradient">Partner</span></h2>
            <p className="section-subtitle">Join us in shaping Ethiopia's future workforce</p>
          </div>

          <div className="become-partner-cta reveal delay-1">
            <div className="become-partner-content">
              <h3>🤝 Partner with Arsi University</h3>
              <p>Join 120+ organizations shaping the future of talent in Ethiopia. Our partnership program connects you with pre-vetted, talented students ready to contribute to your organization.</p>
              <ul className="partner-benefits-list">
                <li>🎯 Access pre-vetted student talent pool</li>
                <li>📋 Post unlimited internship opportunities</li>
                <li>🤖 AI-powered candidate matching</li>
                <li>📊 Progress tracking and evaluation tools</li>
                <li>🎓 Direct pipeline to university talent</li>
              </ul>
              <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} className="btn-primary">Apply for Partnership →</a>
            </div>
            <div className="become-partner-stats">
              <div className="bps-item"><span className="bps-num">120+</span><span>Partners</span></div>
              <div className="bps-item"><span className="bps-num">500+</span><span>Placements</span></div>
              <div className="bps-item"><span className="bps-num">85%</span><span>Retention</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT METRICS */}
      <section id="impact" className="impact-section">
        <div className="impact-bg-pattern"></div>
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag light">Impact</span>
            <h2 className="section-title light">Program Impact <span className="text-gradient">Metrics</span></h2>
          </div>
          <div className="metrics-grid reveal delay-1">
            {[ { icon: '📈', value: 96, suffix: '%', label: 'Employment Rate', sub: 'Graduates employed within 6 months' }, { icon: '💼', value: 85, suffix: '%', label: 'Industry Retention', sub: 'Still with first employer after 2 years' }, { icon: '💰', value: 'ETB 18K', label: 'Avg Starting Salary', sub: 'Above industry average', isText: true }, { icon: '🤝', value: 200, suffix: '+', label: 'Partner Companies', sub: 'Active internship providers' } ].map((metric, idx) => (
              <div key={idx} className="metric-card">
                <div className="metric-ring"><svg viewBox="0 0 120 120"><defs><linearGradient id={`g${idx}`}><stop offset="0%" stopColor="#667eea"/><stop offset="100%" stopColor="#764ba2"/></linearGradient></defs><circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6"/><circle cx="60" cy="60" r="54" fill="none" stroke={`url(#g${idx})`} strokeWidth="6" strokeLinecap="round" strokeDasharray={metric.isText ? '200 339' : `${metric.value / 100 * 339} 339`} className="metric-ring-fill"/></svg></div>
                <div className="metric-value">{metric.isText ? <h3>{metric.value}</h3> : <AnimatedCounter end={metric.value} suffix={metric.suffix} duration={2500} />}</div>
                <p className="metric-label">{metric.label}</p>
                <p className="metric-sub">{metric.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="contact-section reveal">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Contact</span>
            <h2 className="section-title">Send a Message to Support</h2>
            <p className="section-subtitle">Thank you for reaching out for assistance or program information.</p>
          </div>
          <div className="contact-grid">
            <div className="contact-card">
              <h3>Need help from support?</h3>
              <p>Use this form to send a direct message to our support team. They will respond to your email address.</p>
              <ul className="contact-benefits"><li>Request portal access</li><li>Report issues</li><li>Ask about internships</li><li>Partner with Arsi University</li></ul>
            </div>
            <form className="contact-form" onSubmit={handleContactSubmit}>
              {contactStatus && <div className="contact-status">{contactStatus}</div>}
              <div className="input-group"><label htmlFor="contact-name">Full Name</label><input id="contact-name" type="text" name="name" value={contactForm.name} onChange={handleContactChange} className="form-input" placeholder="Your full name" required /></div>
              <div className="input-group"><label htmlFor="contact-email">Email Address</label><input id="contact-email" type="email" name="email" value={contactForm.email} onChange={handleContactChange} className="form-input" placeholder="you@example.com" required /></div>
              <div className="input-group"><label htmlFor="contact-subject">Subject</label><input id="contact-subject" type="text" name="subject" value={contactForm.subject} onChange={handleContactChange} className="form-input" placeholder="Subject" required /></div>
              <div className="input-group"><label htmlFor="contact-message">Message</label><textarea id="contact-message" name="message" value={contactForm.message} onChange={handleContactChange} className="form-input" placeholder="Write your message" rows="6" required /></div>
              <button type="submit" className="btn-primary contact-submit">Send Message</button>
              <p className="contact-note">This opens your email client to send to support@aru.edu.et.</p>
            </form>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta reveal">
        <div className="cta-background-animations">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>
        <div className="container relative-z glass-cta">
          <div className="trusted-by">
            <p>Trusted by leading organizations across Ethiopia</p>
            <div className="trusted-logos">{[ 'Ethio Telecom', 'CBE', 'Ethiopian Airlines', 'DHL', 'Safaricom' ].map(c => <span key={c} className="trusted-logo">{c}</span>)}</div>
          </div>
          <h2>Ready to <span className="text-highlight">Accelerate</span> Your Future?</h2>
          <p className="cta-social-proof">Join 500+ students and 120+ companies already on the platform</p>
          <div className="cta-buttons">
            <a href="mailto:support@aru.edu.et" className="btn-primary btn-large">Contact Support</a>
            <span className="cta-or">or</span>
            <a href="/login" className="btn-login-ghost ghost-light">Access Portal</a>
          </div>
          <span className="cta-badge">🎓 Free for Students</span>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-column"><div className="footer-logo"><img src={universityLogo} alt="Logo" onError={(e) => { e.target.style.display = 'none'; }} /><div><h4>Arsi University</h4><span>Internship Portal</span></div></div><p className="footer-description">Bridging education and industry through innovative internship management.</p><div className="footer-social">{[ '🔗', '🐦', '📘', '▶️' ].map((s, i) => <a key={i} href="#" aria-label="Social">{s}</a>)}</div></div>
            <div className="footer-column"><h4>Quick Links</h4><ul className="footer-links">{[ 'Home', 'Features', 'Internships', 'Partners', 'Contact' ].map(l => <li key={l}><a href={`#${l.toLowerCase()}`} onClick={(e) => { e.preventDefault(); scrollToSection(l.toLowerCase()); }}>{l}</a></li>)}</ul></div>
            <div className="footer-column"><h4>Resources</h4><ul className="footer-links">{[ 'Help Center', 'Documentation', 'FAQ', 'Privacy Policy', 'Terms' ].map(l => <li key={l}><a href="#">{l}</a></li>)}</ul></div>
            <div className="footer-column"><h4>Contact Info</h4><ul className="footer-contact"><li>📧 <a href="mailto:support@aru.edu.et">support@aru.edu.et</a></li><li>📞 +251-XXX-XXXXXX</li><li>📍 Arsi University, Asella</li><li>🕐 Mon-Fri, 8AM-5PM</li></ul></div>
          </div>
          <div className="footer-bottom"><p>&copy; {new Date().getFullYear()} Arsi University. All rights reserved.</p><p>Powered by Arsi University Digital Systems</p></div>
        </div>
      </footer>

      <button className={`back-to-top ${scrolled ? 'visible' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">↑</button>
    </div>
  );
};

export default LandingPage;