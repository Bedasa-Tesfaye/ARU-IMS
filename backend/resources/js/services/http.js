import axios from 'axios';

const http = axios.create({
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    Accept: 'application/json',
  },
  withCredentials: true,
});

const buildQuery = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.append(key, value);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

export const authAPI = {
  login: (payload) => http.post('/login', payload),
  logout: () => http.post('/logout'),
  getProfile: () => http.get('/me'),
};

export const superAdminAPI = {
  getUsers: () => http.get('/admin/users'),
  getDepartments: () => http.get('/admin/departments'),
  getApprovalsSummary: () => http.get('/admin/approvals/summary'),
  registerStudent: (payload) => http.post('/admin/register/student', payload),
  registerStudentsBulk: (payload) => http.post('/admin/register/students/bulk', payload),
  registerCompany: (payload) => http.post('/admin/register/company', payload),
  registerExaminer: (payload) => http.post('/admin/register/examiner', payload),
  registerAdvisor: (payload) => http.post('/admin/register/advisor', payload),
  updateUser: (id, payload) => http.put(`/admin/users/${id}`, payload),
  suspendUser: (id, payload) => http.post(`/admin/users/${id}/suspend`, payload),
  deleteUser: (id) => http.delete(`/admin/users/${id}`),
  resetUserPassword: (id) => http.post(`/admin/users/${id}/reset-password`),
  getPartnerRequests: (params) => http.get(`/admin/partner-requests${buildQuery(params)}`),
  approvePartnerRequest: (id, payload) => http.post(`/admin/partner-requests/${id}/approve`, payload),
  rejectPartnerRequest: (id, payload) => http.post(`/admin/partner-requests/${id}/reject`, payload),
  getColleges: () => http.get('/admin/colleges'),
  getDepartmentsByCollege: (collegeId) => http.get(`/admin/colleges/${collegeId}/departments`),
  getUnassignedStudents: (params) => http.get(`/admin/students/unassigned${buildQuery(params)}`),
  getAvailableExaminers: (departmentId) => http.get(`/admin/departments/${departmentId}/examiners`),
  getAvailableAdvisors: (departmentId) => http.get(`/admin/departments/${departmentId}/advisors`),
  assignExaminer: (payload) => http.post('/admin/assign/examiner', payload),
  assignAdvisor: (payload) => http.post('/admin/assign/advisor', payload),
  assignBoth: (payload) => http.post('/admin/assign/both', payload),
};

export const internshipAPI = {
  getApprovalQueue: (params) => http.get(`/internships/approval-queue${buildQuery(params)}`),
  reviewSubmission: (id, payload) => http.post(`/internships/${id}/review`, payload),
};

export default http;
