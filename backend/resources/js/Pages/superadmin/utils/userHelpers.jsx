export const roleColors = {
  super_admin: { bg: '#dc3545', color: 'white', icon: '👑', label: 'Super Admin' },
  admin: { bg: '#dc3545', color: 'white', icon: '👑', label: 'Super Admin' },
  coordinator: { bg: '#0d6efd', color: 'white', icon: '📋', label: 'Coordinator' },
  examiner: { bg: '#17a2b8', color: 'white', icon: '👨‍🏫', label: 'Examiner' },
  student: { bg: '#28a745', color: 'white', icon: '🎓', label: 'Student' },
  company: { bg: '#fd7e14', color: 'white', icon: '🏢', label: 'Company' },
  advisor: { bg: '#6f42c1', color: 'white', icon: '👨‍💼', label: 'Advisor' },
};

export const statusColors = {
  active: { bg: '#d4edda', color: '#155724', icon: '✅', label: 'Active' },
  suspended: { bg: '#f8d7da', color: '#721c24', icon: '⛔', label: 'Suspended' },
  pending: { bg: '#fff3cd', color: '#856404', icon: '⏳', label: 'Pending' },
  inactive: { bg: '#e2e3e5', color: '#383d41', icon: '⚪', label: 'Inactive' },
};

export const getRoleInfo = (role) => {
  return roleColors[role] || { bg: '#6c757d', color: 'white', icon: '👤', label: role || 'Unknown' };
};

export const getStatusInfo = (status) => {
  return statusColors[status] || statusColors.inactive;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const normalizeUser = (user) => {
  const profile = user.profile_data || {};
  return {
    id: user.id,
    name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
    email: user.email || '',
    role: user.role || 'inactive',
    status: user.is_active === false ? 'suspended' : (user.status || 'active'),
    studentId: user.studentId || user.student_id || profile.student_id || '',
    employeeId: user.employeeId || user.employee_id || profile.employee_id || '',
    companyName: user.companyName || profile.company_name || user.company?.name || '',
    department: user.department?.name || user.department || '',
    phone: user.phone || '',
    lastLogin: user.lastLogin || user.last_login_at || user.updated_at || null,
  };
};

export const filterUsers = (users, searchTerm, roleFilter, statusFilter, departmentFilter) => {
  return users.filter((user) => {
    const matchesSearch = !searchTerm
      || user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      || user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      || user.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
      || user.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
      || user.companyName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    const matchesDepartment = !departmentFilter || user.department === departmentFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });
};

export const exportToCSV = (users) => {
  const headers = ['Name', 'Email', 'Role', 'Status', 'Student ID', 'Employee ID', 'Department', 'Phone', 'Last Login'];
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const rows = users.map((user) => [
    user.name,
    user.email,
    user.role,
    user.status,
    user.studentId || '',
    user.employeeId || '',
    user.department || '',
    user.phone || '',
    formatDate(user.lastLogin),
  ]);

  const csvContent = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToExcel = (users) => {
  const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const rows = users.map((u) => [
    u.name,
    u.email,
    u.role,
    u.status,
    u.studentId || '',
    u.employeeId || '',
    u.department || '',
    u.phone || '',
    formatDate(u.lastLogin),
  ]);

  const rowXml = rows
    .map(
      (r) =>
        '<Row>' +
        r.map((c) => `<Cell><Data ss:Type="String">${esc(c)}</Data></Cell>`).join('') +
        '</Row>'
    )
    .join('');

  const header = ['Name', 'Email', 'Role', 'Status', 'Student ID', 'Employee ID', 'Department', 'Phone', 'Last Login']
    .map((h) => `<Cell><Data ss:Type="String">${esc(h)}</Data></Cell>`)
    .join('');

  const xml =
    '<?xml version="1.0"?>' +
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">' +
    '<Worksheet ss:Name="Users"><Table>' +
    `<Row>${header}</Row>` +
    rowXml +
    '</Table></Worksheet>' +
    '</Workbook>';

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `users_export_${new Date().toISOString().split('T')[0]}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
