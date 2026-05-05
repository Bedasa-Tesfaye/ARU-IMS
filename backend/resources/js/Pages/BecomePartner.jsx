import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { partnershipAPI } from '../services/http';
import './BecomePartner.css';

const DRAFT_KEY = 'aru-partnership-draft-v1';
const DRAFT_MAX_MS = 7 * 24 * 60 * 60 * 1000;
const AUTOSAVE_MS = 30000;

const INDUSTRIES = [
  'Technology',
  'Banking & Finance',
  'Telecommunications',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Agriculture',
  'Airlines & Aviation',
  'Logistics & Supply Chain',
  'Government',
  'Other',
];

const COMPANY_SIZES = ['1-10 employees', '11-50 employees', '51-200 employees', '201-500 employees', '500+ employees'];

const REGIONS = [
  'Addis Ababa',
  'Oromia',
  'Amhara',
  'Tigray',
  'SNNPR',
  'Somali',
  'Afar',
  'Benishangul-Gumuz',
  'Gambela',
  'Harari',
  'Dire Dawa',
  'Sidama',
  'South West Ethiopia Peoples',
  'Other',
];

const CAPACITY_OPTIONS = ['1-5 interns', '6-10 interns', '11-20 interns', '20+ interns'];

const DURATION_OPTIONS = ['1-2 months', '3-4 months', '5-6 months', 'Flexible'];

const STIPEND_RANGES = [
  'ETB 2,000 - 4,000/month',
  'ETB 4,001 - 6,000/month',
  'ETB 6,001 - 8,000/month',
  'ETB 8,001 - 10,000/month',
  'ETB 10,000+/month',
];

const AREA_OPTIONS = [
  'Software Development',
  'IT Support & Networking',
  'Data Science & Analytics',
  'Finance & Accounting',
  'Marketing & Sales',
  'Human Resources',
  'Operations & Logistics',
  'Engineering',
  'Research & Development',
  'Customer Service',
  'Graphic Design & Multimedia',
  'Agriculture & Environmental',
  'Healthcare & Medical',
];

const BENEFIT_OPTS = [
  'Transport allowance',
  'Meal allowance',
  'Certificate of completion',
  'Letter of recommendation',
  'Potential for full-time employment',
  'Accommodation assistance',
  'Training & mentorship program',
];

const emptyForm = () => ({
  companyName: '',
  industry: '',
  companySize: '',
  website: '',
  description: '',
  contactName: '',
  contactTitle: '',
  contactEmail: '',
  contactPhone: '',
  altContactName: '',
  altContactEmail: '',
  altContactPhone: '',
  country: 'Ethiopia',
  region: '',
  city: '',
  subCity: '',
  streetAddress: '',
  buildingName: '',
  poBox: '',
  internCapacity: '',
  internshipAreas: [],
  internshipAreasOther: '',
  preferredDuration: '',
  providesStipend: true,
  stipendRange: '',
  benefits: [],
  benefitsOther: '',
  motivation: '',
  benefitToOrg: '',
  hasPriorExperience: false,
  priorExperience: '',
  agreementConfirmed: false,
  termsAccepted: false,
  reviewAcknowledged: false,
  documents: {
    businessLicense: null,
    companyProfile: null,
    taxCertificate: null,
    other: null,
  },
});

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
const phoneOk = (v) => {
  const s = String(v || '').replace(/\s/g, '');
  if (!s) return false;
  return /^\+?251\d{9}$|^0\d{9}$|^\+?\d{10,14}$/.test(s);
};

function buildFormData(form) {
  const fd = new FormData();
  const appendBool = (k, v) => fd.append(k, v ? '1' : '0');

  fd.append('companyName', form.companyName.trim());
  fd.append('industry', form.industry);
  fd.append('companySize', form.companySize);
  if (form.website) fd.append('website', form.website.trim());
  if (form.description) fd.append('description', form.description);

  fd.append('contactName', form.contactName.trim());
  fd.append('contactTitle', form.contactTitle.trim());
  fd.append('contactEmail', form.contactEmail.trim());
  fd.append('contactPhone', form.contactPhone.trim());
  if (form.altContactName) fd.append('altContactName', form.altContactName.trim());
  if (form.altContactEmail) fd.append('altContactEmail', form.altContactEmail.trim());
  if (form.altContactPhone) fd.append('altContactPhone', form.altContactPhone.trim());

  fd.append('country', form.country);
  fd.append('region', form.region);
  fd.append('city', form.city.trim());
  if (form.subCity) fd.append('subCity', form.subCity.trim());
  if (form.streetAddress) fd.append('streetAddress', form.streetAddress.trim());
  if (form.buildingName) fd.append('buildingName', form.buildingName.trim());
  if (form.poBox) fd.append('poBox', form.poBox.trim());

  fd.append('internCapacity', form.internCapacity);
  const areas = [...form.internshipAreas];
  if (form.internshipAreasOther?.trim()) areas.push(`Other: ${form.internshipAreasOther.trim()}`);
  areas.forEach((a) => fd.append('internshipAreas[]', a));
  if (form.internshipAreasOther) fd.append('internshipAreasOther', form.internshipAreasOther.trim());
  if (form.preferredDuration) fd.append('preferredDuration', form.preferredDuration);

  appendBool('providesStipend', !!form.providesStipend);
  if (form.providesStipend && form.stipendRange) fd.append('stipendRange', form.stipendRange);
  form.benefits.forEach((b) => fd.append('benefits[]', b));
  if (form.benefitsOther?.trim()) fd.append('benefits[]', `Other: ${form.benefitsOther.trim()}`);
  if (form.benefitsOther) fd.append('benefitsOther', form.benefitsOther.trim());

  fd.append('motivation', form.motivation.trim());
  if (form.benefitToOrg) fd.append('benefitToOrg', form.benefitToOrg.trim());
  appendBool('hasPriorExperience', !!form.hasPriorExperience);
  if (form.priorExperience) fd.append('priorExperience', form.priorExperience.trim());

  appendBool('agreementConfirmed', !!form.agreementConfirmed);
  appendBool('termsAccepted', !!form.termsAccepted);
  appendBool('reviewAcknowledged', !!form.reviewAcknowledged);

  ['businessLicense', 'companyProfile', 'taxCertificate', 'other'].forEach((key) => {
    const file = form.documents[key];
    if (file instanceof File) {
      fd.append(`documents[${key}]`, file);
    }
  });

  return fd;
}

export default function BecomePartner() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const saveTimer = useRef(null);

  const formRef = useRef(form);
  formRef.current = form;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.savedAt || !parsed.data) return;
      if (Date.now() - parsed.savedAt > DRAFT_MAX_MS) {
        localStorage.removeItem(DRAFT_KEY);
        return;
      }
      if (typeof window !== 'undefined' && window.confirm('Load your saved draft from this device?')) {
        setForm({ ...emptyForm(), ...parsed.data, documents: emptyForm().documents });
        setDraftLoaded(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persistDraft = useCallback(() => {
    try {
      const data = { ...formRef.current, documents: emptyForm().documents };
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ savedAt: Date.now(), data }));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    saveTimer.current = window.setInterval(persistDraft, AUTOSAVE_MS);
    return () => window.clearInterval(saveTimer.current);
  }, [persistDraft]);

  const progress = useMemo(() => {
    const checks = [
      form.companyName.trim(),
      form.industry,
      form.companySize,
      form.contactName.trim(),
      form.contactTitle.trim(),
      emailOk(form.contactEmail),
      phoneOk(form.contactPhone),
      form.region,
      form.city.trim(),
      form.internCapacity,
      form.internshipAreas.length > 0 || !!String(form.internshipAreasOther || '').trim(),
      form.motivation.trim().length >= 20,
      form.agreementConfirmed,
      form.termsAccepted,
      form.reviewAcknowledged,
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [form]);

  const setField = (path, value) => {
    setForm((prev) => {
      if (path.includes('.')) {
        const [a, b] = path.split('.');
        return { ...prev, [a]: { ...prev[a], [b]: value } };
      }
      return { ...prev, [path]: value };
    });
  };

  const validateField = (name, value, whole = form) => {
    switch (name) {
      case 'contactEmail':
        return emailOk(value) ? '' : 'Enter a valid email address.';
      case 'contactPhone':
        return phoneOk(value) ? '' : 'Use a valid phone number (e.g. +2519xxxxxxxx).';
      case 'motivation':
        return String(value).trim().length >= 20 ? '' : 'Please write at least 20 characters.';
      default:
        return '';
    }
  };

  const blur = (name, value) => {
    setTouched((t) => ({ ...t, [name]: true }));
    const msg = validateField(name, value);
    setErrors((e) => ({ ...e, [name]: msg }));
  };

  const validateAll = () => {
    const e = {};
    if (!form.companyName.trim()) e.companyName = 'Required.';
    if (!form.industry) e.industry = 'Required.';
    if (!form.companySize) e.companySize = 'Required.';
    if (!form.contactName.trim()) e.contactName = 'Required.';
    if (!form.contactTitle.trim()) e.contactTitle = 'Required.';
    if (!emailOk(form.contactEmail)) e.contactEmail = 'Valid email required.';
    if (!phoneOk(form.contactPhone)) e.contactPhone = 'Valid phone required.';
    if (!form.region) e.region = 'Required.';
    if (!form.city.trim()) e.city = 'Required.';
    if (!form.internCapacity) e.internCapacity = 'Required.';
    const hasAreas = form.internshipAreas.length > 0 || !!String(form.internshipAreasOther || '').trim();
    if (!hasAreas) e.internshipAreas = 'Select at least one area or specify Other.';
    if (!form.motivation.trim() || form.motivation.trim().length < 20) e.motivation = 'At least 20 characters required.';
    if (form.providesStipend && !form.stipendRange) e.stipendRange = 'Select a stipend range.';
    if (form.hasPriorExperience && !String(form.priorExperience || '').trim()) {
      e.priorExperience = 'Please describe your experience.';
    }
    if (!form.agreementConfirmed) e.agreementConfirmed = 'You must confirm accuracy.';
    if (!form.termsAccepted) e.termsAccepted = 'You must accept the terms.';
    if (!form.reviewAcknowledged) e.reviewAcknowledged = 'Please acknowledge the review timeline.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const fileErr = (file, label) => {
    if (!file) return '';
    const max = 5120 * 1024;
    if (file.size > max) return `${label} must be 5MB or smaller.`;
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    if (!validateAll()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const fe = fileErr(form.documents.businessLicense, 'Business license');
    if (fe) {
      setErrors((x) => ({ ...x, businessLicense: fe }));
      return;
    }
    setSubmitting(true);
    try {
      const fd = buildFormData(form);
      const { data } = await partnershipAPI.apply(fd);
      if (data.success) {
        localStorage.removeItem(DRAFT_KEY);
        setSuccess({ referenceId: data.referenceId, email: form.contactEmail.trim(), message: data.message });
      }
    } catch (err) {
      if (err.response?.status === 422) {
        const msg = err.response.data?.message || 'Please fix the highlighted fields.';
        const serverErrors = err.response.data?.errors || {};
        const flat = {};
        Object.keys(serverErrors).forEach((k) => {
          flat[k] = Array.isArray(serverErrors[k]) ? serverErrors[k][0] : serverErrors[k];
        });
        setErrors((prev) => ({ ...prev, ...flat }));
        setGeneralError(msg);
      } else {
        setGeneralError('Network error. Please check your connection and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleArea = (label) => {
    setForm((prev) => {
      const set = new Set(prev.internshipAreas);
      if (set.has(label)) set.delete(label);
      else set.add(label);
      return { ...prev, internshipAreas: Array.from(set) };
    });
  };

  const toggleBenefit = (label) => {
    setForm((prev) => {
      const set = new Set(prev.benefits);
      if (set.has(label)) set.delete(label);
      else set.add(label);
      return { ...prev, benefits: Array.from(set) };
    });
  };

  const handleFile = (key, fileList) => {
    const file = fileList?.[0] || null;
    setField(`documents.${key}`, file);
  };

  if (success) {
    return (
      <div className="become-partner-page">
        <div className="bp-top-nav">
          <Link href="/">← Back to home</Link>
        </div>
        <div className="bp-success">
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>✅</div>
          <h2>Application Submitted!</h2>
          <p>Thank you for your interest in partnering with Arsi University.</p>
          <div className="bp-success-ref">Reference: #{success.referenceId}</div>
          <p>
            A confirmation summary was recorded for <strong>{success.email}</strong>.
          </p>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
            Expected review time: 3–5 business days.
            <br />
            Questions? partnerships@aru.edu.et · +251-XXX-XXXXXX
          </p>
          <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="bp-btn bp-btn-primary" onClick={() => router.visit('/')}>
              Return to Home
            </button>
            <a href="mailto:partnerships@aru.edu.et" className="bp-btn bp-btn-secondary">
              Email Partnerships
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="become-partner-page">
      <div className="bp-top-nav">
        <Link href="/">← Home</Link>
        <Link href="/login">Portal sign in</Link>
      </div>

      <header className="bp-hero">
        <div className="bp-hero-particles" aria-hidden />
        <div className="bp-hero-inner">
          <div className="bp-hero-badge">
            <span>🤝</span> Become a Partner
          </div>
          <h1>Join Arsi University&apos;s Industry Network</h1>
          <p>
            Connect with top talent and shape the future of Ethiopia&apos;s workforce through structured internships and
            collaboration.
          </p>
          <button type="button" className="bp-scroll-btn" onClick={() => document.getElementById('bp-application-form')?.scrollIntoView({ behavior: 'smooth' })}>
            Scroll to Form ↓
          </button>
          <div className="bp-stats-strip">
            <div>
              <strong>120+</strong>
              <span>Partners</span>
            </div>
            <div>
              <strong>500+</strong>
              <span>Placements</span>
            </div>
            <div>
              <strong>85%</strong>
              <span>Retention</span>
            </div>
          </div>
        </div>
      </header>

      <section className="bp-benefits" aria-labelledby="bp-benefits-title">
        <h2 id="bp-benefits-title">Why partner with us</h2>
        <div className="bp-benefits-grid">
          {[
            { icon: '🎯', title: 'Access to Talent Pool', desc: 'Reach pre-vetted students aligned with your programs.' },
            { icon: '🤖', title: 'AI-Powered Matching', desc: 'Smarter shortlists based on skills and program fit.' },
            { icon: '📊', title: 'Analytics Dashboard', desc: 'Track applicants, pipelines, and outcomes in one place.' },
            { icon: '📝', title: 'Custom Evaluations', desc: 'Align assessments with your competency frameworks.' },
            { icon: '🔔', title: 'Real-time Notifications', desc: 'Stay informed on applications and milestones.' },
            { icon: '🎓', title: 'Campus Visibility', desc: 'Strengthen your brand across Arsi University channels.' },
          ].map((b) => (
            <div key={b.title} className="bp-benefit-card">
              <div className="icon">{b.icon}</div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="bp-form-wrap" id="bp-application-form">
        {draftLoaded && (
          <p style={{ fontSize: '0.85rem', color: '#059669', marginBottom: 12 }}>Draft restored from this device.</p>
        )}
        {generalError && <div className="bp-error-banner">{generalError}</div>}

        <div className="bp-progress">
          <div className="bp-progress-track">
            <div className="bp-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="bp-progress-label">Form completion · {progress}%</div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <section className="bp-form-section">
            <h2>
              <span>📋</span> Company Information
            </h2>
            <div className="bp-rule" />
            <div className="bp-field">
              <label htmlFor="companyName">
                Company Name <span className="req">*</span>
              </label>
              <input
                id="companyName"
                className="bp-input"
                value={form.companyName}
                onChange={(e) => setField('companyName', e.target.value)}
                onBlur={() => blur('companyName', form.companyName)}
              />
              {errors.companyName && <div className="bp-field-error">{errors.companyName}</div>}
            </div>
            <div className="bp-field">
              <label htmlFor="industry">
                Industry / Field <span className="req">*</span>
              </label>
              <select
                id="industry"
                className="bp-select"
                value={form.industry}
                onChange={(e) => setField('industry', e.target.value)}
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              {errors.industry && <div className="bp-field-error">{errors.industry}</div>}
            </div>
            <div className="bp-field">
              <label htmlFor="companySize">
                Company Size <span className="req">*</span>
              </label>
              <select
                id="companySize"
                className="bp-select"
                value={form.companySize}
                onChange={(e) => setField('companySize', e.target.value)}
              >
                <option value="">Select size</option>
                {COMPANY_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.companySize && <div className="bp-field-error">{errors.companySize}</div>}
            </div>
            <div className="bp-field">
              <label htmlFor="website">Company Website</label>
              <input
                id="website"
                className="bp-input"
                placeholder="https://"
                value={form.website}
                onChange={(e) => setField('website', e.target.value)}
              />
            </div>
            <div className="bp-field">
              <label htmlFor="description">Company Description</label>
              <textarea
                id="description"
                className="bp-textarea"
                maxLength={5000}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Brief description of your company..."
              />
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>{form.description.length}/5000</div>
            </div>
          </section>

          <section className="bp-form-section">
            <h2>
              <span>👤</span> Primary Contact
            </h2>
            <div className="bp-rule" />
            <div className="bp-field">
              <label htmlFor="contactName">
                Full Name <span className="req">*</span>
              </label>
              <input
                id="contactName"
                className="bp-input"
                value={form.contactName}
                onChange={(e) => setField('contactName', e.target.value)}
              />
              {errors.contactName && <div className="bp-field-error">{errors.contactName}</div>}
            </div>
            <div className="bp-field">
              <label htmlFor="contactTitle">
                Job Title / Position <span className="req">*</span>
              </label>
              <input
                id="contactTitle"
                className="bp-input"
                value={form.contactTitle}
                onChange={(e) => setField('contactTitle', e.target.value)}
              />
              {errors.contactTitle && <div className="bp-field-error">{errors.contactTitle}</div>}
            </div>
            <div className="bp-field">
              <label htmlFor="contactEmail">
                Email <span className="req">*</span>
              </label>
              <input
                id="contactEmail"
                type="email"
                className="bp-input"
                value={form.contactEmail}
                onChange={(e) => setField('contactEmail', e.target.value)}
                onBlur={() => blur('contactEmail', form.contactEmail)}
              />
              {(touched.contactEmail || errors.contactEmail) && errors.contactEmail && (
                <div className="bp-field-error">{errors.contactEmail}</div>
              )}
            </div>
            <div className="bp-field">
              <label htmlFor="contactPhone">
                Phone <span className="req">*</span>
              </label>
              <input
                id="contactPhone"
                className="bp-input"
                placeholder="+251 ..."
                value={form.contactPhone}
                onChange={(e) => setField('contactPhone', e.target.value)}
                onBlur={() => blur('contactPhone', form.contactPhone)}
              />
              {(touched.contactPhone || errors.contactPhone) && errors.contactPhone && (
                <div className="bp-field-error">{errors.contactPhone}</div>
              )}
            </div>
            <p style={{ fontWeight: 700, marginBottom: 8 }}>Alternative contact (optional)</p>
            <div className="bp-field">
              <label htmlFor="altContactName">Full Name</label>
              <input id="altContactName" className="bp-input" value={form.altContactName} onChange={(e) => setField('altContactName', e.target.value)} />
            </div>
            <div className="bp-field">
              <label htmlFor="altContactEmail">Email</label>
              <input id="altContactEmail" type="email" className="bp-input" value={form.altContactEmail} onChange={(e) => setField('altContactEmail', e.target.value)} />
            </div>
            <div className="bp-field">
              <label htmlFor="altContactPhone">Phone</label>
              <input id="altContactPhone" className="bp-input" value={form.altContactPhone} onChange={(e) => setField('altContactPhone', e.target.value)} />
            </div>
          </section>

          <section className="bp-form-section">
            <h2>
              <span>📍</span> Company Address
            </h2>
            <div className="bp-rule" />
            <div className="bp-field">
              <label htmlFor="country">
                Country <span className="req">*</span>
              </label>
              <select id="country" className="bp-select" value={form.country} onChange={(e) => setField('country', e.target.value)}>
                <option value="Ethiopia">Ethiopia</option>
              </select>
            </div>
            <div className="bp-field">
              <label htmlFor="region">
                Region / State <span className="req">*</span>
              </label>
              <select id="region" className="bp-select" value={form.region} onChange={(e) => setField('region', e.target.value)}>
                <option value="">Select region</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors.region && <div className="bp-field-error">{errors.region}</div>}
            </div>
            <div className="bp-field">
              <label htmlFor="city">
                City <span className="req">*</span>
              </label>
              <input id="city" className="bp-input" value={form.city} onChange={(e) => setField('city', e.target.value)} />
              {errors.city && <div className="bp-field-error">{errors.city}</div>}
            </div>
            <div className="bp-field">
              <label htmlFor="subCity">Sub-City</label>
              <input id="subCity" className="bp-input" value={form.subCity} onChange={(e) => setField('subCity', e.target.value)} />
            </div>
            <div className="bp-field">
              <label htmlFor="streetAddress">Street Address</label>
              <input id="streetAddress" className="bp-input" value={form.streetAddress} onChange={(e) => setField('streetAddress', e.target.value)} />
            </div>
            <div className="bp-field">
              <label htmlFor="buildingName">Building Name</label>
              <input id="buildingName" className="bp-input" value={form.buildingName} onChange={(e) => setField('buildingName', e.target.value)} />
            </div>
            <div className="bp-field">
              <label htmlFor="poBox">P.O. Box</label>
              <input id="poBox" className="bp-input" value={form.poBox} onChange={(e) => setField('poBox', e.target.value)} />
            </div>
          </section>

          <section className="bp-form-section">
            <h2>
              <span>📝</span> Internship Program
            </h2>
            <div className="bp-rule" />
            <div className="bp-field">
              <label htmlFor="internCapacity">
                How many interns can you host? <span className="req">*</span>
              </label>
              <select
                id="internCapacity"
                className="bp-select"
                value={form.internCapacity}
                onChange={(e) => setField('internCapacity', e.target.value)}
              >
                <option value="">Select capacity</option>
                {CAPACITY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.internCapacity && <div className="bp-field-error">{errors.internCapacity}</div>}
            </div>
            <div className="bp-field">
              <label>
                Internship areas <span className="req">*</span>
              </label>
              <div className="bp-checkbox-grid">
                {AREA_OPTIONS.map((a) => (
                  <label key={a} className="bp-check">
                    <input type="checkbox" checked={form.internshipAreas.includes(a)} onChange={() => toggleArea(a)} />
                    {a}
                  </label>
                ))}
              </div>
              <div className="bp-field" style={{ marginTop: 12 }}>
                <label htmlFor="internshipAreasOther">Other (specify)</label>
                <input
                  id="internshipAreasOther"
                  className="bp-input"
                  value={form.internshipAreasOther}
                  onChange={(e) => setField('internshipAreasOther', e.target.value)}
                />
              </div>
              {errors.internshipAreas && <div className="bp-field-error">{errors.internshipAreas}</div>}
            </div>
            <div className="bp-field">
              <label htmlFor="preferredDuration">Preferred duration</label>
              <select
                id="preferredDuration"
                className="bp-select"
                value={form.preferredDuration}
                onChange={(e) => setField('preferredDuration', e.target.value)}
              >
                <option value="">Select duration</option>
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="bp-field">
              <label>Will you provide stipend? <span className="req">*</span></label>
              <div className="bp-radio-row">
                <label className="bp-radio">
                  <input type="radio" name="stip" checked={form.providesStipend === true} onChange={() => setField('providesStipend', true)} />
                  Yes
                </label>
                <label className="bp-radio">
                  <input type="radio" name="stip" checked={form.providesStipend === false} onChange={() => setField('providesStipend', false)} />
                  No
                </label>
              </div>
            </div>
            {form.providesStipend && (
              <div className="bp-field">
                <label htmlFor="stipendRange">
                  Stipend range <span className="req">*</span>
                </label>
                <select
                  id="stipendRange"
                  className="bp-select"
                  value={form.stipendRange}
                  onChange={(e) => setField('stipendRange', e.target.value)}
                >
                  <option value="">Select range</option>
                  {STIPEND_RANGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.stipendRange && <div className="bp-field-error">{errors.stipendRange}</div>}
              </div>
            )}
            <div className="bp-field">
              <label>Additional benefits</label>
              <div className="bp-checkbox-grid">
                {BENEFIT_OPTS.map((b) => (
                  <label key={b} className="bp-check">
                    <input type="checkbox" checked={form.benefits.includes(b)} onChange={() => toggleBenefit(b)} />
                    {b}
                  </label>
                ))}
              </div>
              <div style={{ marginTop: 10 }}>
                <label htmlFor="benefitsOther">Other</label>
                <input id="benefitsOther" className="bp-input" value={form.benefitsOther} onChange={(e) => setField('benefitsOther', e.target.value)} />
              </div>
            </div>
          </section>

          <section className="bp-form-section">
            <h2>
              <span>💡</span> Motivation & Agreement
            </h2>
            <div className="bp-rule" />
            <div className="bp-field">
              <label htmlFor="motivation">
                Why partner with Arsi University? <span className="req">*</span>
              </label>
              <textarea
                id="motivation"
                className="bp-textarea"
                maxLength={5000}
                value={form.motivation}
                onChange={(e) => setField('motivation', e.target.value)}
                onBlur={() => blur('motivation', form.motivation)}
              />
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{form.motivation.length}/5000</div>
              {(touched.motivation || errors.motivation) && errors.motivation && (
                <div className="bp-field-error">{errors.motivation}</div>
              )}
            </div>
            <div className="bp-field">
              <label htmlFor="benefitToOrg">How will this benefit your organization?</label>
              <textarea id="benefitToOrg" className="bp-textarea" maxLength={5000} value={form.benefitToOrg} onChange={(e) => setField('benefitToOrg', e.target.value)} />
            </div>
            <div className="bp-field">
              <label>Prior internship program experience?</label>
              <div className="bp-radio-row">
                <label className="bp-radio">
                  <input type="radio" name="prior" checked={form.hasPriorExperience === true} onChange={() => setField('hasPriorExperience', true)} />
                  Yes
                </label>
                <label className="bp-radio">
                  <input type="radio" name="prior" checked={form.hasPriorExperience === false} onChange={() => setField('hasPriorExperience', false)} />
                  No
                </label>
              </div>
            </div>
            {form.hasPriorExperience && (
              <div className="bp-field">
                <label htmlFor="priorExperience">Describe prior experience</label>
                <textarea id="priorExperience" className="bp-textarea" value={form.priorExperience} onChange={(e) => setField('priorExperience', e.target.value)} />
                {errors.priorExperience && <div className="bp-field-error">{errors.priorExperience}</div>}
              </div>
            )}
            <label className="bp-check" style={{ marginBottom: 10 }}>
              <input type="checkbox" checked={form.agreementConfirmed} onChange={(e) => setField('agreementConfirmed', e.target.checked)} />I confirm that all information provided is
              accurate and truthful. <span className="req">*</span>
            </label>
            {errors.agreementConfirmed && <div className="bp-field-error">{errors.agreementConfirmed}</div>}
            <label className="bp-check" style={{ marginBottom: 10 }}>
              <input type="checkbox" checked={form.termsAccepted} onChange={(e) => setField('termsAccepted', e.target.checked)} />I agree to the Terms of Partnership and ARU IMS
              policies. <span className="req">*</span>
            </label>
            {errors.termsAccepted && <div className="bp-field-error">{errors.termsAccepted}</div>}
            <label className="bp-check">
              <input type="checkbox" checked={form.reviewAcknowledged} onChange={(e) => setField('reviewAcknowledged', e.target.checked)} />I understand that my application will be
              reviewed within 3–5 business days. <span className="req">*</span>
            </label>
            {errors.reviewAcknowledged && <div className="bp-field-error">{errors.reviewAcknowledged}</div>}
          </section>

          <section className="bp-form-section">
            <h2>
              <span>📄</span> Supporting Documents (optional)
            </h2>
            <div className="bp-rule" />
            {[
              { key: 'businessLicense', label: 'Business license / registration' },
              { key: 'companyProfile', label: 'Company profile / brochure (PDF)' },
              { key: 'taxCertificate', label: 'Tax registration certificate' },
              { key: 'other', label: 'Other relevant documents' },
            ].map((row) => (
              <div key={row.key} className="bp-field">
                <label>{row.label}</label>
                <div className="bp-file">
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => handleFile(row.key, e.target.files)} />
                </div>
                {row.key === 'businessLicense' && errors.businessLicense && (
                  <div className="bp-field-error">{errors.businessLicense}</div>
                )}
              </div>
            ))}
            <p className="bp-note">PDF, JPG, or PNG up to 5MB each (PDF only for company profile).</p>
          </section>

          <div className="bp-actions">
            <button
              type="button"
              className="bp-btn bp-btn-ghost"
              onClick={() => {
                persistDraft();
                alert('Draft saved on this device.');
              }}
            >
              Save Draft
            </button>
            <button type="button" className="bp-btn bp-btn-secondary" onClick={() => setPreviewOpen(true)}>
              Preview
            </button>
            <button type="submit" className="bp-btn bp-btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="bp-spinner" aria-hidden />
                  Submitting your application…
                </>
              ) : (
                'Submit application'
              )}
            </button>
          </div>
          <p className="bp-note">Submitting your application sends it securely for review. You will receive a reference ID on success.</p>
        </form>
      </div>

      {previewOpen && (
        <div className="bp-preview-overlay" role="dialog" aria-modal="true">
          <div className="bp-preview-modal">
            <h3 style={{ marginTop: 0 }}>Preview</h3>
            <pre>
              {JSON.stringify(
                {
                  ...form,
                  documents: {
                    businessLicense: form.documents.businessLicense?.name || null,
                    companyProfile: form.documents.companyProfile?.name || null,
                    taxCertificate: form.documents.taxCertificate?.name || null,
                    other: form.documents.other?.name || null,
                  },
                },
                null,
                2
              )}
            </pre>
            <button type="button" className="bp-btn bp-btn-primary" onClick={() => setPreviewOpen(false)} style={{ marginTop: 16 }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
