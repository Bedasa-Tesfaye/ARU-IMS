import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import "../styles/DepartmentAdminUserRegistration.css";

function DepartmentAdminUserRegistrationPage() {
  const { registerUser, setMessage } = useOutletContext();
  const [selectedRole, setSelectedRole] = useState("Student");
  const [registrationMode, setRegistrationMode] = useState("single"); // single or bulk
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    studentId: "",
    employeeId: "",
    yearOfStudy: "",
    cgpa: "",
    phoneNumber: "",
    qualification: "",
    expertiseArea: "",
    experience: "",
    officeLocation: ""
  });
  const [bulkStudents, setBulkStudents] = useState([
    { fullName: "", email: "", studentId: "", yearOfStudy: "", cgpa: "", phoneNumber: "" }
  ]);
  const [csvData, setCsvData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleFields = {
    Student: ["fullName", "email", "studentId", "yearOfStudy", "cgpa", "phoneNumber"],
    Examiner: ["fullName", "email", "employeeId", "qualification", "expertiseArea", "phoneNumber"],
    Advisor: ["fullName", "email", "employeeId", "experience", "officeLocation", "phoneNumber"]
  };

  const roleDetails = {
    Student: {
      icon: "🎓",
      title: "Student Registration",
      description: "Register new students to the department",
      color: "#10b981",
      gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
    },
    Examiner: {
      icon: "👨‍🏫",
      title: "Examiner Registration",
      description: "Add examiners to evaluate student performance",
      color: "#3b82f6",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    },
    Advisor: {
      icon: "👨‍💼",
      title: "Advisor Registration",
      description: "Register academic advisors for student guidance",
      color: "#8b5cf6",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await registerUser({
        role: selectedRole,
        ...formData
      });

      setFormData({
        fullName: "",
        email: "",
        studentId: "",
        employeeId: "",
        yearOfStudy: "",
        cgpa: "",
        phoneNumber: "",
        qualification: "",
        expertiseArea: "",
        experience: "",
        officeLocation: ""
      });

      setMessage({ type: "success", text: `${selectedRole} registered successfully!` });
    } catch (error) {
      setMessage({ type: "error", text: `Registration failed: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const student of bulkStudents) {
        if (student.fullName && student.email && student.studentId) {
          try {
            await registerUser({
              role: "Student",
              ...student
            });
            successCount++;
          } catch (error) {
            errorCount++;
          }
        }
      }

      setMessage({
        type: "success",
        text: `Bulk registration completed! ${successCount} students registered successfully, ${errorCount} failed.`
      });

      setBulkStudents([{ fullName: "", email: "", studentId: "", yearOfStudy: "", cgpa: "", phoneNumber: "" }]);
      setCsvData(null);
    } catch (error) {
      setMessage({ type: "error", text: `Bulk registration failed: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target.result;
        const lines = csv.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());

        const students = lines
          .slice(1)
          .filter((line) => line.trim())
          .map((line) => {
            const values = line.split(",").map((v) => v.trim());
            const student = {};

            headers.forEach((header, i) => {
              const fieldName = header.toLowerCase().replace(/\s+/g, "");
              if (fieldName.includes("name")) student.fullName = values[i] || "";
              else if (fieldName.includes("email")) student.email = values[i] || "";
              else if (fieldName.includes("student") && fieldName.includes("id")) student.studentId = values[i] || "";
              else if (fieldName.includes("year")) student.yearOfStudy = values[i] || "";
              else if (fieldName.includes("cgpa")) student.cgpa = values[i] || "";
              else if (fieldName.includes("phone")) student.phoneNumber = values[i] || "";
            });

            return {
              fullName: student.fullName || "",
              email: student.email || "",
              studentId: student.studentId || "",
              yearOfStudy: student.yearOfStudy || "",
              cgpa: student.cgpa || "",
              phoneNumber: student.phoneNumber || ""
            };
          });

        setBulkStudents(students.length ? students : bulkStudents);
        setCsvData(file.name);
      };
      reader.readAsText(file);
    } else if (file) {
      setMessage({ type: "error", text: "Please upload a valid CSV file." });
    }
  };

  const handleBulkStudentChange = (index, field, value) => {
    const updatedStudents = [...bulkStudents];
    updatedStudents[index][field] = value;
    setBulkStudents(updatedStudents);
  };

  const addBulkStudentRow = () => {
    setBulkStudents([
      ...bulkStudents,
      { fullName: "", email: "", studentId: "", yearOfStudy: "", cgpa: "", phoneNumber: "" }
    ]);
  };

  const removeBulkStudentRow = (index) => {
    const updatedStudents = bulkStudents.filter((_, i) => i !== index);
    setBulkStudents(updatedStudents);
  };

  const renderField = (fieldName) => {
    const commonProps = {
      value: formData[fieldName] || "",
      onChange: (e) => handleInputChange(fieldName, e.target.value),
      className: "form-input-enhanced",
      required: true
    };

    const fieldConfig = {
      fullName: { label: "Full Name", placeholder: "Enter full name", type: "text", icon: "👤" },
      email: { label: "Email Address", placeholder: "Enter email address", type: "email", icon: "📧" },
      studentId: { label: "Student ID", placeholder: "e.g., CS2021001", type: "text", icon: "🆔" },
      employeeId: { label: "Employee ID", placeholder: "e.g., EMP001", type: "text", icon: "🆔" },
      yearOfStudy: { label: "Year of Study", type: "select", icon: "📚" },
      cgpa: { label: "CGPA", placeholder: "e.g., 3.75", type: "number", icon: "⭐" },
      phoneNumber: { label: "Phone Number", placeholder: "+251911234567", type: "tel", icon: "📞" },
      qualification: { label: "Highest Qualification", placeholder: "e.g., PhD in Computer Science", type: "text", icon: "🎓" },
      expertiseArea: { label: "Expertise Area", placeholder: "e.g., Machine Learning", type: "text", icon: "🔬" },
      experience: { label: "Years of Experience", placeholder: "e.g., 10", type: "number", icon: "⏱️" },
      officeLocation: { label: "Office Location", placeholder: "e.g., Room 201", type: "text", icon: "🏢" }
    };

    const config = fieldConfig[fieldName];

    return (
      <div className="form-group-enhanced">
        <label>
          <span className="field-icon">{config.icon}</span>
          {config.label} <span className="required">*</span>
        </label>
        {config.type === "select" ? (
          <select {...commonProps}>
            <option value="">Select year</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
            <option value="5th Year">5th Year</option>
          </select>
        ) : (
          <input
            type={config.type}
            placeholder={config.placeholder}
            {...commonProps}
            step={fieldName === "cgpa" ? "0.01" : undefined}
            min={fieldName === "cgpa" ? "0" : undefined}
            max={fieldName === "cgpa" ? "4" : undefined}
          />
        )}
      </div>
    );
  };

  const getFieldCount = () => {
    return roleFields[selectedRole].filter((field) => (formData[field] || "").trim()).length;
  };

  const totalFields = roleFields[selectedRole].length;
  const progress = (getFieldCount() / totalFields) * 100;

  return (
    <div className="dept-user-registration">
      <div className="registration-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content-reg">
          <div className="hero-icon">{roleDetails[selectedRole].icon}</div>
          <div className="hero-text">
            <h1>User Registration</h1>
            <p>Add new students, examiners, and advisors to your department</p>
          </div>
        </div>
      </div>

      <div className="registration-wrapper">
        <div className="registration-sidebar">
          <div className="role-selector-enhanced">
            <h3>Select Role</h3>
            <div className="role-cards">
              {["Student", "Examiner", "Advisor"].map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`role-card ${selectedRole === role ? "active" : ""}`}
                  onClick={() => setSelectedRole(role)}
                >
                  <div className="role-card-icon">
                    {role === "Student" && "🎓"}
                    {role === "Examiner" && "👨‍🏫"}
                    {role === "Advisor" && "👨‍💼"}
                  </div>
                  <div className="role-card-info">
                    <div className="role-card-name">{role}</div>
                    <div className="role-card-desc">
                      {role === "Student" && "Register new students"}
                      {role === "Examiner" && "Add examiners"}
                      {role === "Advisor" && "Add academic advisors"}
                    </div>
                  </div>
                  {selectedRole === role && <div className="role-check">✓</div>}
                </button>
              ))}
            </div>
          </div>

          {selectedRole === "Student" && (
            <div className="registration-mode-toggle">
              <h4>Registration Mode</h4>
              <div className="mode-buttons">
                <button
                  type="button"
                  className={`mode-btn ${registrationMode === "single" ? "active" : ""}`}
                  onClick={() => setRegistrationMode("single")}
                >
                  <span className="mode-icon">👤</span>
                  <span>Single Registration</span>
                </button>
                <button
                  type="button"
                  className={`mode-btn ${registrationMode === "bulk" ? "active" : ""}`}
                  onClick={() => setRegistrationMode("bulk")}
                >
                  <span className="mode-icon">👥</span>
                  <span>Bulk Registration</span>
                </button>
              </div>
            </div>
          )}

          <div className="stats-card">
            <h4>Department Stats</h4>
            <div className="stats-list">
              <div className="stats-item">
                <span className="stats-label">Total Students</span>
                <span className="stats-value">342</span>
              </div>
              <div className="stats-item">
                <span className="stats-label">Active Examiners</span>
                <span className="stats-value">18</span>
              </div>
              <div className="stats-item">
                <span className="stats-label">Advisors</span>
                <span className="stats-value">12</span>
              </div>
              <div className="stats-item">
                <span className="stats-label">This Month</span>
                <span className="stats-value">+24</span>
              </div>
            </div>
          </div>
        </div>

        <div className="registration-form-container">
          <div className="form-header-enhanced">
            <div className="form-header-icon" style={{ background: roleDetails[selectedRole].gradient }}>
              {roleDetails[selectedRole].icon}
            </div>
            <div className="form-header-text">
              <h2>{roleDetails[selectedRole].title}</h2>
              <p>{roleDetails[selectedRole].description}</p>
            </div>
            <div className="form-progress">
              <div className="progress-label">
                {getFieldCount()}/{totalFields} completed
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>

          {registrationMode === "single" && selectedRole === "Student" ? (
            <form onSubmit={handleSingleSubmit} className="registration-form-enhanced">
              <div className="form-grid-enhanced">
                {roleFields[selectedRole].map((fieldName) => (
                  <div key={fieldName}>{renderField(fieldName)}</div>
                ))}
              </div>

              <div className="form-actions-enhanced">
                <button
                  type="button"
                  className="btn-clear"
                  onClick={() => {
                    setFormData({
                      fullName: "",
                      email: "",
                      studentId: "",
                      employeeId: "",
                      yearOfStudy: "",
                      cgpa: "",
                      phoneNumber: "",
                      qualification: "",
                      expertiseArea: "",
                      experience: "",
                      officeLocation: ""
                    });
                  }}
                >
                  <span>🗑️</span> Clear Form
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isSubmitting}
                  style={{ background: roleDetails[selectedRole].gradient }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-small"></span>
                      Registering...
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      Register {selectedRole}
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : selectedRole === "Student" && registrationMode === "bulk" ? (
            <div className="bulk-registration-container">
              <div className="bulk-upload-section">
                <h4>📁 Upload CSV File</h4>
                <div className="upload-area">
                  <input type="file" accept=".csv" onChange={handleCsvUpload} className="csv-input" id="csv-upload" />
                  <label htmlFor="csv-upload" className="upload-label">
                    <span className="upload-icon">📄</span>
                    <div className="upload-text">
                      <span className="upload-title">Choose CSV file</span>
                      <span className="upload-subtitle">or drag and drop</span>
                    </div>
                  </label>
                  {csvData && (
                    <div className="file-info">
                      <span className="file-name">📎 {csvData}</span>
                      <button type="button" className="remove-file" onClick={() => setCsvData(null)}>
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bulk-manual-section">
                <div className="bulk-header">
                  <h4>✏️ Manual Entry</h4>
                  <button type="button" className="add-row-btn" onClick={addBulkStudentRow}>
                    <span>➕</span> Add Student
                  </button>
                </div>

                <div className="bulk-table-container">
                  <table className="bulk-table">
                    <thead>
                      <tr>
                        <th>Full Name *</th>
                        <th>Email *</th>
                        <th>Student ID *</th>
                        <th>Year of Study *</th>
                        <th>CGPA *</th>
                        <th>Phone Number</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkStudents.map((student, index) => (
                        <tr key={index}>
                          <td>
                            <input
                              type="text"
                              value={student.fullName}
                              onChange={(e) => handleBulkStudentChange(index, "fullName", e.target.value)}
                              className="bulk-input"
                              placeholder="Enter full name"
                            />
                          </td>
                          <td>
                            <input
                              type="email"
                              value={student.email}
                              onChange={(e) => handleBulkStudentChange(index, "email", e.target.value)}
                              className="bulk-input"
                              placeholder="Enter email"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={student.studentId}
                              onChange={(e) => handleBulkStudentChange(index, "studentId", e.target.value)}
                              className="bulk-input"
                              placeholder="e.g., CS2021001"
                            />
                          </td>
                          <td>
                            <select
                              value={student.yearOfStudy}
                              onChange={(e) => handleBulkStudentChange(index, "yearOfStudy", e.target.value)}
                              className="bulk-input"
                            >
                              <option value="">Select year</option>
                              <option value="1st Year">1st Year</option>
                              <option value="2nd Year">2nd Year</option>
                              <option value="3rd Year">3rd Year</option>
                              <option value="4th Year">4th Year</option>
                              <option value="5th Year">5th Year</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              value={student.cgpa}
                              onChange={(e) => handleBulkStudentChange(index, "cgpa", e.target.value)}
                              className="bulk-input"
                              placeholder="e.g., 3.75"
                              min="0"
                              max="4"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <input
                              type="tel"
                              value={student.phoneNumber}
                              onChange={(e) => handleBulkStudentChange(index, "phoneNumber", e.target.value)}
                              className="bulk-input"
                              placeholder="+251911234567"
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="remove-row-btn"
                              onClick={() => removeBulkStudentRow(index)}
                              disabled={bulkStudents.length === 1}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bulk-actions">
                <button
                  type="button"
                  className="btn-clear"
                  onClick={() => {
                    setBulkStudents([
                      { fullName: "", email: "", studentId: "", yearOfStudy: "", cgpa: "", phoneNumber: "" }
                    ]);
                    setCsvData(null);
                  }}
                >
                  <span>🗑️</span> Clear All
                </button>
                <button
                  type="button"
                  className="btn-submit"
                  onClick={handleBulkSubmit}
                  disabled={isSubmitting}
                  style={{ background: roleDetails[selectedRole].gradient }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-small"></span>
                      Bulk Registering...
                    </>
                  ) : (
                    <>
                      <span>👥</span>
                      Register All Students
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSingleSubmit} className="registration-form-enhanced">
              <div className="form-grid-enhanced">
                {roleFields[selectedRole].map((fieldName) => (
                  <div key={fieldName}>{renderField(fieldName)}</div>
                ))}
              </div>

              <div className="form-actions-enhanced">
                <button
                  type="button"
                  className="btn-clear"
                  onClick={() => {
                    setFormData({
                      fullName: "",
                      email: "",
                      studentId: "",
                      employeeId: "",
                      yearOfStudy: "",
                      cgpa: "",
                      phoneNumber: "",
                      qualification: "",
                      expertiseArea: "",
                      experience: "",
                      officeLocation: ""
                    });
                  }}
                >
                  <span>🗑️</span> Clear Form
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isSubmitting}
                  style={{ background: roleDetails[selectedRole].gradient }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-small"></span>
                      Registering...
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      Register {selectedRole}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="registration-info-enhanced">
            <div className="info-header">
              <span className="info-icon">ℹ️</span>
              <h4>Important Information</h4>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-bullet">✓</span>
                <span>
                  All fields marked with <span className="required">*</span> are required
                </span>
              </div>
              <div className="info-item">
                <span className="info-bullet">🔑</span>
                <span>A temporary password will be automatically generated</span>
              </div>
              <div className="info-item">
                <span className="info-bullet">📧</span>
                <span>Welcome email with login credentials will be sent to the user</span>
              </div>
              <div className="info-item">
                <span className="info-bullet">🏛️</span>
                <span>Users will be affiliated with your department automatically</span>
              </div>
              <div className="info-item">
                <span className="info-bullet">📝</span>
                <span>All registration activities are logged for audit purposes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DepartmentAdminUserRegistrationPage;

