import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { superAdminAPI } from '../services/api';
import './SuperAdminDashboard.css';

const QUALIFICATION_OPTIONS = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Senior Lecturer',
  'Lecturer',
  'Assistant Lecturer',
  'Instructor',
  'PhD Candidate (Teaching Assistant)',
  'Industry Professional (Adjunct)',
  'Guest Examiner',
];

const initialStudent = {
  full_name: '',
  phone: '',
  department_id: '',
  year: '',
  cgpa: '',
  student_id: '',
};

const initialCompany = {
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
};

const initialStaff = {
  full_name: '',
  phone: '',
  employee_id: '',
  department_id: '',
  highest_qualification: '',
  field_of_specialization: '',
  years_of_experience: '',
};

const SuperAdminDashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('student-single');
  const [departments, setDepartments] = useState([]);
  const [studentData, setStudentData] = useState(initialStudent);
  const [bulkRowsText, setBulkRowsText] = useState('');
  const [bulkFileName, setBulkFileName] = useState('');
  const [companyData, setCompanyData] = useState(initialCompany);
  const [examinerData, setExaminerData] = useState(initialStaff);
  const [advisorData, setAdvisorData] = useState(initialStaff);
  const [generatedCredentials, setGeneratedCredentials] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAuthenticated && user?.role === 'super_admin') {
      superAdminAPI
        .getDepartments()
        .then((res) => setDepartments(res.data))
        .catch((err) => {
          setError(err.response?.data?.message || 'Failed to load departments.');
        });
    }
  }, [isAuthenticated, user]);

  const departmentOptions = useMemo(
    () => departments.map((dep) => ({ value: String(dep.id), label: `${dep.name} (${dep.code})` })),
    [departments]
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'super_admin') {
    return (
      <div className="sa-dashboard-wrap">
        <div className="sa-card">
          <h2>Access denied</h2>
          <p>This dashboard is available only to Super-Admin users.</p>
        </div>
      </div>
    );
  }

  const clearAlerts = () => {
    setError('');
    setSuccess('');
  };

  const parseBulkRows = (rawText) => {
    const rows = rawText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (rows.length === 0) {
      throw new Error('Please provide bulk rows.');
    }

    const maybeHeader = rows[0].toLowerCase().includes('full_name');
    const bodyRows = maybeHeader ? rows.slice(1) : rows;

    return bodyRows.map((line) => {
      const [full_name, phone, department_id, year, cgpa, student_id] = line.split(',').map((v) => v.trim());
      return {
        full_name,
        phone,
        department_id: Number(department_id),
        year: Number(year),
        cgpa: Number(cgpa),
        student_id,
      };
    });
  };

  const onBulkFileChange = async (e) => {
    clearAlerts();
    const file = e.target.files?.[0];
    if (!file) {
      setBulkFileName('');
      return;
    }

    try {
      const text = await file.text();
      parseBulkRows(text);
      setBulkRowsText(text);
      setBulkFileName(file.name);
      setSuccess(`Loaded ${file.name}. You can now submit bulk registration.`);
    } catch (parseErr) {
      setBulkFileName('');
      setError(parseErr.message || 'Unable to read the CSV file.');
    }
  };

  const exportCredentials = () => {
    if (generatedCredentials.length === 0) {
      setError('No generated credentials to export.');
      return;
    }

    const header = ['name', 'student_id', 'email', 'password'];
    const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const lines = [
      header.join(','),
      ...generatedCredentials.map((row) =>
        [row.name, row.student_id, row.email, row.password].map(escapeCsv).join(',')
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `generated_credentials_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const onSingleStudentSubmit = async (e) => {
    e.preventDefault();
    clearAlerts();
    setIsSubmitting(true);

    try {
      const payload = {
        ...studentData,
        department_id: Number(studentData.department_id),
        year: Number(studentData.year),
        cgpa: Number(studentData.cgpa),
      };
      const res = await superAdminAPI.registerStudent(payload);
      setGeneratedCredentials([res.data.credentials]);
      setSuccess('Student registered successfully and credentials generated.');
      setStudentData(initialStudent);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onBulkStudentSubmit = async (e) => {
    e.preventDefault();
    clearAlerts();
    setIsSubmitting(true);

    try {
      const students = parseBulkRows(bulkRowsText);

      const res = await superAdminAPI.registerStudentsBulk(students);
      setGeneratedCredentials(res.data.credentials || []);
      setSuccess(`${res.data.count || students.length} students registered successfully.`);
      setBulkRowsText('');
      setBulkFileName('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to bulk register students.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCompanySubmit = async (e) => {
    e.preventDefault();
    clearAlerts();
    setIsSubmitting(true);

    try {
      const res = await superAdminAPI.registerCompany(companyData);
      setGeneratedCredentials([res.data.credentials]);
      setSuccess('Company registered successfully and credentials generated.');
      setCompanyData(initialCompany);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register company.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitStaff = async (e, role) => {
    e.preventDefault();
    clearAlerts();
    setIsSubmitting(true);

    const current = role === 'examiner' ? examinerData : advisorData;
    const payload = {
      ...current,
      department_id: Number(current.department_id),
      years_of_experience: Number(current.years_of_experience),
    };

    try {
      const res =
        role === 'examiner'
          ? await superAdminAPI.registerExaminer(payload)
          : await superAdminAPI.registerAdvisor(payload);
      setGeneratedCredentials([res.data.credentials]);
      setSuccess(`${role === 'examiner' ? 'Examiner' : 'Advisor'} registered successfully.`);
      if (role === 'examiner') {
        setExaminerData(initialStaff);
      } else {
        setAdvisorData(initialStaff);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to register ${role}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sa-dashboard-wrap">
      <div className="sa-card">
        <h1>Super-Admin Dashboard</h1>
        <p>Register all actors and generate system email/password credentials automatically.</p>

        <div className="sa-tabs">
          <button onClick={() => setActiveTab('student-single')} className={activeTab === 'student-single' ? 'active' : ''}>Student (Single)</button>
          <button onClick={() => setActiveTab('student-bulk')} className={activeTab === 'student-bulk' ? 'active' : ''}>Student (Bulk)</button>
          <button onClick={() => setActiveTab('company')} className={activeTab === 'company' ? 'active' : ''}>Company</button>
          <button onClick={() => setActiveTab('examiner')} className={activeTab === 'examiner' ? 'active' : ''}>Examiner</button>
          <button onClick={() => setActiveTab('advisor')} className={activeTab === 'advisor' ? 'active' : ''}>Advisor Examiner</button>
        </div>

        {error && <div className="sa-alert sa-error">{error}</div>}
        {success && <div className="sa-alert sa-success">{success}</div>}

        {activeTab === 'student-single' && (
          <form className="sa-form-grid" onSubmit={onSingleStudentSubmit}>
            <input placeholder="Full Name" value={studentData.full_name} onChange={(e) => setStudentData({ ...studentData, full_name: e.target.value })} required />
            <input placeholder="Phone Number" value={studentData.phone} onChange={(e) => setStudentData({ ...studentData, phone: e.target.value })} />
            <select value={studentData.department_id} onChange={(e) => setStudentData({ ...studentData, department_id: e.target.value })} required>
              <option value="">Select Department</option>
              {departmentOptions.map((dep) => <option key={dep.value} value={dep.value}>{dep.label}</option>)}
            </select>
            <input placeholder="Year" type="number" min="1" max="8" value={studentData.year} onChange={(e) => setStudentData({ ...studentData, year: e.target.value })} required />
            <input placeholder="CGPA" type="number" step="0.01" min="0" max="4" value={studentData.cgpa} onChange={(e) => setStudentData({ ...studentData, cgpa: e.target.value })} required />
            <input placeholder="Student ID (e.g. ugr/13960/15)" value={studentData.student_id} onChange={(e) => setStudentData({ ...studentData, student_id: e.target.value })} required />
            <button type="submit" disabled={isSubmitting}>Register Student</button>
          </form>
        )}

        {activeTab === 'student-bulk' && (
          <form onSubmit={onBulkStudentSubmit} className="sa-form-grid">
            <p className="sa-help-text">Paste CSV rows in order: full_name, phone, department_id, year, cgpa, student_id</p>
            <input type="file" accept=".csv,text/csv" onChange={onBulkFileChange} />
            {bulkFileName && <p className="sa-help-text">Loaded file: {bulkFileName}</p>}
            <textarea
              rows={8}
              placeholder="full_name,phone,department_id,year,cgpa,student_id&#10;Abel Tufa,0911223344,1,4,3.45,ugr/13960/15"
              value={bulkRowsText}
              onChange={(e) => setBulkRowsText(e.target.value)}
              required
            />
            <button type="submit" disabled={isSubmitting}>Bulk Register Students</button>
          </form>
        )}

        {activeTab === 'company' && (
          <form className="sa-form-grid" onSubmit={onCompanySubmit}>
            <input placeholder="Company Name" value={companyData.company_name} onChange={(e) => setCompanyData({ ...companyData, company_name: e.target.value })} required />
            <input placeholder="Country/Region" value={companyData.country_region} onChange={(e) => setCompanyData({ ...companyData, country_region: e.target.value })} required />
            <input placeholder="State" value={companyData.state} onChange={(e) => setCompanyData({ ...companyData, state: e.target.value })} required />
            <input placeholder="City" value={companyData.city} onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })} required />
            <input placeholder="Sub-City" value={companyData.sub_city} onChange={(e) => setCompanyData({ ...companyData, sub_city: e.target.value })} />
            <input placeholder="Street" value={companyData.street} onChange={(e) => setCompanyData({ ...companyData, street: e.target.value })} />
            <input placeholder="Building" value={companyData.building} onChange={(e) => setCompanyData({ ...companyData, building: e.target.value })} />
            <input placeholder="P.O. Box" value={companyData.po_box} onChange={(e) => setCompanyData({ ...companyData, po_box: e.target.value })} />
            <input placeholder="Company Website" value={companyData.website} onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })} />
            <input placeholder="Company Email" value={companyData.company_email} onChange={(e) => setCompanyData({ ...companyData, company_email: e.target.value })} />
            <input placeholder="Field of Interest" value={companyData.field_of_interest} onChange={(e) => setCompanyData({ ...companyData, field_of_interest: e.target.value })} required />
            <input placeholder="Phone Number" value={companyData.phone} onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })} required />
            <input placeholder="Contact Person" value={companyData.contact_person} onChange={(e) => setCompanyData({ ...companyData, contact_person: e.target.value })} required />
            <button type="submit" disabled={isSubmitting}>Register Company</button>
          </form>
        )}

        {activeTab === 'examiner' && (
          <form className="sa-form-grid" onSubmit={(e) => submitStaff(e, 'examiner')}>
            <input placeholder="Full Name" value={examinerData.full_name} onChange={(e) => setExaminerData({ ...examinerData, full_name: e.target.value })} required />
            <input placeholder="Phone Number" value={examinerData.phone} onChange={(e) => setExaminerData({ ...examinerData, phone: e.target.value })} />
            <input placeholder="Employee ID" value={examinerData.employee_id} onChange={(e) => setExaminerData({ ...examinerData, employee_id: e.target.value })} required />
            <select value={examinerData.department_id} onChange={(e) => setExaminerData({ ...examinerData, department_id: e.target.value })} required>
              <option value="">Select Department</option>
              {departmentOptions.map((dep) => <option key={dep.value} value={dep.value}>{dep.label}</option>)}
            </select>
            <select value={examinerData.highest_qualification} onChange={(e) => setExaminerData({ ...examinerData, highest_qualification: e.target.value })} required>
              <option value="">Select Highest Qualification</option>
              {QUALIFICATION_OPTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
            <input placeholder="Field of Specialization" value={examinerData.field_of_specialization} onChange={(e) => setExaminerData({ ...examinerData, field_of_specialization: e.target.value })} required />
            <input placeholder="Years of Experience" type="number" min="0" value={examinerData.years_of_experience} onChange={(e) => setExaminerData({ ...examinerData, years_of_experience: e.target.value })} required />
            <button type="submit" disabled={isSubmitting}>Register Examiner</button>
          </form>
        )}

        {activeTab === 'advisor' && (
          <form className="sa-form-grid" onSubmit={(e) => submitStaff(e, 'advisor')}>
            <input placeholder="Full Name" value={advisorData.full_name} onChange={(e) => setAdvisorData({ ...advisorData, full_name: e.target.value })} required />
            <input placeholder="Phone Number" value={advisorData.phone} onChange={(e) => setAdvisorData({ ...advisorData, phone: e.target.value })} />
            <input placeholder="Employee ID" value={advisorData.employee_id} onChange={(e) => setAdvisorData({ ...advisorData, employee_id: e.target.value })} required />
            <select value={advisorData.department_id} onChange={(e) => setAdvisorData({ ...advisorData, department_id: e.target.value })} required>
              <option value="">Select Department</option>
              {departmentOptions.map((dep) => <option key={dep.value} value={dep.value}>{dep.label}</option>)}
            </select>
            <select value={advisorData.highest_qualification} onChange={(e) => setAdvisorData({ ...advisorData, highest_qualification: e.target.value })} required>
              <option value="">Select Highest Qualification</option>
              {QUALIFICATION_OPTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
            <input placeholder="Field of Specialization" value={advisorData.field_of_specialization} onChange={(e) => setAdvisorData({ ...advisorData, field_of_specialization: e.target.value })} required />
            <input placeholder="Years of Experience" type="number" min="0" value={advisorData.years_of_experience} onChange={(e) => setAdvisorData({ ...advisorData, years_of_experience: e.target.value })} required />
            <button type="submit" disabled={isSubmitting}>Register Advisor Examiner</button>
          </form>
        )}

        <div className="sa-credentials">
          <div className="sa-credentials-header">
            <h3>Generated Credentials</h3>
            <button type="button" className="sa-export-btn" onClick={exportCredentials}>Export CSV</button>
          </div>
          {generatedCredentials.length === 0 ? (
            <p>No generated credentials yet.</p>
          ) : (
            generatedCredentials.map((item, idx) => (
              <div className="sa-credential-item" key={`${item.email}-${idx}`}>
                <strong>{item.email}</strong>
                <span>{item.password}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

