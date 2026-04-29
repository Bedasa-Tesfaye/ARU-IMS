import React from 'react';
import CoordinatorApprovalsPage from '../coordinator/CoordinatorApprovalsPage';

export default function UniversityAdminApprovalsPage() {
  // Reuse approvals queue UI; university admin has university-wide authority.
  return <CoordinatorApprovalsPage />;
}

