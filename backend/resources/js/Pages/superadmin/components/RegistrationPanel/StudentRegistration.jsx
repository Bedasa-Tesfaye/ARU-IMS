import React, { useState, useRef, useEffect } from "react";
import { resolveDepartmentId } from "../../utils/resolveDepartmentId";

const StudentRegistration = ({
    departments = [], // ADD DEFAULT VALUE
    onRegister,
    onBulkRegister,
    isSubmitting,
    onFormProgress,
}) => {
    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        department_id: "",
        year: "",
        cgpa: "",
        student_id: "",
    });
    const [bulkMode, setBulkMode] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [bulkData, setBulkData] = useState([]);
    const [csvError, setCsvError] = useState("");
    const [formErrors, setFormErrors] = useState({});
    const fileInputRef = useRef(null);

    // Track form progress
    useEffect(() => {
        const filled = Object.values(formData).filter((v) => v !== "").length;
        const total = Object.keys(formData).length;
        const progress = bulkMode
            ? 2
            : Math.min(2 + Math.floor((filled / total) * 1), 3);
        onFormProgress?.(progress);
    }, [formData, bulkMode]);

    const parseCSVLine = (line) => {
        const out = [];
        let cur = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"' && line[i + 1] === '"') {
                cur += '"';
                i++;
                continue;
            }
            if (ch === '"') {
                inQuotes = !inQuotes;
                continue;
            }
            if (ch === "," && !inQuotes) {
                out.push(cur);
                cur = "";
                continue;
            }
            cur += ch;
        }
        out.push(cur);
        return out.map((v) => v.trim());
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.full_name.trim())
            errors.full_name = "Full name is required";
        if (!departments || departments.length === 0) {
            errors.department_id =
                "Departments are not loaded yet. Please refresh the page.";
        } else if (!formData.department_id) {
            errors.department_id = "Department is required";
        } else if (
            !departments.some(
                (d) => String(d.id) === String(formData.department_id),
            )
        ) {
            errors.department_id =
                "The selected department is not valid. Please pick from the list.";
        }
        if (!formData.year) errors.year = "Year of study is required";
        if (!formData.cgpa) errors.cgpa = "CGPA is required";
        else if (formData.cgpa < 0 || formData.cgpa > 4)
            errors.cgpa = "CGPA must be between 0-4";
        if (!formData.student_id.trim())
            errors.student_id = "Student ID is required";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onRegister(formData, "student");
        }
    };

    const downloadTemplate = () => {
        const headers = [
            "full_name",
            "phone",
            "department_id",
            "year",
            "cgpa",
            "student_id",
        ];
        const sampleDept1 = departments?.[0]?.id ? String(departments[0].id) : "";
        const sampleDept2 = departments?.[1]?.id ? String(departments[1].id) : sampleDept1;
        const sampleData = [
            ["John Doe", "0912345678", sampleDept1 || "DEPARTMENT_ID_FROM_DB", "3", "3.5", "CS2024001"],
            ["Jane Smith", "0912345679", sampleDept2 || "DEPARTMENT_ID_FROM_DB", "2", "3.8", "IT2024002"],
        ];

        const csvContent = [
            headers.join(","),
            ...sampleData.map((row) => row.join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "student_registration_template.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        setCsvError("");

        if (!file) return;

        const isCsv =
            file.name?.toLowerCase().endsWith(".csv") ||
            file.type?.includes("csv") ||
            file.type?.startsWith("text/");

        if (!isCsv) {
            setCsvFile(null);
            setBulkData([]);
            setCsvError("Please select a valid .csv file.");
            return;
        }

        setCsvFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target.result;
                const lines = text
                    .replace(/\r\n/g, "\n")
                    .replace(/\r/g, "\n")
                    .split("\n")
                    .filter((l) => l.trim() !== "");

                if (lines.length < 2) {
                    setCsvError(
                        "CSV file must contain headers and at least one data row.",
                    );
                    return;
                }

                const headers = parseCSVLine(lines[0]).map((h) =>
                    h.trim().toLowerCase(),
                );
                const requiredHeaders = [
                    "full_name",
                    "phone",
                    "department_id",
                    "year",
                    "cgpa",
                    "student_id",
                ];
                const missing = requiredHeaders.filter(
                    (h) => !headers.includes(h),
                );

                if (missing.length) {
                    setBulkData([]);
                    setCsvError(
                        `Missing columns: ${missing.join(", ")}. Download the template for correct format.`,
                    );
                    return;
                }

                const data = [];
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim()) {
                        const values = parseCSVLine(lines[i]);
                        const row = {};
                        headers.forEach((header, index) => {
                            row[header] = values[index] || "";
                        });
                        data.push(row);
                    }
                }
                setBulkData(data);
            } catch (err) {
                setCsvError("Error reading CSV file. Please check the format.");
            }
        };
        reader.onerror = () => {
            setCsvError("Error reading file. Please try again.");
        };
        reader.readAsText(file);
    };

    const handleBulkSubmit = (e) => {
        e.preventDefault();
        if (!departments || departments.length === 0) {
            setCsvError(
                "Departments are not loaded. Please refresh the page before bulk registration.",
            );
            return;
        }

        if (bulkData.length > 0) {
            const normalized = bulkData.map((row) => {
                const raw = String(row.department_id || "").trim();
                // 1) Exact id match
                const idMatch = departments.find(
                    (d) => String(d.id) === raw,
                )?.id;
                if (idMatch != null) return { ...row, department_id: String(idMatch) };

                // 2) If user pasted a department name in department_id column
                const resolvedByIdColumn = resolveDepartmentId(departments, raw);
                if (resolvedByIdColumn?.id)
                    return { ...row, department_id: String(resolvedByIdColumn.id) };

                // 3) Optional support for department_name column
                const resolvedByNameColumn = resolveDepartmentId(
                    departments,
                    row.department_name,
                );
                if (resolvedByNameColumn?.id)
                    return { ...row, department_id: String(resolvedByNameColumn.id) };

                return { ...row, department_id: raw, _dept_error: true };
            });

            const invalidCount = normalized.filter((r) => r._dept_error).length;
            if (invalidCount > 0) {
                setCsvError(
                    `${invalidCount} row(s) have an invalid department_id. Use real database IDs (download the template) or put the department name in the department_id column.`,
                );
                return;
            }

            onBulkRegister(normalized, "student");
        }
    };

    const removeFile = () => {
        setCsvFile(null);
        setBulkData([]);
        setCsvError("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <form
            className="sa-registration-form"
            onSubmit={bulkMode ? handleBulkSubmit : handleSubmit}
            noValidate
        >
            <div className="form-header">
                <div className="header-content">
                    <div>
                        <h3>🎓 Student Registration</h3>
                        <p>
                            {bulkMode
                                ? "Import multiple students from CSV file"
                                : "Register a new student with auto-generated login credentials"}
                        </p>
                    </div>
                    <div className="mode-toggle">
                        <button
                            type="button"
                            className={`toggle-btn ${!bulkMode ? "active" : ""}`}
                            onClick={() => {
                                setBulkMode(false);
                                setFormErrors({});
                            }}
                        >
                            <span>📝</span> Single
                        </button>
                        <button
                            type="button"
                            className={`toggle-btn ${bulkMode ? "active" : ""}`}
                            onClick={() => {
                                setBulkMode(true);
                                setFormErrors({});
                            }}
                        >
                            <span>📁</span> Bulk (CSV)
                        </button>
                    </div>
                </div>
            </div>

            {!bulkMode ? (
                <>
                    <div className="form-section">
                        <h4>📋 Personal Information</h4>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>
                                    Full Name{" "}
                                    <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            full_name: e.target.value,
                                        })
                                    }
                                    placeholder="Enter full name"
                                    className={
                                        formErrors.full_name ? "error" : ""
                                    }
                                />
                                {formErrors.full_name && (
                                    <span className="error-text">
                                        {formErrors.full_name}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            phone: e.target.value,
                                        })
                                    }
                                    placeholder="+251 9XX XXX XXXX"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h4>🎓 Academic Information</h4>
                        <div className="form-grid">
                            {/* FIXED: Department Dropdown with safety check */}
                            <div className="form-group">
                                <label>
                                    Department{" "}
                                    <span className="required">*</span>
                                </label>
                                <select
                                    value={formData.department_id}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            department_id: e.target.value,
                                        })
                                    }
                                    className={
                                        formErrors.department_id ? "error" : ""
                                    }
                                    disabled={!departments || departments.length === 0}
                                >
                                    <option value="">
                                        -- Select Department --
                                    </option>
                                    {departments && departments.length > 0 ? (
                                        departments.map((dept) => (
                                            <option
                                                key={String(dept.id)}
                                                value={String(dept.id)}
                                            >
                                                {dept.name}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>
                                            Departments unavailable (refresh)...
                                        </option>
                                    )}
                                </select>
                                {formErrors.department_id && (
                                    <span className="error-text">
                                        {formErrors.department_id}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label>
                                    Year of Study{" "}
                                    <span className="required">*</span>
                                </label>
                                <select
                                    value={formData.year}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            year: e.target.value,
                                        })
                                    }
                                    className={formErrors.year ? "error" : ""}
                                >
                                    <option value="">-- Select Year --</option>
                                    {[1, 2, 3, 4, 5].map((year) => (
                                        <option key={year} value={year}>
                                            Year {year}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.year && (
                                    <span className="error-text">
                                        {formErrors.year}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label>
                                    CGPA <span className="required">*</span>{" "}
                                    <span className="hint">(0.00 - 4.00)</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="4"
                                    value={formData.cgpa}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            cgpa: e.target.value,
                                        })
                                    }
                                    placeholder="3.50"
                                    className={formErrors.cgpa ? "error" : ""}
                                />
                                {formErrors.cgpa && (
                                    <span className="error-text">
                                        {formErrors.cgpa}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label>
                                    Student ID{" "}
                                    <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.student_id}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            student_id: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., CS2024001"
                                    className={
                                        formErrors.student_id ? "error" : ""
                                    }
                                />
                                {formErrors.student_id && (
                                    <span className="error-text">
                                        {formErrors.student_id}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="form-info-box">
                        <span className="info-icon">ℹ️</span>
                        <div>
                            <strong>Auto-generated credentials</strong>
                            <p>
                                Email and password will be automatically
                                generated upon registration. You can send them
                                to the student via email or download them.
                            </p>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bulk-upload-section">
                    <div className="bulk-upload-header">
                        <h4>📁 Upload CSV File</h4>
                        <p>
                            Import multiple students at once by uploading a
                            properly formatted CSV file
                        </p>
                    </div>

                    <div className="template-section">
                        <div className="template-info">
                            <h5>📋 CSV Format Requirements</h5>
                            <p>
                                Your CSV file must include these columns (order
                                doesn't matter):
                            </p>
                            <ul>
                                <li>
                                    <code>full_name</code> - Full name
                                    (required)
                                </li>
                                <li>
                                    <code>phone</code> - Phone number (optional)
                                </li>
                                <li>
                                    <code>department_id</code> - Department ID
                                    number (required)
                                </li>
                                <li>
                                    <code>year</code> - Year of study 1-5
                                    (required)
                                </li>
                                <li>
                                    <code>cgpa</code> - Grade point 0-4
                                    (required)
                                </li>
                                <li>
                                    <code>student_id</code> - University ID
                                    (required)
                                </li>
                            </ul>
                        </div>
                        <button
                            type="button"
                            className="btn-template"
                            onClick={downloadTemplate}
                        >
                            📥 Download Template
                        </button>
                    </div>

                    <div className="file-upload-section">
                        <div
                            className={`file-upload-area ${csvFile ? "has-file" : ""} ${csvError ? "has-error" : ""}`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files[0];
                                if (file) {
                                    const fakeEvent = {
                                        target: { files: [file] },
                                    };
                                    handleFileUpload(fakeEvent);
                                }
                            }}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,text/csv"
                                onChange={handleFileUpload}
                                style={{ display: "none" }}
                                id="csv-upload"
                            />

                            {!csvFile ? (
                                <>
                                    <div className="upload-icon">📤</div>
                                    <p className="upload-text">
                                        Drag & drop your CSV file here
                                    </p>
                                    <p className="upload-or">or</p>
                                    <button
                                        type="button"
                                        className="btn-upload"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                    >
                                        Browse Files
                                    </button>
                                    <p className="upload-hint">
                                        .csv files only
                                    </p>
                                </>
                            ) : (
                                <div className="file-info-display">
                                    <div className="file-info-icon">📄</div>
                                    <div className="file-info-details">
                                        <span className="file-name">
                                            {csvFile.name}
                                        </span>
                                        <span className="file-size">
                                            {(csvFile.size / 1024).toFixed(2)}{" "}
                                            KB
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className="file-remove-btn"
                                        onClick={removeFile}
                                        title="Remove file"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}

                            {csvError && (
                                <div className="csv-error-message">
                                    <span>⚠️</span> {csvError}
                                </div>
                            )}
                        </div>
                    </div>

                    {bulkData.length > 0 && (
                        <div className="bulk-preview">
                            <div className="bulk-preview-header">
                                <h5>📊 Data Preview</h5>
                                <span className="bulk-count-badge">
                                    {bulkData.length} students found
                                </span>
                            </div>
                            <div className="preview-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Full Name</th>
                                            <th>Student ID</th>
                                            <th>Dept ID</th>
                                            <th>Year</th>
                                            <th>CGPA</th>
                                            <th>Phone</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bulkData
                                            .slice(0, 5)
                                            .map((student, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{student.full_name}</td>
                                                    <td>
                                                        {student.student_id}
                                                    </td>
                                                    <td>
                                                        {student.department_id}
                                                    </td>
                                                    <td>{student.year}</td>
                                                    <td>{student.cgpa}</td>
                                                    <td>
                                                        {student.phone || "-"}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                                {bulkData.length > 5 && (
                                    <p className="more-rows">
                                        ... and {bulkData.length - 5} more
                                        students
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <button
                type="submit"
                className="btn-submit"
                disabled={
                    isSubmitting ||
                    (!bulkMode && (!departments || departments.length === 0)) ||
                    (bulkMode && bulkData.length === 0)
                }
            >
                {isSubmitting ? (
                    <>
                        <span className="spinner-mini"></span>
                        Registering...
                    </>
                ) : bulkMode ? (
                    `🎓 Register ${bulkData.length} Student${bulkData.length !== 1 ? "s" : ""}`
                ) : (
                    "🎓 Register Student"
                )}
            </button>
        </form>
    );
};

export default StudentRegistration;
