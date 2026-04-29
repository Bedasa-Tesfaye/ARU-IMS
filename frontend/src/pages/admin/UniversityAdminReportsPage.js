import React from 'react';
import CoordinatorReportsPage from '../coordinator/CoordinatorReportsPage';

export default function UniversityAdminReportsPage() {
  // Reuse reports UI; university admin scope is system-wide.
  return <CoordinatorReportsPage />;
}

