import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from '@inertiajs/react';
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

const internshipListings = [
  { id: 1, company: 'Ethio Telecom', initials: 'ET', color: '#2196f3', department: 'Computer Science', title: 'Software Development Intern', location: 'Addis Ababa', type: 'Full-time', duration: '3-4 months', stipend: 'ETB 8,000/month', deadline: '2025-12-15', skills: ['React', 'Node.js', 'MongoDB', 'Git'], posted: '2 days ago', description: 'Join our development team and work on real-world projects building next-generation telecom solutions.', requirements: ['Currently enrolled in CS/IT program', 'CGPA 3.0+', 'Knowledge of JavaScript', 'Git experience'], positions: 3, verified: true, featured: true },
  { id: 2, company: 'Commercial Bank of Ethiopia', initials: 'CB', color: '#4caf50', department: 'Accounting', title: 'Banking Operations Intern', location: 'Addis Ababa', type: 'Full-time', duration: '5-6 months', stipend: 'ETB 6,500/month', deadline: '2025-12-30', skills: ['Accounting', 'Excel', 'Financial Analysis', 'Communication'], posted: '5 days ago', description: 'Gain hands-on experience in banking operations, financial analysis, and customer service.', requirements: ['Accounting/Finance major', 'CGPA 3.2+', 'Strong analytical skills'], positions: 5, verified: true },
  { id: 3, company: 'Ethiopian Airlines', initials: 'EA', color: '#ff9800', department: 'Engineering', title: 'Engineering Intern', location: 'Addis Ababa', type: 'On-site', duration: '4-5 months', stipend: 'ETB 10,000/month', deadline: '2025-12-20', skills: ['Mechanical Engineering', 'CAD', 'Problem Solving', 'Teamwork'], posted: '1 week ago', description: 'Work alongside experienced engineers on aircraft maintenance and engineering projects.', requirements: ['Engineering major', 'CGPA 3.0+', 'CAD proficiency'], positions: 2, verified: true, featured: true },
  { id: 4, company: 'DHL Ethiopia', initials: 'DH', color: '#ff5722', department: 'Business Administration', title: 'Logistics Intern', location: 'Addis Ababa', type: 'Full-time', duration: '3-4 months', stipend: 'ETB 7,000/month', deadline: '2026-01-01', skills: ['Supply Chain', 'Excel', 'Communication', 'Problem Solving'], posted: '3 days ago', description: 'Learn about global logistics and supply chain management in a fast-paced environment.', requirements: ['Business/Logistics major', 'CGPA 3.0+', 'Interest in operations'], positions: 4, verified: true },
  { id: 5, company: 'Safaricom', initials: 'SF', color: '#9c27b0', department: 'Information Technology', title: 'Telecom Intern', location: 'Addis Ababa', type: 'Hybrid', duration: '4-5 months', stipend: 'ETB 9,000/month', deadline: '2025-12-25', skills: ['Telecommunications', 'Customer Service', 'Data Analysis', 'Networking'], posted: '1 week ago', description: 'Explore the telecom industry and customer experience management.', requirements: ['IT/Engineering major', 'CGPA 3.0+', 'Communication skills'], positions: 3, verified: true },
  { id: 6, company: 'Awash International Bank', initials: 'AI', color: '#3f51b5', department: 'Accounting', title: 'Finance Intern', location: 'Addis Ababa', type: 'Full-time', duration: '5-6 months', stipend: 'ETB 7,500/month', deadline: '2026-01-10', skills: ['Finance', 'Excel', 'Financial Modeling', 'Analysis'], posted: '4 days ago', description: 'Work in financial analysis and banking operations at a leading private bank.', requirements: ['Finance/Economics major', 'CGPA 3.2+', 'Quantitative skills'], positions: 2, verified: true },
];

const partnersList = [
  { name: 'Ethio Telecom', logo: '📡', industry: 'Telecommunications', location: 'Addis Ababa', hires: 45, rating: 4.9, reviewsCount: 210, openRoles: 14, premium: true, internships: 45, description: 'Leading telecommunications provider offering digital transformation internships', focusAreas: 'Technology, Innovation, Digital Transformation' },
  { name: 'Commercial Bank of Ethiopia', logo: '🏦', industry: 'Banking & Finance', location: 'Addis Ababa', hires: 38, rating: 4.7, reviewsCount: 156, openRoles: 11, premium: false, internships: 38, description: 'Premier banking institution providing financial services and banking internships', focusAreas: 'Finance, Banking, Customer Service' },
  { name: 'Ethiopian Airlines', logo: '✈️', industry: 'Aviation', location: 'Bole', hires: 25, rating: 4.85, reviewsCount: 98, openRoles: 9, premium: true, internships: 25, description: 'National carrier offering aviation, logistics, and operations internships', focusAreas: 'Aviation, Engineering, Logistics' },
  { name: 'Dashen Bank', logo: '💰', industry: 'Banking & Finance', location: 'Addis Ababa', hires: 32, rating: 4.6, reviewsCount: 74, openRoles: 8, premium: false, internships: 32, description: 'Innovative banking solutions and financial technology internship programs', focusAreas: 'FinTech, Banking, Digital Services' },
  { name: 'Ministry of Education', logo: '🎓', industry: 'Government', location: 'Addis Ababa', hires: 20, rating: 4.5, reviewsCount: 42, openRoles: 6, premium: false, internships: 20, description: 'Government ministry overseeing education policy and internship coordination', focusAreas: 'Policy, Research, Administration' },
  { name: 'DHL Ethiopia', logo: '📦', industry: 'Logistics & Supply Chain', location: 'Addis Ababa', hires: 28, rating: 4.55, reviewsCount: 61, openRoles: 7, premium: false, internships: 28, description: 'Global logistics leader with structured internship pathways.', focusAreas: 'Operations, Supply Chain' },
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

  const [expandedInternship, setExpandedInternship] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedPartner, setExpandedPartner] = useState(null);
  const ITEMS_PER_PAGE = 6;

  const [internshipSearch, setInternshipSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [viewMode, setViewMode] = useState('grid');
  const [quickChip, setQuickChip] = useState(null);
  const [internshipBarScrolled, setInternshipBarScrolled] = useState(false);
  const [tick, setTick] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const searchBarRef = useRef(null);

  const [savedInternships, setSavedInternships] = useState(() => {
    try {
      const raw = localStorage.getItem('aru-saved-internships');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [partnerIndustry, setPartnerIndustry] = useState('All');
  const [partnerQuery, setPartnerQuery] = useState('');

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

  useEffect(() => {
    const t = window.setTimeout(() => setListLoading(false), 650);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setTick((x) => x + 1), 60000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const el = searchBarRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      setInternshipBarScrolled(top < 96);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [internshipSearch, typeFilter, quickChip, sortBy]);

  const stipendNum = (s) => {
    const m = String(s).match(/[\d,]+/);
    return m ? parseInt(m[0].replace(/,/g, ''), 10) : 0;
  };

  const filteredInternships = useMemo(() => {
    let list = [...internshipListings];
    if (internshipSearch.trim()) {
      const q = internshipSearch.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.company.toLowerCase().includes(q) ||
          i.department.toLowerCase().includes(q) ||
          i.skills.some((sk) => sk.toLowerCase().includes(q))
      );
    }
    if (typeFilter !== 'all') {
      list = list.filter((i) => i.type === typeFilter);
    }
    if (quickChip === 'tech') {
      list = list.filter(
        (i) =>
          i.skills.some((sk) => /react|node|mongo|software|data|git|telecom/i.test(sk)) ||
          /software|developer|data|telecom|it/i.test(i.title)
      );
    } else if (quickChip === 'finance') {
      list = list.filter((i) => /finance|accounting|bank|banking/i.test(`${i.title} ${i.department}`));
    } else if (quickChip === 'hybrid') {
      list = list.filter((i) => i.type === 'Hybrid');
    }
    const sorted = [...list].sort((a, b) => {
      if (sortBy === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
      if (sortBy === 'stipend') return stipendNum(b.stipend) - stipendNum(a.stipend);
      if (sortBy === 'recent') return b.id - a.id;
      return a.id - b.id;
    });
    return sorted;
  }, [internshipSearch, typeFilter, quickChip, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredInternships.length / ITEMS_PER_PAGE));
  const paginatedInternships = filteredInternships.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const activeFilterCount = [internshipSearch.trim(), typeFilter !== 'all', quickChip != null].filter(Boolean).length;

  const industryCounts = useMemo(() => {
    const map = { All: partnersList.length };
    partnersList.forEach((p) => {
      map[p.industry] = (map[p.industry] || 0) + 1;
    });
    return map;
  }, [partnersList]);

  const partnerIndustries = useMemo(() => ['All', ...new Set(partnersList.map((p) => p.industry))], []);

  const filteredPartners = useMemo(() => {
    let list = [...partnersList];
    if (partnerIndustry !== 'All') list = list.filter((p) => p.industry === partnerIndustry);
    if (partnerQuery.trim()) {
      const q = partnerQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.industry.toLowerCase().includes(q));
    }
    return list;
  }, [partnerIndustry, partnerQuery, partnersList]);

  const toggleSaveInternship = (id) => {
    setSavedInternships((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      const arr = [...s];
      try {
        localStorage.setItem('aru-saved-internships', JSON.stringify(arr));
      } catch {
        /* ignore */
      }
      return arr;
    });
  };

  const shareInternship = async (internship) => {
    const url = `${window.location.origin}${window.location.pathname}#internships`;
    try {
      if (navigator.share) {
        await navigator.share({ title: internship.title, text: `${internship.company} — ${internship.title}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        window.alert('Link to internships copied to clipboard.');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        window.alert('Link copied.');
      } catch {
        /* ignore */
      }
    }
  };

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
      <section id="internships" className="internships-section internships-section--premium">
        <div className="internships-floating-dots" aria-hidden />
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag section-tag--glow">Opportunities</span>
            <h2 className="section-title">Internship <span className="text-gradient">Programs</span></h2>
            <p className="section-subtitle">Current internship postings by our partner companies and admin</p>
          </div>

          <div ref={searchBarRef} className={`internships-search-bar internships-search-bar--glass ${internshipBarScrolled ? 'scrolled' : ''}`}>
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="search"
                placeholder="Search roles, skills, companies…"
                value={internshipSearch}
                onChange={(e) => setInternshipSearch(e.target.value)}
                aria-label="Search internships"
              />
            </div>
            <div className="filter-pills type-filter-pills" role="group" aria-label="Employment type">
              {['all', 'Full-time', 'Hybrid', 'On-site'].map((t) => (
                <button key={t} type="button" className={`filter-pill ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>
                  {t === 'all' ? 'All types' : t}
                </button>
              ))}
            </div>
            <div className="sort-wrap">
              <label className="sort-label" htmlFor="intern-sort">Sort</label>
              <select id="intern-sort" className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="deadline">📅 Deadline</option>
                <option value="stipend">💰 Stipend</option>
                <option value="recent">🆕 Recent</option>
              </select>
            </div>
            <div className="view-toggle" role="group" aria-label="View mode">
              <button type="button" className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} aria-label="Grid view">
                ▦
              </button>
              <button type="button" className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} aria-label="List view">
                ☰
              </button>
            </div>
            {activeFilterCount > 0 && <span className="filter-count-badge">{activeFilterCount}</span>}
          </div>

          <div className="quick-filter-chips reveal delay-1">
            <span className="quick-label">Quick filters</span>
            {[
              { id: 'tech', label: 'Technology' },
              { id: 'finance', label: 'Finance' },
              { id: 'hybrid', label: 'Hybrid roles' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                className={`quick-chip ${quickChip === c.id ? 'active' : ''}`}
                onClick={() => setQuickChip(quickChip === c.id ? null : c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>

          {(internshipSearch.trim() || typeFilter !== 'all' || quickChip) && (
            <div className="active-filters-bar">
              <span>Filters active</span>
              <button
                type="button"
                className="clear-all-tag"
                onClick={() => {
                  setInternshipSearch('');
                  setTypeFilter('all');
                  setQuickChip(null);
                }}
              >
                Clear all
              </button>
            </div>
          )}

          <div className="results-header">
            <div className="results-count-badge">
              <span className="results-animated">
                Showing <strong>{paginatedInternships.length}</strong> of <strong>{filteredInternships.length}</strong> results
              </span>
            </div>
          </div>

          <div className="internships-posting-space reveal delay-1">
            <div className="posting-header">
              <h3>Active internship postings</h3>
              <p>Browse, save, and apply to programs posted by verified partners</p>
            </div>

            {filteredInternships.length === 0 && !listLoading ? (
              <div className="empty-state reveal internship-empty">
                <div className="empty-icon">🧭</div>
                <h3>No matches yet</h3>
                <p>Try clearing filters or searching with broader keywords.</p>
                <button type="button" className="btn-secondary btn-sm" onClick={() => { setInternshipSearch(''); setTypeFilter('all'); setQuickChip(null); }}>
                  Reset filters
                </button>
              </div>
            ) : listLoading ? (
              <div className={`internships-grid internship-skeleton-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <div key={s} className="internship-skeleton-card">
                    <div className="sk-line sk-line--lg" />
                    <div className="sk-line sk-line--md" />
                    <div className="sk-line sk-line--sm" />
                    <div className="sk-pills">
                      <span className="sk-pill" />
                      <span className="sk-pill" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className={`internships-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                  {paginatedInternships.map((internship) => {
                    const isExpanded = expandedInternship === internship.id;
                    const daysLeft = getDaysLeft(internship.deadline);
                    const urgency = getDeadlineUrgency(internship.deadline);
                    const saved = savedInternships.includes(internship.id);
                    return (
                      <div
                        key={internship.id}
                        className={`internship-card premium-card animated-border reveal ${isExpanded ? 'expanded' : ''} ${internship.featured ? 'featured' : ''}`}
                      >
                        {internship.featured && <div className="featured-ribbon">Featured</div>}
                        <div className="card-inner">
                          <div className="card-top-row">
                            <div className="company-logo-wrapper">
                              <div className={`company-logo logo-shimmer`} style={{ backgroundColor: internship.color }}>
                                {internship.initials}
                              </div>
                              <div className="company-info-mini">
                                <h4>{internship.company}</h4>
                                {internship.verified && (
                                  <span className="verified-inline" title="Verified partner">
                                    ✓ Verified
                                  </span>
                                )}
                                <span className="posted-date">Posted {internship.posted}</span>
                              </div>
                            </div>
                            <div className="card-actions-top">
                              <button
                                type="button"
                                className={`icon-btn heart-btn ${saved ? 'saved' : ''}`}
                                aria-label={saved ? 'Remove saved' : 'Save listing'}
                                onClick={() => toggleSaveInternship(internship.id)}
                              >
                                {saved ? '♥' : '♡'}
                              </button>
                              <button type="button" className="icon-btn" aria-label="Share" onClick={() => shareInternship(internship)}>
                                ↗
                              </button>
                            </div>
                          </div>

                          <h3 className="internship-title">📋 {internship.title}</h3>

                          <div className="internship-meta internship-meta--grid">
                            <span className="meta-item">📍 {internship.location}</span>
                            <span className={`meta-item type-badge type-${internship.type.toLowerCase().replace(/\s+/g, '-')}`}>{internship.type}</span>
                            <span className="meta-item">⏱️ {internship.duration}</span>
                            <span className="meta-item">💰 {internship.stipend}</span>
                          </div>

                          <div className="internship-skills">
                            {internship.skills.map((skill) => (
                              <span key={skill} className="skill-tag skill-tag-gradient">
                                {skill}
                              </span>
                            ))}
                          </div>

                          <div className="details-divider" />

                          <div className="internship-footer internship-footer--glass">
                            <div className="deadline-row">
                              <span className={`deadline-badge deadline-${urgency}`}>
                                <span className="deadline-dot" aria-hidden />
                                📅 {new Date(internship.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <span key={tick} className={`countdown-pill countdown-${urgency}`}>
                                {daysLeft === 0 ? 'Last day' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                              </span>
                            </div>
                            <div className="footer-actions-group">
                              <button type="button" className="learn-more-btn" onClick={() => setExpandedInternship(isExpanded ? null : internship.id)}>
                                {isExpanded ? 'Learn Less ▲' : 'Learn More ▼'}
                              </button>
                              <a href="/login" className="btn-apply-sm">
                                Apply <span className="arrow">→</span>
                              </a>
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="internship-details-expanded">
                            <div className="detail-block">
                              <h5>
                                <span className="detail-icon">📋</span> Role overview
                              </h5>
                              <p>{internship.description}</p>
                            </div>
                            <div className="detail-block">
                              <h5>
                                <span className="detail-icon">✅</span> Requirements
                              </h5>
                              <ul className="req-list">
                                {internship.requirements.map((req, i) => (
                                  <li key={i}>{req}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="details-meta-row">
                              <span>🔄 {internship.positions} open role{internship.positions !== 1 ? 's' : ''}</span>
                              <span>📅 Posted {internship.posted}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {totalPages > 1 && (
                  <div className="pagination pagination--premium">
                    <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button key={page} type="button" className={`page-btn ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>
                        {page}
                      </button>
                    ))}
                    <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                      Next →
                    </button>
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
              {[ { num: '1', icon: '📝', title: 'Profile Setup', desc: 'Build your academic portfolio' }, { num: '2', icon: '🎯', title: 'Smart Match', desc: 'Connect with industry leaders' }, { num: '3', icon: '📊', title: 'Log Progress', desc: 'Submit weekly milestone reports' }, { num: '4', icon: '🎓', title: 'Earn Credits', desc: 'Final review and completion' } ].map((step, idx) => (
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
              <div key={idx} className={`testimonial-card reveal delay-${idx + 1}`} style={{ borderTopColor: ['#667eea', '#4caf50', '#ff9800'][idx] }}>
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
      <section id="partnership" className="partnership-section partnership-section--dark">
        <div className="partnership-dot-pattern" aria-hidden />
        <div className="container">
          <div className="section-header reveal partnership-section-header">
            <span className="section-tag section-tag--glow light">Partners</span>
            <h2 className="section-title light">
              Trusted <span className="text-gradient">Partners</span>
            </h2>
            <p className="section-subtitle light">Organizations powering experiential learning at Arsi University</p>
          </div>

          <div className="partner-stats-overview reveal delay-1">
            {[
              { icon: '🤝', label: 'Partner organizations', end: 120, suffix: '+' },
              { icon: '🎯', label: 'Live internship roles', end: 54, suffix: '+' },
              { icon: '⭐', label: 'Avg partner rating', text: '4.7' },
              { icon: '📈', label: 'Student placements', end: 500, suffix: '+' },
            ].map((s, i) => (
              <div key={s.label} className="partner-stat-card glass-stat">
                <div className="partner-stat-icon">{s.icon}</div>
                <div className="partner-stat-value">
                  {s.text ? s.text : <AnimatedCounter end={s.end} suffix={s.suffix || ''} />}
                </div>
                <p className="partner-stat-label">{s.label}</p>
                <div className="stat-progress">
                  <span
                    style={{
                      width: `${s.text ? 94 : Math.min(100, (s.end / (s.label.includes('roles') ? 80 : 600)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="partner-search-bar reveal delay-2">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="search"
                placeholder="Search partners by name or industry…"
                value={partnerQuery}
                onChange={(e) => setPartnerQuery(e.target.value)}
                aria-label="Search partners"
              />
            </div>
          </div>

          <div className="industry-filters reveal delay-2">
            <div className="industry-filter-scroll" tabIndex={0}>
              {partnerIndustries.map((ind) => (
                <button key={ind} type="button" className={`industry-filter-chip ${partnerIndustry === ind ? 'active' : ''}`} onClick={() => setPartnerIndustry(ind)}>
                  {ind}
                  <span className="pill-count">{industryCounts[ind] ?? 0}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="partners-grid reveal delay-3">
            {filteredPartners.map((p) => {
              const expanded = expandedPartner === p.name;
              const stars = Math.round(p.rating);
              return (
                <div key={p.name} className={`partner-card-premium glass-card glow-hover ${p.premium ? 'is-premium' : ''}`}>
                  {p.premium && <div className="premium-partner-ribbon">⭐ Premium Partner</div>}
                  <div className="partner-logo-ring">
                    <span className="partner-logo-lg">{p.logo}</span>
                  </div>
                  <h3 className="partner-card-title">{p.name}</h3>
                  <span className="industry-badge">{p.industry}</span>
                  <p className="partner-loc">📍 {p.location}</p>
                  <div className="partner-stats-mini">
                    <div>
                      <strong>{p.hires}</strong>
                      <span>Hires</span>
                    </div>
                    <div>
                      <strong>{p.rating}</strong>
                      <span>Rate</span>
                    </div>
                    <div>
                      <strong>{p.openRoles}</strong>
                      <span>Open</span>
                    </div>
                  </div>
                  <div className="partner-rating-row">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`partner-star ${i < stars ? 'on' : ''}`}>
                        ★
                      </span>
                    ))}
                    <span className="review-count">({p.reviewsCount} reviews)</span>
                  </div>
                  <div className="partner-card-actions">
                    <button type="button" className="btn-partner-outline" onClick={() => setExpandedPartner(expanded ? null : p.name)}>
                      {expanded ? 'Hide details' : 'View opportunities'}
                    </button>
                    <a href="mailto:partnerships@aru.edu.et?subject=Partnership%20inquiry" className="btn-partner-cta">
                      Contact <span className="arrow">→</span>
                    </a>
                  </div>
                  {expanded && (
                    <div className="partner-expand">
                      <p>{p.description}</p>
                      <p className="focus-areas">
                        <strong>Focus areas:</strong> {p.focusAreas}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="become-partner-cta become-partner-cta--split reveal delay-4">
            <div className="cta-particles" aria-hidden />
            <div className="become-partner-content">
              <h3>🤝 Become a Partner</h3>
              <p>Join 120+ organizations shaping the future of talent in Ethiopia with structured internships and campus visibility.</p>
              <ul className="partner-benefits-list partner-benefits-list--checks">
                <li>Access pre-vetted talent pool</li>
                <li>AI-powered candidate matching</li>
                <li>Post unlimited internships</li>
                <li>Custom evaluation frameworks</li>
                <li>Dedicated support team</li>
              </ul>
              <Link href="/become-partner" className="btn-cta-pulse btn-cta-large">
                Apply for Partnership <span>→</span>
              </Link>
              <div className="trust-badges">
                <span>120+ partners</span>
                <span>500+ placements</span>
              </div>
            </div>
            <div className="become-partner-stats become-partner-stats--viz">
              <div className="bps-item glass">
                <span className="bps-num">
                  <AnimatedCounter end={120} suffix="+" />
                </span>
                <span>Partners</span>
              </div>
              <div className="bps-item glass">
                <span className="bps-num">
                  <AnimatedCounter end={500} suffix="+" />
                </span>
                <span>Placements</span>
              </div>
              <div className="bps-item glass">
                <span className="bps-num">85%</span>
                <span>Retention</span>
              </div>
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
            <div className="footer-column"><h4>Quick Links</h4><ul className="footer-links">{[ { label: 'Home', id: 'home' }, { label: 'Features', id: 'features' }, { label: 'Internships', id: 'internships' }, { label: 'Partners', id: 'partnership' }, { label: 'Contact', id: 'contact' } ].map((l) => <li key={l.id}><a href={`#${l.id}`} onClick={(e) => { e.preventDefault(); scrollToSection(l.id); }}>{l.label}</a></li>)}</ul></div>
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