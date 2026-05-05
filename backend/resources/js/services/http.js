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

export const partnershipAPI = {
  /** Pass a plain object (JSON) or FormData for file uploads; axios sets multipart boundaries automatically. */
  apply: (payload) => http.post('/api/partnership/apply', payload),
};

export const authAPI = {
  login: (payload) => http.post('/login', payload),
  logout: () => http.post('/logout'),
  getProfile: () => http.get('/me'),
};

export const superAdminAPI = {
  logout: () => http.post('/logout'),
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
  generateCredentials: (payload) => http.post('/admin/credentials/generate', payload),
  generateBulkCredentials: (payload) => http.post('/admin/credentials/generate-bulk', payload),
  sendCredentialsEmail: (payload) => http.post('/admin/credentials/send-email', payload),
  checkEmailAvailability: (email) => http.get(`/admin/credentials/check-email${buildQuery({ email })}`),
  getCredentialExpiryReport: (days) => http.get(`/admin/credentials/expiry-report${buildQuery({ days })}`),
  getCredentialPolicy: () => http.get('/admin/settings/credential-policy'),
  updateCredentialPolicy: (payload) => http.put('/admin/settings/credential-policy', payload),
  getAuditLogs: (params) => http.get(`/admin/logs${buildQuery(params)}`),
  getColleges: () => http.get('/admin/colleges'),
  getDepartmentsByCollege: (collegeId) => http.get(`/admin/colleges/${collegeId}/departments`),
  getUnassignedStudents: (params) => http.get(`/admin/students/unassigned${buildQuery(params)}`),
  getAvailableExaminers: (departmentId) => http.get(`/admin/departments/${departmentId}/examiners`),
  getAvailableAdvisors: (departmentId) => http.get(`/admin/departments/${departmentId}/advisors`),
  assignExaminer: (payload) => http.post('/admin/assign/examiner', payload),
  assignAdvisor: (payload) => http.post('/admin/assign/advisor', payload),
  assignBoth: (payload) => http.post('/admin/assign/both', payload),
  getCompanyEngagementReport: (params) => http.get(`/admin/reports/company-engagement${buildQuery(params)}`),
  getReportsDashboard: (params) => http.get(`/admin/reports/dashboard${buildQuery(params)}`),
  exportReport: (payload) =>
    http.post('/admin/reports/export', payload, {
      responseType: 'blob',
    }),
};

export const internshipAPI = {
  getApprovalQueue: (params) => http.get(`/internships/approval-queue${buildQuery(params)}`),
  reviewSubmission: (id, payload) => http.post(`/internships/${id}/review`, payload),
};

export const studentAPI = {
  getOverview: () => http.get('/api/student/dashboard/overview'),
  getInternships: (params) => http.get(`/public/internships${buildQuery(params)}`),
  getApplications: (params) => http.get(`/applications${buildQuery(params)}`),
  applyInternship: (id, payload) => http.post(`/internships/${id}/apply`, payload),
  withdrawApplication: (id) => http.put(`/applications/${id}`, { status: 'withdrawn' }),
  getInterviews: () => http.get('/api/student/interviews'),
  getInterviewCalendar: () => http.get('/api/student/interviews/calendar'),
  createInterview: (payload) => http.post('/api/student/interviews', payload),
  saveInterviewFeedback: (id, payload) => http.put(`/api/student/interviews/${id}/feedback`, payload),
  getMessages: (params) => http.get(`/api/student/messages${buildQuery(params)}`),
  sendMessage: (payload) => http.post('/api/student/messages', payload),
  markMessageRead: (id) => http.put(`/api/student/messages/${id}/read`),
  getThreadSummary: (threadKey) => http.get(`/api/student/messages/thread/${threadKey}/summary`),
  getDocuments: () => http.get('/api/student/documents'),
  saveDocument: (payload) => http.post('/api/student/documents', payload),
  downloadDocument: (id) => http.get(`/api/student/documents/${id}/download`, { responseType: 'blob' }),
  getProgress: () => http.get('/api/student/progress'),
  addAchievement: (payload) => http.post('/api/student/achievements', payload),
  getSettings: () => http.get('/api/student/settings'),
  updateSettings: (payload) => http.put('/api/student/settings', payload),
};

export const aiAPI = {
  careerChat: (payload) => http.post('/api/ai/career-chat', payload),
  getRecommendations: (studentId) => http.get(`/api/ai/recommendations/${studentId}`),
  resumeAnalyze: (payload) => http.post('/api/ai/resume-analyze', payload),
  coverLetterGenerate: (payload) => http.post('/api/ai/cover-letter-generate', payload),
  mockInterview: (payload) => http.post('/api/ai/mock-interview', payload),
  skillGapAnalysis: (payload) => http.post('/api/ai/skill-gap-analysis', payload),
  profileInsights: () => http.get('/api/ai/profile-insights'),
  documentReview: (payload) => http.post('/api/ai/document-review', payload),
  applicationPredictions: () => http.get('/api/ai/application-predictions'),
  careerPath: () => http.get('/api/ai/career-path'),
  interviewPrep: (payload) => http.post('/api/ai/interview-prep', payload),
  smartReply: (payload) => http.post('/api/ai/smart-reply', payload),
  dailyBriefing: () => http.get('/api/ai/daily-briefing'),
  feedback: (payload) => http.post('/api/ai/feedback', payload),
};

export const examinerAPI = {
  getDashboardStats: () => http.get('/api/examiner/dashboard/stats'),
  getStudents: (params) => http.get(`/api/examiner/students${buildQuery(params)}`),
  getStudentDetail: (id) => http.get(`/api/examiner/students/${id}`),
  getStudentDeliverables: (id) => http.get(`/api/examiner/students/${id}/deliverables`),
  getStudentEvaluationHistory: (id) => http.get(`/api/examiner/students/${id}/evaluation-history`),
  getEvaluationQueue: () => http.get('/api/examiner/evaluation-queue'),
  evaluateReport: (payload) => http.post('/api/examiner/evaluate/report', payload),
  updateEvaluation: (id, payload) => http.put(`/api/examiner/evaluate/report/${id}`, payload),
  requestRevision: (payload) => http.post('/api/examiner/evaluate/request-revision', payload),
  getVivaSchedule: () => http.get('/api/examiner/viva/schedule'),
  createVivaSchedule: (payload) => http.post('/api/examiner/viva/schedule', payload),
  recordVivaResults: (id, payload) => http.put(`/api/examiner/viva/${id}/record-results`, payload),
  generateVivaQuestions: (payload) => http.post('/api/examiner/viva/generate-questions', payload),
  getGrades: () => http.get('/api/examiner/grades'),
  calculateGrades: (payload) => http.post('/api/examiner/grades/calculate', payload),
  publishGrades: (payload) => http.post('/api/examiner/grades/publish', payload),
  getAnalytics: () => http.get('/api/examiner/reports/analytics'),
  generateReport: (payload) => http.post('/api/examiner/reports/generate', payload),
  exportReport: (format) => http.get(`/api/examiner/reports/export${buildQuery({ format })}`, { responseType: 'blob' }),
  getMessages: () => http.get('/api/examiner/messages'),
  sendMessage: (payload) => http.post('/api/examiner/messages', payload),
  getSettings: () => http.get('/api/examiner/settings'),
  updateSettings: (payload) => http.put('/api/examiner/settings', payload),
};

export const advisorAPI = {
  getDashboardStats: () => http.get('/api/advisor/dashboard/stats'),
  getStudents: (params) => http.get(`/api/advisor/students${buildQuery(params)}`),
  getStudent: (id) => http.get(`/api/advisor/students/${id}`),
  getStudentApplications: (id) => http.get(`/api/advisor/students/${id}/applications`),
  reviewApplication: (id, payload) => http.put(`/api/advisor/applications/${id}/review`, payload),
  getReviewQueue: (params) => http.get(`/api/advisor/applications/review-queue${buildQuery(params)}`),
  getMeetings: (params) => http.get(`/api/advisor/meetings${buildQuery(params)}`),
  createMeeting: (payload) => http.post('/api/advisor/meetings', payload),
  updateMeeting: (id, payload) => http.put(`/api/advisor/meetings/${id}`, payload),
  getMeetingSummary: (id) => http.get(`/api/advisor/meetings/${id}/summary`),
  getMessages: (params) => http.get(`/api/advisor/messages${buildQuery(params)}`),
  sendMessage: (payload) => http.post('/api/advisor/messages/send', payload),
  getDocumentsReview: (params) => http.get(`/api/advisor/documents/review${buildQuery(params)}`),
  documentFeedback: (id, payload) => http.post(`/api/advisor/documents/${id}/feedback`, payload),
  getProgress: () => http.get('/api/advisor/progress'),
  getReports: () => http.get('/api/advisor/reports'),
  generateReport: (payload) => http.post('/api/advisor/reports/generate', payload),
  getSettings: () => http.get('/api/advisor/settings'),
  updateSettings: (payload) => http.put('/api/advisor/settings', payload),
};

export const companyAPI = {
  getDashboardStats: () => http.get('/api/company/dashboard/stats'),
  getProfile: () => http.get('/api/company/profile'),
  updateProfile: (payload) => http.put('/api/company/profile', payload),
  getInternships: (params) => http.get(`/api/company/internships${buildQuery(params)}`),
  createInternship: (payload) => http.post('/api/company/internships', payload),
  updateInternship: (id, payload) => http.put(`/api/company/internships/${id}`, payload),
  deleteInternship: (id) => http.delete(`/api/company/internships/${id}`),
  submitInternshipForApproval: (id) => http.post(`/api/company/internships/${id}/submit-for-approval`),
  getInternshipApplicants: (id, params) => http.get(`/api/company/internships/${id}/applicants${buildQuery(params)}`),
  getApplicants: (params) => http.get(`/api/company/applicants${buildQuery(params)}`),
  getApplicant: (id) => http.get(`/api/company/applicants/${id}`),
  updateApplicantStatus: (id, payload) => http.put(`/api/company/applicants/${id}/status`, payload),
  shortlistApplicant: (id) => http.post(`/api/company/applicants/${id}/shortlist`),
  scheduleApplicantInterview: (id, payload) => http.post(`/api/company/applicants/${id}/schedule-interview`, payload),
  makeOffer: (id) => http.post(`/api/company/applicants/${id}/make-offer`),
  getInterns: (params) => http.get(`/api/company/interns${buildQuery(params)}`),
  getIntern: (id) => http.get(`/api/company/interns/${id}`),
  evaluateIntern: (id, payload) => http.post(`/api/company/interns/${id}/evaluate`, payload),
  getInternEvaluations: (id) => http.get(`/api/company/interns/${id}/evaluations`),
  getMessages: (params) => http.get(`/api/company/messages${buildQuery(params)}`),
  sendMessage: (payload) => http.post('/api/company/messages/send', payload),
  getSchedule: (params) => http.get(`/api/company/schedule${buildQuery(params)}`),
  createSchedule: (payload) => http.post('/api/company/schedule', payload),
  getAnalytics: () => http.get('/api/company/analytics'),
  generateReport: (payload) => http.post('/api/company/reports/generate', payload),
  getTeam: () => http.get('/api/company/team'),
  searchStudents: (params) => http.get(`/api/company/search-students${buildQuery(params)}`),
  inviteStudents: (payload) => http.post('/api/company/invite-students', payload),
  getTalentPool: () => http.get('/api/company/talent-pool'),
  addTalentPool: (payload) => http.post('/api/company/talent-pool/add', payload),
  getSettings: () => http.get('/api/company/settings'),
  updateSettings: (payload) => http.put('/api/company/settings', payload),
};

export const aiCompanyAPI = {
  generateJobDescription: (payload) => http.post('/api/ai/company/generate-job-description', payload),
  optimizePosting: (payload) => http.post('/api/ai/company/optimize-posting', payload),
  rankApplicants: (payload) => http.post('/api/ai/company/rank-applicants', payload),
  screenCandidate: (payload) => http.post('/api/ai/company/screen-candidate', payload),
  generateInterviewQuestions: (payload) => http.post('/api/ai/company/generate-interview-questions', payload),
  suggestReply: (payload) => http.post('/api/ai/company/suggest-reply', payload),
  generateEvaluation: (payload) => http.post('/api/ai/company/generate-evaluation', payload),
  predictFit: (payload) => http.post('/api/ai/company/predict-fit', payload),
  chat: (payload) => http.post('/api/ai/company/chat', payload),
  marketInsights: () => http.get('/api/ai/company/market-insights'),
  recruitmentAnalytics: () => http.get('/api/ai/company/recruitment-analytics'),
  biasCheck: (payload) => http.post('/api/ai/company/bias-check', payload),
  offerAcceptancePredict: (payload) => http.post('/api/ai/company/offer-acceptance-predict', payload),
  internPerformancePredict: (payload) => http.post('/api/ai/company/intern-performance-predict', payload),
};

export const aiAdvisorAPI = {
  studentInsights: (payload) => http.post('/api/ai/advisor/student-insights', payload),
  applicationReview: (payload) => http.post('/api/ai/advisor/application-review', payload),
  meetingPrep: (payload) => http.post('/api/ai/advisor/meeting-prep', payload),
  suggestReply: (payload) => http.post('/api/ai/advisor/suggest-reply', payload),
  documentReview: (payload) => http.post('/api/ai/advisor/document-review', payload),
  riskAlerts: () => http.get('/api/ai/advisor/risk-alerts'),
  performanceInsights: () => http.get('/api/ai/advisor/performance-insights'),
  chat: (payload) => http.post('/api/ai/advisor/chat', payload),
  generateReport: (payload) => http.post('/api/ai/advisor/generate-report', payload),
  trends: () => http.get('/api/ai/advisor/trends'),
  mentoringStrategy: (payload) => http.post('/api/ai/advisor/mentoring-strategy', payload),
};

export const aiExaminerAPI = {
  reportSummarize: (payload) => http.post('/api/ai/examiner/report-summarize', payload),
  suggestScores: (payload) => http.post('/api/ai/examiner/suggest-scores', payload),
  generateFeedback: (payload) => http.post('/api/ai/examiner/generate-feedback', payload),
  plagiarismCheck: (payload) => http.post('/api/ai/examiner/plagiarism-check', payload),
  consistencyCheck: (payload) => http.post('/api/ai/examiner/consistency-check', payload),
  generateVivaQuestions: (payload) => http.post('/api/ai/examiner/generate-viva-questions', payload),
  transcribeViva: (payload) => http.post('/api/ai/examiner/transcribe-viva', payload),
  predictGrade: (payload) => http.post('/api/ai/examiner/predict-grade', payload),
  chat: (payload) => http.post('/api/ai/examiner/chat', payload),
  getPerformanceInsights: () => http.get('/api/ai/examiner/performance-insights'),
  getRiskStudents: () => http.get('/api/ai/examiner/risk-students'),
  biasDetection: (payload) => http.post('/api/ai/examiner/bias-detection', payload),
};

export default http;
