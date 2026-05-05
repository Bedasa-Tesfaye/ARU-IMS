<?php

use App\Http\Controllers\SuperAdminReportController;
use App\Http\Controllers\PartnershipApplicationController;
use App\Http\Controllers\AdvisorController;
use App\Http\Controllers\AIAdvisorController;
use App\Http\Controllers\AICompanyController;
use App\Http\Controllers\AppController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\AIController;
use App\Http\Controllers\AIExaminerController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\ExaminerController;
use App\Http\Controllers\InternshipController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StudentDashboardController;
use App\Http\Controllers\StudentExperienceController;
use App\Http\Controllers\SuperAdminRegistrationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', [AppController::class, 'landing']);

Route::get('/become-partner', [AppController::class, 'becomePartner'])->name('become-partner');
Route::post('/api/partnership/apply', [PartnershipApplicationController::class, 'store']);

Route::get('/register', [AppController::class, 'login']);
Route::get('/login', [AppController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:web');

Route::get('/public/internships', [InternshipController::class, 'publicIndex']);

Route::middleware('auth:web')->group(function () {
    Route::get('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/superadmin', [AppController::class, 'superAdminDashboard']);
    Route::get('/student-dashboard', [AppController::class, 'studentDashboard']);
    Route::get('/examiner-dashboard', [AppController::class, 'examinerDashboard']);
    Route::get('/advisor-dashboard', [AppController::class, 'advisorDashboard']);
    Route::get('/company-dashboard', [AppController::class, 'companyDashboard']);

    Route::get('/internships', [InternshipController::class, 'index']);
    Route::post('/internships', [InternshipController::class, 'store']);
    Route::get('/internships/{id}', [InternshipController::class, 'show']);
    Route::put('/internships/{id}', [InternshipController::class, 'update']);
    Route::delete('/internships/{id}', [InternshipController::class, 'destroy']);
    Route::post('/internships/{id}/apply', [InternshipController::class, 'apply']);
    Route::get('/internships/approval-queue', [InternshipController::class, 'approvalQueue']);
    Route::post('/internships/{id}/review', [InternshipController::class, 'reviewSubmission']);

    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::post('/applications', [ApplicationController::class, 'store']);
    Route::get('/applications/{id}', [ApplicationController::class, 'show']);
    Route::put('/applications/{id}', [ApplicationController::class, 'update']);
    Route::delete('/applications/{id}', [ApplicationController::class, 'destroy']);

    Route::get('/reports', [ReportController::class, 'index']);
    Route::post('/reports', [ReportController::class, 'store']);
    Route::get('/reports/{id}', [ReportController::class, 'show']);
    Route::put('/reports/{id}', [ReportController::class, 'update']);
    Route::delete('/reports/{id}', [ReportController::class, 'destroy']);

    Route::get('/evaluations', [EvaluationController::class, 'index']);
    Route::post('/evaluations', [EvaluationController::class, 'store']);
    Route::get('/evaluations/{id}', [EvaluationController::class, 'show']);
    Route::put('/evaluations/{id}', [EvaluationController::class, 'update']);
    Route::delete('/evaluations/{id}', [EvaluationController::class, 'destroy']);

    Route::prefix('admin')->group(function () {
        Route::get('/departments', [SuperAdminRegistrationController::class, 'departments']);
        Route::get('/users', [SuperAdminRegistrationController::class, 'users']);
        Route::get('/logs', [SuperAdminRegistrationController::class, 'getAuditLogs']);
        Route::get('/approvals/summary', [SuperAdminRegistrationController::class, 'getApprovalsSummary']);
        Route::get('/partner-requests', [SuperAdminRegistrationController::class, 'getPartnerRequests']);
        Route::post('/partner-requests/{id}/approve', [SuperAdminRegistrationController::class, 'approvePartnerRequest']);
        Route::post('/partner-requests/{id}/reject', [SuperAdminRegistrationController::class, 'rejectPartnerRequest']);
        Route::put('/users/{id}', [SuperAdminRegistrationController::class, 'updateUser']);
        Route::post('/users/{id}/suspend', [SuperAdminRegistrationController::class, 'suspendUser']);
        Route::post('/users/{id}/reset-password', [SuperAdminRegistrationController::class, 'resetUserPassword']);
        Route::delete('/users/{id}', [SuperAdminRegistrationController::class, 'deleteUser']);
        Route::post('/register/student', [SuperAdminRegistrationController::class, 'registerStudent']);
        Route::post('/register/students/bulk', [SuperAdminRegistrationController::class, 'registerStudentsBulk']);
        Route::post('/register/company', [SuperAdminRegistrationController::class, 'registerCompany']);
        Route::post('/register/examiner', [SuperAdminRegistrationController::class, 'registerExaminer']);
        Route::post('/register/advisor', [SuperAdminRegistrationController::class, 'registerAdvisor']);
        Route::post('/credentials/generate', [SuperAdminRegistrationController::class, 'generateCredentialPreview']);
        Route::post('/credentials/generate-bulk', [SuperAdminRegistrationController::class, 'generateBulkCredentials']);
        Route::post('/credentials/send-email', [SuperAdminRegistrationController::class, 'sendCredentialsEmail']);
        Route::get('/credentials/check-email', [SuperAdminRegistrationController::class, 'checkEmailAvailability']);
        Route::get('/credentials/expiry-report', [SuperAdminRegistrationController::class, 'credentialsExpiryReport']);
        Route::get('/settings/credential-policy', [SuperAdminRegistrationController::class, 'getCredentialPolicy']);
        Route::put('/settings/credential-policy', [SuperAdminRegistrationController::class, 'updateCredentialPolicy']);
        Route::get('/reports/company-engagement', [SuperAdminReportController::class, 'companyEngagement']);
        Route::get('/reports/dashboard', [SuperAdminReportController::class, 'dashboard']);
        Route::post('/reports/export', [SuperAdminReportController::class, 'export']);
    });

    Route::prefix('api/admin')->group(function () {
        Route::post('/credentials/generate', [SuperAdminRegistrationController::class, 'generateCredentialPreview']);
        Route::post('/credentials/generate-bulk', [SuperAdminRegistrationController::class, 'generateBulkCredentials']);
        Route::post('/credentials/send-email', [SuperAdminRegistrationController::class, 'sendCredentialsEmail']);
        Route::put('/credentials/{userId}/reset', [SuperAdminRegistrationController::class, 'resetUserPassword']);
        Route::get('/credentials/check-email', [SuperAdminRegistrationController::class, 'checkEmailAvailability']);
        Route::get('/credentials/expiry-report', [SuperAdminRegistrationController::class, 'credentialsExpiryReport']);
        Route::put('/settings/credential-policy', [SuperAdminRegistrationController::class, 'updateCredentialPolicy']);
        Route::get('/dashboard/stats', [SuperAdminRegistrationController::class, 'getApprovalsSummary']);
        Route::get('/dashboard/ai-insights', [SuperAdminRegistrationController::class, 'getApprovalsSummary']);
        Route::get('/dashboard/activity', [SuperAdminRegistrationController::class, 'getAuditLogs']);
        Route::get('/approvals/partner-requests', [SuperAdminRegistrationController::class, 'getPartnerRequests']);
        Route::put('/approvals/partner/{id}/approve', [SuperAdminRegistrationController::class, 'approvePartnerRequest']);
        Route::put('/approvals/partner/{id}/reject', [SuperAdminRegistrationController::class, 'rejectPartnerRequest']);
        Route::get('/logs', [SuperAdminRegistrationController::class, 'getAuditLogs']);
    });

    Route::prefix('api/student')->group(function () {
        Route::get('/dashboard/overview', [StudentDashboardController::class, 'overview']);
        Route::get('/interviews', [StudentExperienceController::class, 'interviews']);
        Route::get('/interviews/calendar', [StudentExperienceController::class, 'interviewCalendar']);
        Route::post('/interviews', [StudentExperienceController::class, 'createInterview']);
        Route::put('/interviews/{id}/feedback', [StudentExperienceController::class, 'updateInterviewFeedback']);
        Route::get('/messages', [StudentExperienceController::class, 'messages']);
        Route::post('/messages', [StudentExperienceController::class, 'createMessage']);
        Route::put('/messages/{id}/read', [StudentExperienceController::class, 'markMessageRead']);
        Route::get('/messages/thread/{threadKey}/summary', [StudentExperienceController::class, 'threadSummary']);
        Route::get('/documents', [StudentExperienceController::class, 'documents']);
        Route::post('/documents', [StudentExperienceController::class, 'createDocument']);
        Route::get('/documents/{id}/download', [StudentExperienceController::class, 'downloadDocument']);
        Route::get('/progress', [StudentExperienceController::class, 'progress']);
        Route::post('/achievements', [StudentExperienceController::class, 'addAchievement']);
        Route::get('/settings', [StudentExperienceController::class, 'getSettings']);
        Route::put('/settings', [StudentExperienceController::class, 'updateSettings']);
    });

    Route::prefix('api/ai')->group(function () {
        Route::post('/career-chat', [AIController::class, 'careerChat']);
        Route::get('/recommendations/{studentId}', [AIController::class, 'recommendations']);
        Route::post('/resume-analyze', [AIController::class, 'resumeAnalyze']);
        Route::post('/cover-letter-generate', [AIController::class, 'coverLetterGenerate']);
        Route::post('/mock-interview', [AIController::class, 'mockInterview']);
        Route::post('/skill-gap-analysis', [AIController::class, 'skillGapAnalysis']);
        Route::get('/profile-insights', [AIController::class, 'profileInsights']);
        Route::post('/document-review', [AIController::class, 'documentReview']);
        Route::get('/application-predictions', [AIController::class, 'applicationPredictions']);
        Route::get('/career-path', [AIController::class, 'careerPath']);
        Route::post('/interview-prep', [AIController::class, 'interviewPrep']);
        Route::post('/smart-reply', [AIController::class, 'smartReply']);
        Route::get('/daily-briefing', [AIController::class, 'dailyBriefing']);
        Route::post('/feedback', [AIController::class, 'feedback']);
    });

    Route::prefix('api/advisor')->group(function () {
        Route::get('/dashboard/stats', [AdvisorController::class, 'dashboardStats']);
        Route::get('/applications/review-queue', [AdvisorController::class, 'applicationReviewQueue']);
        Route::get('/students', [AdvisorController::class, 'students']);
        Route::get('/students/{id}/applications', [AdvisorController::class, 'studentApplications']);
        Route::get('/students/{id}', [AdvisorController::class, 'studentDetail']);
        Route::put('/applications/{id}/review', [AdvisorController::class, 'reviewApplication']);
        Route::get('/meetings', [AdvisorController::class, 'meetings']);
        Route::post('/meetings', [AdvisorController::class, 'storeMeeting']);
        Route::put('/meetings/{id}', [AdvisorController::class, 'updateMeeting']);
        Route::get('/meetings/{id}/summary', [AdvisorController::class, 'meetingSummary']);
        Route::get('/messages', [AdvisorController::class, 'messages']);
        Route::post('/messages/send', [AdvisorController::class, 'sendMessage']);
        Route::get('/documents/review', [AdvisorController::class, 'documentsReviewQueue']);
        Route::post('/documents/{id}/feedback', [AdvisorController::class, 'documentFeedback']);
        Route::get('/progress', [AdvisorController::class, 'progress']);
        Route::get('/reports', [AdvisorController::class, 'reports']);
        Route::post('/reports/generate', [AdvisorController::class, 'generateReport']);
        Route::get('/settings', [AdvisorController::class, 'settings']);
        Route::put('/settings', [AdvisorController::class, 'updateSettings']);
    });

    Route::prefix('api/company')->group(function () {
        Route::get('/dashboard/stats', [CompanyController::class, 'dashboardStats']);
        Route::get('/profile', [CompanyController::class, 'profile']);
        Route::put('/profile', [CompanyController::class, 'updateProfile']);
        Route::get('/internships', [CompanyController::class, 'internships']);
        Route::post('/internships', [CompanyController::class, 'storeInternship']);
        Route::put('/internships/{id}', [CompanyController::class, 'updateInternship']);
        Route::delete('/internships/{id}', [CompanyController::class, 'destroyInternship']);
        Route::post('/internships/{id}/submit-for-approval', [CompanyController::class, 'submitForApproval']);
        Route::get('/internships/{id}/applicants', [CompanyController::class, 'internshipApplicants']);
        Route::get('/applicants', [CompanyController::class, 'applicants']);
        Route::get('/applicants/{id}', [CompanyController::class, 'applicantDetail']);
        Route::put('/applicants/{id}/status', [CompanyController::class, 'updateApplicantStatus']);
        Route::post('/applicants/{id}/shortlist', [CompanyController::class, 'shortlistApplicant']);
        Route::post('/applicants/{id}/schedule-interview', [CompanyController::class, 'scheduleInterview']);
        Route::post('/applicants/{id}/make-offer', [CompanyController::class, 'makeOffer']);
        Route::get('/interns', [CompanyController::class, 'interns']);
        Route::get('/interns/{id}', [CompanyController::class, 'internDetail']);
        Route::post('/interns/{id}/evaluate', [CompanyController::class, 'evaluateIntern']);
        Route::get('/interns/{id}/evaluations', [CompanyController::class, 'internEvaluations']);
        Route::get('/messages', [CompanyController::class, 'messages']);
        Route::post('/messages/send', [CompanyController::class, 'sendMessage']);
        Route::get('/schedule', [CompanyController::class, 'schedule']);
        Route::post('/schedule', [CompanyController::class, 'storeSchedule']);
        Route::get('/analytics', [CompanyController::class, 'analytics']);
        Route::post('/reports/generate', [CompanyController::class, 'generateReport']);
        Route::get('/team', [CompanyController::class, 'team']);
        Route::get('/search-students', [CompanyController::class, 'searchStudents']);
        Route::post('/invite-students', [CompanyController::class, 'inviteStudents']);
        Route::get('/talent-pool', [CompanyController::class, 'talentPool']);
        Route::post('/talent-pool/add', [CompanyController::class, 'addTalentPool']);
        Route::get('/settings', [CompanyController::class, 'settings']);
        Route::put('/settings', [CompanyController::class, 'updateSettings']);
    });

    Route::prefix('api/ai/company')->group(function () {
        Route::post('/generate-job-description', [AICompanyController::class, 'generateJobDescription']);
        Route::post('/optimize-posting', [AICompanyController::class, 'optimizePosting']);
        Route::post('/rank-applicants', [AICompanyController::class, 'rankApplicants']);
        Route::post('/screen-candidate', [AICompanyController::class, 'screenCandidate']);
        Route::post('/generate-interview-questions', [AICompanyController::class, 'generateInterviewQuestions']);
        Route::post('/suggest-reply', [AICompanyController::class, 'suggestReply']);
        Route::post('/generate-evaluation', [AICompanyController::class, 'generateEvaluation']);
        Route::post('/predict-fit', [AICompanyController::class, 'predictFit']);
        Route::post('/chat', [AICompanyController::class, 'chat']);
        Route::get('/market-insights', [AICompanyController::class, 'marketInsights']);
        Route::get('/recruitment-analytics', [AICompanyController::class, 'recruitmentAnalytics']);
        Route::post('/bias-check', [AICompanyController::class, 'biasCheck']);
        Route::post('/offer-acceptance-predict', [AICompanyController::class, 'offerAcceptancePredict']);
        Route::post('/intern-performance-predict', [AICompanyController::class, 'internPerformancePredict']);
    });

    Route::prefix('api/ai/advisor')->group(function () {
        Route::post('/student-insights', [AIAdvisorController::class, 'studentInsights']);
        Route::post('/application-review', [AIAdvisorController::class, 'applicationReview']);
        Route::post('/meeting-prep', [AIAdvisorController::class, 'meetingPrep']);
        Route::post('/suggest-reply', [AIAdvisorController::class, 'suggestReply']);
        Route::post('/document-review', [AIAdvisorController::class, 'documentReview']);
        Route::get('/risk-alerts', [AIAdvisorController::class, 'riskAlerts']);
        Route::get('/performance-insights', [AIAdvisorController::class, 'performanceInsights']);
        Route::post('/chat', [AIAdvisorController::class, 'chat']);
        Route::post('/generate-report', [AIAdvisorController::class, 'generateReport']);
        Route::get('/trends', [AIAdvisorController::class, 'trends']);
        Route::post('/mentoring-strategy', [AIAdvisorController::class, 'mentoringStrategy']);
    });

    Route::prefix('api/examiner')->group(function () {
        Route::get('/dashboard/stats', [ExaminerController::class, 'dashboardStats']);
        Route::get('/students', [ExaminerController::class, 'students']);
        Route::get('/students/{id}', [ExaminerController::class, 'studentDetail']);
        Route::get('/students/{id}/deliverables', [ExaminerController::class, 'studentDeliverables']);
        Route::get('/students/{id}/evaluation-history', [ExaminerController::class, 'studentEvaluationHistory']);
        Route::get('/evaluation-queue', [ExaminerController::class, 'evaluationQueue']);
        Route::post('/evaluate/report', [ExaminerController::class, 'evaluateReport']);
        Route::put('/evaluate/report/{id}', [ExaminerController::class, 'updateEvaluation']);
        Route::post('/evaluate/request-revision', [ExaminerController::class, 'requestRevision']);
        Route::get('/viva/schedule', [ExaminerController::class, 'vivaSchedule']);
        Route::post('/viva/schedule', [ExaminerController::class, 'createVivaSchedule']);
        Route::put('/viva/{id}/record-results', [ExaminerController::class, 'recordVivaResults']);
        Route::post('/viva/generate-questions', [ExaminerController::class, 'generateVivaQuestions']);
        Route::get('/grades', [ExaminerController::class, 'grades']);
        Route::post('/grades/calculate', [ExaminerController::class, 'calculateGrades']);
        Route::post('/grades/publish', [ExaminerController::class, 'publishGrades']);
        Route::get('/reports/analytics', [ExaminerController::class, 'analytics']);
        Route::post('/reports/generate', [ExaminerController::class, 'generateAnalyticsReport']);
        Route::get('/reports/export', [ExaminerController::class, 'exportAnalyticsReport']);
        Route::get('/messages', [ExaminerController::class, 'messages']);
        Route::post('/messages', [ExaminerController::class, 'sendMessage']);
        Route::get('/settings', [ExaminerController::class, 'settings']);
        Route::put('/settings', [ExaminerController::class, 'updateSettings']);
    });

    Route::prefix('api/ai/examiner')->group(function () {
        Route::post('/report-summarize', [AIExaminerController::class, 'reportSummarize']);
        Route::post('/suggest-scores', [AIExaminerController::class, 'suggestScores']);
        Route::post('/generate-feedback', [AIExaminerController::class, 'generateFeedback']);
        Route::post('/plagiarism-check', [AIExaminerController::class, 'plagiarismCheck']);
        Route::post('/consistency-check', [AIExaminerController::class, 'consistencyCheck']);
        Route::post('/generate-viva-questions', [AIExaminerController::class, 'generateVivaQuestions']);
        Route::post('/transcribe-viva', [AIExaminerController::class, 'transcribeViva']);
        Route::post('/predict-grade', [AIExaminerController::class, 'predictGrade']);
        Route::post('/chat', [AIExaminerController::class, 'chat']);
        Route::get('/performance-insights', [AIExaminerController::class, 'performanceInsights']);
        Route::get('/risk-students', [AIExaminerController::class, 'riskStudents']);
        Route::post('/bias-detection', [AIExaminerController::class, 'biasDetection']);
    });
});
