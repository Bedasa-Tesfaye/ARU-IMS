import React, { useState, useRef } from 'react';

const StudentRegistration = ({ departments, onRegister, onBulkRegister, isSubmitting }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    department_id: '',
    year: '',
    cgpa: '',
    student_id: '',
  });
  const [bulkMode, setBulkMode] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [bulkData, setBulkData] = useState([]);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(formData, 'student');
  };

  const downloadTemplate = () => {
    const headers = ['full_name', 'phone', 'department_id', 'year', 'cgpa', 'student_id'];
    const sampleData = [
      ['John Doe', '0912345678', '1', '3', '3.5', 'CS2024001'],
      ['Jane Smith', '0912345679', '2', '2', '3.8', 'IT2024002'],
    ];
    
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_registration_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            data.push(row);
          }
        }
        setBulkData(data);
      };
      reader.readAsText(file);
    }
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    if (bulkData.length > 0) {
      onBulkRegister(bulkData, 'student');
    }
  };

  return (
    <form className="sa-registration-form" onSubmit={bulkMode ? handleBulkSubmit : handleSubmit}>
      <div className="form-header">
        <div className="header-content">
          <div>
            <h3>🎓 Student Registration</h3>
            <p>{bulkMode ? 'Register multiple students from CSV file' : 'Register a new student account with auto-generated credentials'}</p>
          </div>
          <div className="mode-toggle">
            <button
              type="button"
              className={`toggle-btn ${!bulkMode ? 'active' : ''}`}
              onClick={() => setBulkMode(false)}
            >
              Single
            </button>
            <button
              type="button"
              className={`toggle-btn ${bulkMode ? 'active' : ''}`}
              onClick={() => setBulkMode(true)}
            >
              Bulk
            </button>
          </div>
        </div>
      </div>

      {!bulkMode ? (
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name *</label>
            <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Department *</label>
            <select value={formData.department_id} onChange={(e) => setFormData({ ...formData, department_id: e.target.value })} required>
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Year of Study *</label>
            <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} required>
              <option value="">Select Year</option>
              {[1, 2, 3, 4, 5].map((year) => (
                <option key={year} value={year}>{year} Year</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>CGPA *</label>
            <input type="number" step="0.01" min="0" max="4" value={formData.cgpa} onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Student ID *</label>
            <input type="text" value={formData.student_id} onChange={(e) => setFormData({ ...formData, student_id: e.target.value })} required />
          </div>
        </div>
      ) : (
        <div className="bulk-upload-section">
          <div className="bulk-upload-header">
            <h4>📁 Upload CSV File</h4>
            <p>Upload a CSV file containing student information</p>
          </div>
          
          <div className="template-section">
            <div className="template-info">
              <h5>📋 CSV Template Required</h5>
              <p>The CSV file must contain the following columns:</p>
              <ul>
                <li><code>full_name</code> - Student's full name</li>
                <li><code>phone</code> - Phone number (optional)</li>
                <li><code>department_id</code> - Department ID (number)</li>
                <li><code>year</code> - Year of study (1-5)</li>
                <li><code>cgpa</code> - CGPA (0-4)</li>
                <li><code>student_id</code> - Student ID</li>
              </ul>
            </div>
            <button type="button" className="btn-template" onClick={downloadTemplate}>
              📥 Download Template
            </button>
          </div>

          <div className="file-upload-section">
            <div className="file-upload-area">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn-upload"
                onClick={() => fileInputRef.current?.click()}
              >
                📤 Choose CSV File
              </button>
              {csvFile && (
                <div className="file-info">
                  <span className="file-name">📄 {csvFile.name}</span>
                  <span className="file-size">({(csvFile.size / 1024).toFixed(2)} KB)</span>
                </div>
              )}
            </div>
          </div>

          {bulkData.length > 0 && (
            <div className="bulk-preview">
              <h5>📊 Data Preview ({bulkData.length} students)</h5>
              <div className="preview-table">
                <table>
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Student ID</th>
                      <th>Department</th>
                      <th>Year</th>
                      <th>CGPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkData.slice(0, 5).map((student, index) => (
                      <tr key={index}>
                        <td>{student.full_name}</td>
                        <td>{student.student_id}</td>
                        <td>{student.department_id}</td>
                        <td>{student.year}</td>
                        <td>{student.cgpa}</td>
                      </tr>
                    ))}
                    {bulkData.length > 5 && (
                      <tr>
                        <td colSpan="5" className="more-rows">
                          ... and {bulkData.length - 5} more students
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <button type="submit" className="btn-submit" disabled={isSubmitting || (bulkMode && bulkData.length === 0)}>
        {isSubmitting ? 'Registering...' : bulkMode ? `🎓 Register ${bulkData.length} Students` : '🎓 Register Student'}
      </button>
    </form>
  );
};

export default StudentRegistration;
