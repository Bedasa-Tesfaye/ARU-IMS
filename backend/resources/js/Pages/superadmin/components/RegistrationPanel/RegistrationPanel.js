import React from 'react';
import AdvisorRegistration from './RegistrationPanel/AdvisorRegistration';
import CompanyRegistration from './RegistrationPanel/CompanyRegistration';
import ExaminerRegistration from './RegistrationPanel/ExaminerRegistration';
import StudentRegistration from './RegistrationPanel/StudentRegistration';
import './RegistrationPanel.css';

const RegistrationPanel = ({
  activeSection,
  departments,
  onRegister,
  onBulkRegister,
  isSubmitting,
}) => {
  switch (activeSection) {
    case 'student':
      return <StudentRegistration departments={departments} onRegister={onRegister} onBulkRegister={onBulkRegister} isSubmitting={isSubmitting} />;
    case 'company':
      return <CompanyRegistration onRegister={onRegister} isSubmitting={isSubmitting} />;
    case 'examiner':
      return <ExaminerRegistration departments={departments} onRegister={onRegister} isSubmitting={isSubmitting} />;
    case 'advisor':
      return <AdvisorRegistration departments={departments} onRegister={onRegister} isSubmitting={isSubmitting} />;
    default:
      return (
        <div className="sa-empty-panel">
          <h3>Registration Section</h3>
          <p>Select a registration type from the left navigation.</p>
        </div>
      );
  }
};

export default RegistrationPanel;
