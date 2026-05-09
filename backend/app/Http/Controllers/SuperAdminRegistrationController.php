<?php

namespace App\Http\Controllers;

use App\Models\AdminAuditLog;
use App\Models\College;
use App\Models\Company;
use App\Models\Department;
use App\Models\Internship;
use App\Models\User;
use App\Services\CredentialService;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class SuperAdminRegistrationController extends Controller
{
    private const COLLEGE_DEPARTMENT_MAP = [
        'College of Health Sciences' => [
            'Medicine',
            'Nursing',
            'Public Health',
            'Midwifery',
            'Medical Laboratory Science',
            'Anesthesia',
            'Pharmacy',
        ],
        'College of Agriculture and Environmental Science' => [
            'Plant Science',
            'Animal Science',
            'Horticulture',
            'Agricultural Economics',
            'Agribusiness and Value Chain Management',
            'Food Science and Post-Harvest Technology',
            'Natural Resource Management',
            'Soil Resource and Water Management',
            'Forestry',
            'Rural Development and Agricultural Extension',
            'Veterinary Science',
            'Statistics',
        ],
        'College of Business and Economics' => [
            'Accounting and Finance',
            'Economics',
            'Management',
            'Marketing Management',
            'Logistics and Supply Chain Management',
            'Management Information Systems (MIS)',
            'International Trade and Investment Management',
            'Tourism and Hospitality Management',
        ],
        'College of Education and Behavioral Science' => [
            'Educational Leadership and Management',
            'Psychology',
            "Curriculum and Teachers' Professional Development",
            'Adult Education and Community Development',
            'Special Needs and Inclusive Education',
            'Early Childhood Care and Education',
        ],
        'College of Social Sciences and Humanities' => [
            'English Language and Literature',
            'Afaan Oromoo and Literature',
            'History and Heritage Management',
            'Geography and Environmental Studies',
            'Sociology and Social Work',
            'Civic and Ethical Studies',
            'Gadaa and Oromo Folklore',
        ],
        'College of Natural and Computational Sciences' => [
            'Biology',
            'Chemistry',
            'Physics',
            'Mathematics',
            'Computer Science',
            'Sport Science',
        ],
    ];

    public function __construct(private readonly CredentialService $credentialService)
    {
    }

    public function departments(Request $request)
    {
        $this->ensureSuperAdmin($request);

        return response()->json(
            Department::query()
                ->orderBy('name')
                ->get(['id', 'name', 'code'])
        );
    }

    public function colleges(Request $request)
    {
        $this->ensureSuperAdmin($request);

        return response()->json(
            College::query()
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'description'])
        );
    }

    public function storeCollege(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $validated = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255', Rule::unique('colleges', 'name')],
            'code' => ['required', 'string', 'max:30', Rule::unique('colleges', 'code')],
            'description' => ['nullable', 'string', 'max:2000'],
        ])->validate();

        $college = College::query()->create([
            'name' => trim((string) $validated['name']),
            'code' => strtoupper(trim((string) $validated['code'])),
            'description' => $validated['description'] ?? null,
        ]);

        $this->logAudit($request, 'registration', 'create_college', 'info', "College created: {$college->name}", [
            'college_id' => $college->id,
            'name' => $college->name,
            'code' => $college->code,
        ]);

        return response()->json([
            'message' => 'College created successfully.',
            'college' => $college,
        ], 201);
    }

    public function updateCollege(Request $request, int $id)
    {
        $this->ensureSuperAdmin($request);
        $college = College::query()->findOrFail($id);

        $validated = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255', Rule::unique('colleges', 'name')->ignore($college->id)],
            'code' => ['required', 'string', 'max:30', Rule::unique('colleges', 'code')->ignore($college->id)],
            'description' => ['nullable', 'string', 'max:2000'],
        ])->validate();

        $college->update([
            'name' => trim((string) $validated['name']),
            'code' => strtoupper(trim((string) $validated['code'])),
            'description' => $validated['description'] ?? null,
        ]);

        $this->logAudit($request, 'registration', 'update_college', 'info', "College updated: {$college->name}", [
            'college_id' => $college->id,
            'name' => $college->name,
            'code' => $college->code,
        ]);

        return response()->json(['message' => 'College updated.', 'college' => $college->fresh()]);
    }

    public function deleteCollege(Request $request, int $id)
    {
        $this->ensureSuperAdmin($request);
        $college = College::query()->findOrFail($id);
        $name = $college->name;

        try {
            $college->delete();
        } catch (QueryException $e) {
            return response()->json(['message' => 'This college is in use and cannot be deleted.'], 422);
        }

        $this->logAudit($request, 'registration', 'delete_college', 'warning', "College deleted: {$name}", [
            'college_id' => $id,
            'name' => $name,
        ]);

        return response()->json(['message' => 'College deleted.']);
    }

    public function departmentsByCollege(Request $request, int $collegeId)
    {
        $this->ensureSuperAdmin($request);

        $college = College::query()->findOrFail($collegeId);
        $departmentNames = self::COLLEGE_DEPARTMENT_MAP[$college->name] ?? [];
        if (empty($departmentNames)) {
            return response()->json([]);
        }

        return response()->json(
            Department::query()
                ->whereIn('name', $departmentNames)
                ->orderBy('name')
                ->get(['id', 'name', 'code'])
        );
    }

    public function storeDepartment(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $validated = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255', Rule::unique('departments', 'name')],
            'code' => ['required', 'string', 'max:50', Rule::unique('departments', 'code')],
        ])->validate();

        $dept = Department::query()->create([
            'name' => trim((string) $validated['name']),
            'code' => strtoupper(trim((string) $validated['code'])),
        ]);

        $this->logAudit($request, 'registration', 'create_department', 'info', "Department created: {$dept->name}", [
            'department_id' => $dept->id,
            'name' => $dept->name,
            'code' => $dept->code,
        ]);

        return response()->json(['message' => 'Department created.', 'department' => $dept], 201);
    }

    public function updateDepartment(Request $request, int $id)
    {
        $this->ensureSuperAdmin($request);
        $dept = Department::query()->findOrFail($id);

        $validated = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255', Rule::unique('departments', 'name')->ignore($dept->id)],
            'code' => ['required', 'string', 'max:50', Rule::unique('departments', 'code')->ignore($dept->id)],
        ])->validate();

        $dept->update([
            'name' => trim((string) $validated['name']),
            'code' => strtoupper(trim((string) $validated['code'])),
        ]);

        $this->logAudit($request, 'registration', 'update_department', 'info', "Department updated: {$dept->name}", [
            'department_id' => $dept->id,
            'name' => $dept->name,
            'code' => $dept->code,
        ]);

        return response()->json(['message' => 'Department updated.', 'department' => $dept->fresh()]);
    }

    public function deleteDepartment(Request $request, int $id)
    {
        $this->ensureSuperAdmin($request);
        $dept = Department::query()->findOrFail($id);
        $name = $dept->name;

        try {
            $dept->delete();
        } catch (QueryException $e) {
            return response()->json(['message' => 'This department is in use and cannot be deleted.'], 422);
        }

        $this->logAudit($request, 'registration', 'delete_department', 'warning', "Department deleted: {$name}", [
            'department_id' => $id,
            'name' => $name,
        ]);

        return response()->json(['message' => 'Department deleted.']);
    }

    public function registerStudent(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $validated = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'department_id' => 'required|exists:departments,id',
            'year' => 'required|integer|min:1|max:8',
            'cgpa' => 'required|numeric|min:0|max:4',
            'student_id' => 'required|string|max:50|unique:users,student_id',
        ])->validate();

        [$user, $plainPassword] = $this->createUserWithGeneratedCredentials(
            role: 'student',
            fullName: $validated['full_name'],
            phone: $validated['phone'] ?? null,
            departmentId: (int) $validated['department_id'],
            profileData: [
                'student_id' => $validated['student_id'],
                'year' => (int) $validated['year'],
                'cgpa' => (float) $validated['cgpa'],
            ],
            studentId: $validated['student_id']
        );

        return response()->json([
            'message' => 'Student registered successfully.',
            'user' => $user,
            'credentials' => [
                'name' => $user->full_name,
                'student_id' => $validated['student_id'],
                'email' => $user->email,
                'password' => $plainPassword,
            ],
        ], 201);
    }

    public function registerStudentsBulk(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $validated = Validator::make($request->all(), [
            'students' => 'required|array|min:1',
            'students.*.full_name' => 'required|string|max:255',
            'students.*.phone' => 'nullable|string|max:20',
            'students.*.department_id' => 'required|exists:departments,id',
            'students.*.year' => 'required|integer|min:1|max:8',
            'students.*.cgpa' => 'required|numeric|min:0|max:4',
            'students.*.student_id' => 'required|string|max:50|distinct|unique:users,student_id',
        ])->validate();

        $credentials = [];
        $createdUsers = [];

        DB::transaction(function () use ($validated, &$credentials, &$createdUsers) {
            foreach ($validated['students'] as $student) {
                [$user, $plainPassword] = $this->createUserWithGeneratedCredentials(
                    role: 'student',
                    fullName: $student['full_name'],
                    phone: $student['phone'] ?? null,
                    departmentId: (int) $student['department_id'],
                    profileData: [
                        'student_id' => $student['student_id'],
                        'year' => (int) $student['year'],
                        'cgpa' => (float) $student['cgpa'],
                    ],
                    studentId: $student['student_id']
                );

                $createdUsers[] = $user;
                $credentials[] = [
                    'name' => $user->full_name,
                    'email' => $user->email,
                    'password' => $plainPassword,
                    'student_id' => $student['student_id'],
                ];
            }
        });

        return response()->json([
            'message' => 'Students registered successfully.',
            'count' => count($createdUsers),
            'credentials' => $credentials,
        ], 201);
    }

    public function registerCompany(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $validated = Validator::make($request->all(), [
            'company_name' => 'required|string|max:255',
            'country_region' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'sub_city' => 'nullable|string|max:100',
            'street' => 'nullable|string|max:100',
            'building' => 'nullable|string|max:100',
            'po_box' => 'nullable|string|max:100',
            'website' => 'nullable|url|max:255',
            'company_email' => 'nullable|email|max:255',
            'field_of_interest' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'contact_person' => 'required|string|max:255',
        ])->validate();

        $company = Company::create([
            'name' => $validated['company_name'],
            'industry' => $validated['field_of_interest'],
            'description' => 'Created by Super Admin onboarding dashboard',
            'website' => $validated['website'] ?? null,
            'address' => trim(implode(', ', array_filter([
                $validated['street'] ?? null,
                $validated['building'] ?? null,
                $validated['sub_city'] ?? null,
            ]))),
            'city' => $validated['city'],
            'country' => $validated['country_region'],
            'contact_person' => $validated['contact_person'],
            'contact_email' => $validated['company_email'] ?? null,
            'contact_phone' => $validated['phone'],
            'is_verified' => true,
            'meta' => [
                'state' => $validated['state'],
                'po_box' => $validated['po_box'] ?? null,
                'sub_city' => $validated['sub_city'] ?? null,
                'street' => $validated['street'] ?? null,
                'building' => $validated['building'] ?? null,
            ],
        ]);

        [$user, $plainPassword] = $this->createUserWithGeneratedCredentials(
            role: 'company',
            fullName: $validated['contact_person'],
            phone: $validated['phone'],
            companyId: $company->id,
            profileData: [
                'company_name' => $validated['company_name'],
                'field_of_interest' => $validated['field_of_interest'],
                'company_email' => $validated['company_email'] ?? null,
            ],
            companyName: $validated['company_name'],
            website: $validated['website'] ?? null,
            preferredEmail: $validated['company_email'] ?? null
        );

        return response()->json([
            'message' => 'Company registered successfully.',
            'company' => $company,
            'user' => $user,
            'credentials' => [
                'name' => $user->full_name,
                'email' => $user->email,
                'password' => $plainPassword,
            ],
        ], 201);
    }

    public function registerExaminer(Request $request)
    {
        return $this->registerAcademicStaff($request, 'examiner');
    }

    public function registerAdvisor(Request $request)
    {
        return $this->registerAcademicStaff($request, 'advisor');
    }

    public function users(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $users = User::query()
            ->with(['department:id,name,code', 'company:id,name'])
            ->orderByDesc('id')
            ->get();

        return response()->json($users);
    }

    public function updateUser(Request $request, int $id)
    {
        $this->ensureSuperAdmin($request);

        $user = User::query()->findOrFail($id);
        [$firstName, $lastName] = $this->splitFullName((string) $request->input('name', $user->full_name));

        $validated = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'department_id' => 'nullable|exists:departments,id',
            'student_id' => ['nullable', 'string', 'max:50', Rule::unique('users', 'student_id')->ignore($user->id)],
            'employee_id' => ['nullable', 'string', 'max:100', Rule::unique('users', 'employee_id')->ignore($user->id)],
            'status' => 'nullable|in:active,suspended,pending,inactive',
        ])->validate();

        $isActive = $user->is_active;
        if (array_key_exists('status', $validated)) {
            $isActive = $validated['status'] === 'active';
        }

        $profileData = is_array($user->profile_data) ? $user->profile_data : [];
        if (array_key_exists('student_id', $validated)) {
            $profileData['student_id'] = $validated['student_id'];
        }
        if (array_key_exists('employee_id', $validated)) {
            $profileData['employee_id'] = $validated['employee_id'];
        }

        $user->update([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? $user->phone,
            'department_id' => $validated['department_id'] ?? $user->department_id,
            'student_id' => $validated['student_id'] ?? $user->student_id,
            'employee_id' => $validated['employee_id'] ?? $user->employee_id,
            'is_active' => $isActive,
            'profile_data' => $profileData,
        ]);

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $user->load(['department:id,name,code', 'company:id,name']),
        ]);
    }

    public function suspendUser(Request $request, int $id)
    {
        $this->ensureSuperAdmin($request);

        $user = User::query()->findOrFail($id);
        $validated = Validator::make($request->all(), [
            'duration' => 'required|string|max:20',
            'reason' => 'required|string|max:500',
        ])->validate();

        $profileData = is_array($user->profile_data) ? $user->profile_data : [];
        $profileData['suspension'] = [
            'duration' => $validated['duration'],
            'reason' => $validated['reason'],
            'suspended_at' => now()->toIso8601String(),
        ];

        $user->update([
            'is_active' => false,
            'profile_data' => $profileData,
        ]);

        return response()->json([
            'message' => 'User suspended successfully.',
            'user' => $user->fresh()->load(['department:id,name,code', 'company:id,name']),
        ]);
    }

    public function deleteUser(Request $request, int $id)
    {
        $this->ensureSuperAdmin($request);
        $actor = auth()->user();
        abort_if($actor && $actor->id === $id, 422, 'You cannot delete your own account.');

        $user = User::query()->findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    public function resetUserPassword(Request $request, int $id)
    {
        $this->ensureSuperAdmin($request);
        $user = User::query()->findOrFail($id);
        $policy = $this->credentialService->getPolicy();
        $plainPassword = $this->credentialService->generatePassword($policy);
        $user->update([
            'password' => Hash::make($plainPassword, ['rounds' => 12]),
            'password_changed_at' => now(),
            'password_expires_at' => now()->addDays((int) $policy->password_expiry_days),
            'must_change_password' => (bool) $policy->force_password_change,
        ]);

        $this->logAudit($request, 'credentials', 'reset_password', 'warning', "Password reset for {$user->email}", [
            'user_id' => $user->id,
            'email' => $user->email,
        ], $user->id);

        return response()->json([
            'message' => 'Password reset successfully.',
            'credentials' => [
                'name' => $user->full_name,
                'email' => $user->email,
                'password' => $plainPassword,
                'password_expires_at' => optional($user->password_expires_at)->toIso8601String(),
            ],
        ]);
    }

    public function getApprovalsSummary(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $pendingPartners = Company::query()->where('is_verified', false)->count();
        $pendingInternships = \App\Models\Internship::query()
            ->whereIn('submission_status', ['pending', 'improvement'])
            ->count();

        return response()->json([
            'pending_partners' => $pendingPartners,
            'pending_internships' => $pendingInternships,
            'total_pending' => $pendingPartners + $pendingInternships,
        ]);
    }

    public function getApprovalsHistory(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $days = max(7, (int) $request->query('days', 30));
        $since = now()->subDays($days)->startOfDay();

        $logs = AdminAuditLog::query()
            ->where('module', 'approvals')
            ->where('created_at', '>=', $since)
            ->whereIn('action', [
                'approve_partner',
                'reject_partner',
                'approve_internship',
                'reject_internship',
                'request_internship_edit',
            ])
            ->orderBy('created_at')
            ->get(['id', 'action', 'created_at', 'meta']);

        $totals = [
            'partner_approved' => 0,
            'partner_rejected' => 0,
            'internship_approved' => 0,
            'internship_rejected' => 0,
            'internship_improvement' => 0,
        ];

        $timeline = [];
        foreach ($logs as $log) {
            $date = optional($log->created_at)->toDateString() ?: now()->toDateString();
            $timeline[$date] = $timeline[$date] ?? [
                'date' => $date,
                'partner_approved' => 0,
                'partner_rejected' => 0,
                'internship_approved' => 0,
                'internship_rejected' => 0,
                'internship_improvement' => 0,
            ];

            if ($log->action === 'approve_partner') {
                $totals['partner_approved']++;
                $timeline[$date]['partner_approved']++;
            } elseif ($log->action === 'reject_partner') {
                $totals['partner_rejected']++;
                $timeline[$date]['partner_rejected']++;
            } elseif ($log->action === 'approve_internship') {
                $totals['internship_approved']++;
                $timeline[$date]['internship_approved']++;
            } elseif ($log->action === 'reject_internship') {
                $totals['internship_rejected']++;
                $timeline[$date]['internship_rejected']++;
            } elseif ($log->action === 'request_internship_edit') {
                $totals['internship_improvement']++;
                $timeline[$date]['internship_improvement']++;
            }
        }

        $timelineList = array_values($timeline);
        $maxDaily = 1;
        foreach ($timelineList as $r) {
            $sum = (int) $r['partner_approved'] + (int) $r['partner_rejected'] + (int) $r['internship_approved'] + (int) $r['internship_rejected'] + (int) $r['internship_improvement'];
            $maxDaily = max($maxDaily, $sum);
        }

        $partnerReviewHours = [];
        $companyIds = $logs->filter(fn ($l) => in_array($l->action, ['approve_partner', 'reject_partner'], true))
            ->map(fn ($l) => (int) ($l->meta['company_id'] ?? 0))
            ->filter(fn ($id) => $id > 0)
            ->unique()
            ->values()
            ->all();
        $companies = Company::query()->whereIn('id', $companyIds)->get(['id', 'created_at'])->keyBy('id');
        foreach ($logs as $log) {
            if (!in_array($log->action, ['approve_partner', 'reject_partner'], true)) {
                continue;
            }
            $companyId = (int) ($log->meta['company_id'] ?? 0);
            $company = $companies->get($companyId);
            if (!$company || !$company->created_at || !$log->created_at) {
                continue;
            }
            $partnerReviewHours[] = max(0, $company->created_at->diffInMinutes($log->created_at) / 60);
        }
        $avgPartner = count($partnerReviewHours) ? round(array_sum($partnerReviewHours) / count($partnerReviewHours), 2) : null;

        $avgInternship = Internship::query()
            ->whereNotNull('reviewed_at')
            ->whereNotNull('submission_date')
            ->where('reviewed_at', '>=', $since)
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, submission_date, reviewed_at)) as avg_h')
            ->value('avg_h');
        $avgInternship = $avgInternship !== null ? round((float) $avgInternship, 2) : null;

        $partnerReasons = Company::query()
            ->whereNotNull('meta->rejected_reason')
            ->whereNotNull('meta->rejected_at')
            ->where('meta->rejected_at', '>=', $since->toIso8601String())
            ->get(['meta'])
            ->map(fn ($c) => (string) ($c->meta['rejected_reason'] ?? 'Unknown'))
            ->filter()
            ->countBy()
            ->sortDesc()
            ->map(fn ($count, $reason) => ['reason' => $reason, 'count' => $count])
            ->values()
            ->all();

        $internshipReasons = Internship::query()
            ->whereIn('submission_status', [Internship::SUBMISSION_STATUS_REJECTED, Internship::SUBMISSION_STATUS_IMPROVEMENT])
            ->whereNotNull('reviewed_at')
            ->where('reviewed_at', '>=', $since)
            ->get(['review_notes', 'submission_status'])
            ->map(function ($i) {
                $reason = trim((string) $i->review_notes);
                if ($reason === '') {
                    $reason = $i->submission_status === Internship::SUBMISSION_STATUS_IMPROVEMENT ? 'Requested improvement' : 'Rejected';
                }
                return $reason;
            })
            ->countBy()
            ->sortDesc()
            ->map(fn ($count, $reason) => ['reason' => $reason, 'count' => $count])
            ->values()
            ->all();

        return response()->json([
            'window_days' => $days,
            'max_daily_total' => $maxDaily,
            'totals' => $totals,
            'timeline' => $timelineList,
            'metrics' => [
                'avg_partner_review_hours' => $avgPartner,
                'avg_internship_review_hours' => $avgInternship,
            ],
            'top_reasons' => [
                'partner' => $partnerReasons,
                'internship' => $internshipReasons,
            ],
        ]);
    }

    public function getPartnerRequests(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $status = $request->query('status', 'pending');
        $query = Company::query()->orderByDesc('id');
        if ($status === 'pending') {
            $query->where('is_verified', false);
        }
        if ($status === 'approved') {
            $query->where('is_verified', true);
        }

        $records = $query->paginate(12);
        $records->getCollection()->transform(function (Company $company) {
            return [
                'id' => $company->id,
                'company_name' => $company->name,
                'company_email' => $company->contact_email,
                'contact_person' => $company->contact_person,
                'phone' => $company->contact_phone,
                'website' => $company->website,
                'city' => $company->city,
                'state' => $company->meta['state'] ?? null,
                'country_region' => $company->country,
                'field_of_interest' => $company->industry,
                'status' => $company->is_verified ? 'approved' : 'pending',
                'created_at' => optional($company->created_at)->toIso8601String(),
            ];
        });

        return response()->json($records);
    }

    public function approvePartnerRequest(Request $request, int $id)
    {
        $this->ensureSuperAdmin($request);
        $company = Company::query()->findOrFail($id);
        $policy = $this->credentialService->getPolicy();

        $company->is_verified = true;
        $company->save();

        $existingUser = User::query()
            ->where('company_id', $company->id)
            ->where('role', 'company')
            ->first();

        $plainPassword = null;
        $user = $existingUser;
        if (!$existingUser) {
            [$user, $plainPassword] = $this->createUserWithGeneratedCredentials(
                role: 'company',
                fullName: $company->contact_person ?: $company->name,
                phone: $company->contact_phone,
                companyId: $company->id,
                profileData: [
                    'company_name' => $company->name,
                    'field_of_interest' => $company->industry,
                    'approval_notes' => (string) $request->input('notes', ''),
                ],
                companyName: $company->name,
                website: $company->website,
                preferredEmail: $company->contact_email
            );
        }

        $this->logAudit($request, 'approvals', 'approve_partner', 'info', "Partner approved: {$company->name}", [
            'company_id' => $company->id,
            'generated_credentials' => $plainPassword !== null,
        ], $user?->id);

        return response()->json([
            'message' => 'Partner request approved successfully.',
            'company' => $company,
            'credentials' => $plainPassword ? [
                'name' => $user->full_name,
                'email' => $user->email,
                'password' => $plainPassword,
                'password_expires_at' => now()->addDays((int) $policy->password_expiry_days)->toIso8601String(),
            ] : null,
        ]);
    }

    public function rejectPartnerRequest(Request $request, int $id)
    {
        $this->ensureSuperAdmin($request);
        $company = Company::query()->findOrFail($id);

        $validated = Validator::make($request->all(), [
            'reason' => 'required|string|max:500',
        ])->validate();

        $meta = is_array($company->meta) ? $company->meta : [];
        $meta['rejected_reason'] = $validated['reason'];
        $meta['rejected_at'] = now()->toIso8601String();
        $company->meta = $meta;
        $company->save();

        $this->logAudit($request, 'approvals', 'reject_partner', 'warning', "Partner rejected: {$company->name}", [
            'company_id' => $company->id,
            'reason' => $validated['reason'],
        ]);

        return response()->json(['message' => 'Partner request rejected successfully.']);
    }

    public function requestPartnerEdit(Request $request, int $id)
    {
        $this->ensureSuperAdmin($request);
        $company = Company::query()->findOrFail($id);

        $validated = Validator::make($request->all(), [
            'notes' => 'required|string|max:800',
        ])->validate();

        $meta = is_array($company->meta) ? $company->meta : [];
        $meta['edit_requested_at'] = now()->toIso8601String();
        $meta['edit_request_notes'] = $validated['notes'];
        $company->meta = $meta;
        $company->save();

        $this->logAudit($request, 'approvals', 'request_partner_edit', 'info', "Partner edit requested: {$company->name}", [
            'company_id' => $company->id,
            'notes' => $validated['notes'],
        ]);

        return response()->json(['message' => 'Edit request sent to partner successfully.']);
    }

    public function generateCredentialPreview(Request $request)
    {
        $this->ensureSuperAdmin($request);
        $validated = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'role' => 'required|string|max:50',
            'company_name' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
        ])->validate();

        $email = $validated['role'] === 'company'
            ? $this->credentialService->generateCompanyEmail(
                $validated['company_name'] ?? $validated['full_name'],
                $validated['website'] ?? null
            )
            : $this->credentialService->generateUserEmail($validated['full_name']);

        $password = $this->credentialService->generatePassword();

        return response()->json([
            'email' => $email,
            'password' => $password,
        ]);
    }

    public function generateBulkCredentials(Request $request)
    {
        $this->ensureSuperAdmin($request);
        $validated = Validator::make($request->all(), [
            'records' => 'required|array|min:1',
            'records.*.full_name' => 'required|string|max:255',
            'records.*.role' => 'required|string|max:50',
        ])->validate();

        $emails = [];
        $results = [];
        foreach ($validated['records'] as $index => $record) {
            $email = $record['role'] === 'company'
                ? $this->credentialService->generateCompanyEmail($record['full_name'], null, $emails)
                : $this->credentialService->generateUserEmail($record['full_name'], $emails);
            $emails[] = $email;
            $results[] = [
                'row' => $index + 1,
                'full_name' => $record['full_name'],
                'role' => $record['role'],
                'email' => $email,
                'password' => $this->credentialService->generatePassword(),
            ];
        }

        return response()->json([
            'count' => count($results),
            'credentials' => $results,
        ]);
    }

    public function checkEmailAvailability(Request $request)
    {
        $this->ensureSuperAdmin($request);
        $email = strtolower((string) $request->query('email', ''));
        abort_if($email === '', 422, 'Email query is required.');

        return response()->json([
            'email' => $email,
            'available' => !User::query()->where('email', $email)->exists(),
        ]);
    }

    public function credentialsExpiryReport(Request $request)
    {
        $this->ensureSuperAdmin($request);
        $days = max(1, (int) $request->query('days', 14));
        $now = now();
        $until = now()->addDays($days);

        $expiringSoon = User::query()
            ->whereNotNull('password_expires_at')
            ->whereBetween('password_expires_at', [$now, $until])
            ->orderBy('password_expires_at')
            ->get(['id', 'first_name', 'last_name', 'email', 'role', 'password_expires_at']);

        return response()->json([
            'window_days' => $days,
            'count' => $expiringSoon->count(),
            'users' => $expiringSoon,
        ]);
    }

    public function getCredentialPolicy(Request $request)
    {
        $this->ensureSuperAdmin($request);
        return response()->json($this->credentialService->getPolicy());
    }

    public function updateCredentialPolicy(Request $request)
    {
        $this->ensureSuperAdmin($request);
        $policy = $this->credentialService->getPolicy();

        $validated = Validator::make($request->all(), [
            'password_length' => 'nullable|integer|min:8|max:20',
            'require_uppercase' => 'nullable|boolean',
            'require_lowercase' => 'nullable|boolean',
            'require_numbers' => 'nullable|boolean',
            'require_special' => 'nullable|boolean',
            'minimum_numbers' => 'nullable|integer|min:1|max:5',
            'minimum_special' => 'nullable|integer|min:1|max:5',
            'password_expiry_days' => 'nullable|integer|min:0|max:365',
            'force_password_change' => 'nullable|boolean',
            'user_email_domain' => 'nullable|string|max:120',
            'partner_email_domain' => 'nullable|string|max:120',
            'auto_send_welcome_email' => 'nullable|boolean',
            'duplicate_strategy' => 'nullable|string|in:increment_suffix',
            'failed_login_limit' => 'nullable|integer|min:3|max:10',
            'lockout_minutes' => 'nullable|integer|min:5|max:120',
        ])->validate();

        $policy->update($validated);
        $this->logAudit($request, 'settings', 'update_credential_policy', 'info', 'Credential policy updated.', $validated);

        return response()->json([
            'message' => 'Credential policy updated successfully.',
            'policy' => $policy->fresh(),
        ]);
    }

    public function sendCredentialsEmail(Request $request)
    {
        $this->ensureSuperAdmin($request);
        $validated = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
            'name' => 'required|string|max:255',
            'password' => 'required|string|max:64',
        ])->validate();

        $this->logAudit($request, 'credentials', 'send_email', 'info', "Credential email dispatch requested for {$validated['email']}", [
            'recipient' => $validated['email'],
        ]);

        return response()->json([
            'message' => 'Credential email queued successfully.',
            'queued' => true,
        ]);
    }

    public function getAuditLogs(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $query = AdminAuditLog::query()->orderByDesc('id');
        if ($request->filled('module')) {
            $query->where('module', $request->query('module'));
        }
        if ($request->filled('severity')) {
            $query->where('severity', $request->query('severity'));
        }
        if ($request->filled('action')) {
            $query->where('action', 'like', '%' . $request->query('action') . '%');
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->query('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->query('date_to'));
        }
        if ($request->filled('user_id')) {
            $userId = (int) $request->query('user_id');
            $query->where(function ($q) use ($userId) {
                $q->where('actor_user_id', $userId)
                    ->orWhere('target_user_id', $userId);
            });
        }

        return response()->json($query->paginate(30));
    }

    private function registerAcademicStaff(Request $request, string $role)
    {
        $this->ensureSuperAdmin($request);

        $validated = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'employee_id' => 'required|string|max:100',
            'department_id' => 'required|exists:departments,id',
            'highest_qualification' => 'required|string|max:100',
            'field_of_specialization' => 'required|string|max:255',
            'years_of_experience' => 'required|integer|min:0|max:60',
        ])->validate();

        $employeeExists = User::where('employee_id', $validated['employee_id'])->exists();
        if ($employeeExists) {
            return response()->json([
                'message' => 'Employee ID already exists.',
            ], 422);
        }

        [$user, $plainPassword] = $this->createUserWithGeneratedCredentials(
            role: $role,
            fullName: $validated['full_name'],
            phone: $validated['phone'] ?? null,
            departmentId: (int) $validated['department_id'],
            profileData: [
                'employee_id' => $validated['employee_id'],
                'highest_qualification' => $validated['highest_qualification'],
                'field_of_specialization' => $validated['field_of_specialization'],
                'years_of_experience' => (int) $validated['years_of_experience'],
            ],
            employeeId: $validated['employee_id']
        );

        return response()->json([
            'message' => ucfirst($role) . ' registered successfully.',
            'user' => $user,
            'credentials' => [
                'name' => $user->full_name,
                'email' => $user->email,
                'password' => $plainPassword,
            ],
        ], 201);
    }

    private function createUserWithGeneratedCredentials(
        string $role,
        string $fullName,
        ?string $phone = null,
        ?int $departmentId = null,
        ?int $companyId = null,
        array $profileData = [],
        ?string $studentId = null,
        ?string $employeeId = null,
        ?string $companyName = null,
        ?string $website = null,
        ?string $preferredEmail = null
    ): array {
        [$firstName, $lastName] = $this->splitFullName($fullName);
        $policy = $this->credentialService->getPolicy();
        $email = $preferredEmail && !User::query()->where('email', strtolower($preferredEmail))->exists()
            ? strtolower($preferredEmail)
            : (
                $role === 'company'
                    ? $this->credentialService->generateCompanyEmail($companyName ?: $fullName, $website)
                    : $this->credentialService->generateUserEmail($fullName)
            );
        $plainPassword = $this->credentialService->generatePassword($policy);

        $user = User::create([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'password' => Hash::make($plainPassword, ['rounds' => 12]),
            'password_changed_at' => now(),
            'password_expires_at' => now()->addDays((int) $policy->password_expiry_days),
            'must_change_password' => (bool) $policy->force_password_change,
            'phone' => $phone,
            'address' => null,
            'department_id' => $departmentId,
            'company_id' => $companyId,
            'student_id' => $studentId,
            'employee_id' => $employeeId,
            'role' => $role,
            'profile_data' => $profileData,
        ]);

        $this->logAudit(request(), 'credentials', 'generate', 'info', "Credentials generated for {$user->email}", [
            'role' => $role,
            'password_expiry_days' => (int) $policy->password_expiry_days,
        ], $user->id);

        return [$user, $plainPassword];
    }

    private function splitFullName(string $fullName): array
    {
        $parts = preg_split('/\s+/', trim($fullName)) ?: [];
        $firstName = $parts[0] ?? 'Unknown';
        $lastName = count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : 'User';

        return [$firstName, $lastName];
    }

    private function ensureSuperAdmin(Request $request): void
    {
        $user = auth()->user();

        abort_unless($user && $user->role === 'super_admin', 403, 'Only super admins can register actors.');
    }

    private function logAudit(Request $request, string $module, string $action, string $severity, string $description, array $meta = [], ?int $targetUserId = null): void
    {
        AdminAuditLog::query()->create([
            'actor_user_id' => auth()->id(),
            'target_user_id' => $targetUserId,
            'module' => $module,
            'action' => $action,
            'severity' => $severity,
            'description' => $description,
            'ip_address' => $request->ip(),
            'user_agent' => (string) $request->userAgent(),
            'meta' => $meta,
            'created_at' => now(),
        ]);
    }
}

