<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Company;
use App\Models\DashboardAuditEvent;
use App\Models\DashboardReportRun;
use App\Models\Department;
use App\Models\Evaluation;
use App\Models\Internship;
use App\Models\Notification;
use App\Models\StudentDocument;
use App\Models\StudentInterview;
use App\Models\StudentMessage;
use App\Models\User;
use App\Services\ScheduleNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class CompanyController extends Controller
{
    private const FIELD_DEPARTMENT_MAP = [
        'technology' => ['IT', 'IS', 'CS'],
        'tech' => ['IT', 'IS', 'CS'],
        'it' => ['IT', 'IS', 'CS'],
        'marketing' => ['IT', 'IS', 'CS'],
        'business' => ['ECON'],
        'finance' => ['ECON'],
    ];

    private function companyUser(Request $request): User
    {
        $user = $request->user();
        abort_unless($user && $user->isCompany() && $user->company_id, 403, 'Company access only.');

        return $user;
    }

    private function companyModel(User $user): Company
    {
        return Company::query()->findOrFail($user->company_id);
    }

    private function resolveRoutingDepartments(?string $programField): Collection
    {
        if (!$programField) {
            return collect();
        }
        $normalized = strtolower(trim($programField));
        $codes = self::FIELD_DEPARTMENT_MAP[$normalized] ?? null;
        if (!$codes) {
            return Department::query()->limit(1)->get();
        }

        return Department::query()->whereIn('code', $codes)->orderBy('code')->get();
    }

    private function syncRoutingDepartments(Internship $internship, Collection $routingDepartments): void
    {
        $ids = $routingDepartments->pluck('id')->values()->all();
        $internship->routingDepartments()->sync($ids);
    }

    private function internshipIds(int $companyId): Collection
    {
        return Internship::query()->where('company_id', $companyId)->pluck('id');
    }

    private function applicationsQuery(int $companyId)
    {
        $ids = $this->internshipIds($companyId);

        return Application::query()
            ->with(['student.department', 'internship.company'])
            ->whereIn('internship_id', $ids->all());
    }

    private function getAtsStages(Company $company): array
    {
        return $company->meta['ats_stages'] ?? [];
    }

    private function saveAtsStages(Company $company, array $stages): void
    {
        $meta = $company->meta ?? [];
        $meta['ats_stages'] = $stages;
        $company->update(['meta' => $meta]);
    }

    private function inferPipelineStage(Application $app, array $ats): string
    {
        $sid = (string) $app->id;
        if (isset($ats[$sid])) {
            return $ats[$sid];
        }
        if ($app->status === 'approved') {
            return 'hired';
        }
        if ($app->status === 'rejected') {
            return 'rejected';
        }

        return 'applied';
    }

    // ============================================
    // NEW: Approve Application
    // ============================================
    public function approveApplication(Request $request, $id)
    {
        $user = $this->companyUser($request);
        $company = $this->companyModel($user);
        $app = $this->applicationsQuery((int) $company->id)->findOrFail($id);
        $app->loadMissing(['internship', 'student']);

        $internship = $app->internship;
        if (!$internship) {
            return response()->json(['error' => 'Internship not found for this application.'], 422);
        }

        // Prevent over-approving beyond the internship capacity.
        $capacity = max(1, (int) ($internship->max_applicants ?? 1));
        $approvedCount = Application::query()
            ->where('internship_id', $internship->id)
            ->where('status', 'approved')
            ->count();
        if ($approvedCount >= $capacity) {
            return response()->json([
                'error' => 'This internship has already reached its capacity.',
                'code' => 'capacity_reached',
            ], 422);
        }

        $app->update([
            'status' => 'approved',
            'approved_date' => now(),
            'intern_status' => 'active',
            'intern_started_at' => now(),
            'intern_ended_at' => null,
            'intern_end_reason' => null,
        ]);

        // NOTE: `current_applicants` is incremented on application submission.
        // Approving an application should not increment it again.

        // If capacity is now reached, close the internship posting.
        if (($approvedCount + 1) >= $capacity) {
            $internship->update(['status' => 'closed']);
        }

        // If a student gets placed, withdraw all of their other pending applications
        // (so the workflow is consistent: one student -> one placement).
        $student = $app->student;
        if ($student) {
            $otherPending = Application::query()
                ->with('internship')
                ->where('student_id', $student->id)
                ->where('status', 'pending')
                ->where('id', '!=', $app->id)
                ->get();
            foreach ($otherPending as $other) {
                $other->withdraw();
            }
        }

        // Notify student
        if ($student) {
            Notification::create([
                'user_id' => $student->id,
                'type' => 'application_approved',
                'title' => 'Application Approved! 🎉',
                'message' => "Your application for \"{$internship->title}\" at {$company->name} has been approved! You are now an intern.",
                'meta' => [
                    'application_id' => $app->id,
                    'internship_id' => $internship->id,
                    'company_id' => $company->id,
                ],
            ]);
        }

        // Notify super admins
        $superAdmins = User::where('role', 'super_admin')->get();
        foreach ($superAdmins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'student_placed',
                'title' => 'Student Placed',
                'message' => ($student->first_name ?? 'Student') . " has been accepted by {$company->name} for \"{$internship->title}\"",
                'meta' => [
                    'application_id' => $app->id,
                    'student_id' => $student->id,
                    'company_id' => $company->id,
                ],
            ]);
        }

        // Update ATS stage
        $ats = $this->getAtsStages($company);
        $ats[(string) $app->id] = 'hired';
        $this->saveAtsStages($company, $ats);

        return response()->json([
            'message' => 'Application approved successfully! Student is now an intern.',
            'application' => $app->fresh(['student', 'internship.company']),
        ]);
    }

    public function terminateIntern(Request $request, int $applicationId)
    {
        $user = $this->companyUser($request);
        $company = $this->companyModel($user);

        $validated = Validator::make($request->all(), [
            'reason' => 'nullable|string|max:5000',
        ])->validated();

        $app = $this->applicationsQuery((int) $company->id)->findOrFail($applicationId);
        abort_unless($app->status === 'approved', 422, 'Only approved placements can be terminated.');

        $app->update([
            'intern_status' => 'terminated',
            'intern_ended_at' => now(),
            'intern_end_reason' => $validated['reason'] ?? null,
        ]);

        // Notify student
        $student = $app->student;
        $internship = $app->internship;
        if ($student && $internship) {
            Notification::create([
                'user_id' => $student->id,
                'type' => 'internship_terminated',
                'title' => 'Internship placement ended',
                'message' => "Your internship placement for \"{$internship->title}\" at {$company->name} has been terminated.",
                'meta' => [
                    'application_id' => $app->id,
                    'internship_id' => $internship->id,
                    'company_id' => $company->id,
                ],
            ]);
        }

        return response()->json(['message' => 'Intern terminated.', 'application' => $app->fresh()]);
    }

    public function completeIntern(Request $request, int $applicationId)
    {
        $user = $this->companyUser($request);
        $company = $this->companyModel($user);

        $validated = Validator::make($request->all(), [
            'note' => 'nullable|string|max:5000',
        ])->validated();

        $app = $this->applicationsQuery((int) $company->id)->findOrFail($applicationId);
        abort_unless($app->status === 'approved', 422, 'Only approved placements can be completed.');

        $app->update([
            'intern_status' => 'completed',
            'intern_ended_at' => now(),
            'intern_end_reason' => $validated['note'] ?? null,
        ]);

        $student = $app->student;
        $internship = $app->internship;
        if ($student && $internship) {
            Notification::create([
                'user_id' => $student->id,
                'type' => 'internship_completed',
                'title' => 'Internship completed',
                'message' => "Congratulations! Your internship for \"{$internship->title}\" at {$company->name} has been marked as completed.",
                'meta' => [
                    'application_id' => $app->id,
                    'internship_id' => $internship->id,
                    'company_id' => $company->id,
                ],
            ]);
        }

        return response()->json(['message' => 'Intern completed.', 'application' => $app->fresh()]);
    }

    // ============================================
    // NEW: Reject Application
    // ============================================
    public function rejectApplication(Request $request, $id)
    {
        $user = $this->companyUser($request);
        $company = $this->companyModel($user);
        $app = $this->applicationsQuery((int) $company->id)->findOrFail($id);

        $reason = $request->input('reason');

        $app->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
        ]);

        // Notify student
        $student = $app->student;
        $internship = $app->internship;
        if ($student) {
            $message = "Your application for \"{$internship->title}\" at {$company->name} was not selected.";
            if ($reason) {
                $message .= " Reason: {$reason}";
            }

            Notification::create([
                'user_id' => $student->id,
                'type' => 'application_rejected',
                'title' => 'Application Update',
                'message' => $message,
                'meta' => [
                    'application_id' => $app->id,
                    'internship_id' => $internship->id,
                ],
            ]);
        }

        // Update ATS stage
        $ats = $this->getAtsStages($company);
        $ats[(string) $app->id] = 'rejected';
        $this->saveAtsStages($company, $ats);

        return response()->json([
            'message' => 'Application rejected.',
            'application' => $app->fresh(['student', 'internship.company']),
        ]);
    }

    public function dashboardStats(Request $request)
    {
        $user = $this->companyUser($request);
        $company = $this->companyModel($user);
        $cid = (int) $company->id;

        $internships = Internship::query()->where('company_id', $cid)->get();
        $activePostings = $internships->where('status', 'active')->where('submission_status', Internship::SUBMISSION_STATUS_APPROVED)->count();

        $apps = $this->applicationsQuery($cid)->get();
        $cycleApps = $apps->filter(fn ($a) => optional($a->applied_date)->greaterThanOrEquals(now()->subMonths(6)));
        $totalApplicants = $cycleApps->count();

        $ats = $this->getAtsStages($company);
        $shortlisted = $apps->filter(fn ($a) => in_array($this->inferPipelineStage($a, $ats), ['shortlisted', 'interview', 'offer'], true))->count();

        $currentInterns = $apps->filter(function ($a) {
            if ($a->status !== 'approved') {
                return false;
            }
            $end = $a->internship?->end_date;
            $start = $a->internship?->start_date;

            return $start && $end && now()->between($start, $end);
        })->count();

        $studentIds = $apps->pluck('student_id')->unique()->filter()->values();
        $interviewsScheduled = StudentInterview::query()
            ->whereIn('student_id', $studentIds->all())
            ->where('scheduled_at', '>=', now()->subDay())
            ->count();

        $offersFilled = $apps->where('status', 'approved')->count();

        $avgRating = Evaluation::query()
            ->where('company_id', $cid)
            ->avg('overall_performance');

        $name = $company->name;

        return response()->json([
            'company' => [
                'id' => $company->id,
                'name' => $name,
                'is_verified' => (bool) $company->is_verified,
                'industry' => $company->industry,
            ],
            'ai_greeting' => "Welcome back, {$name}! You have {$totalApplicants} applicant(s) this cycle and {$activePostings} active internship program(s).",
            'stats' => [
                'active_postings' => $activePostings,
                'total_applicants_cycle' => $totalApplicants,
                'shortlisted' => $shortlisted,
                'current_interns' => $currentInterns,
                'interviews_scheduled' => $interviewsScheduled,
                'positions_filled' => $offersFilled,
                'avg_intern_rating' => $avgRating ? round((float) $avgRating, 1) : 4.2,
            ],
            'ai_priority_alerts' => [
                '🔴 Urgent: Review postings nearing SLA deadline — renew or close soon.',
                '🟡 Several applications pending review for 7+ days — candidates may lose interest.',
                '🟢 AI identified strong matches in your latest applicant pool.',
                '📊 Mid-term evaluations approaching for active interns.',
                '💡 Tip: Remote-friendly posts attract more applicants in similar cohorts.',
            ],
            'recruitment_funnel' => [
                'views' => max(120, $apps->count() * 24),
                'applications' => $apps->count(),
                'shortlisted' => max(1, (int) round($apps->count() * 0.22)),
                'interviewed' => max(1, (int) round($apps->count() * 0.14)),
                'offered' => max(0, (int) round($apps->count() * 0.08)),
                'accepted' => $apps->where('status', 'approved')->count(),
                'offer_acceptance_note' => 'Your offer acceptance rate is tracking above typical benchmarks.',
                'bottleneck_note' => 'Bottleneck insight: streamline interview scheduling to reduce time-to-offer.',
            ],
            'posting_cards' => $internships->take(8)->map(fn ($i) => [
                'id' => $i->id,
                'title' => $i->title,
                'status' => $i->status,
                'submission_status' => $i->submission_status,
                'days_active' => optional($i->published_at ?? $i->created_at)->diffInDays(now()),
                'days_remaining' => $i->sla_deadline_at ? max(0, now()->diffInDays($i->sla_deadline_at, false)) : null,
                'applicant_count' => $i->current_applicants ?? 0,
                'ai_quality_score' => min(99, 65 + ($i->current_applicants ?? 0) * 2),
            ])->values(),
            'upcoming_schedule' => $this->buildSchedule($studentIds, $cid),
            'recent_activity' => $this->recentActivity($apps),
            'ai_recruitment_insights' => [
                'Posts mentioning mentorship and learning outcomes perform best.',
                'Optimal visibility: Monday AM publishes tend to earn higher application volume.',
                'Adding stipend ranges correlates with higher completion rates on applications.',
            ],
            'notification_digest' => [
                ['id' => 1, 'title' => 'Applicants', 'body' => "{$totalApplicants} candidates in the current cycle."],
                ['id' => 2, 'title' => 'Interviews', 'body' => "{$interviewsScheduled} upcoming session(s) on the calendar."],
            ],
        ]);
    }

    private function buildSchedule(Collection $studentIds, int $companyId): array
    {
        $meetings = StudentInterview::query()
            ->whereIn('student_id', $studentIds->all())
            ->where('scheduled_at', '>=', now()->subDays(1))
            ->orderBy('scheduled_at')
            ->take(12)
            ->get();

        $items = [];
        foreach ($meetings as $m) {
            $items[] = [
                'id' => $m->id,
                'title' => ($m->company_name ?? 'Interview') . ' · ' . ($m->position_title ?? ''),
                'scheduled_at' => optional($m->scheduled_at)->toIso8601String(),
                'ai_brief' => 'Review resume highlights and agree on next steps.',
                'type' => 'interview',
            ];
        }

        $deadlines = Internship::query()
            ->where('company_id', $companyId)
            ->whereNotNull('sla_deadline_at')
            ->where('sla_deadline_at', '>=', now())
            ->orderBy('sla_deadline_at')
            ->take(5)
            ->get();

        foreach ($deadlines as $d) {
            $items[] = [
                'id' => 'sla-' . $d->id,
                'title' => 'Posting SLA · ' . $d->title,
                'scheduled_at' => optional($d->sla_deadline_at)->toIso8601String(),
                'ai_brief' => 'Ensure posting stays compliant before cutoff.',
                'type' => 'deadline',
            ];
        }

        return $items;
    }

    private function recentActivity(Collection $applications): array
    {
        $rows = [];
        foreach ($applications->sortByDesc('updated_at')->take(10) as $a) {
            $rows[] = [
                'type' => 'application',
                'summary' => 'Application status ' . $a->status . ' · ' . ($a->internship?->title ?? ''),
                'at' => optional($a->updated_at)->toIso8601String(),
            ];
        }

        return $rows;
    }

    public function profile(Request $request)
    {
        $user = $this->companyUser($request);
        $company = $this->companyModel($user)->loadCount('internships');

        return response()->json([
            'company' => $company,
            'profile_completeness' => min(100, 40 + ($company->description ? 25 : 0) + ($company->website ? 15 : 0) + ($company->meta['banner_url'] ?? null ? 20 : 0)),
            'partnership_tier' => $company->meta['partnership_tier'] ?? 'standard',
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $this->companyUser($request);
        $company = $this->companyModel($user);

        $validated = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'industry' => 'sometimes|string|nullable|max:120',
            'description' => 'sometimes|string|nullable',
            'website' => 'sometimes|string|nullable|max:255',
            'city' => 'sometimes|string|nullable|max:120',
            'country' => 'sometimes|string|nullable|max:120',
            'contact_person' => 'sometimes|string|nullable|max:255',
            'contact_email' => 'sometimes|email|nullable',
            'contact_phone' => 'sometimes|string|nullable|max:50',
            'meta' => 'sometimes|array',
        ])->validated();

        $company->update($validated);

        return response()->json(['message' => 'Profile updated.', 'company' => $company->fresh()]);
    }

    public function internships(Request $request)
    {
        $user = $this->companyUser($request);
        $cid = $user->company_id;

        $query = Internship::query()->with(['company'])->where('company_id', $cid);

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }
        if ($request->filled('submission_status')) {
            $query->where('submission_status', $request->query('submission_status'));
        }

        $sort = $request->query('sort', 'newest');
        if ($sort === 'most_applicants') {
            $query->orderByDesc('current_applicants');
        } elseif ($sort === 'deadline') {
            $query->orderBy('sla_deadline_at');
        } else {
            $query->orderByDesc('updated_at');
        }

        $paginator = $query->paginate($request->integer('per_page', 15));
        $paginator->getCollection()->transform(function (Internship $i) {
            return [
                'id' => $i->id,
                'title' => $i->title,
                'program_field' => $i->program_field,
                'location' => $i->location,
                'status' => $i->status,
                'submission_status' => $i->submission_status,
                'work_modality' => $i->work_modality,
                'start_date' => optional($i->start_date)->toDateString(),
                'end_date' => optional($i->end_date)->toDateString(),
                'sla_deadline_at' => optional($i->sla_deadline_at)->toIso8601String(),
                'current_applicants' => $i->current_applicants,
                'max_applicants' => $i->max_applicants,
                'ai_performance_note' => 'Posting engagement is tracking close to cohort averages.',
            ];
        });

        return response()->json($paginator);
    }

    public function storeInternship(Request $request)
    {
        $user = $this->companyUser($request);

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'program_field' => 'required|string|max:100',
            'work_modality' => 'required|in:on-site,remote,hybrid',
            'location' => 'nullable|string|max:255',
            'type' => 'required|in:full-time,part-time,remote,hybrid',
            'duration_weeks' => 'required|integer|min:1',
            'stipend' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'requirements' => 'nullable|string',
            'responsibilities' => 'nullable|string',
            'required_skills' => 'nullable|string',
            'sla_deadline_at' => 'nullable|date',
            'max_applicants' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payload = $validator->validated();
        $payload['company_id'] = $user->company_id;
        $payload['submission_date'] = now();
        $payload['submission_status'] = Internship::SUBMISSION_STATUS_PENDING;
        $payload['status'] = 'draft';

        $routingDepartments = $this->resolveRoutingDepartments($payload['program_field']);
        $payload['routing_department_id'] = $routingDepartments->first()?->id;

        $internship = Internship::create($payload);
        $this->syncRoutingDepartments($internship, $routingDepartments);

        return response()->json([
            'message' => 'Internship draft saved. Submit for approval when ready.',
            'internship' => $internship->load(['company', 'routingDepartments']),
        ], 201);
    }

    public function updateInternship(Request $request, int $id)
    {
        $user = $this->companyUser($request);
        $internship = Internship::query()->where('company_id', $user->company_id)->findOrFail($id);

        $validated = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'program_field' => 'sometimes|string|max:100',
            'work_modality' => 'sometimes|in:on-site,remote,hybrid',
            'location' => 'nullable|string|max:255',
            'type' => 'sometimes|in:full-time,part-time,remote,hybrid',
            'duration_weeks' => 'sometimes|integer|min:1',
            'stipend' => 'nullable|numeric|min:0',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'requirements' => 'nullable|string',
            'responsibilities' => 'nullable|string',
            'required_skills' => 'nullable|string',
            'sla_deadline_at' => 'nullable|date',
            'max_applicants' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:draft,active,closed,completed',
        ])->validated();

        if (isset($validated['program_field'])) {
            $routingDepartments = $this->resolveRoutingDepartments($validated['program_field']);
            $validated['routing_department_id'] = $routingDepartments->first()?->id;
            $this->syncRoutingDepartments($internship, $routingDepartments);
        }

        $internship->update($validated);

        return response()->json(['internship' => $internship->fresh(['company', 'routingDepartments'])]);
    }

    public function destroyInternship(Request $request, int $id)
    {
        $user = $this->companyUser($request);
        $internship = Internship::query()->where('company_id', $user->company_id)->findOrFail($id);

        if ($internship->applications()->exists()) {
            return response()->json(['error' => 'Cannot delete internship with applications'], 422);
        }

        $internship->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function submitForApproval(Request $request, int $id)
    {
        $user = $this->companyUser($request);
        $internship = Internship::query()->where('company_id', $user->company_id)->findOrFail($id);

        $internship->update([
            'submission_status' => Internship::SUBMISSION_STATUS_PENDING,
            'submission_date' => now(),
            'status' => 'draft',
        ]);

        return response()->json(['message' => 'Submitted for approval.', 'internship' => $internship]);
    }

    public function internshipApplicants(Request $request, int $id)
    {
        $user = $this->companyUser($request);
        $internship = Internship::query()->where('company_id', $user->company_id)->findOrFail($id);
        $company = $this->companyModel($user);
        $ats = $this->getAtsStages($company);

        $apps = Application::query()
            ->with(['student.department'])
            ->where('internship_id', $internship->id)
            ->orderByDesc('applied_date')
            ->paginate($request->integer('per_page', 30));

        $apps->getCollection()->transform(function (Application $a) use ($ats) {
            return [
                'id' => $a->id,
                'student' => $a->student,
                'applied_date' => optional($a->applied_date)->toDateString(),
                'status' => $a->status,
                'pipeline_stage' => $this->inferPipelineStage($a, $ats),
                'ai_match_score' => min(99, 58 + crc32((string) $a->id) % 40),
            ];
        });

        return response()->json($apps);
    }

    public function applicants(Request $request)
    {
        $user = $this->companyUser($request);
        $company = $this->companyModel($user);
        $ats = $this->getAtsStages($company);

        $query = $this->applicationsQuery((int) $company->id);

        if ($request->filled('internship_id')) {
            $query->where('internship_id', (int) $request->query('internship_id'));
        }

        if ($request->filled('pipeline_stage')) {
            $stage = $request->query('pipeline_stage');
            $metaIds = [];
            foreach ($ats as $appId => $st) {
                if ($st === $stage) {
                    $metaIds[] = (int) $appId;
                }
            }
            if ($stage === 'hired') {
                $query->where('status', 'approved');
            } elseif ($stage === 'rejected') {
                $query->where('status', 'rejected');
            } elseif ($stage === 'applied') {
                $query->where('status', 'pending')->whereNotIn('id', array_keys($ats));
            } elseif (! empty($metaIds)) {
                $query->whereIn('id', $metaIds);
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        $apps = $query->orderByDesc('applied_date')->paginate($request->integer('per_page', 40));

        $apps->getCollection()->transform(function (Application $a) use ($ats) {
            $student = $a->student;

            return [
                'id' => $a->id,
                'student_id' => $a->student_id,
                'first_name' => $student?->first_name,
                'last_name' => $student?->last_name,
                'student_code' => $student?->student_id,
                'department' => $student?->department?->name,
                'internship_title' => $a->internship?->title,
                'internship_id' => $a->internship_id,
                'applied_date' => optional($a->applied_date)->toDateString(),
                'status' => $a->status,
                'pipeline_stage' => $this->inferPipelineStage($a, $ats),
                'ai_match_score' => min(99, 58 + crc32((string) $a->id) % 40),
                'skills_preview' => $student?->profile_data['skills'] ?? ['Communication', 'Teamwork'],
            ];
        });

        return response()->json($apps);
    }

    public function applicantDetail(Request $request, int $id)
    {
        $user = $this->companyUser($request);
        $company = $this->companyModel($user);
        $ats = $this->getAtsStages($company);

        $app = $this->applicationsQuery((int) $company->id)->with(['student.department', 'internship'])->findOrFail($id);

        return response()->json([
            'application' => $app,
            'pipeline_stage' => $this->inferPipelineStage($app, $ats),
            'documents_preview' => StudentDocument::query()
                ->where('student_id', (int) $app->student_id)
                ->orderByDesc('updated_at')
                ->take(8)
                ->get(['id', 'student_id', 'type', 'title', 'file_path', 'version', 'updated_at']),
            'ai_insights' => [
                'skills_match' => 88,
                'experience_match' => 82,
                'education_match' => 90,
                'culture_fit' => 76,
                'summary' => 'Strong alignment with role requirements; emphasize depth in collaborative projects.',
                'interview_questions' => [
                    'Describe a project where you improved a measurable outcome.',
                    'How do you prioritize competing deadlines?',
                ],
            ],
        ]);
    }

    public function viewDocumentFile(Request $request, int $id)
    {
        $user = $this->companyUser($request);
        $cid = (int) $user->company_id;
        $studentIds = $this->applicationsQuery($cid)->pluck('student_id')->unique();
        $doc = StudentDocument::query()->whereIn('student_id', $studentIds->all())->findOrFail($id);
        abort_unless($doc->file_path, 404, 'File not found.');
        abort_unless(Storage::disk('public')->exists($doc->file_path), 404, 'File not found.');
        return Storage::disk('public')->response($doc->file_path);
    }

    public function downloadDocument(Request $request, int $id)
    {
        $user = $this->companyUser($request);
        $cid = (int) $user->company_id;
        $studentIds = $this->applicationsQuery($cid)->pluck('student_id')->unique();
        $doc = StudentDocument::query()->whereIn('student_id', $studentIds->all())->findOrFail($id);

        if ($doc->file_path && Storage::disk('public')->exists($doc->file_path)) {
            $downloadName = preg_replace('/[^a-z0-9\-_]+/i', '_', strtolower($doc->title));
            $ext = pathinfo($doc->file_path, PATHINFO_EXTENSION);
            $ext = $ext ? ".{$ext}" : '';
            return Storage::disk('public')->download($doc->file_path, $downloadName . $ext);
        }

        $filename = preg_replace('/[^a-z0-9\-_]+/i', '_', strtolower($doc->title)) . '.txt';
        $content = $doc->content ?: "Title: {$doc->title}\nType: {$doc->type}\nNo content.";

        return response($content, 200, [
            'Content-Type' => 'text/plain; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function updateApplicantStatus(Request $request, int $id)
    {
        $user = $this->companyUser($request);
        $company = $this->companyModel($user);
        $app = $this->applicationsQuery((int) $company->id)->findOrFail($id);

        $validated = Validator::make($request->all(), [
            'pipeline_stage' => 'nullable|in:applied,screening,shortlisted,interview,offer,hired,rejected',
            'application_status' => 'nullable|in:pending,approved,rejected',
        ])->validated();

        if (! empty($validated['pipeline_stage'])) {
            $ats = $this->getAtsStages($company);
            $ats[(string) $app->id] = $validated['pipeline_stage'];
            $this->saveAtsStages($company, $ats);
        }

        if (! empty($validated['application_status'])) {
            $app->update(['status' => $validated['application_status']]);
        }

        return response()->json(['message' => 'Updated', 'application' => $app->fresh()]);
    }

    public function shortlistApplicant(Request $request, int $id)
    {
        $request->merge(['pipeline_stage' => 'shortlisted']);

        return $this->updateApplicantStatus($request, $id);
    }

    public function scheduleInterview(Request $request, int $id)
    {
        $user = $this->companyUser($request);
        $company = $this->companyModel($user);
        $app = $this->applicationsQuery((int) $company->id)->findOrFail($id);

        $validated = Validator::make($request->all(), [
            'scheduled_at' => 'required|date',
            'format' => 'nullable|in:video,phone,in_person',
            'notes' => 'nullable|string',
        ])->validate();

        StudentInterview::create([
            'student_id' => $app->student_id,
            'application_id' => $app->id,
            'company_name' => $company->name,
            'position_title' => $app->internship?->title ?? 'Interview',
            'scheduled_at' => $validated['scheduled_at'],
            'format' => $validated['format'] ?? 'video',
            'notes' => $validated['notes'] ?? '',
        ]);

        $ats = $this->getAtsStages($company);
        $ats[(string) $app->id] = 'interview';
        $this->saveAtsStages($company, $ats);

        return response()->json(['message' => 'Interview scheduled']);
    }

    public function makeOffer(Request $request, int $id)
    {
        $request->merge(['pipeline_stage' => 'offer', 'application_status' => 'pending']);

        return $this->updateApplicantStatus($request, $id);
    }

    public function interns(Request $request)
    {
        $user = $this->companyUser($request);
        $cid = (int) $user->company_id;

        $rows = Application::query()
            ->with(['student.department', 'internship'])
            ->whereHas('internship', fn ($q) => $q->where('company_id', $cid))
            ->where('status', 'approved')
            ->where(function ($q) {
                $q->whereNull('intern_status')
                    ->orWhere('intern_status', '')
                    ->orWhere('intern_status', 'active');
            })
            ->orderByDesc('approved_date')
            ->paginate($request->integer('per_page', 30));

        $rows->getCollection()->transform(function (Application $a) {
            $internship = $a->internship;

            return [
                'application_id' => $a->id,
                'student' => $a->student,
                'internship_title' => $internship?->title,
                'start_date' => optional($internship?->start_date)->toDateString(),
                'end_date' => optional($internship?->end_date)->toDateString(),
                'intern_status' => $a->intern_status,
                'status_label' => $a->intern_status
                    ? $a->intern_status
                    : (now()->between($internship?->start_date ?? now()->subDay(), $internship?->end_date ?? now()->addMonth())
                        ? 'active'
                        : 'completed'),
                'performance_hint' => 'On track — maintain weekly sync for deliverables.',
            ];
        });

        return response()->json($rows);
    }

    public function internHistory(Request $request)
    {
        $user = $this->companyUser($request);
        $cid = (int) $user->company_id;

        $rows = Application::query()
            ->with(['student.department', 'internship'])
            ->whereHas('internship', fn ($q) => $q->where('company_id', $cid))
            ->where('status', 'approved')
            ->whereIn('intern_status', ['completed', 'terminated'])
            ->orderByDesc('intern_ended_at')
            ->orderByDesc('updated_at')
            ->paginate($request->integer('per_page', 40));

        $rows->getCollection()->transform(function (Application $a) {
            $internship = $a->internship;

            return [
                'application_id' => $a->id,
                'student' => $a->student,
                'internship_title' => $internship?->title,
                'start_date' => optional($internship?->start_date)->toDateString(),
                'end_date' => optional($internship?->end_date)->toDateString(),
                'intern_status' => $a->intern_status,
                'intern_started_at' => optional($a->intern_started_at)->toIso8601String(),
                'intern_ended_at' => optional($a->intern_ended_at)->toIso8601String(),
                'intern_end_reason' => $a->intern_end_reason,
            ];
        });

        return response()->json($rows);
    }

    public function internDetail(Request $request, int $id)
    {
        $user = $this->companyUser($request);
        $cid = (int) $user->company_id;

        $app = Application::query()
            ->with(['student.department', 'internship', 'evaluations'])
            ->whereHas('internship', fn ($q) => $q->where('company_id', $cid))
            ->where('status', 'approved')
            ->where('student_id', $id)
            ->firstOrFail();

        return response()->json(['application' => $app]);
    }

    public function evaluateIntern(Request $request, int $id)
    {
        $user = $this->companyUser($request);
        $cid = (int) $user->company_id;

        $app = Application::query()
            ->whereHas('internship', fn ($q) => $q->where('company_id', $cid))
            ->where('status', 'approved')
            ->where('student_id', $id)
            ->firstOrFail();

        $validated = Validator::make($request->all(), [
            'type' => 'required|in:midterm,final',
            'technical_skills' => 'required|integer|min:0|max:100',
            'communication_skills' => 'required|integer|min:0|max:100',
            'problem_solving' => 'required|integer|min:0|max:100',
            'teamwork' => 'required|integer|min:0|max:100',
            'time_management' => 'required|integer|min:0|max:100',
            'strengths' => 'nullable|string',
            'weaknesses' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'evaluation_date' => 'required|date',
        ])->validate();

        $eval = Evaluation::create([
            'technical_skills' => $validated['technical_skills'],
            'communication_skills' => $validated['communication_skills'],
            'problem_solving' => $validated['problem_solving'],
            'teamwork' => $validated['teamwork'],
            'time_management' => $validated['time_management'],
            'strengths' => $validated['strengths'] ?? null,
            'weaknesses' => $validated['weaknesses'] ?? null,
            'recommendations' => $validated['recommendations'] ?? null,
            'type' => $validated['type'],
            'evaluation_date' => $validated['evaluation_date'],
            'student_id' => $app->student_id,
            'application_id' => $app->id,
            'examiner_id' => $user->id,
            'company_id' => $cid,
        ]);
        $eval->calculateOverallPerformance();

        return response()->json(['evaluation' => $eval], 201);
    }

    public function internEvaluations(Request $request, int $id)
    {
        $user = $this->companyUser($request);
        $cid = (int) $user->company_id;

        $app = Application::query()
            ->whereHas('internship', fn ($q) => $q->where('company_id', $cid))
            ->where('student_id', $id)
            ->firstOrFail();

        return response()->json(
            Evaluation::query()
                ->where('application_id', $app->id)
                ->where('company_id', $cid)
                ->orderByDesc('evaluation_date')
                ->get()
        );
    }

    public function messages(Request $request)
    {
        $user = $this->companyUser($request);
        $cid = (int) $user->company_id;
        $studentIds = $this->applicationsQuery($cid)->pluck('student_id')->unique()->filter()->values();

        $paginator = StudentMessage::query()
            ->whereIn('student_id', $studentIds->all())
            ->where('thread_key', 'like', 'company-' . $cid . '-%')
            ->orderByDesc('created_at')
            ->paginate(50);

        $paginator->getCollection()->transform(function (StudentMessage $m) {
            $row = $m->toArray();
            $row['attachment_url'] = $m->attachment_path ? route('company.message.attachment', ['id' => $m->id]) : null;

            return $row;
        });

        return response()->json($paginator);
    }

    public function sendMessage(Request $request)
    {
        $user = $this->companyUser($request);
        $company = $this->companyModel($user);

        $validated = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'subject' => 'nullable|string|max:255',
            'body' => 'required|string|max:8000',
        ])->validate();

        $studentIds = $this->applicationsQuery((int) $company->id)->pluck('student_id')->unique();
        abort_unless($studentIds->contains((int) $validated['student_id']), 403);

        $msg = StudentMessage::create([
            'student_id' => $validated['student_id'],
            'thread_key' => 'company-' . $company->id . '-' . $validated['student_id'],
            'subject' => $validated['subject'] ?? 'Message from ' . $company->name,
            'from_name' => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '') ?: $company->name),
            'from_email' => $user->email ?? $company->contact_email,
            'category' => 'follow_up',
            'sentiment' => 'neutral',
            'body' => $validated['body'],
        ]);

        return response()->json(['message' => $msg], 201);
    }

    public function markMessageRead(Request $request, int $id)
    {
        $user = $this->companyUser($request);
        $company = $this->companyModel($user);
        $cid = (int) $company->id;
        $studentIds = $this->applicationsQuery($cid)->pluck('student_id')->unique();

        $message = StudentMessage::query()->findOrFail($id);
        abort_unless($studentIds->contains((int) $message->student_id), 403);
        abort_unless(str_starts_with((string) $message->thread_key, 'company-' . $cid . '-'), 403);

        $message->update(['read_at' => now()]);

        return response()->json(['message' => 'Marked read.', 'item' => $message->fresh()]);
    }

    public function viewMessageAttachment(Request $request, int $id)
    {
        $user = $this->companyUser($request);
        $company = $this->companyModel($user);
        $cid = (int) $company->id;
        $studentIds = $this->applicationsQuery($cid)->pluck('student_id')->unique();

        $message = StudentMessage::query()->findOrFail($id);
        abort_unless($studentIds->contains((int) $message->student_id), 403);
        abort_unless(str_starts_with((string) $message->thread_key, 'company-' . $cid . '-'), 403);
        abort_unless($message->attachment_path, 404, 'Attachment not found.');
        abort_unless(Storage::disk('public')->exists($message->attachment_path), 404, 'Attachment not found.');

        return Storage::disk('public')->response($message->attachment_path);
    }

    public function schedule(Request $request)
    {
        $user = $this->companyUser($request);
        $studentIds = $this->applicationsQuery((int) $user->company_id)->pluck('student_id')->unique()->filter()->values();

        $meetings = StudentInterview::query()
            ->whereIn('student_id', $studentIds->all())
            ->orderBy('scheduled_at')
            ->paginate(40);

        return response()->json($meetings);
    }

    public function storeSchedule(Request $request)
    {
        $user = $this->companyUser($request);
        $company = $this->companyModel($user);

        $validated = Validator::make($request->all(), [
            'application_id' => 'required|exists:applications,id',
            'scheduled_at' => 'required|date',
            'format' => 'nullable|in:video,phone,in_person',
            'notes' => 'nullable|string',
        ])->validate();

        $app = $this->applicationsQuery((int) $company->id)->findOrFail((int) $validated['application_id']);

        $interview = StudentInterview::create([
            'student_id' => $app->student_id,
            'application_id' => $app->id,
            'company_name' => $company->name,
            'position_title' => $app->internship?->title ?? 'Session',
            'scheduled_at' => $validated['scheduled_at'],
            'format' => $validated['format'] ?? 'video',
            'notes' => $validated['notes'] ?? '',
        ]);

        $ats = $this->getAtsStages($company);
        $ats[(string) $app->id] = 'interview';
        $this->saveAtsStages($company, $ats);

        $notifier = app(ScheduleNotificationService::class);
        $notifier->notifyStudent(
            (int) $app->student_id,
            'scheduled',
            'Interview scheduled',
            sprintf(
                "Your interview has been scheduled.\n\nCompany: %s\nPosition: %s\nWhen: %s\nFormat: %s\n\nNotes: %s",
                (string) $company->name,
                (string) ($app->internship?->title ?? 'Internship'),
                $notifier->formatWhen($interview->scheduled_at),
                (string) ($interview->format ?? 'video'),
                (string) ($interview->notes ?? '—')
            ),
            [
                'event_type' => 'company_interview',
                'event_id' => (int) $interview->id,
                'scheduled_at' => $interview->scheduled_at?->toIso8601String(),
                'company_id' => (int) $company->id,
                'application_id' => (int) $app->id,
            ],
            'company-' . ((int) $company->id) . '-' . ((int) $app->student_id),
            (string) $company->name,
            $user->email ? (string) $user->email : null,
            'urgent',
            'urgent'
        );

        return response()->json(['message' => 'Scheduled'], 201);
    }

    public function updateSchedule(Request $request, int $id)
    {
        $user = $this->companyUser($request);
        $company = $this->companyModel($user);

        $validated = Validator::make($request->all(), [
            'scheduled_at' => 'sometimes|date',
            'format' => 'sometimes|in:video,phone,in_person',
            'notes' => 'sometimes|string|nullable',
            'location' => 'sometimes|string|nullable|max:255',
        ])->validate();

        $interview = StudentInterview::query()->findOrFail($id);
        abort_unless($interview->application_id, 422, 'Only application-linked schedules can be edited here.');

        // Ensure the application belongs to this company.
        $this->applicationsQuery((int) $company->id)->findOrFail((int) $interview->application_id);

        $interview->update($validated);

        // Inform student about update.
        $app = Application::query()->with('internship')->find($interview->application_id);
        if ($app && $app->student_id) {
            $notifier = app(\App\Services\ScheduleNotificationService::class);
            $notifier->notifyStudent(
                (int) $app->student_id,
                'updated',
                'Interview updated',
                sprintf(
                    "Your interview schedule was updated.\n\nCompany: %s\nPosition: %s\nWhen: %s\nFormat: %s\n\nNotes: %s",
                    (string) $company->name,
                    (string) ($app->internship?->title ?? $interview->position_title ?? 'Internship'),
                    $notifier->formatWhen($interview->scheduled_at),
                    (string) ($interview->format ?? 'video'),
                    (string) ($interview->notes ?? '—')
                ),
                [
                    'event_type' => 'company_interview',
                    'event_id' => (int) $interview->id,
                    'scheduled_at' => $interview->scheduled_at?->toIso8601String(),
                    'company_id' => (int) $company->id,
                    'application_id' => (int) $app->id,
                ],
                'company-' . ((int) $company->id) . '-' . ((int) $app->student_id),
                (string) $company->name,
                $user->email ? (string) $user->email : null,
                'follow_up',
                'neutral'
            );
        }

        return response()->json(['message' => 'Schedule updated.', 'item' => $interview->fresh()]);
    }

    public function destroySchedule(Request $request, int $id)
    {
        $user = $this->companyUser($request);
        $company = $this->companyModel($user);

        $interview = StudentInterview::query()->findOrFail($id);
        abort_unless($interview->application_id, 422, 'Only application-linked schedules can be cancelled here.');
        $app = $this->applicationsQuery((int) $company->id)->findOrFail((int) $interview->application_id);

        $studentId = (int) $app->student_id;
        $when = $interview->scheduled_at;
        $interview->delete();

        $notifier = app(\App\Services\ScheduleNotificationService::class);
        $notifier->notifyStudent(
            $studentId,
            'cancelled',
            'Interview cancelled',
            sprintf(
                "An interview was cancelled.\n\nCompany: %s\nPosition: %s\nWas scheduled for: %s\n\nYou will be contacted to reschedule if needed.",
                (string) $company->name,
                (string) ($app->internship?->title ?? 'Internship'),
                $when ? $notifier->formatWhen($when) : '—'
            ),
            [
                'event_type' => 'company_interview',
                'event_id' => (int) $id,
                'scheduled_at' => $when?->toIso8601String(),
                'company_id' => (int) $company->id,
                'application_id' => (int) $app->id,
            ],
            'company-' . ((int) $company->id) . '-' . $studentId,
            (string) $company->name,
            $user->email ? (string) $user->email : null,
            'urgent',
            'urgent'
        );

        return response()->json(['message' => 'Schedule cancelled.']);
    }

    public function analytics(Request $request)
    {
        $user = $this->companyUser($request);
        $cid = (int) $user->company_id;
        $apps = $this->applicationsQuery($cid)->get();

        return response()->json([
            'pipeline_conversion' => [
                'apply_to_shortlist' => $apps->count() ? round(22 / max(1, $apps->count()) * 100, 1) : 0,
                'shortlist_to_offer' => $apps->where('status', 'pending')->count() > 0
                    ? round($apps->where('status', 'approved')->count() / max(1, $apps->where('status', 'pending')->count()) * 100, 1)
                    : 0,
            ],
            'time_to_hire_days' => round((float) (Application::query()
                ->whereIn('internship_id', $this->internshipIds($cid)->all())
                ->where('status', 'approved')
                ->selectRaw('AVG(TIMESTAMPDIFF(DAY, created_at, updated_at)) as d')
                ->value('d') ?: 0), 1),
            'intern_performance' => [
                'avg_overall' => round((float) (Evaluation::query()->where('company_id', $cid)->avg('overall_performance') ?: 78), 1),
            ],
            'diversity_note' => 'Monitor sourcing channels to maintain inclusive funnel balance.',
        ]);
    }

    public function generateReport(Request $request)
    {
        $user = $this->companyUser($request);
        Validator::make($request->all(), [
            'type' => 'required|in:recruitment,interns,roi',
        ])->validate();

        $cid = (int) $user->company_id;
        $apps = $this->applicationsQuery($cid)->get();
        $evals = Evaluation::query()->where('company_id', $cid)->get();

        $payload = [
            'applications' => [
                'total' => $apps->count(),
                'pending' => $apps->where('status', 'pending')->count(),
                'approved' => $apps->where('status', 'approved')->count(),
                'rejected' => $apps->where('status', 'rejected')->count(),
            ],
            'interviews_scheduled' => StudentInterview::query()->where('company_id', $cid)->count(),
            'average_evaluation_score' => round((float) ($evals->avg('overall_performance') ?: 0), 1),
        ];

        $run = DashboardReportRun::query()->create([
            'module' => 'company',
            'owner_user_id' => $user->id,
            'report_type' => (string) $request->input('type'),
            'title' => 'Company ' . ucfirst((string) $request->input('type')) . ' report',
            'status' => 'completed',
            'payload' => $payload,
            'generated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Report generated successfully.',
            'report' => $run,
        ]);
    }

    public function team(Request $request)
    {
        $user = $this->companyUser($request);

        return response()->json(
            User::query()
                ->where('company_id', $user->company_id)
                ->where('role', 'company')
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name', 'email', 'role'])
        );
    }

    public function searchStudents(Request $request)
    {
        $this->companyUser($request);

        $q = User::query()->with('department')->where('role', 'student');

        if ($request->filled('q')) {
            $term = '%' . $request->query('q') . '%';
            $q->where(fn ($qq) => $qq
                ->where('first_name', 'like', $term)
                ->orWhere('last_name', 'like', $term)
                ->orWhere('student_id', 'like', $term));
        }

        if ($request->filled('department_id')) {
            $q->where('department_id', (int) $request->query('department_id'));
        }

        $students = $q->orderBy('first_name')->paginate($request->integer('per_page', 20));

        $students->getCollection()->transform(fn ($s) => [
            'id' => $s->id,
            'name' => trim(($s->first_name ?? '') . ' ' . ($s->last_name ?? '')),
            'student_id' => $s->student_id,
            'department' => $s->department?->name,
            'ai_match' => min(99, 60 + crc32((string) $s->id) % 35),
        ]);

        return response()->json($students);
    }

    public function inviteStudents(Request $request)
    {
        $user = $this->companyUser($request);
        $validated = Validator::make($request->all(), [
            'student_ids' => 'required|array',
            'student_ids.*' => 'integer|exists:users,id',
            'internship_id' => 'nullable|exists:internships,id',
        ])->validate();

        $studentIds = collect($validated['student_ids'] ?? [])->map(fn ($id) => (int) $id)->unique()->values();
        $company = $this->companyModel($user);
        $internshipId = isset($validated['internship_id']) ? (int) $validated['internship_id'] : null;
        $sent = 0;
        foreach ($studentIds as $studentId) {
            $student = User::query()->where('role', 'student')->find($studentId);
            if (!$student) {
                continue;
            }

            Notification::query()->create([
                'user_id' => $studentId,
                'type' => 'company_invitation',
                'title' => 'Company invitation',
                'message' => "{$company->name} invited you to apply for an internship opportunity.",
                'meta' => [
                    'company_id' => $company->id,
                    'company_name' => $company->name,
                    'internship_id' => $internshipId,
                    'student_id' => $studentId,
                ],
            ]);

            StudentMessage::query()->create([
                'student_id' => $studentId,
                'thread_key' => 'company-invite-' . $company->id . '-' . $studentId,
                'subject' => 'New internship invitation',
                'from_name' => (string) $company->name,
                'from_email' => (string) ($user->email ?? ''),
                'category' => 'invitation',
                'sentiment' => 'positive',
                'body' => "You have received an internship invitation from {$company->name}.",
            ]);

            DashboardAuditEvent::query()->create([
                'module' => 'company',
                'action' => 'invite_student',
                'severity' => 'info',
                'actor_user_id' => $user->id,
                'target_user_id' => $studentId,
                'description' => "Company invitation sent to {$student->email}",
                'meta' => [
                    'company_id' => $company->id,
                    'company_name' => $company->name,
                    'internship_id' => $internshipId,
                ],
                'created_at' => now(),
            ]);
            $sent++;
        }

        return response()->json(['message' => 'Invitations sent and audited.', 'sent' => $sent]);
    }

    public function talentPool(Request $request)
    {
        $user = $this->companyUser($request);
        $company = $this->companyModel($user);
        $ids = $company->meta['talent_pool'] ?? [];

        if (! is_array($ids) || empty($ids)) {
            return response()->json(['items' => []]);
        }

        $students = User::query()->with('department')->whereIn('id', $ids)->get();

        return response()->json(['items' => $students]);
    }

    public function addTalentPool(Request $request)
    {
        $user = $this->companyUser($request);
        $company = $this->companyModel($user);

        $validated = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
        ])->validate();

        $meta = $company->meta ?? [];
        $pool = $meta['talent_pool'] ?? [];
        $pool[] = (int) $validated['student_id'];
        $meta['talent_pool'] = array_values(array_unique($pool));
        $company->update(['meta' => $meta]);

        return response()->json(['message' => 'Saved to talent pool.', 'talent_pool' => $meta['talent_pool']]);
    }

    public function settings(Request $request)
    {
        $user = $this->companyUser($request);

        return response()->json([
            'ai_assistance_level' => $user->profile_data['ai_assistance_level'] ?? 'balanced',
            'ai_communication_style' => $user->profile_data['ai_communication_style'] ?? 'balanced',
            'notify_digest' => $user->profile_data['notify_digest'] ?? 'daily',
        ]);
    }

    public function updateSettings(Request $request)
    {
        $user = $this->companyUser($request);

        $validated = Validator::make($request->all(), [
            'ai_assistance_level' => 'sometimes|in:minimal,balanced,maximum',
            'ai_communication_style' => 'sometimes|in:formal,friendly,balanced',
            'notify_digest' => 'sometimes|in:off,daily,weekly',
        ])->validated();

        $profile = $user->profile_data ?? [];
        foreach ($validated as $k => $v) {
            $profile[$k] = $v;
        }
        $user->update(['profile_data' => $profile]);

        return response()->json(['message' => 'Saved.', 'settings' => $profile]);
    }
}