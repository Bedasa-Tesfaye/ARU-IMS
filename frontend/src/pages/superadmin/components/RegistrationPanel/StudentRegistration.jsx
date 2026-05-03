import React, { useState } from 'react';

const StudentRegistration = ({ departments, onRegister, onBulkRegister, isSubmitting }) => {
  const [mode, setMode] = useState('single'); // 'single' or 'bulk'
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    department_id: '',
    year: '',
    cgpa: '',
    student_id: ''
  });
  const [csvFile, setCsvFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(formData, 'student');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      parseCSV(file);
    } else {
      alert('Please upload a CSV file');
    }
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const students = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        return {
          id: index + 1,
          full_name: values[0] || '',
          phone: values[1] || '',
          department_id: values[2] || '',
          year: values[3] || '',
          cgpa: values[4] || '',
          student_id: values[5] || ''
        };
      }).filter(student => student.full_name);
      
      setPreviewData(students);
      setShowPreview(true);
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csvContent = 'full_name,phone,department_id,year,cgpa,student_id\nJohn Doe,0912345678,1,3,3.5,CS2024001\nJane Smith,0912345679,2,2,3.8,IT2024002';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkSubmit = () => {
    if (previewData.length > 0) {
      onBulkRegister(previewData);
    }
  };

  const resetBulkForm = () => {
    setCsvFile(null);
    setPreviewData([]);
    setShowPreview(false);
    const fileInput = document.getElementById('csv-file');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="student-registration">
      <div className="registration-modes">
        <button
          className={`mode-btn ${mode === 'single' ? 'active' : ''}`}
          onClick={() => setMode('single')}
        >
          Single Registration
        </button>
        <button
          className={`mode-btn ${mode === 'bulk' ? 'active' : ''}`}
          onClick={() => setMode('bulk')}
        >
          Bulk Registration
        </button>
      </div>

      {mode === 'single' ? (
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label htmlFor="full_name">Full Name</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="department_id">Department</label>
            <select
              id="department_id"
              name="department_id"
              value={formData.department_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="year">Year</label>
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
              <option value="5">5th Year</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="cgpa">CGPA</label>
            <input
              type="number"
              id="cgpa"
              name="cgpa"
              value={formData.cgpa}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              max="4"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="student_id">Student ID</label>
            <input
              type="text"
              id="student_id"
              name="student_id"
              value={formData.student_id}
              onChange={handleInputChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Register Student'}
          </button>
        </form>
      ) : (
        <div className="bulk-registration">
          <div className="template-section">
            <h3>Download Template</h3>
            <p>Download the CSV template and fill it with student data:</p>
            <button
              type="button"
              className="btn-template"
              onClick={downloadTemplate}
            >
              📥 Download Template
            </button>
          </div>

          <div className="upload-section">
            <h3>Upload CSV File</h3>
            <input
              type="file"
              id="csv-file"
              accept=".csv"
              onChange={handleFileUpload}
              className="file-input"
            />
          </div>

          {showPreview && (
            <div className="preview-section">
              <h3>Preview ({previewData.length} students)</h3>
              <div className="preview-table">
                <table>
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Phone</th>
                      <th>Department</th>
                      <th>Year</th>
                      <th>CGPA</th>
                      <th>Student ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 5).map((student) => (
                      <tr key={student.id}>
                        <td>{student.full_name}</td>
                        <td>{student.phone}</td>
                        <td>{student.department_id}</td>
                        <td>{student.year}</td>
                        <td>{student.cgpa}</td>
                        <td>{student.student_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 5 && (
                  <p className="preview-note">... and {previewData.length - 5} more students</p>
                )}
              </div>

              <div className="preview-actions">
                <button
                  type="button"
                  className="btn-submit"
                  onClick={handleBulkSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registering...' : `Register ${previewData.length} Students`}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={resetBulkForm}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentRegistration;
