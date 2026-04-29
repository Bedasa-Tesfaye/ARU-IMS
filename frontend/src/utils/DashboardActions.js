// Dashboard Actions Utility
export const handleStudentActions = (action, navigate) => {
  switch (action) {
    case 'browse-internships':
      navigate('/dashboard/internships');
      break;
    
    case 'submit-report':
      navigate('/dashboard/reports');
      break;
    
    case 'view-progress':
      navigate('/dashboard');
      break;
    
    case 'update-profile':
      navigate('/dashboard/profile');
      break;
    
    default:
      console.log('Unknown action:', action);
  }
};

export const handleCompanyActions = (action, navigate) => {
  switch (action) {
    case 'post-internship':
      navigate('/dashboard/internships');
      break;
    
    case 'review-applications':
      navigate('/dashboard/applications');
      break;
    
    case 'view-analytics':
      navigate('/dashboard');
      break;
    
    case 'company-profile':
      navigate('/dashboard/profile');
      break;
    
    default:
      console.log('Unknown action:', action);
  }
};

export const handleCoordinatorActions = (action, navigate) => {
  switch (action) {
    case 'review-applications':
      navigate('/dashboard/applications');
      break;
    
    case 'manage-internships':
      navigate('/dashboard/internships');
      break;
    
    case 'review-reports':
      navigate('/dashboard/reports');
      break;
    
    case 'generate-reports':
      navigate('/dashboard/reports');
      break;
    
    default:
      console.log('Unknown action:', action);
  }
};

export const handleExaminerActions = (action, navigate) => {
  switch (action) {
    case 'review-reports':
      navigate('/dashboard/reports');
      break;
    
    case 'create-evaluation':
      navigate('/dashboard/evaluations');
      break;
    
    case 'view-analytics':
      navigate('/dashboard');
      break;
    
    case 'submit-feedback':
      navigate('/dashboard/reports');
      break;
    
    default:
      console.log('Unknown action:', action);
  }
};

export const handleAdminActions = (action, navigate, setShowReports, setShowSettings, setShowUserManagement) => {
  switch (action) {
    case 'manage-users':
      // Navigate to user management
      console.log('Navigating to Manage Users...');
      // Show the UserManagement component instead of navigating
      if (setShowUserManagement) {
        setShowUserManagement(true);
      } else {
        // navigate('/admin/users'); // Uncomment when route exists
        console.log('setShowUserManagement function not provided');
      }
      break;
    
    case 'system-settings':
      // Navigate to system settings
      console.log('Navigating to System Settings...');
      // Show the SystemSettings component instead of navigating
      if (setShowSettings) {
        setShowSettings(true);
      } else {
        // navigate('/admin/settings'); // Uncomment when route exists
        console.log('setShowSettings function not provided');
      }
      break;
    
    case 'view-reports':
      // Navigate to admin reports
      console.log('Navigating to View Reports...');
      // Show the AdminReports component instead of navigating
      if (setShowReports) {
        setShowReports(true);
      } else {
        // navigate('/admin/reports'); // Uncomment when route exists
        console.log('setShowReports function not provided');
      }
      break;
    
    case 'backup-data':
      // Navigate to data backup
      console.log('Navigating to Backup Data...');
      // navigate('/admin/backup'); // Uncomment when route exists
      alert('Backup Data - Feature coming soon! This will open the data backup interface.');
      break;
    
    default:
      console.log('Unknown action:', action);
  }
};
