import React, { useState } from 'react';

const CompanyRegistration = ({ onRegister, isSubmitting }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    country_region: '',
    state: '',
    city: '',
    sub_city: '',
    street: '',
    building: '',
    po_box: '',
    website: '',
    company_email: '',
    field_of_interest: '',
    phone: '',
    contact_person: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(formData, 'company');
  };

  return (
    <form className="sa-registration-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h3>🏢 Company Registration</h3>
        <p>Register a new partner company account</p>
      </div>

      <div className="form-section">
        <h4>Basic Information</h4>
        <div className="form-grid">
          <div className="form-group"><label>Company Name *</label><input type="text" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} required /></div>
          <div className="form-group"><label>Company Email *</label><input type="email" value={formData.company_email} onChange={(e) => setFormData({ ...formData, company_email: e.target.value })} required /></div>
          <div className="form-group"><label>Phone Number *</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required /></div>
          <div className="form-group"><label>Website</label><input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} /></div>
          <div className="form-group"><label>Field of Interest *</label><input type="text" value={formData.field_of_interest} onChange={(e) => setFormData({ ...formData, field_of_interest: e.target.value })} required /></div>
          <div className="form-group"><label>Contact Person *</label><input type="text" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} required /></div>
        </div>
      </div>

      <div className="form-section">
        <h4>Address Information</h4>
        <div className="form-grid">
          <div className="form-group"><label>Country/Region *</label><input type="text" value={formData.country_region} onChange={(e) => setFormData({ ...formData, country_region: e.target.value })} required /></div>
          <div className="form-group"><label>State *</label><input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} required /></div>
          <div className="form-group"><label>City *</label><input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required /></div>
          <div className="form-group"><label>Sub-City</label><input type="text" value={formData.sub_city} onChange={(e) => setFormData({ ...formData, sub_city: e.target.value })} /></div>
          <div className="form-group"><label>Street</label><input type="text" value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })} /></div>
          <div className="form-group"><label>Building</label><input type="text" value={formData.building} onChange={(e) => setFormData({ ...formData, building: e.target.value })} /></div>
          <div className="form-group"><label>P.O. Box</label><input type="text" value={formData.po_box} onChange={(e) => setFormData({ ...formData, po_box: e.target.value })} /></div>
        </div>
      </div>

      <button type="submit" className="btn-submit" disabled={isSubmitting}>
        {isSubmitting ? 'Registering...' : '🏢 Register Company'}
      </button>
    </form>
  );
};

export default CompanyRegistration;
