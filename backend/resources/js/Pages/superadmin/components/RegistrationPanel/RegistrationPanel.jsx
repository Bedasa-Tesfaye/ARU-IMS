import React, { useState } from "react";
import AdvisorRegistration from "./AdvisorRegistration";
import CompanyRegistration from "./CompanyRegistration";
import ExaminerRegistration from "./ExaminerRegistration";
import StudentRegistration from "./StudentRegistration";
import "./RegistrationPanel.css";
import { superAdminAPI } from "../../../../services/http";

const types = [
    {
        id: "student",
        label: "Student",
        icon: "🎓",
        blurb: "Single or bulk intake",
    },
    { id: "company", label: "Company", icon: "🏢", blurb: "Industry partners" },
    {
        id: "examiner",
        label: "Examiner",
        icon: "👨‍🏫",
        blurb: "Assessment staff",
    },
    { id: "advisor", label: "Advisor", icon: "👨‍💼", blurb: "Academic mentors" },
];

const RegistrationPanel = ({
    activeSection,
    departments,
    onRegister,
    onBulkRegister,
    isSubmitting,
    onSelectType,
}) => {
    const [deptDraft, setDeptDraft] = useState({ name: "", code: "" });
    const [deptBusy, setDeptBusy] = useState(false);
    const [deptMsg, setDeptMsg] = useState("");
    const currentMeta = types.find((t) => t.id === activeSection);
    const step1 = !!activeSection && types.some((t) => t.id === activeSection);
    const step2 = step1;
    const step3 = false;

    return (
        <div className="sa-registration-hub">
            <header className="sa-reg-hub-header">
                <div>
                    <h2 className="sa-reg-hub-title">Registration Center</h2>
                    <p className="sa-reg-hub-sub">
                        Choose who you are onboarding — the form slides in with
                        guided steps.
                    </p>
                </div>
            </header>

            <div className="sa-reg-progress" aria-label="Registration progress">
                <div
                    className={`sa-reg-progress-step ${step1 ? "done" : "current"}`}
                >
                    <span className="sa-reg-progress-num">1</span>
                    <span>Type</span>
                </div>
                <div className="sa-reg-progress-line" />
                <div
                    className={`sa-reg-progress-step ${step2 ? "current" : "pending"}`}
                >
                    <span className="sa-reg-progress-num">2</span>
                    <span>Details</span>
                </div>
                <div className="sa-reg-progress-line" />
                <div
                    className={`sa-reg-progress-step ${step3 ? "current" : "pending"}`}
                >
                    <span className="sa-reg-progress-num">3</span>
                    <span>Submit</span>
                </div>
            </div>

            {Array.isArray(departments) && departments.length === 0 && (
                <div className="sa-empty-panel" style={{ marginTop: 14 }}>
                    <h3>No departments found</h3>
                    <p>
                        Registration for students/examiners/advisors requires a
                        department. Create at least one department to continue.
                    </p>
                    {deptMsg && (
                        <p style={{ color: deptMsg.startsWith("✅") ? "#16a34a" : "#dc2626" }}>
                            {deptMsg}
                        </p>
                    )}
                    <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
                        <input
                            placeholder="Department name (e.g. Computer Science)"
                            value={deptDraft.name}
                            onChange={(e) =>
                                setDeptDraft((p) => ({
                                    ...p,
                                    name: e.target.value,
                                }))
                            }
                        />
                        <input
                            placeholder="Department code (e.g. CS)"
                            value={deptDraft.code}
                            onChange={(e) =>
                                setDeptDraft((p) => ({
                                    ...p,
                                    code: e.target.value,
                                }))
                            }
                        />
                        <button
                            type="button"
                            className="sa-btn-secondary"
                            disabled={deptBusy || !deptDraft.name.trim() || !deptDraft.code.trim()}
                            onClick={async () => {
                                setDeptBusy(true);
                                setDeptMsg("");
                                try {
                                    await superAdminAPI.createDepartment({
                                        name: deptDraft.name,
                                        code: deptDraft.code,
                                    });
                                    setDeptMsg("✅ Department created. Click Refresh in the dashboard if needed.");
                                    setDeptDraft({ name: "", code: "" });
                                } catch (e) {
                                    setDeptMsg(e?.response?.data?.message || "Failed to create department.");
                                } finally {
                                    setDeptBusy(false);
                                }
                            }}
                        >
                            {deptBusy ? "Creating..." : "Create department"}
                        </button>
                    </div>
                </div>
            )}

            <div
                className="sa-reg-type-grid"
                role="tablist"
                aria-label="Registration type"
            >
                {types.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={activeSection === t.id}
                        className={`sa-reg-type-card ${activeSection === t.id ? "active" : ""}`}
                        onClick={() => onSelectType?.(t.id)}
                    >
                        <span className="sa-reg-type-icon" aria-hidden>
                            {t.icon}
                        </span>
                        <div className="sa-reg-type-body">
                            <span className="sa-reg-type-label">{t.label}</span>
                            <span className="sa-reg-type-blurb">{t.blurb}</span>
                        </div>
                    </button>
                ))}
            </div>

            <div className="sa-reg-form-shell" key={activeSection}>
                {activeSection === "student" && (
                    <StudentRegistration
                        departments={departments}
                        onRegister={onRegister}
                        onBulkRegister={onBulkRegister}
                        isSubmitting={isSubmitting}
                    />
                )}
                {activeSection === "company" && (
                    <CompanyRegistration
                        onRegister={onRegister}
                        isSubmitting={isSubmitting}
                    />
                )}
                {activeSection === "examiner" && (
                    <ExaminerRegistration
                        departments={departments}
                        onRegister={onRegister}
                        isSubmitting={isSubmitting}
                    />
                )}
                {activeSection === "advisor" && (
                    <AdvisorRegistration
                        departments={departments}
                        onRegister={onRegister}
                        isSubmitting={isSubmitting}
                    />
                )}
                {!["student", "company", "examiner", "advisor"].includes(
                    activeSection,
                ) && (
                    <div className="sa-empty-panel sa-reg-placeholder">
                        <h3>Select a registration type</h3>
                        <p>Use the cards above to open the correct workflow.</p>
                    </div>
                )}
            </div>

            {currentMeta && (
                <p className="sa-reg-active-hint">
                    Active: <strong>{currentMeta.icon}</strong>{" "}
                    {currentMeta.label}
                </p>
            )}
        </div>
    );
};

export default RegistrationPanel;
