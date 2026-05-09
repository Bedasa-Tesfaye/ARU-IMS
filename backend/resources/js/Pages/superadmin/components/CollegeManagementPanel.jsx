import React, { useMemo, useState } from "react";

export default function CollegeManagementPanel({
  colleges = [],
  departments = [],
  onCreateCollege,
  onCreateDepartment,
  onUpdateCollege,
  onDeleteCollege,
  onUpdateDepartment,
  onDeleteDepartment,
  loading = false,
}) {
  const [collegeForm, setCollegeForm] = useState({ name: "", code: "", description: "" });
  const [departmentForm, setDepartmentForm] = useState({ name: "", code: "" });
  const [editingCollegeId, setEditingCollegeId] = useState(null);
  const [editingDepartmentId, setEditingDepartmentId] = useState(null);
  const [collegeEditForm, setCollegeEditForm] = useState({ name: "", code: "", description: "" });
  const [departmentEditForm, setDepartmentEditForm] = useState({ name: "", code: "" });
  const [busyCollege, setBusyCollege] = useState(false);
  const [busyDepartment, setBusyDepartment] = useState(false);

  const sortedColleges = useMemo(
    () =>
      [...(Array.isArray(colleges) ? colleges : [])].sort((a, b) =>
        String(a?.name || "").localeCompare(String(b?.name || ""))
      ),
    [colleges]
  );
  const sortedDepartments = useMemo(
    () =>
      [...(Array.isArray(departments) ? departments : [])].sort((a, b) =>
        String(a?.name || "").localeCompare(String(b?.name || ""))
      ),
    [departments]
  );

  const submitCollege = async () => {
    if (!collegeForm.name.trim() || !collegeForm.code.trim()) return;
    setBusyCollege(true);
    try {
      await onCreateCollege?.({
        name: collegeForm.name.trim(),
        code: collegeForm.code.trim().toUpperCase(),
        description: collegeForm.description.trim() || null,
      });
      setCollegeForm({ name: "", code: "", description: "" });
    } finally {
      setBusyCollege(false);
    }
  };

  const submitDepartment = async () => {
    if (!departmentForm.name.trim() || !departmentForm.code.trim()) return;
    setBusyDepartment(true);
    try {
      await onCreateDepartment?.({
        name: departmentForm.name.trim(),
        code: departmentForm.code.trim().toUpperCase(),
      });
      setDepartmentForm({ name: "", code: "" });
    } finally {
      setBusyDepartment(false);
    }
  };

  const startEditCollege = (c) => {
    setEditingCollegeId(c.id);
    setCollegeEditForm({
      name: c.name || "",
      code: c.code || "",
      description: c.description || "",
    });
  };

  const startEditDepartment = (d) => {
    setEditingDepartmentId(d.id);
    setDepartmentEditForm({
      name: d.name || "",
      code: d.code || "",
    });
  };

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <section className="sa-settings-card">
        <h2>🏫 College Management</h2>
        <p className="sa-muted">
          Create and view colleges used across reporting and assignment flows.
        </p>
        <div
          style={{
            display: "grid",
            gap: ".75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <label>
            College name
            <input
              value={collegeForm.name}
              onChange={(e) => setCollegeForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. College of Engineering and Technology"
            />
          </label>
          <label>
            Code
            <input
              value={collegeForm.code}
              onChange={(e) => setCollegeForm((p) => ({ ...p, code: e.target.value }))}
              placeholder="e.g. CET"
            />
          </label>
        </div>
        <label style={{ marginTop: ".75rem", display: "block" }}>
          Description (optional)
          <textarea
            rows={3}
            value={collegeForm.description}
            onChange={(e) =>
              setCollegeForm((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="Brief summary of focus areas..."
          />
        </label>
        <div style={{ marginTop: ".8rem" }}>
          <button
            type="button"
            className="sa-btn-primary"
            onClick={submitCollege}
            disabled={busyCollege || !collegeForm.name.trim() || !collegeForm.code.trim()}
          >
            {busyCollege ? "Creating..." : "Create college"}
          </button>
        </div>
      </section>

      <section className="sa-settings-card">
        <h2>🏛️ Department Management</h2>
        <p className="sa-muted">
          Create departments used in registration, assignment, and student filtering.
        </p>
        <div
          style={{
            display: "grid",
            gap: ".75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <label>
            Department name
            <input
              value={departmentForm.name}
              onChange={(e) =>
                setDepartmentForm((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="e.g. Computer Science"
            />
          </label>
          <label>
            Code
            <input
              value={departmentForm.code}
              onChange={(e) =>
                setDepartmentForm((p) => ({ ...p, code: e.target.value }))
              }
              placeholder="e.g. CSC"
            />
          </label>
        </div>
        <div style={{ marginTop: ".8rem" }}>
          <button
            type="button"
            className="sa-btn-primary"
            onClick={submitDepartment}
            disabled={
              busyDepartment ||
              !departmentForm.name.trim() ||
              !departmentForm.code.trim()
            }
          >
            {busyDepartment ? "Creating..." : "Create department"}
          </button>
        </div>
      </section>

      <section className="sa-settings-card">
        <h2>Registered colleges</h2>
        {loading ? (
          <p className="sa-muted">Loading colleges...</p>
        ) : sortedColleges.length ? (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedColleges.map((c) => (
                  <tr key={c.id}>
                    {editingCollegeId === c.id ? (
                      <>
                        <td>
                          <input
                            value={collegeEditForm.name}
                            onChange={(e) =>
                              setCollegeEditForm((p) => ({ ...p, name: e.target.value }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            value={collegeEditForm.code}
                            onChange={(e) =>
                              setCollegeEditForm((p) => ({ ...p, code: e.target.value }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            value={collegeEditForm.description}
                            onChange={(e) =>
                              setCollegeEditForm((p) => ({ ...p, description: e.target.value }))
                            }
                          />
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button
                              type="button"
                              className="sa-btn-primary sa-btn-sm"
                              onClick={async () => {
                                await onUpdateCollege?.(c.id, {
                                  name: collegeEditForm.name.trim(),
                                  code: collegeEditForm.code.trim().toUpperCase(),
                                  description: collegeEditForm.description.trim() || null,
                                });
                                setEditingCollegeId(null);
                              }}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="sa-btn-secondary sa-btn-sm"
                              onClick={() => setEditingCollegeId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{c.name}</td>
                        <td>{c.code}</td>
                        <td>{c.description || "—"}</td>
                        <td>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button
                              type="button"
                              className="sa-btn-secondary sa-btn-sm"
                              onClick={() => startEditCollege(c)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="sa-btn-danger sa-btn-sm"
                              onClick={async () => {
                                if (!window.confirm(`Delete college "${c.name}"?`)) return;
                                await onDeleteCollege?.(c.id);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="sa-muted">No colleges registered yet.</p>
        )}
      </section>

      <section className="sa-settings-card">
        <h2>Registered departments</h2>
        {loading ? (
          <p className="sa-muted">Loading departments...</p>
        ) : sortedDepartments.length ? (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedDepartments.map((d) => (
                  <tr key={d.id}>
                    {editingDepartmentId === d.id ? (
                      <>
                        <td>
                          <input
                            value={departmentEditForm.name}
                            onChange={(e) =>
                              setDepartmentEditForm((p) => ({ ...p, name: e.target.value }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            value={departmentEditForm.code}
                            onChange={(e) =>
                              setDepartmentEditForm((p) => ({ ...p, code: e.target.value }))
                            }
                          />
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button
                              type="button"
                              className="sa-btn-primary sa-btn-sm"
                              onClick={async () => {
                                await onUpdateDepartment?.(d.id, {
                                  name: departmentEditForm.name.trim(),
                                  code: departmentEditForm.code.trim().toUpperCase(),
                                });
                                setEditingDepartmentId(null);
                              }}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="sa-btn-secondary sa-btn-sm"
                              onClick={() => setEditingDepartmentId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{d.name}</td>
                        <td>{d.code}</td>
                        <td>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button
                              type="button"
                              className="sa-btn-secondary sa-btn-sm"
                              onClick={() => startEditDepartment(d)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="sa-btn-danger sa-btn-sm"
                              onClick={async () => {
                                if (!window.confirm(`Delete department "${d.name}"?`)) return;
                                await onDeleteDepartment?.(d.id);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="sa-muted">No departments registered yet.</p>
        )}
      </section>
    </div>
  );
}

