import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  logout: () => api.post('/logout'),
  refresh: () => api.post('/refresh'),
  getProfile: () => api.get('/me'),
  getAuthorityMatrix: () => api.get('/authority-matrix'),
};

export const internshipAPI = {
  getInternships: (params) => api.get('/internships', { params }),
  getPublicInternships: (params) => axios.get(`${API_BASE_URL}/public/internships`, { params }),
  getInternship: (id) => api.get(`/internships/${id}`),
  createInternship: (data) => api.post('/internships', data),
  updateInternship: (id, data) => api.put(`/internships/${id}`, data),
  deleteInternship: (id) => api.delete(`/internships/${id}`),
  applyToInternship: (id, data) => api.post(`/internships/${id}/apply`, data),
};

export const applicationAPI = {
  getApplications: (params) => api.get('/applications', { params }),
  getApplication: (id) => api.get(`/applications/${id}`),
  updateApplication: (id, data) => api.put(`/applications/${id}`, data),
  approveApplication: (id) => api.post(`/applications/${id}/approve`),
  rejectApplication: (id, reason) => api.post(`/applications/${id}/reject`, { rejection_reason: reason }),
  withdrawApplication: (id) => api.post(`/applications/${id}/withdraw`),
};

export const reportAPI = {
  getReports: (params) => api.get('/reports', { params }),
  getReport: (id) => api.get(`/reports/${id}`),
  createReport: (data) => api.post('/reports', data),
  updateReport: (id, data) => api.put(`/reports/${id}`, data),
  reviewReport: (id, data) => api.post(`/reports/${id}/review`, data),
  assignExaminer: (id, examinerId) => api.post(`/reports/${id}/assign-examiner`, { examiner_id: examinerId }),
};

export const evaluationAPI = {
  getEvaluations: (params) => api.get('/evaluations', { params }),
  getEvaluation: (id) => api.get(`/evaluations/${id}`),
  createEvaluation: (data) => api.post('/evaluations', data),
  updateEvaluation: (id, data) => api.put(`/evaluations/${id}`, data),
  deleteEvaluation: (id) => api.delete(`/evaluations/${id}`),
  getStudentEvaluations: (studentId) => api.get(`/evaluations/student/${studentId}`),
};

export default api;
