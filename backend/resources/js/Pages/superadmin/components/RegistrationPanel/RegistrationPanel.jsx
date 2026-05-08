import React from "react";
import AdvisorRegistration from "./AdvisorRegistration";
import CompanyRegistration from "./CompanyRegistration";
import ExaminerRegistration from "./ExaminerRegistration";
import StudentRegistration from "./StudentRegistration";
import "./RegistrationPanel.css";

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
