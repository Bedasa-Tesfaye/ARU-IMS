import React from 'react';
import StudentRegistration from './RegistrationPanel/StudentRegistration';
import CompanyRegistration from './RegistrationPanel/CompanyRegistration';
import ExaminerRegistration from './RegistrationPanel/ExaminerRegistration';
import AdvisorRegistration from './RegistrationPanel/AdvisorRegistration';

const RegistrationPanel = ({ activeSection, departments, onRegister, onBulkRegister, isSubmitting }) => {
  const renderRegistrationForm = () => {
    switch (activeSection) {
      case 'student':
        return (
          <StudentRegistration
            departments={departments}
            onRegister={onRegister}
            onBulkRegister={onBulkRegister}
            isSubmitting={isSubmitting}
          />
        );
      case 'company':
        return (
          <CompanyRegistration
            onRegister={onRegister}
            isSubmitting={isSubmitting}
          />
        );
      case 'examiner':
        return (
          <ExaminerRegistration
            departments={departments}
            onRegister={onRegister}
            isSubmitting={isSubmitting}
          />
        );
      case 'advisor':
        return (
          <AdvisorRegistration
            departments={departments}
            onRegister={onRegister}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return (
          <div className="registration-panel">
            <h3>Select Registration Type</h3>
            <p>Please choose a registration type from the sidebar.</p>
          </div>
        );
    }
  };

  return (
    <div className="registration-panel">
      <div className="registration-header">
        <h2>
          {activeSection === 'student' && 'Student Registration'}
          {activeSection === 'company' && 'Company Registration'}
          {activeSection === 'examiner' && 'Examiner Registration'}
          {activeSection === 'advisor' && 'Advisor Registration'}
        </h2>
      </div>
      {renderRegistrationForm()}
    </div>
  );
};

export default RegistrationPanel;
