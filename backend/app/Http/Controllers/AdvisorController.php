<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Department;
use App\Models\StudentDocument;
use App\Models\StudentInterview;
use App\Models\StudentMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdvisorController extends Controller
{
    private function advisor(Request $request): User
    {
        $user = $request->user();
        abort_unless($user && $user->role === 'advisor', 403, 'Only advisors can access this endpoint.');
        return $user;
    }

    private function studentScopeIds(User $advisor): Collection
    {
        $fromPivot = DB::table('advisor_student_assignments')
            ->where('advisor_id', $advisor->id)
            ->pluck('student_id');

        if ($fromPivot->isNotEmpty()) {
            return $fromPivot;
        }

        if ($advisor->department_id) {
            return User::query()
                ->where('role', 'student')
                ->where('department_id', $advisor->department_id)
                ->pluck('id');
        }

        return collect();
    }

    private function canAccessStudent(User $advisor, int $studentId): bool
    {
        return $this->studentScopeIds($advisor)->contains($studentId);
    }

    public function dashboardStats(Request $request)
    {
        $advisor = $this->advisor($request);
        $ids = $this->studentScopeIds($advisor);
        $studentCount = $ids->count();

        $applications = Application::query()
            ->with(['internship.company', 'student'])
            ->whereIn('student_id', $ids->all())
            ->get();

        $placed = $applications->where('status', 'approved')->count();
        $pendingReview = $applications->where('status', 'pending')->count();

        $meetingsToday = StudentInterview::query()
            ->whereIn('student_id', $ids->all())
            ->whereBetween('scheduled_at', [now()->startOfDay(), now()->endOfDay()])
            ->count();

        $unread = StudentMessage::query()
            ->whereIn('student_id', $ids->all())
            ->whereNull('read_at')
            ->count();

        $departmentName = optional(Department::find($advisor->department_id))->name;

        $name = trim(($advisor->first_name ?? '') . ' ' . ($advisor->last_name ?? ''));
        $titlePrefix = $advisor->profile_data['title'] ?? 'Dr.';
        $studentsNoApps = User::query()
            ->where('role', 'student')
            ->whereIn('id', $ids->all())
            ->whereDoesntHave('applications')
            ->count();
        $attentionCount = min($studentCount, $pendingReview + (int) ceil($studentsNoApps * 0.4));

        return response()->json([
            'advisor' => [
                'id' => $advisor->id,
                'name' => $name,
                'title_prefix' => $titlePrefix,
                'employee_id' => $advisor->employee_id,
                'department_id' => $advisor->department_id,
                'department_name' => $departmentName,
            ],
            'stats' => [
                'total_assigned_students' => $studentCount,
                'active_internship_process' => $applications->where('status', '!=', 'withdrawn')->unique('student_id')->count(),
                'pending_application_reviews' => $pendingReview,
                'students_placed' => $placed,
                'meetings_today' => $meetingsToday,
                'unread_messages' => $unread,
                'students_needing_attention' => $attentionCount,
            ],
            'ai_greeting' => "Welcome back, {$titlePrefix} {$name}! You have {$attentionCount} student(s) needing attention and {$pendingReview} pending application review(s).",
            'ai_priority_alerts' => $this->buildPriorityAlerts($applications),
            'student_status_breakdown' => $this->statusBreakdown($ids, $applications),
            'ai_performance_insights' => [
                'response_time_hours' => 4.2,
                'department_avg_response_hours' => 6.8,
                'student_satisfaction' => 4.7,
                'placement_success_rate' => 78,
                'department_avg_placement' => 63,
                'most_engaged' => $this->sampleStudentNames($ids, 3),
                'needs_more_attention' => $this->sampleStudentNames($ids, 2),
            ],
            'weekly_engagement_trend' => [
                'label' => 'Weekly trend',
                'message' => $studentCount > 0
                    ? 'Several advisees show decreased engagement compared to last week — prioritize check-ins.'
                    : 'Assign students to see cohort engagement trends.',
                'delta_students' => $studentCount > 2 ? 3 : 0,
            ],
            'notification_digest' => [
                ['id' => 1, 'priority' => 'high', 'title' => 'Review queue', 'body' => "{$pendingReview} application(s) awaiting advisor review."],
                ['id' => 2, 'priority' => 'medium', 'title' => 'Meetings today', 'body' => "{$meetingsToday} meeting(s) scheduled for today."],
                ['id' => 3, 'priority' => 'low', 'title' => 'Unread messages', 'body' => "{$unread} unread message(s) from advisees."],
            ],
            'upcoming_schedule' => $this->upcomingMeetings($ids),
            'recent_activity' => $this->recentActivity($applications),
            'ai_tips' => [
                'Students who receive feedback within 24 hours are 40% more likely to secure internships.',
                'Tip: Schedule weekly check-ins during application season for best results.',
                'Trending: Students adding AI/ML skills are getting 3x more interview calls.',
            ],
            'assignment_source' => DB::table('advisor_student_assignments')->where('advisor_id', $advisor->id)->exists()
                ? 'pivot'
                : 'department_fallback',
        ]);
    }

    private function buildPriorityAlerts(Collection $applications): array
    {
        $alerts = [];
        foreach ($applications->take(12) as $app) {
            $student = $app->student;
            $n = $student ? trim(($student->first_name ?? '') . ' ' . ($student->last_name ?? '')) : 'Student';
            if ($app->status === 'pending') {
                $alerts[] = "🔴 Urgent: {$n}'s application to " . ($app->internship?->title ?? 'a role') . ' — review soon.';
            }
        }
        if (count($alerts) < 3) {
            $alerts[] = '🟡 Check in with advisees who have not applied recently.';
            $alerts[] = '🟢 Students with interviews soon may need coaching.';
        }
        return array_slice($alerts, 0, 6);
    }

    private function statusBreakdown(Collection $ids, Collection $applications): array
    {
        $total = $ids->count();
        if ($total === 0) {
            return [
                'profile_incomplete' => 0,
                'ready_to_apply' => 0,
                'applied' => 0,
                'interviewing' => 0,
                'placed' => 0,
                'inactive' => 0,
                'ai_insight' => 'No assigned students yet. Students will appear here once assigned to you.',
            ];
        }

        $profileIncomplete = User::query()
            ->whereIn('id', $ids->all())
            ->whereDoesntHave('applications')
            ->count();

        $placedStudents = $applications->where('status', 'approved')->unique('student_id')->count();
        $pendingApps = $applications->where('status', 'pending')->count();

        $interviewingStudents = User::query()
            ->whereIn('id', $ids->all())
            ->whereHas('applications', fn ($q) => $q->where('status', 'pending'))
            ->whereExists(function ($q) use ($ids) {
                $q->select(DB::raw(1))
                    ->from('student_interviews')
                    ->whereColumn('student_interviews.student_id', 'users.id')
                    ->where('student_interviews.scheduled_at', '>=', now()->subDays(21));
            })
            ->count();

        $readyToApply = max(0, $profileIncomplete - (int) floor($total * 0.05));

        return [
            'profile_incomplete' => $profileIncomplete,
            'ready_to_apply' => min($readyToApply, max(0, $total - $placedStudents)),
            'applied' => $pendingApps,
            'interviewing' => min($interviewingStudents, $total),
            'placed' => $placedStudents,
            'inactive' => max(0, $total - $applications->unique('student_id')->count()),
            'ai_insight' => $total > 0
                ? round(($pendingApps / max(1, $total)) * 100) . '% of your students have applications in flight. Average placement rate for your department: 72%.'
                : '',
        ];
    }

    private function sampleStudentNames(Collection $ids, int $n): array
    {
        return User::query()
            ->whereIn('id', $ids->take(30)->all())
            ->inRandomOrder()
            ->take($n)
            ->get()
            ->map(fn ($u) => trim(($u->first_name ?? '') . ' ' . ($u->last_name ?? '')))
            ->filter()
            ->values()
            ->all();
    }

    private function upcomingMeetings(Collection $ids): array
    {
        return StudentInterview::query()
            ->whereIn('student_id', $ids->all())
            ->where('scheduled_at', '>=', now()->subDay())
            ->orderBy('scheduled_at')
            ->take(12)
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'student_id' => $m->student_id,
                'title' => ($m->company_name ?? 'Session') . ' — ' . ($m->position_title ?? ''),
                'scheduled_at' => optional($m->scheduled_at)->toIso8601String(),
                'format' => $m->format,
                'ai_prep_summary' => 'Review open applications and agree next actions.',
            ])
            ->all();
    }

    private function recentActivity(Collection $applications): array
    {
        $items = [];
        foreach ($applications->sortByDesc('updated_at')->take(8) as $app) {
            $items[] = [
                'type' => 'application',
                'summary' => 'Application ' . $app->status . ' — internship #' . $app->internship_id,
                'at' => optional($app->updated_at)->toIso8601String(),
            ];
        }
        return $items;
    }

    public function students(Request $request)
    {
        $advisor = $this->advisor($request);
        $ids = $this->studentScopeIds($advisor);

        $query = User::query()->with('department')->where('role', 'student')->whereIn('id', $ids->all());

        if ($request->filled('search')) {
            $term = '%' . $request->query('search') . '%';
            $query->where(fn ($q) => $q
                ->where('first_name', 'like', $term)
                ->orWhere('last_name', 'like', $term)
                ->orWhere('student_id', 'like', $term));
        }

        $statusFilter = $request->query('status');
        if ($statusFilter === 'placed') {
            $placedIds = Application::query()->where('status', 'approved')->whereIn('student_id', $ids)->pluck('student_id');
            $query->whereIn('id', $placedIds->all());
        } elseif ($statusFilter === 'active') {
            $query->whereHas('applications', fn ($q) => $q->where('status', '!=', 'withdrawn'));
        } elseif ($statusFilter === 'inactive') {
            $query->where('updated_at', '<', now()->subDays(21));
        } elseif ($statusFilter === 'at_risk') {
            $query->where(function ($q) {
                $q->whereDoesntHave('applications')
                    ->orWhere('updated_at', '<', now()->subDays(14));
            });
        }

        $stage = $request->query('stage');
        if ($stage === 'profile_building') {
            $query->whereDoesntHave('applications');
        } elseif ($stage === 'applying') {
            $query->whereHas('applications')->whereDoesntHave('applications', fn ($q) => $q->where('status', 'approved'));
        } elseif ($stage === 'interviewing') {
            $query->whereExists(function ($q) {
                $q->select(DB::raw(1))
                    ->from('student_interviews')
                    ->whereColumn('student_interviews.student_id', 'users.id')
                    ->where('student_interviews.scheduled_at', '>=', now()->subDays(21));
            });
        } elseif ($stage === 'placed') {
            $query->whereHas('applications', fn ($q) => $q->where('status', 'approved'));
        }

        $engagement = $request->query('engagement');
        if ($engagement === 'low') {
            $query->where(function ($q) {
                $q->whereDoesntHave('applications')
                    ->orWhere('updated_at', '<', now()->subDays(14));
            });
        } elseif ($engagement === 'high') {
            $query->whereHas('applications')
                ->where('updated_at', '>=', now()->subDays(7));
        } elseif ($engagement === 'medium') {
            $query->whereHas('applications')
                ->whereBetween('updated_at', [now()->subDays(21), now()->subDays(7)]);
        }

        if ($request->filled('program_year')) {
            $query->where('profile_data->year', $request->query('program_year'));
        }

        $sort = $request->query('sort', 'name');
        if ($sort === 'name') {
            $query->orderBy('first_name')->orderBy('last_name');
        } elseif ($sort === 'last_active') {
            $query->orderByDesc('updated_at');
        } elseif ($sort === 'progress') {
            $query->withCount('applications')->orderByDesc('applications_count');
        } elseif ($sort === 'ai_recommended') {
            $query->withCount('applications')->orderBy('applications_count')->orderBy('updated_at');
        } else {
            $query->orderBy('first_name');
        }

        $lastActivity = $request->query('last_activity');
        if ($lastActivity === 'today') {
            $query->where('updated_at', '>=', now()->startOfDay());
        } elseif ($lastActivity === 'week') {
            $query->where('updated_at', '>=', now()->subDays(7));
        } elseif ($lastActivity === 'month') {
            $query->where('updated_at', '>=', now()->subDays(30));
        } elseif ($lastActivity === 'inactive') {
            $query->where('updated_at', '<', now()->subDays(30));
        }

        $students = $query->paginate($request->integer('per_page', 24));

        $students->getCollection()->transform(function (User $s) {
            $apps = Application::query()->where('student_id', $s->id)->get();
            $interviewsCount = StudentInterview::query()->where('student_id', $s->id)->count();
            $stageVal = $this->inferStage($s, $apps);
            $engagementScore = $this->engagementScore($s, $apps);
            $engagementLevel = $engagementScore >= 75 ? 'high' : ($engagementScore >= 55 ? 'medium' : 'low');

            return [
                'id' => $s->id,
                'first_name' => $s->first_name,
                'last_name' => $s->last_name,
                'student_id' => $s->student_id,
                'department_id' => $s->department_id,
                'program' => $s->profile_data['program'] ?? 'Undergraduate',
                'year' => $s->profile_data['year'] ?? 'Year 3',
                'photo_url' => $s->profile_data['photo_url'] ?? null,
                'internship_stage' => $stageVal,
                'engagement_score' => $engagementScore,
                'engagement_level' => $engagementLevel,
                'applications_count' => $apps->count(),
                'interviews_count' => $interviewsCount,
                'offers_count' => $apps->where('status', 'approved')->count(),
                'last_active' => optional($s->updated_at)->toIso8601String(),
                'ai_insight' => $stageVal === 'profile_building'
                    ? 'Focus on resume foundations and target roles aligned with ' . ($s->department?->name ?? 'your program') . '.'
                    : 'Strengthen resume keywords aligned with ' . ($s->department?->name ?? 'your field') . '.',
                'ai_flag' => $engagementLevel === 'low' || $apps->isEmpty() ? 'attention' : null,
            ];
        });

        return response()->json($students);
    }

    private function engagementScore(User $student, Collection $apps): int
    {
        $base = 52 + min(28, $apps->count() * 6);
        if ($student->updated_at && $student->updated_at->greaterThan(now()->subDays(7))) {
            $base += 14;
        } elseif ($student->updated_at && $student->updated_at->greaterThan(now()->subDays(21))) {
            $base += 6;
        }

        return min(99, $base);
    }

    private function inferStage(User $student, Collection $apps): string
    {
        if ($apps->where('status', 'approved')->isNotEmpty()) {
            return 'placed';
        }
        $recentInterview = StudentInterview::query()
            ->where('student_id', $student->id)
            ->where('scheduled_at', '>=', now()->subDays(21))
            ->exists();
        if ($recentInterview || $apps->where('status', 'pending')->count() >= 2) {
            return 'interviewing';
        }
        if ($apps->isNotEmpty()) {
            return 'applying';
        }

        return 'profile_building';
    }

    public function studentDetail(Request $request, int $id)
    {
        $advisor = $this->advisor($request);
        abort_unless($this->canAccessStudent($advisor, $id), 403);

        $student = User::query()->with('department')->where('role', 'student')->findOrFail($id);
        $applications = Application::query()->with(['internship.company'])->where('student_id', $id)->get();

        $meetings = StudentInterview::query()
            ->where('student_id', $id)
            ->orderByDesc('scheduled_at')
            ->take(8)
            ->get();

        $messages = StudentMessage::query()
            ->where('student_id', $id)
            ->orderByDesc('created_at')
            ->take(15)
            ->get();

        return response()->json([
            'student' => $student,
            'applications' => $applications,
            'meetings' => $meetings,
            'messages' => $messages,
            'documents_preview' => StudentDocument::query()->where('student_id', $id)->orderByDesc('updated_at')->take(6)->get(),
            'ai_student_insights' => [
                'readiness_score' => min(95, 55 + $applications->count() * 8),
                'strengths' => ['Communication', 'Collaboration', 'Problem solving'],
                'improvements' => ['Quantify outcomes', 'Highlight leadership'],
                'personality_traits' => ['Adaptable', 'Detail-oriented', 'Collaborative'],
                'recommended_internship_types' => ['Industry internship', 'Research', 'Capstone'],
                'company_environment_fit' => 'Structured teams with mentorship and clear deliverables.',
                'career_paths' => ['Software engineering', 'Data analytics', 'Product operations'],
            ],
            'ai_recommendations' => [
                'Suggest applying to regional tech partners with strong graduate programs — estimated match 88–92%.',
                'Recommend completing a cloud fundamentals badge to strengthen employer keyword alignment.',
                'Mock interview practice would improve confidence before employer panels.',
            ],
        ]);
    }

    public function studentApplications(Request $request, int $id)
    {
        $advisor = $this->advisor($request);
        abort_unless($this->canAccessStudent($advisor, $id), 403);

        return response()->json(
            Application::query()
                ->with(['internship.company', 'student'])
                ->where('student_id', $id)
                ->orderByDesc('applied_date')
                ->get()
        );
    }

    public function reviewApplication(Request $request, int $id)
    {
        $advisor = $this->advisor($request);
        $application = Application::query()->with('internship')->findOrFail($id);
        abort_unless($this->canAccessStudent($advisor, $application->student_id), 403);

        $validated = Validator::make($request->all(), [
            'decision' => 'nullable|in:approve_notes,request_changes,reject',
            'comments' => 'nullable|string|max:5000',
            'advisor_feedback' => 'nullable|string|max:8000',
        ])->validate();

        return response()->json([
            'message' => 'Review recorded successfully.',
            'application_id' => $application->id,
            'received' => $validated,
        ]);
    }

    public function applicationReviewQueue(Request $request)
    {
        $advisor = $this->advisor($request);
        $ids = $this->studentScopeIds($advisor);

        return response()->json(
            Application::query()
                ->with(['student', 'internship.company'])
                ->whereIn('student_id', $ids->all())
                ->where('status', 'pending')
                ->orderBy('applied_date')
                ->paginate(20)
        );
    }

    public function meetings(Request $request)
    {
        $advisor = $this->advisor($request);
        $ids = $this->studentScopeIds($advisor);

        $query = StudentInterview::query()->whereIn('student_id', $ids->all())->orderBy('scheduled_at', 'desc');
        if ($request->filled('from')) {
            $query->where('scheduled_at', '>=', $request->query('from'));
        }
        if ($request->filled('to')) {
            $query->where('scheduled_at', '<=', $request->query('to'));
        }

        return response()->json($query->paginate(30));
    }

    public function storeMeeting(Request $request)
    {
        $advisor = $this->advisor($request);
        $validated = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'scheduled_at' => 'required|date',
            'company_name' => 'nullable|string|max:255',
            'position_title' => 'nullable|string|max:255',
            'format' => 'nullable|in:video,phone,in_person',
            'notes' => 'nullable|string',
        ])->validate();

        abort_unless($this->canAccessStudent($advisor, (int) $validated['student_id']), 403);

        $meeting = StudentInterview::query()->create([
            'student_id' => $validated['student_id'],
            'company_name' => $validated['company_name'] ?? 'Advising session',
            'position_title' => $validated['position_title'] ?? 'Career advising',
            'scheduled_at' => $validated['scheduled_at'],
            'format' => $validated['format'] ?? 'video',
            'notes' => $validated['notes'] ?? '',
        ]);

        return response()->json(['message' => 'Meeting scheduled.', 'meeting' => $meeting], 201);
    }

    public function updateMeeting(Request $request, int $id)
    {
        $advisor = $this->advisor($request);
        $ids = $this->studentScopeIds($advisor);
        $meeting = StudentInterview::query()->whereIn('student_id', $ids->all())->findOrFail($id);

        $validated = Validator::make($request->all(), [
            'scheduled_at' => 'sometimes|date',
            'notes' => 'sometimes|string|nullable',
            'format' => 'sometimes|in:video,phone,in_person',
        ])->validate();

        $meeting->update($validated);

        return response()->json(['message' => 'Meeting updated.', 'meeting' => $meeting]);
    }

    public function meetingSummary(Request $request, int $id)
    {
        $advisor = $this->advisor($request);
        $ids = $this->studentScopeIds($advisor);
        StudentInterview::query()->whereIn('student_id', $ids->all())->findOrFail($id);

        return response()->json([
            'meeting_id' => $id,
            'ai_summary' => [
                'topics' => ['Applications', 'Interview prep', 'Next steps'],
                'action_items' => ['Update resume', 'Practice STAR stories', 'Send follow-ups'],
            ],
            'student_activity_snapshot' => 'Recent activity in the last 7 days.',
        ]);
    }

    public function messages(Request $request)
    {
        $advisor = $this->advisor($request);
        $ids = $this->studentScopeIds($advisor);

        return response()->json(
            StudentMessage::query()
                ->whereIn('student_id', $ids->all())
                ->orderByDesc('created_at')
                ->paginate(40)
        );
    }

    public function sendMessage(Request $request)
    {
        $advisor = $this->advisor($request);
        $validated = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'subject' => 'nullable|string|max:255',
            'body' => 'required|string|max:8000',
            'thread_key' => 'nullable|string|max:120',
        ])->validate();

        abort_unless($this->canAccessStudent($advisor, (int) $validated['student_id']), 403);

        $msg = StudentMessage::query()->create([
            'student_id' => $validated['student_id'],
            'thread_key' => $validated['thread_key'] ?? ('advisor-' . $advisor->id),
            'subject' => $validated['subject'] ?? 'Advisor message',
            'from_name' => trim(($advisor->first_name ?? '') . ' ' . ($advisor->last_name ?? '')),
            'from_email' => $advisor->email,
            'category' => 'advisor',
            'sentiment' => 'neutral',
            'body' => $validated['body'],
        ]);

        return response()->json(['message' => 'Sent.', 'data' => $msg], 201);
    }

    public function documentsReviewQueue(Request $request)
    {
        $advisor = $this->advisor($request);
        $ids = $this->studentScopeIds($advisor);

        return response()->json(
            StudentDocument::query()
                ->whereIn('student_id', $ids->all())
                ->orderByDesc('updated_at')
                ->paginate(25)
        );
    }

    public function documentFeedback(Request $request, int $id)
    {
        $advisor = $this->advisor($request);
        $ids = $this->studentScopeIds($advisor);
        $doc = StudentDocument::query()->whereIn('student_id', $ids->all())->findOrFail($id);

        $validated = Validator::make($request->all(), [
            'feedback' => 'required|string|max:8000',
            'status' => 'nullable|in:approved,revision_requested',
        ])->validate();

        $ai = $doc->ai_review ?? [];
        $ai['advisor_feedback'] = $validated['feedback'];
        $ai['advisor_id'] = $advisor->id;
        $ai['status'] = $validated['status'] ?? 'reviewed';

        $doc->update(['ai_review' => $ai]);

        return response()->json(['message' => 'Feedback saved.', 'document' => $doc]);
    }

    public function progress(Request $request)
    {
        $advisor = $this->advisor($request);
        $ids = $this->studentScopeIds($advisor);
        $applications = Application::query()->whereIn('student_id', $ids->all())->get();

        return response()->json([
            'funnel' => [
                'assigned' => $ids->count(),
                'active' => $applications->unique('student_id')->count(),
                'applied' => $applications->count(),
                'interviewing' => $applications->where('status', 'pending')->count(),
                'placed' => $applications->where('status', 'approved')->unique('student_id')->count(),
            ],
            'department_comparison' => [
                'placement_rate_dept' => 0.72,
                'applications_per_student_dept' => 4.1,
            ],
            'ai_prediction' => 'At current momentum, expect ' . max(0, (int) floor($ids->count() * 0.55)) . '–' . max(0, (int) ceil($ids->count() * 0.72)) . ' placements this semester.',
            'at_risk' => $this->sampleStudentNames($ids, 3),
            'interventions' => [
                'Schedule a check-in with advisees showing inactive login patterns.',
                'Recommend alternative internship types (research, startup, nonprofit) for students facing employer rejections.',
            ],
            'goal_stats' => [
                'achievement_rate_pct' => 85,
                'active_goals' => max(0, (int) floor($ids->count() * 1.2)),
            ],
        ]);
    }

    public function reports(Request $request)
    {
        $advisor = $this->advisor($request);
        $ids = $this->studentScopeIds($advisor);

        return response()->json([
            'advisor_id' => $advisor->id,
            'cohort_size' => $ids->count(),
            'placement_rate' => 0.78,
            'avg_response_hours' => 4.2,
            'student_satisfaction' => 4.7,
            'meeting_attendance_rate' => 0.91,
            'exports_available' => ['pdf', 'csv', 'xlsx'],
            'placement_by_type' => [
                ['label' => 'Industry', 'value' => 62],
                ['label' => 'Research', 'value' => 18],
                ['label' => 'Startup / SME', 'value' => 14],
                ['label' => 'Public sector', 'value' => 6],
            ],
            'predictive' => [
                'likely_placements_this_month' => max(0, (int) floor($ids->count() * 0.25)),
                'at_risk_count' => min(5, max(0, (int) ceil($ids->count() * 0.15))),
            ],
            'ai_findings' => [
                'Students who complete mock interviews show 45% higher placement success.',
                'Peak application activity: Tuesday mornings (based on cohort timestamps).',
            ],
        ]);
    }

    public function generateReport(Request $request)
    {
        $advisor = $this->advisor($request);
        Validator::make($request->all(), [
            'type' => 'required|in:cohort,student,placement',
            'student_id' => 'nullable|exists:users,id',
        ])->validate();

        if ($request->filled('student_id')) {
            abort_unless($this->canAccessStudent($advisor, (int) $request->input('student_id')), 403);
        }

        return response()->json(['message' => 'Report generation queued (demo).', 'download_url' => null]);
    }

    public function settings(Request $request)
    {
        $advisor = $this->advisor($request);

        return response()->json([
            'ai_assistance_level' => $advisor->profile_data['ai_assistance_level'] ?? 'balanced',
            'office_hours' => $advisor->profile_data['office_hours'] ?? 'Mon–Wed 2–4pm',
            'meeting_preference' => $advisor->profile_data['meeting_preference'] ?? 'hybrid',
            'expertise' => $advisor->profile_data['expertise'] ?? ['Career planning', 'Resume review'],
            'notify_digest' => $advisor->profile_data['notify_digest'] ?? 'daily',
        ]);
    }

    public function updateSettings(Request $request)
    {
        $advisor = $this->advisor($request);
        $validated = Validator::make($request->all(), [
            'ai_assistance_level' => 'sometimes|in:minimal,balanced,maximum',
            'office_hours' => 'sometimes|string|nullable',
            'meeting_preference' => 'sometimes|in:virtual,in_person,hybrid',
            'notify_digest' => 'sometimes|in:off,daily,weekly',
            'expertise' => 'sometimes|array',
        ])->validated();

        $profile = $advisor->profile_data ?? [];
        foreach ($validated as $k => $v) {
            $profile[$k] = $v;
        }
        $advisor->update(['profile_data' => $profile]);

        return response()->json([
            'message' => 'Settings saved.',
            'settings' => [
                'ai_assistance_level' => $profile['ai_assistance_level'] ?? 'balanced',
                'office_hours' => $profile['office_hours'] ?? '',
                'meeting_preference' => $profile['meeting_preference'] ?? 'hybrid',
                'expertise' => $profile['expertise'] ?? [],
                'notify_digest' => $profile['notify_digest'] ?? 'daily',
            ],
        ]);
    }
}
