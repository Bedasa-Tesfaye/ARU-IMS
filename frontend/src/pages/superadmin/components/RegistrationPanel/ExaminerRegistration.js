import React, { useState } from 'react';

const QUALIFICATION_OPTIONS = [
  'Professor', 'Associate Professor', 'Assistant Professor', 'Senior Lecturer',
  'Lecturer', 'Assistant Lecturer', 'Instructor', 'PhD Candidate (Teaching Assistant)',
  'Industry Professional (Adjunct)', 'Guest Examiner',
];

const ExaminerRegistration = ({ departments, onRegister, isSubmitting }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    employee_id: '',
    department_id: '',
    highest_qualification: '',
    field_of_specialization: '',
    years_of_experience: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(formData, 'examiner');
  };

  return (
    <form className="sa-registration-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h3>👨‍🏫 Examiner Registration</h3>
        <p>Register a new examiner/supervisor account</p>
      </div>
      <div className="form-grid">
        <div className="form-group"><label>Full Name *</label><input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required /></div>
        <div className="form-group"><label>Phone Number</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
        <div className="form-group"><label>Employee ID *</label><input type="text" value={formData.employee_id} onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })} required /></div>
        <div className="form-group">
          <label>Department *</label>
          <select value={formData.department_id} onChange={(e) => setFormData({ ...formData, department_id: e.target.value })} required>
            <option value="">Select Department</option>
            {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Highest Qualification *</label>
          <select value={formData.highest_qualification} onChange={(e) => setFormData({ ...formData, highest_qualification: e.target.value })} required>
            <option value="">Select Qualification</option>
            {QUALIFICATION_OPTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>
        <div className="form-group"><label>Field of Specialization *</label><input type="text" value={formData.field_of_specialization} onChange={(e) => setFormData({ ...formData, field_of_specialization: e.target.value })} required /></div>
        <div className="form-group">
          <label>Years of Experience *</label>
          <select value={formData.years_of_experience} onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })} required>
            <option value="">Select Years</option>
            {[...Array(31).keys()].map((year) => <option key={year} value={year}>{year} {year === 1 ? 'year' : 'years'}</option>)}
          </select>
        </div>
      </div>
      <button type="submit" className="btn-submit" disabled={isSubmitting}>{isSubmitting ? 'Registering...' : '👨‍🏫 Register Examiner'}</button>
    </form>
  );
};

export default ExaminerRegistration;
