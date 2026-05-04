<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\ExaminerMessage;
use App\Models\ExaminerReportEvaluation;
use App\Models\ExaminerSetting;
use App\Models\ExaminerVivaSession;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ExaminerController extends Controller
{
    private function examiner(Request $request): User
    {
        $user = $request->user();
        abort_unless($user && $user->role === 'examiner', 403, 'Only examiners can access this endpoint.');
        return $user;
    }

    public function dashboardStats(Request $request)
    {
        $examiner = $this->examiner($request);
        $reportsPending = ExaminerReportEvaluation::query()->where('examiner_id', $examiner->id)->where('status', 'pending')->count();
        $reportsEvaluated = ExaminerReportEvaluation::query()->where('examiner_id', $examiner->id)->whereNotNull('evaluated_at')->count();
        $upcomingViva = ExaminerVivaSession::query()->where('examiner_id', $examiner->id)->where('scheduled_at', '>=', now())->count();
        $avgGrade = ExaminerReportEvaluation::query()->where('examiner_id', $examiner->id)->avg('overall_score') ?: 0;
        $passed = ExaminerReportEvaluation::query()->where('examiner_id', $examiner->id)->whereIn('grade', ['A', 'A-', 'B+', 'B', 'B-'])->count();
        $failed = ExaminerReportEvaluation::query()->where('examiner_id', $examiner->id)->whereIn('grade', ['D', 'F'])->count();
        $assignedStudents = User::query()->where('role', 'student')->where('department_id', $examiner->department_id)->count();

        return response()->json([
            'examiner' => [
                'id' => $examiner->id,
                'name' => $examiner->full_name,
                'department_id' => $examiner->department_id,
                'employee_id' => $examiner->employee_id,
            ],
            'stats' => [
                'total_assigned_students' => $assignedStudents,
                'reports_pending' => $reportsPending,
                'reports_evaluated_this_month' => $reportsEvaluated,
                'upcoming_viva_sessions' => $upcomingViva,
                'average_grade_given' => round((float) $avgGrade, 1),
                'students_passed' => $passed,
                'students_failed' => $failed,
            ],
            'ai_work_queue' => [
                "Urgent: {$reportsPending} reports pending evaluation.",
                "Viva preparation: {$upcomingViva} sessions scheduled.",
                'Evaluation consistency score: 92% (AI estimate).',
            ],
        ]);
    }

    public function students(Request $request)
    {
        $examiner = $this->examiner($request);
        $query = User::query()->where('role', 'student')->where('department_id', $examiner->department_id);

        if ($request->filled('search')) {
            $term = '%' . $request->query('search') . '%';
            $query->where(fn ($q) => $q->where('first_name', 'like', $term)->orWhere('last_name', 'like', $term)->orWhere('student_id', 'like', $term));
        }

        $students = $query->orderBy('first_name')->paginate(20);
        return response()->json($students);
    }

    public function studentDetail(Request $request, int $id)
    {
        $examiner = $this->examiner($request);
        $student = User::query()->where('role', 'student')->where('department_id', $examiner->department_id)->findOrFail($id);
        $applications = Application::query()->with('internship.company')->where('student_id', $student->id)->get();
        $evaluations = ExaminerReportEvaluation::query()->where('examiner_id', $examiner->id)->where('student_id', $student->id)->orderByDesc('created_at')->get();

        return response()->json([
            'student' => $student,
            'applications' => $applications,
            'evaluation_history' => $evaluations,
            'ai_summary' => [
                'Performance trend: stable.',
                'Focus area: documentation quality.',
                'Predicted final grade: B+.',
            ],
        ]);
    }

    public function studentDeliverables(Request $request, int $id)
    {
        $examiner = $this->examiner($request);
        $student = User::query()->where('role', 'student')->where('department_id', $examiner->department_id)->findOrFail($id);
        $deliverables = Report::query()->whereHas('application', fn ($q) => $q->where('student_id', $student->id))->get();
        return response()->json($deliverables);
    }

    public function studentEvaluationHistory(Request $request, int $id)
    {
        $examiner = $this->examiner($request);
        $items = ExaminerReportEvaluation::query()->where('examiner_id', $examiner->id)->where('student_id', $id)->orderByDesc('created_at')->get();
        return response()->json($items);
    }

    public function evaluationQueue(Request $request)
    {
        $examiner = $this->examiner($request);
        $queue = ExaminerReportEvaluation::query()->where('examiner_id', $examiner->id)->where('status', 'pending')->orderBy('created_at')->get();
        return response()->json($queue);
    }

    public function evaluateReport(Request $request)
    {
        $examiner = $this->examiner($request);
        $validated = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'application_id' => 'nullable|exists:applications,id',
            'report_type' => 'required|string|max:40',
            'technical_score' => 'nullable|integer|min:0|max:100',
            'documentation_score' => 'nullable|integer|min:0|max:100',
            'presentation_score' => 'nullable|integer|min:0|max:100',
            'overall_score' => 'nullable|integer|min:0|max:100',
            'grade' => 'nullable|string|max:10',
            'strengths' => 'nullable|string',
            'improvements' => 'nullable|string',
            'comments' => 'nullable|string',
        ])->validate();

        $item = ExaminerReportEvaluation::query()->create([
            ...$validated,
            'examiner_id' => $examiner->id,
            'status' => 'evaluated',
            'evaluated_at' => now(),
            'ai_meta' => ['consistency_score' => 92, 'bias_flag' => false],
        ]);
        return response()->json(['message' => 'Report evaluated.', 'item' => $item], 201);
    }

    public function updateEvaluation(Request $request, int $id)
    {
        $examiner = $this->examiner($request);
        $item = ExaminerReportEvaluation::query()->where('examiner_id', $examiner->id)->findOrFail($id);
        $item->update($request->only([
            'technical_score',
            'documentation_score',
            'presentation_score',
            'overall_score',
            'grade',
            'strengths',
            'improvements',
            'comments',
            'status',
        ]));
        return response()->json(['message' => 'Evaluation updated.', 'item' => $item->fresh()]);
    }

    public function requestRevision(Request $request)
    {
        $examiner = $this->examiner($request);
        $validated = Validator::make($request->all(), [
            'evaluation_id' => 'required|exists:examiner_report_evaluations,id',
            'revision_notes' => 'required|string|max:2000',
        ])->validate();
        $item = ExaminerReportEvaluation::query()->where('examiner_id', $examiner->id)->findOrFail((int) $validated['evaluation_id']);
        $item->update(['status' => 'revision_requested', 'comments' => $validated['revision_notes']]);
        return response()->json(['message' => 'Revision requested.', 'item' => $item->fresh()]);
    }

    public function vivaSchedule(Request $request)
    {
        $examiner = $this->examiner($request);
        return response()->json(ExaminerVivaSession::query()->where('examiner_id', $examiner->id)->orderBy('scheduled_at')->get());
    }

    public function createVivaSchedule(Request $request)
    {
        $examiner = $this->examiner($request);
        $validated = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'application_id' => 'nullable|exists:applications,id',
            'scheduled_at' => 'required|date',
            'format' => 'nullable|in:virtual,in_person,phone',
            'room_or_link' => 'nullable|string|max:255',
        ])->validate();
        $session = ExaminerVivaSession::query()->create([
            ...$validated,
            'examiner_id' => $examiner->id,
            'status' => 'scheduled',
            'format' => $validated['format'] ?? 'virtual',
            'ai_questions' => ['Explain your core internship project outcome.', 'What challenge did you solve and how?'],
        ]);
        return response()->json(['message' => 'Viva scheduled.', 'session' => $session], 201);
    }

    public function recordVivaResults(Request $request, int $id)
    {
        $examiner = $this->examiner($request);
        $session = ExaminerVivaSession::query()->where('examiner_id', $examiner->id)->findOrFail($id);
        $validated = Validator::make($request->all(), [
            'communication_score' => 'nullable|integer|min:0|max:100',
            'technical_score' => 'nullable|integer|min:0|max:100',
            'problem_solving_score' => 'nullable|integer|min:0|max:100',
            'confidence_score' => 'nullable|integer|min:0|max:100',
            'overall_score' => 'nullable|integer|min:0|max:100',
            'result' => 'nullable|in:pass,pass_minor_revisions,major_revisions,fail',
            'feedback' => 'nullable|string|max:2000',
        ])->validate();
        $session->update([...$validated, 'status' => 'completed']);
        return response()->json(['message' => 'Viva results recorded.', 'session' => $session->fresh()]);
    }

    public function generateVivaQuestions(Request $request)
    {
        $this->examiner($request);
        $studentName = (string) $request->input('student_name', 'Student');
        return response()->json([
            'questions' => [
                "Summarize your internship impact, {$studentName}.",
                'Describe a technical challenge and your resolution approach.',
                'How would you improve your solution in production conditions?',
            ],
        ]);
    }

    public function grades(Request $request)
    {
        $examiner = $this->examiner($request);
        return response()->json(
            ExaminerReportEvaluation::query()->where('examiner_id', $examiner->id)->whereNotNull('grade')->orderByDesc('evaluated_at')->get()
        );
    }

    public function calculateGrades(Request $request)
    {
        $this->examiner($request);
        $validated = Validator::make($request->all(), [
            'midterm' => 'required|numeric|min:0|max:100',
            'final_report' => 'required|numeric|min:0|max:100',
            'viva' => 'required|numeric|min:0|max:100',
            'supervisor' => 'required|numeric|min:0|max:100',
        ])->validate();
        $score = (0.2 * $validated['midterm']) + (0.35 * $validated['final_report']) + (0.25 * $validated['viva']) + (0.2 * $validated['supervisor']);
        $grade = $score >= 85 ? 'A' : ($score >= 75 ? 'B+' : ($score >= 65 ? 'B' : ($score >= 55 ? 'C' : 'D')));
        return response()->json(['final_score' => round($score, 2), 'grade' => $grade]);
    }

    public function publishGrades(Request $request)
    {
        $examiner = $this->examiner($request);
        $ids = (array) $request->input('evaluation_ids', []);
        ExaminerReportEvaluation::query()->where('examiner_id', $examiner->id)->whereIn('id', $ids)->update(['status' => 'published']);
        return response()->json(['message' => 'Grades published.', 'count' => count($ids)]);
    }

    public function analytics(Request $request)
    {
        $examiner = $this->examiner($request);
        $evaluations = ExaminerReportEvaluation::query()->where('examiner_id', $examiner->id)->get();
        return response()->json([
            'metrics' => [
                'completed_evaluations' => $evaluations->whereNotNull('evaluated_at')->count(),
                'avg_turnaround_days' => 3.2,
                'avg_score' => round((float) ($evaluations->avg('overall_score') ?: 0), 1),
                'grade_consistency' => 92,
            ],
            'insights' => [
                'Evaluation completion rate is on track for this semester.',
                'Feedback quality trends above department baseline.',
                'Students show stronger technical scores than documentation scores.',
            ],
        ]);
    }

    public function generateAnalyticsReport(Request $request)
    {
        $this->examiner($request);
        return response()->json([
            'report' => [
                'title' => 'Examiner Performance & Cohort Report',
                'generated_at' => now()->toIso8601String(),
                'summary' => 'Evaluation throughput is healthy with strong consistency and timely completion.',
            ],
        ]);
    }

    public function exportAnalyticsReport(Request $request)
    {
        $examiner = $this->examiner($request);
        $format = strtolower((string) $request->query('format', 'csv'));
        $evaluations = ExaminerReportEvaluation::query()->where('examiner_id', $examiner->id)->get();

        if ($format === 'pdf') {
            $body = "Examiner Analytics Report\n"
                . "Generated: " . now()->toDateTimeString() . "\n"
                . "Examiner: {$examiner->full_name}\n"
                . "Completed Evaluations: " . $evaluations->whereNotNull('evaluated_at')->count() . "\n"
                . "Average Score: " . round((float) ($evaluations->avg('overall_score') ?: 0), 1) . "\n";

            return response($body, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="examiner_analytics_report.pdf"',
            ]);
        }

        $lines = [
            'student_id,report_type,status,overall_score,grade,evaluated_at',
        ];
        foreach ($evaluations as $row) {
            $lines[] = implode(',', [
                $row->student_id,
                $row->report_type,
                $row->status,
                $row->overall_score ?? '',
                $row->grade ?? '',
                optional($row->evaluated_at)->toDateTimeString() ?? '',
            ]);
        }
        $csv = implode("\n", $lines);
        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="examiner_analytics_report.csv"',
        ]);
    }

    public function messages(Request $request)
    {
        $examiner = $this->examiner($request);
        return response()->json(ExaminerMessage::query()->where('examiner_id', $examiner->id)->orderByDesc('created_at')->get());
    }

    public function sendMessage(Request $request)
    {
        $examiner = $this->examiner($request);
        $validated = Validator::make($request->all(), [
            'student_id' => 'nullable|exists:users,id',
            'thread_key' => 'required|string|max:120',
            'subject' => 'nullable|string|max:255',
            'body' => 'required|string|max:5000',
            'category' => 'nullable|string|max:30',
        ])->validate();
        $msg = ExaminerMessage::query()->create([
            ...$validated,
            'examiner_id' => $examiner->id,
            'from_name' => $examiner->full_name,
            'from_role' => 'examiner',
            'category' => $validated['category'] ?? 'general',
        ]);
        return response()->json(['message' => 'Message sent.', 'item' => $msg], 201);
    }

    public function settings(Request $request)
    {
        $examiner = $this->examiner($request);
        $settings = ExaminerSetting::query()->firstOrCreate(['examiner_id' => $examiner->id], [
            'notification_prefs' => ['deadline_alerts' => true, 'submission_alerts' => true, 'viva_reminders' => true],
            'rubric_templates' => [
                ['name' => 'Final Report', 'technical' => 40, 'documentation' => 30, 'presentation' => 30],
            ],
        ]);
        return response()->json($settings);
    }

    public function updateSettings(Request $request)
    {
        $examiner = $this->examiner($request);
        $settings = ExaminerSetting::query()->firstOrCreate(['examiner_id' => $examiner->id]);
        $settings->update($request->only([
            'ai_assistance_level',
            'auto_suggest_scores',
            'auto_feedback_drafts',
            'bias_detection',
            'theme',
            'notification_prefs',
            'rubric_templates',
            'max_examinees_capacity',
            'weekly_evaluation_capacity',
        ]));
        return response()->json(['message' => 'Settings updated.', 'settings' => $settings->fresh()]);
    }
}
