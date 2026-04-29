import React, { useState } from 'react';
import '../styles/PartnershipSection.css';

const PartnershipSection = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    website: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const benefits = [
    {
      icon: '🎓',
      title: 'Access Top Talent',
      description: 'Connect with qualified students from diverse academic backgrounds ready for internship opportunities.'
    },
    {
      icon: '📊',
      title: 'Streamlined Management',
      description: 'Our platform simplifies the entire internship process from recruitment to evaluation and reporting.'
    },
    {
      icon: '🤝',
      title: 'Dedicated Support',
      description: 'Get personalized assistance from our partnership team to ensure successful internship programs.'
    },
    {
      icon: '📈',
      title: 'Analytics & Insights',
      description: 'Access detailed reports and analytics to measure the impact of your internship program.'
    },
    {
      icon: '🌐',
      title: 'Industry Network',
      description: 'Join a network of leading companies and organizations shaping the future workforce.'
    },
    {
      icon: '⭐',
      title: 'Brand Visibility',
      description: 'Showcase your company to thousands of students and increase your recruitment reach.'
    }
  ];

  const partners = [
    { name: 'TechCorp', logo: '💻', type: 'Technology' },
    { name: 'FinanceHub', logo: '🏦', type: 'Finance' },
    { name: 'HealthPlus', logo: '🏥', type: 'Healthcare' },
    { name: 'EduLearn', logo: '📚', type: 'Education' },
    { name: 'GreenEnergy', logo: '🌱', type: 'Energy' },
    { name: 'MediaGroup', logo: '📺', type: 'Media' },
    { name: 'RetailMax', logo: '🛒', type: 'Retail' },
    { name: 'ConsultPro', logo: '💼', type: 'Consulting' }
  ];

  const steps = [
    { number: '01', title: 'Register', description: 'Create your company account and complete the verification process.' },
    { number: '02', title: 'Post Opportunities', description: 'List your internship positions with detailed requirements and benefits.' },
    { number: '03', title: 'Review Applications', description: 'Browse and evaluate student applications using our screening tools.' },
    { number: '04', title: 'Select & Onboard', description: 'Choose candidates and use our onboarding resources to get started.' },
    { number: '05', title: 'Manage & Evaluate', description: 'Track progress and provide feedback throughout the internship period.' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="partnership-section" id="partnership">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Partnership</span>
          <h2 className="section-title">Become a Partner Company</h2>
          <p className="section-subtitle">
            Join our network of industry leaders and help shape the future workforce
            while accessing top talent for your organization.
          </p>
        </div>

        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <div className="benefit-card" key={index}>
              <div className="benefit-icon">{benefit.icon}</div>
              <h3 className="benefit-title">{benefit.title}</h3>
              <p className="benefit-description">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="partners-showcase">
          <h3 className="showcase-title">Our Trusted Partners</h3>
          <div className="partners-grid">
            {partners.map((partner, index) => (
              <div className="partner-card" key={index}>
                <div className="partner-logo">{partner.logo}</div>
                <h4 className="partner-name">{partner.name}</h4>
                <span className="partner-type">{partner.type}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="how-it-works">
          <h3 className="works-title">How It Works</h3>
          <div className="steps-container">
            {steps.map((step, index) => (
              <div className="step-item" key={index}>
                <div className="step-number">{step.number}</div>
                <div className="step-content">
                  <h4 className="step-title">{step.title}</h4>
                  <p className="step-description">{step.description}</p>
                </div>
                {index < steps.length - 1 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="cta-box">
          <div className="cta-box-content">
            <h3>Ready to Start Your Partnership?</h3>
            <p>Submit your company details and our partnership team will connect with you within 48 hours.</p>
            {submitted && (
              <div className="partner-form-success">
                Thank you! Your request has been received. We will contact you soon.
              </div>
            )}
            <form className="partner-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>
                  Company Name
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your company name"
                  />
                </label>
                <label>
                  Contact Person
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    required
                    placeholder="Name of the contact person"
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Email Address
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="example@company.com"
                  />
                </label>
                <label>
                  Company Website
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://yourcompany.com"
                  />
                </label>
              </div>
              <label>
                Message / Internship Focus
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell us what type of internship partnership you are looking for"
                />
              </label>
              <button type="submit" className="btn btn-primary btn-lg">Become a Partner</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnershipSection;