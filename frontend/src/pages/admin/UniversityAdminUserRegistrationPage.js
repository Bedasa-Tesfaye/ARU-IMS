import React from 'react';
import DepartmentAdminUserRegistrationPage from '../DepartmentAdminUserRegistrationPage';

export default function UniversityAdminUserRegistrationPage() {
  // Reuse the same premium registration UI; university admin has wider role scope via backend.
  return <DepartmentAdminUserRegistrationPage />;
}

