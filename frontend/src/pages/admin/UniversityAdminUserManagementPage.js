import React from 'react';
import CoordinatorUserManagementPage from '../coordinator/CoordinatorUserManagementPage';

export default function UniversityAdminUserManagementPage() {
  // Reuse user management table UI; backend authorization determines scope (university-wide for super_admin).
  return <CoordinatorUserManagementPage />;
}

