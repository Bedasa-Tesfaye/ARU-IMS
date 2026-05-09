<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Company;
use App\Models\Department;
use App\Models\Internship;
use App\Models\StudentInterview;
use App\Models\User;
use App\Services\InternshipCompositeGradeService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SuperAdminReportController extends Controller
{
    public function companyEngagement(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $filters = [
            'college_id' => $request->query('college_id'),
            'department_id' => $request->query('department_id'),
            'company_id' => $request->query('company_id'),
            'date_from' => $request->query('date_from'),
            'date_to' => $request->query('date_to'),
        ];

        $base = $this->internshipQuery($request);

        $ranked = (clone $base)
            ->select('internships.company_id', DB::raw('COUNT(*) as posting_count'))
            ->whereNotNull('internships.company_id')
            ->groupBy('internships.company_id')
            ->orderByDesc('posting_count')
            ->get()
            ->map(function ($row) {
                $company = Company::query()->find($row->company_id);

                return [
                    'company_id' => (int) $row->company_id,
                    'company_name' => $company?->name ?? 'Unknown',
                    'industry' => $company?->industry,
                    'posting_count' => (int) $row->posting_count,
                ];
            });

        $monthly = (clone $base)
            ->select(DB::raw("DATE_FORMAT(internships.created_at, '%Y-%m') as month"), DB::raw('COUNT(*) as count'))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($r) => ['month' => $r->month, 'count' => (int) $r->count]);

        return response()->json([
            'filters' => $filters,
            'companiesRanked' => $ranked,
            'monthlyTrend' => $monthly,
            'totals' => [
                'internships' => (clone $base)->count(),
                'companies' => (int) ((clone $base)->whereNotNull('company_id')->selectRaw('COUNT(DISTINCT company_id) as c')->value('c') ?? 0),
            ],
            'filterOptions' => [
                'departments' => Department::query()->orderBy('name')->get(['id', 'name']),
                'companies' => Company::query()->orderBy('name')->get(['id', 'name']),
            ],
        ]);
    }

    public function dashboard(Request $request)
    {
        $this->ensureSuperAdmin($request);

        return response()->json($this->buildDashboardPayload($request));
    }

    /**
     * Company internship evaluations (mid-term + final) combined with examiner campus evaluation.
     */
    public function internshipCompositeGrades(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $service = new InternshipCompositeGradeService();

        $query = Application::query()
            ->with(['student.department', 'internship.company'])
            ->where('status', 'approved')
            ->whereHas('internship');

        if ($request->filled('search')) {
            $term = '%' . str_replace(['%', '_'], ['\\%', '\\_'], (string) $request->query('search')) . '%';
            $query->whereHas('student', function ($q) use ($term) {
                $q->where('first_name', 'like', $term)
                    ->orWhere('last_name', 'like', $term)
                    ->orWhere('student_id', 'like', $term)
                    ->orWhere('email', 'like', $term);
            });
        }

        if ($request->boolean('complete_only')) {
            $query
                ->whereExists(function ($sub) {
                    $sub->selectRaw('1')
                        ->from('evaluations')
                        ->whereColumn('evaluations.application_id', 'applications.id')
                        ->whereNotNull('evaluations.company_id')
                        ->where('evaluations.type', 'midterm');
                })
                ->whereExists(function ($sub) {
                    $sub->selectRaw('1')
                        ->from('evaluations')
                        ->whereColumn('evaluations.application_id', 'applications.id')
                        ->whereNotNull('evaluations.company_id')
                        ->where('evaluations.type', 'final');
                })
                ->whereExists(function ($sub) {
                    $sub->selectRaw('1')
                        ->from('examiner_report_evaluations')
                        ->whereColumn('examiner_report_evaluations.application_id', 'applications.id')
                        ->where('examiner_report_evaluations.report_type', InternshipCompositeGradeService::CAMPUS_REPORT_TYPE)
                        ->whereIn('examiner_report_evaluations.status', ['evaluated', 'published']);
                });
        }

        $paginator = $query
            ->orderByDesc('updated_at')
            ->paginate($request->integer('per_page', 25));

        $paginator->getCollection()->transform(function (Application $app) use ($service) {
            return $service->breakdownForApplication($app);
        });

        $summary = [
            'weights' => [
                'company_internship' => InternshipCompositeGradeService::WEIGHT_COMPANY,
                'campus_examiner' => InternshipCompositeGradeService::WEIGHT_CAMPUS,
            ],
            'campus_report_type' => InternshipCompositeGradeService::CAMPUS_REPORT_TYPE,
            'note' => 'Combined score is shown only when the company has submitted both mid-internship and final evaluations (averaged 50/50) and an examiner campus evaluation exists.',
        ];

        return response()->json([
            'summary' => $summary,
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function export(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $validated = $request->validate([
            'type' => 'required|string|in:company_engagement,user_registration,approval_pipeline,assignment_report,student_distribution,examiner_workload,placement_statistics',
            'format' => 'required|string|in:pdf,excel,csv',
            'filters' => 'nullable|array',
            'filters.college_id' => 'nullable|string',
            'filters.college_name' => 'nullable|string',
            'filters.department_id' => 'nullable|integer',
            'filters.company_id' => 'nullable|integer',
            'filters.date_from' => 'nullable|date',
            'filters.date_to' => 'nullable|date',
            'filters.role' => 'nullable|string',
            'filters.user_status' => 'nullable|string|in:all,active,inactive',
            'filters.student_year' => 'nullable|string',
            'filters.approval_type' => 'nullable|string|in:all,partner,internship',
            'options' => 'nullable|array',
            'options.includeCharts' => 'nullable|boolean',
            'options.includeTables' => 'nullable|boolean',
            'options.includeSummary' => 'nullable|boolean',
            'options.includeAIInsights' => 'nullable|boolean',
            'options.includeCover' => 'nullable|boolean',
            'options.pageSize' => 'nullable|string|in:A4,Letter,Legal',
            'options.orientation' => 'nullable|string|in:portrait,landscape',
        ]);

        $type = $validated['type'];
        $format = $validated['format'];
        $filters = $validated['filters'] ?? [];
        $options = array_merge([
            'includeCharts' => true,
            'includeTables' => true,
            'includeSummary' => true,
            'includeAIInsights' => false,
            'includeCover' => true,
            'pageSize' => 'A4',
            'orientation' => 'portrait',
        ], $validated['options'] ?? []);

        $stamp = now()->format('Y-m-d');
        $baseName = "{$type}_{$stamp}";

        if ($type === 'company_engagement') {
            $request->merge([
                'company_id' => $filters['company_id'] ?? null,
                'department_id' => $filters['department_id'] ?? null,
                'date_from' => $filters['date_from'] ?? null,
                'date_to' => $filters['date_to'] ?? null,
            ]);
            $base = $this->internshipQuery($request);

            $rows = (clone $base)
                ->join('companies', 'internships.company_id', '=', 'companies.id')
                ->select(
                    'companies.name as company_name',
                    'companies.industry',
                    DB::raw('COUNT(internships.id) as postings')
                )
                ->groupBy('companies.id', 'companies.name', 'companies.industry')
                ->orderByDesc('postings')
                ->get();

            $monthly = (clone $base)
                ->select(DB::raw("DATE_FORMAT(internships.created_at, '%Y-%m') as month"), DB::raw('COUNT(*) as count'))
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            if ($format === 'csv') {
                $csv = $this->buildCsv($type, $rows, $monthly, $options);

                return response($csv, 200, [
                    'Content-Type' => 'text/csv; charset=UTF-8',
                    'Content-Disposition' => "attachment; filename=\"{$baseName}.csv\"",
                ]);
            }

            if ($format === 'excel') {
                $xml = $this->buildSpreadsheetMl($type, $rows, $monthly, $options);

                return response($xml, 200, [
                    'Content-Type' => 'application/vnd.ms-excel',
                    'Content-Disposition' => "attachment; filename=\"{$baseName}.xls\"",
                ]);
            }

            $html = view('admin.report-export', [
                'title' => 'Company engagement report',
                'type' => $type,
                'rows' => $rows,
                'monthly' => $monthly,
                'options' => $options,
                'filters' => $filters,
                'generatedAt' => now()->toDateTimeString(),
            ])->render();

            return response($html, 200, [
                'Content-Type' => 'text/html; charset=UTF-8',
                'Content-Disposition' => "attachment; filename=\"{$baseName}.html\"",
            ]);
        }

        $fake = Request::create('/admin/reports/dashboard', 'GET', array_merge(
            [
                'date_from' => $filters['date_from'] ?? null,
                'date_to' => $filters['date_to'] ?? null,
                'role' => $filters['role'] ?? null,
                'department_id' => $filters['department_id'] ?? null,
                'college_name' => $filters['college_name'] ?? null,
                'user_status' => $filters['user_status'] ?? 'all',
                'student_year' => $filters['student_year'] ?? null,
                'company_id' => $filters['company_id'] ?? null,
                'approval_type' => $filters['approval_type'] ?? 'all',
            ],
            $request->query()
        ));

        $payload = $this->buildDashboardPayload($fake);
        $lines = $this->genericExportLines($type, $payload, $options);

        if ($format === 'csv') {
            $csv = "\u{FEFF}" . implode("\n", $lines);

            return response($csv, 200, [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => "attachment; filename=\"{$baseName}.csv\"",
            ]);
        }

        if ($format === 'excel') {
            $esc = fn ($s) => htmlspecialchars((string) $s, ENT_XML1 | ENT_QUOTES, 'UTF-8');
            $rowsXml = '';
            foreach ($lines as $line) {
                $rowsXml .= '<Row><Cell><Data ss:Type="String">' . $esc($line) . '</Data></Cell></Row>';
            }
            $xml = '<?xml version="1.0"?>'
                . '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">'
                . '<Worksheet ss:Name="Report"><Table>'
                . '<Row><Cell><Data ss:Type="String">Line</Data></Cell></Row>'
                . $rowsXml
                . '</Table></Worksheet></Workbook>';

            return response($xml, 200, [
                'Content-Type' => 'application/vnd.ms-excel',
                'Content-Disposition' => "attachment; filename=\"{$baseName}.xls\"",
            ]);
        }

        $html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Report</title></head><body><pre>'
            . htmlspecialchars(implode("\n", $lines), ENT_QUOTES, 'UTF-8')
            . '</pre></body></html>';

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$baseName}.html\"",
        ]);
    }

    private function buildDashboardPayload(Request $request): array
    {
        $from = $request->query('date_from', Carbon::now()->subMonths(6)->toDateString());
        $to = $request->query('date_to', Carbon::now()->toDateString());
        $role = $request->query('role');
        $departmentId = $request->query('department_id') ? (int) $request->query('department_id') : null;
        $collegeName = $request->query('college_name');
        $userStatus = $request->query('user_status', 'all');
        $studentYear = $request->query('student_year');
        $companyId = $request->query('company_id') ? (int) $request->query('company_id') : null;
        $approvalType = $request->query('approval_type', 'all');

        $deptIdsCollege = $this->departmentIdsForCollegeName($collegeName);
        $start = Carbon::parse($from)->startOfDay();
        $end = Carbon::parse($to)->endOfDay();

        $userBase = User::query()
            ->whereBetween('created_at', [$start, $end])
            ->when($role, fn ($q) => $q->where('role', $role))
            ->when($departmentId, fn ($q) => $q->where('department_id', $departmentId))
            ->when($userStatus === 'active', fn ($q) => $q->where('is_active', true))
            ->when($userStatus === 'inactive', fn ($q) => $q->where('is_active', false))
            ->when($collegeName && $deptIdsCollege !== [], fn ($q) => $q->whereIn('department_id', $deptIdsCollege));

        $totalNewUsers = (clone $userBase)->count();
        $byRole = (clone $userBase)
            ->select('role', DB::raw('COUNT(*) as c'))
            ->groupBy('role')
            ->pluck('c', 'role')
            ->toArray();

        $trend = (clone $userBase)
            ->select(DB::raw("DATE_FORMAT(created_at, '%Y-%m') as m"), DB::raw('COUNT(*) as c'))
            ->groupBy('m')
            ->orderBy('m')
            ->get()
            ->map(fn ($r) => ['month' => $r->m, 'count' => (int) $r->c]);

        $days = max(1, $start->diffInDays($end) + 1);
        $prevEnd = $start->copy()->subDay();
        $prevStart = $prevEnd->copy()->subDays($days - 1);
        $prevCount = User::query()
            ->whereBetween('created_at', [$prevStart, $prevEnd])
            ->when($role, fn ($q) => $q->where('role', $role))
            ->when($departmentId, fn ($q) => $q->where('department_id', $departmentId))
            ->when($userStatus === 'active', fn ($q) => $q->where('is_active', true))
            ->when($userStatus === 'inactive', fn ($q) => $q->where('is_active', false))
            ->when($collegeName && $deptIdsCollege !== [], fn ($q) => $q->whereIn('department_id', $deptIdsCollege))
            ->count();
        $growthPercent = $prevCount > 0 ? round(($totalNewUsers - $prevCount) / $prevCount * 100, 1) : null;

        $userList = (clone $userBase)
            ->with('department:id,name')
            ->orderByDesc('created_at')
            ->limit(80)
            ->get()
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->full_name,
                'email' => $u->email,
                'role' => $u->role,
                'department' => $u->department?->name,
                'status' => $u->is_active ? 'active' : 'inactive',
                'created_at' => optional($u->created_at)->toIso8601String(),
            ]);

        $partnerPending = Company::query()
            ->where('is_verified', false)
            ->whereNull('meta->rejected_at')
            ->count();
        $partnerApproved = Company::query()->where('is_verified', true)->count();
        $partnerRejected = Company::query()
            ->where('is_verified', false)
            ->whereNotNull('meta->rejected_at')
            ->count();

        $internshipStatuses = Internship::query()
            ->when($start, fn ($q) => $q->whereDate('created_at', '>=', $start->toDateString()))
            ->when($end, fn ($q) => $q->whereDate('created_at', '<=', $end->toDateString()))
            ->select('submission_status', DB::raw('COUNT(*) as c'))
            ->groupBy('submission_status')
            ->pluck('c', 'submission_status')
            ->toArray();

        $avgInternshipHours = Internship::query()
            ->whereNotNull('reviewed_at')
            ->whereNotNull('submission_date')
            ->when($start, fn ($q) => $q->whereDate('reviewed_at', '>=', $start->toDateString()))
            ->when($end, fn ($q) => $q->whereDate('reviewed_at', '<=', $end->toDateString()))
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, submission_date, reviewed_at)) as avg_h')
            ->value('avg_h');
        $approvedI = (int) ($internshipStatuses[Internship::SUBMISSION_STATUS_APPROVED] ?? 0);
        $rejectedI = (int) ($internshipStatuses[Internship::SUBMISSION_STATUS_REJECTED] ?? 0);
        $decided = $approvedI + $rejectedI;
        $approvalRate = $decided > 0 ? round($approvedI / $decided * 100, 1) : null;

        $assignmentStudents = User::query()
            ->where('role', 'student')
            ->when($departmentId, fn ($q) => $q->where('department_id', $departmentId))
            ->when($collegeName && $deptIdsCollege !== [], fn ($q) => $q->whereIn('department_id', $deptIdsCollege))
            ->with('department:id,name')
            ->withCount('advisingAdvisors')
            ->orderBy('id')
            ->limit(120)
            ->get();

        $assignmentRows = $assignmentStudents->map(function (User $s) {
            $examinerCount = 0;
            if (Schema::hasTable('examiner_report_evaluations')) {
                $examinerCount = (int) DB::table('examiner_report_evaluations')
                    ->where('student_id', $s->id)
                    ->selectRaw('COUNT(DISTINCT examiner_id) as c')
                    ->value('c');
            }

            return [
                'student_id' => $s->student_id,
                'name' => $s->full_name,
                'department' => $s->department?->name,
                'advisor_links' => (int) $s->advising_advisors_count,
                'examiner_links' => (int) $examinerCount,
            ];
        });

        $distributionQuery = User::query()
            ->where('role', 'student')
            ->with('department:id,name')
            ->when($departmentId, fn ($q) => $q->where('department_id', $departmentId))
            ->when($collegeName && $deptIdsCollege !== [], fn ($q) => $q->whereIn('department_id', $deptIdsCollege))
            ->when($studentYear, fn ($q) => $q->where('profile_data->year', $studentYear));

        $studentsForDist = $distributionQuery->get();
        $byCollege = [];
        $byDepartment = [];
        foreach ($studentsForDist as $s) {
            $dn = $s->department?->name ?? 'No department';
            $col = $this->collegeForDepartmentName($s->department?->name) ?? 'Unmapped / other';
            $byCollege[$col] = ($byCollege[$col] ?? 0) + 1;
            $byDepartment[$dn] = ($byDepartment[$dn] ?? 0) + 1;
        }

        $examinerWorkload = collect();
        if (Schema::hasTable('examiner_report_evaluations')) {
            $examinerWorkload = DB::table('examiner_report_evaluations')
                ->join('users', 'examiner_report_evaluations.examiner_id', '=', 'users.id')
                ->select(
                    'users.id as examiner_id',
                    DB::raw("CONCAT(users.first_name,' ',users.last_name) as name"),
                    DB::raw('COUNT(DISTINCT examiner_report_evaluations.student_id) as students')
                )
                ->groupBy('users.id', 'users.first_name', 'users.last_name')
                ->orderByDesc('students')
                ->get()
                ->map(function ($r) {
                    $n = (int) $r->students;

                    return [
                        'examiner_id' => (int) $r->examiner_id,
                        'name' => $r->name,
                        'students' => $n,
                        'band' => $n >= 11 ? 'red' : ($n >= 6 ? 'orange' : 'green'),
                    ];
                });
        }

        $appQ = Application::query()
            ->when($start, fn ($q) => $q->whereDate('created_at', '>=', $start->toDateString()))
            ->when($end, fn ($q) => $q->whereDate('created_at', '<=', $end->toDateString()))
            ->when($departmentId, function ($q) use ($departmentId) {
                $q->whereHas('student', fn ($s) => $s->where('department_id', $departmentId));
            })
            ->when($companyId, fn ($q) => $q->whereHas('internship', fn ($i) => $i->where('company_id', $companyId)));

        $totalApplied = (clone $appQ)->count();
        $placed = (clone $appQ)->where('status', 'approved')->count();
        $rejectedApp = (clone $appQ)->where('status', 'rejected')->count();
        $interviewed = 0;
        if (Schema::hasTable('student_interviews')) {
            $interviewed = StudentInterview::query()
                ->when($start, fn ($q) => $q->whereDate('scheduled_at', '>=', $start->toDateString()))
                ->when($end, fn ($q) => $q->whereDate('scheduled_at', '<=', $end->toDateString()))
                ->count();
        }
        $placementRate = $totalApplied > 0 ? round($placed / $totalApplied * 100, 1) : null;

        $request->merge([
            'company_id' => $companyId,
            'department_id' => $departmentId,
            'date_from' => $from,
            'date_to' => $to,
        ]);
        $internBase = $this->internshipQuery($request);
        $companyRanked = (clone $internBase)
            ->select('internships.company_id', DB::raw('COUNT(*) as posting_count'))
            ->whereNotNull('internships.company_id')
            ->groupBy('internships.company_id')
            ->orderByDesc('posting_count')
            ->limit(25)
            ->get()
            ->map(function ($row) {
                $company = Company::query()->find($row->company_id);

                return [
                    'company_id' => (int) $row->company_id,
                    'company_name' => $company?->name ?? 'Unknown',
                    'posting_count' => (int) $row->posting_count,
                ];
            });
        $monthlyEng = (clone $internBase)
            ->select(DB::raw("DATE_FORMAT(internships.created_at, '%Y-%m') as month"), DB::raw('COUNT(*) as count'))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($r) => ['month' => $r->month, 'count' => (int) $r->count]);

        return [
            'meta' => [
                'date_from' => $from,
                'date_to' => $to,
                'role' => $role,
                'department_id' => $departmentId,
                'college_name' => $collegeName,
                'user_status' => $userStatus,
                'student_year' => $studentYear,
                'company_id' => $companyId,
                'approval_type' => $approvalType,
            ],
            'userRegistration' => [
                'summary' => [
                    'total_new_users' => $totalNewUsers,
                    'by_role' => $byRole,
                    'growth_percent' => $growthPercent,
                ],
                'trend' => $trend,
                'users' => $userList,
            ],
            'approvalPipeline' => [
                'partner' => [
                    'pending' => $partnerPending,
                    'approved' => $partnerApproved,
                    'rejected' => $partnerRejected,
                ],
                'internship' => $internshipStatuses,
                'metrics' => [
                    'avg_internship_review_hours' => $avgInternshipHours !== null ? round((float) $avgInternshipHours, 2) : null,
                    'internship_approval_rate_percent' => $approvalRate,
                ],
            ],
            'assignmentReport' => [
                'distribution' => $assignmentRows->groupBy('department')->map(fn ($g) => $g->count())->toArray(),
                'rows' => $assignmentRows,
            ],
            'studentDistribution' => [
                'by_college' => $byCollege,
                'by_department' => $byDepartment,
                'total_students' => $studentsForDist->count(),
            ],
            'examinerWorkload' => $examinerWorkload,
            'placementStats' => [
                'funnel' => [
                    'applied' => $totalApplied,
                    'interviewed' => $interviewed,
                    'placed' => $placed,
                    'rejected' => $rejectedApp,
                ],
                'placement_rate_percent' => $placementRate,
            ],
            'companyEngagement' => [
                'companiesRanked' => $companyRanked,
                'monthlyTrend' => $monthlyEng,
                'totals' => [
                    'internships' => (clone $internBase)->count(),
                    'companies' => (int) ((clone $internBase)->whereNotNull('company_id')->selectRaw('COUNT(DISTINCT company_id) as c')->value('c') ?? 0),
                ],
            ],
            'filterOptions' => [
                'departments' => Department::query()->orderBy('name')->get(['id', 'name']),
                'companies' => Company::query()->orderBy('name')->get(['id', 'name']),
                'colleges' => array_keys($this->collegeDepartments()),
            ],
        ];
    }

    private function genericExportLines(string $type, array $payload, array $options): array
    {
        $lines = [];
        if ($options['includeCover'] ?? true) {
            $lines[] = 'ARU IMS — Super Admin Report';
            $lines[] = 'Type: ' . $type;
            $lines[] = 'Generated: ' . now()->toIso8601String();
            $lines[] = '';
        }

        if ($type === 'user_registration') {
            $s = $payload['userRegistration']['summary'] ?? [];
            if ($options['includeSummary'] ?? true) {
                $lines[] = 'Summary';
                $lines[] = 'Total new users,' . ($s['total_new_users'] ?? 0);
                $lines[] = 'Growth %,' . ($s['growth_percent'] ?? '');
                $lines[] = '';
            }
            if ($options['includeTables'] ?? true) {
                $lines[] = 'Name,Email,Role,Department,Status,Created';
                foreach ($payload['userRegistration']['users'] ?? [] as $u) {
                    $lines[] = '"' . str_replace('"', '""', $u['name'] ?? '') . '","' . ($u['email'] ?? '') . '","' . ($u['role'] ?? '') . '","' . str_replace('"', '""', $u['department'] ?? '') . '","' . ($u['status'] ?? '') . '","' . ($u['created_at'] ?? '') . '"';
                }
            }
        }

        if ($type === 'approval_pipeline') {
            $lines[] = 'Partner pending,' . ($payload['approvalPipeline']['partner']['pending'] ?? 0);
            $lines[] = 'Partner approved,' . ($payload['approvalPipeline']['partner']['approved'] ?? 0);
            $lines[] = 'Partner rejected,' . ($payload['approvalPipeline']['partner']['rejected'] ?? 0);
            foreach ($payload['approvalPipeline']['internship'] ?? [] as $st => $c) {
                $lines[] = 'Internship ' . $st . ',' . $c;
            }
        }

        if ($type === 'assignment_report') {
            $lines[] = 'Student ID,Name,Department,Advisor links,Examiner links';
            foreach ($payload['assignmentReport']['rows'] ?? [] as $r) {
                $lines[] = '"' . ($r['student_id'] ?? '') . '","' . str_replace('"', '""', $r['name'] ?? '') . '","' . str_replace('"', '""', $r['department'] ?? '') . '",' . ($r['advisor_links'] ?? 0) . ',' . ($r['examiner_links'] ?? 0);
            }
        }

        if ($type === 'student_distribution') {
            $lines[] = 'College,Students';
            foreach ($payload['studentDistribution']['by_college'] ?? [] as $k => $v) {
                $lines[] = '"' . str_replace('"', '""', $k) . '",' . $v;
            }
            $lines[] = '';
            $lines[] = 'Department,Students';
            foreach ($payload['studentDistribution']['by_department'] ?? [] as $k => $v) {
                $lines[] = '"' . str_replace('"', '""', $k) . '",' . $v;
            }
        }

        if ($type === 'examiner_workload') {
            $lines[] = 'Examiner,Students,Band';
            foreach ($payload['examinerWorkload'] ?? [] as $r) {
                $lines[] = '"' . str_replace('"', '""', $r['name'] ?? '') . '",' . ($r['students'] ?? 0) . ',' . ($r['band'] ?? '');
            }
        }

        if ($type === 'placement_statistics') {
            $f = $payload['placementStats']['funnel'] ?? [];
            $lines[] = 'Metric,Count';
            foreach ($f as $k => $v) {
                $lines[] = $k . ',' . $v;
            }
            $lines[] = 'placement_rate_percent,' . ($payload['placementStats']['placement_rate_percent'] ?? '');
        }

        if ($options['includeAIInsights'] ?? false) {
            $lines[] = '';
            $lines[] = 'AI Insights (preview)';
            $lines[] = 'High-level trends only; validate against operational data.';
        }

        return $lines;
    }

    private function collegeForDepartmentName(?string $deptName): ?string
    {
        if (!$deptName) {
            return null;
        }
        foreach ($this->collegeDepartments() as $college => $depts) {
            if (in_array($deptName, $depts, true)) {
                return $college;
            }
        }

        return null;
    }

    private function departmentIdsForCollegeName(?string $collegeName): array
    {
        if (!$collegeName) {
            return [];
        }
        $names = $this->collegeDepartments()[$collegeName] ?? [];

        return Department::query()->whereIn('name', $names)->pluck('id')->all();
    }

    /** @return array<string, array<int, string>> */
    private function collegeDepartments(): array
    {
        return [
            'College of Agriculture and Environmental Science' => [
                'Animal Science', 'Horticulture', 'Plant Science',
                'Natural Resource Management', 'Agricultural Economics',
                'Agribusiness and Value Chain Management',
                'Food Science and Post-Harvest Technology',
                'Rural Development and Agricultural Extension', 'Statistics',
            ],
            'College of Business and Economics' => [
                'Accounting and Finance', 'Economics',
                'Logistics and Supply Chain Management (LSCM)', 'Management',
                'Management Information System (MIS)', 'Marketing Management',
                'Tourism and Hospitality Management',
                'International Trade and Investment Management (ITIM)',
            ],
            'College of Education and Behavioral Science' => [
                'Educational Leadership and Management', 'Psychology',
                'Curriculum and Teachers Professional Development Studies',
                'Adult Education and Community Development',
                'Special Needs and Inclusive Education',
                'Early Childhood Care and Education',
            ],
            'College of Health Sciences' => [
                'Medicine', 'Public Health', 'Animal Health Science',
                'Nursing', 'Pharmacy', 'Medical Laboratory Science',
                'Midwifery', 'Health Service Management',
            ],
            'College of Social Sciences and Humanities' => [
                'Sociology', 'Social Work', 'Political Science',
                'Geography', 'History', 'Amharic Language',
                'English Language', 'Journalism', 'Philosophy',
            ],
            'College of Law' => [
                'Law', 'Human Rights', 'International Law',
                'Business Law', 'Constitutional Law',
            ],
            'College of Natural and Computational Sciences' => [
                'Computer Science', 'Information Technology',
                'Software Engineering', 'Mathematics', 'Physics',
                'Chemistry', 'Biology', 'Statistics',
            ],
            'College of Engineering and Technology' => [
                'Civil Engineering', 'Mechanical Engineering',
                'Electrical and Computer Engineering', 'Chemical Engineering',
                'Industrial Engineering', 'Architecture',
                'Construction Technology and Management',
            ],
            'Institute of Oromo Studies' => [
                'Oromo Language', 'Oromo Literature',
                'Oromo Culture and Heritage', 'Oromo History',
            ],
        ];
    }

    private function internshipQuery(Request $request)
    {
        $q = Internship::query();

        if ($request->filled('company_id')) {
            $q->where('internships.company_id', (int) $request->input('company_id'));
        }

        if ($request->filled('department_id')) {
            $deptId = (int) $request->input('department_id');
            $q->where(function ($q2) use ($deptId) {
                $q2->where('internships.routing_department_id', $deptId)
                    ->orWhereExists(function ($sub) use ($deptId) {
                        $sub->selectRaw('1')
                            ->from('internship_department_routes')
                            ->whereColumn('internship_department_routes.internship_id', 'internships.id')
                            ->where('internship_department_routes.department_id', $deptId);
                    });
            });
        }

        if ($request->filled('date_from')) {
            $q->whereDate('internships.created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $q->whereDate('internships.created_at', '<=', $request->input('date_to'));
        }

        return $q;
    }

    private function buildCsv(string $type, $rows, $monthly, array $options): string
    {
        $lines = [];
        if ($options['includeCover'] ?? true) {
            $lines[] = 'ARU IMS — Super Admin Report';
            $lines[] = 'Type: ' . $type;
            $lines[] = 'Generated: ' . now()->toIso8601String();
            $lines[] = '';
        }
        if ($options['includeSummary'] ?? true) {
            $lines[] = 'Summary';
            $lines[] = 'Total companies in export,' . $rows->count();
            $lines[] = 'Total postings (summed),' . $rows->sum('postings');
            $lines[] = '';
        }
        if ($options['includeTables'] ?? true) {
            $lines[] = 'Company,Industry,Postings';
            foreach ($rows as $r) {
                $lines[] = '"' . str_replace('"', '""', $r->company_name) . '","' . str_replace('"', '""', (string) $r->industry) . '",' . $r->postings;
            }
            $lines[] = '';
            $lines[] = 'Month,Postings';
            foreach ($monthly as $m) {
                $lines[] = $m->month . ',' . $m->count;
            }
        }
        if ($options['includeAIInsights'] ?? false) {
            $lines[] = '';
            $lines[] = 'AI Insights (preview)';
            $lines[] = 'Top hiring momentum based on posting volume in selected period.';
        }

        return "\u{FEFF}" . implode("\n", $lines);
    }

    private function buildSpreadsheetMl(string $type, $rows, $monthly, array $options): string
    {
        $esc = fn ($s) => htmlspecialchars((string) $s, ENT_XML1 | ENT_QUOTES, 'UTF-8');

        $rowsXml = '';
        foreach ($rows as $r) {
            $rowsXml .= '<Row><Cell><Data ss:Type="String">' . $esc($r->company_name) . '</Data></Cell>'
                . '<Cell><Data ss:Type="String">' . $esc($r->industry) . '</Data></Cell>'
                . '<Cell><Data ss:Type="Number">' . (int) $r->postings . '</Data></Cell></Row>';
        }

        $monthXml = '';
        foreach ($monthly as $m) {
            $monthXml .= '<Row><Cell><Data ss:Type="String">' . $esc($m->month) . '</Data></Cell>'
                . '<Cell><Data ss:Type="Number">' . (int) $m->count . '</Data></Cell></Row>';
        }

        return '<?xml version="1.0"?>'
            . '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" '
            . 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">'
            . '<Worksheet ss:Name="CompanyEngagement"><Table>'
            . '<Row><Cell><Data ss:Type="String">Company</Data></Cell>'
            . '<Cell><Data ss:Type="String">Industry</Data></Cell>'
            . '<Cell><Data ss:Type="String">Postings</Data></Cell></Row>'
            . $rowsXml
            . '</Table></Worksheet>'
            . '<Worksheet ss:Name="Monthly"><Table>'
            . '<Row><Cell><Data ss:Type="String">Month</Data></Cell>'
            . '<Cell><Data ss:Type="String">Count</Data></Cell></Row>'
            . $monthXml
            . '</Table></Worksheet>'
            . '</Workbook>';
    }

    private function ensureSuperAdmin(Request $request): void
    {
        $user = auth()->user();
        abort_unless($user && $user->role === 'super_admin', 403, 'Only super admins can access reports.');
    }
}
