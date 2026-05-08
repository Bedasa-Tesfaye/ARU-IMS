<?php

namespace App\Http\Controllers;

use App\Models\AdminAuditLog;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SuperAdminAssignmentController extends Controller
{
    public function unassignedStudents(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $departmentId = $request->query('department_id') ? (int) $request->query('department_id') : null;
        if (!$departmentId) {
            return response()->json([
                'data' => [],
                'current_page' => 1,
                'last_page' => 1,
                'total' => 0,
            ]);
        }

        $includeAssigned = filter_var($request->query('include_assigned', false), FILTER_VALIDATE_BOOL);
        $q = trim((string) $request->query('q', ''));
        $sort = (string) $request->query('sort', 'name');
        $dir = strtolower((string) $request->query('dir', 'asc')) === 'desc' ? 'desc' : 'asc';

        $query = User::query()
            ->where('role', 'student')
            ->where('department_id', $departmentId)
            ->with(['advisingAdvisors:id,first_name,last_name', 'examiningExaminers:id,first_name,last_name']);

        if (!$includeAssigned) {
            $query
                ->whereDoesntHave('advisingAdvisors')
                ->whereDoesntHave('examiningExaminers');
        }

        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('first_name', 'like', "%{$q}%")
                    ->orWhere('last_name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('student_id', 'like', "%{$q}%");
            });
        }

        if ($sort === 'id') {
            $query->orderBy('student_id', $dir);
        } elseif ($sort === 'status') {
            $query->orderBy('is_active', $dir);
        } else {
            $query->orderBy('first_name', $dir)->orderBy('last_name', $dir);
        }

        $page = $query->paginate(20);
        $page->getCollection()->transform(function (User $student) {
            $advisor = $student->advisingAdvisors->first();
            $examiner = $student->examiningExaminers->first();

            return [
                'id' => $student->id,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'full_name' => $student->full_name,
                'email' => $student->email,
                'student_id' => $student->student_id,
                'department_id' => $student->department_id,
                'profile_data' => $student->profile_data,
                'advisor_id' => $advisor?->id,
                'examiner_id' => $examiner?->id,
                'is_active' => $student->is_active,
            ];
        });

        return response()->json($page);
    }

    public function availableExaminers(Request $request, int $departmentId)
    {
        $this->ensureSuperAdmin($request);
        Department::query()->findOrFail($departmentId);

        $workloads = DB::table('examiner_student_assignments')
            ->join('users as s', 's.id', '=', 'examiner_student_assignments.student_id')
            ->where('s.department_id', $departmentId)
            ->select('examiner_student_assignments.examiner_id', DB::raw('COUNT(*) as workload'))
            ->groupBy('examiner_student_assignments.examiner_id')
            ->pluck('workload', 'examiner_id');

        $examiners = User::query()
            ->where('role', 'examiner')
            ->where('department_id', $departmentId)
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name', 'email'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'first_name' => $u->first_name,
                'last_name' => $u->last_name,
                'email' => $u->email,
                'workload' => (int) ($workloads[$u->id] ?? 0),
            ]);

        return response()->json($examiners);
    }

    public function availableAdvisors(Request $request, int $departmentId)
    {
        $this->ensureSuperAdmin($request);
        Department::query()->findOrFail($departmentId);

        $workloads = DB::table('advisor_student_assignments')
            ->join('users as s', 's.id', '=', 'advisor_student_assignments.student_id')
            ->where('s.department_id', $departmentId)
            ->select('advisor_student_assignments.advisor_id', DB::raw('COUNT(*) as workload'))
            ->groupBy('advisor_student_assignments.advisor_id')
            ->pluck('workload', 'advisor_id');

        $advisors = User::query()
            ->where('role', 'advisor')
            ->where('department_id', $departmentId)
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name', 'email'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'first_name' => $u->first_name,
                'last_name' => $u->last_name,
                'email' => $u->email,
                'workload' => (int) ($workloads[$u->id] ?? 0),
            ]);

        return response()->json($advisors);
    }

    public function assignExaminer(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $validated = Validator::make($request->all(), [
            'department_id' => 'required|exists:departments,id',
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'required|exists:users,id',
            'examiner_id' => 'required|exists:users,id',
        ])->validate();

        $departmentId = (int) $validated['department_id'];
        $studentIds = array_map('intval', $validated['student_ids']);
        $examinerId = (int) $validated['examiner_id'];

        $this->ensureExaminerInDepartment($examinerId, $departmentId);
        $this->ensureStudentsInDepartment($studentIds, $departmentId);

        $now = now();
        DB::transaction(function () use ($studentIds, $examinerId, $now) {
            foreach ($studentIds as $studentId) {
                DB::table('examiner_student_assignments')->updateOrInsert(
                    ['student_id' => $studentId],
                    ['examiner_id' => $examinerId, 'created_at' => $now, 'updated_at' => $now]
                );
            }
        });

        $this->logAudit($request, 'assignments', 'assign_examiner', 'info', 'Examiner assigned to students', [
            'department_id' => $departmentId,
            'examiner_id' => $examinerId,
            'student_ids' => $studentIds,
        ]);

        return response()->json(['message' => 'Examiner assigned successfully.']);
    }

    public function assignAdvisor(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $validated = Validator::make($request->all(), [
            'department_id' => 'required|exists:departments,id',
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'required|exists:users,id',
            'advisor_id' => 'required|exists:users,id',
        ])->validate();

        $departmentId = (int) $validated['department_id'];
        $studentIds = array_map('intval', $validated['student_ids']);
        $advisorId = (int) $validated['advisor_id'];

        $this->ensureAdvisorInDepartment($advisorId, $departmentId);
        $this->ensureStudentsInDepartment($studentIds, $departmentId);

        $now = now();
        DB::transaction(function () use ($studentIds, $advisorId, $now) {
            DB::table('advisor_student_assignments')->whereIn('student_id', $studentIds)->delete();
            $rows = array_map(fn ($sid) => [
                'advisor_id' => $advisorId,
                'student_id' => $sid,
                'created_at' => $now,
                'updated_at' => $now,
            ], $studentIds);
            DB::table('advisor_student_assignments')->insert($rows);
        });

        $this->logAudit($request, 'assignments', 'assign_advisor', 'info', 'Advisor assigned to students', [
            'department_id' => $departmentId,
            'advisor_id' => $advisorId,
            'student_ids' => $studentIds,
        ]);

        return response()->json(['message' => 'Advisor assigned successfully.']);
    }

    public function assignBoth(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $validated = Validator::make($request->all(), [
            'department_id' => 'required|exists:departments,id',
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'required|exists:users,id',
            'examiner_id' => 'required|exists:users,id',
            'advisor_id' => 'required|exists:users,id',
        ])->validate();

        $departmentId = (int) $validated['department_id'];
        $studentIds = array_map('intval', $validated['student_ids']);
        $examinerId = (int) $validated['examiner_id'];
        $advisorId = (int) $validated['advisor_id'];

        $this->ensureExaminerInDepartment($examinerId, $departmentId);
        $this->ensureAdvisorInDepartment($advisorId, $departmentId);
        $this->ensureStudentsInDepartment($studentIds, $departmentId);

        $now = now();
        DB::transaction(function () use ($studentIds, $examinerId, $advisorId, $now) {
            foreach ($studentIds as $studentId) {
                DB::table('examiner_student_assignments')->updateOrInsert(
                    ['student_id' => $studentId],
                    ['examiner_id' => $examinerId, 'created_at' => $now, 'updated_at' => $now]
                );
            }

            DB::table('advisor_student_assignments')->whereIn('student_id', $studentIds)->delete();
            $rows = array_map(fn ($sid) => [
                'advisor_id' => $advisorId,
                'student_id' => $sid,
                'created_at' => $now,
                'updated_at' => $now,
            ], $studentIds);
            DB::table('advisor_student_assignments')->insert($rows);
        });

        $this->logAudit($request, 'assignments', 'assign_both', 'info', 'Examiner and advisor assigned to students', [
            'department_id' => $departmentId,
            'examiner_id' => $examinerId,
            'advisor_id' => $advisorId,
            'student_ids' => $studentIds,
        ]);

        return response()->json(['message' => 'Examiner and advisor assigned successfully.']);
    }

    private function ensureSuperAdmin(Request $request): void
    {
        $user = auth()->user();
        abort_unless($user && $user->role === 'super_admin', 403, 'Only super admins can manage assignments.');
    }

    private function ensureStudentsInDepartment(array $studentIds, int $departmentId): void
    {
        $count = User::query()
            ->whereIn('id', $studentIds)
            ->where('role', 'student')
            ->where('department_id', $departmentId)
            ->count();

        abort_unless($count === count($studentIds), 422, 'Some selected students are not in this department.');
    }

    private function ensureExaminerInDepartment(int $examinerId, int $departmentId): void
    {
        $ok = User::query()
            ->where('id', $examinerId)
            ->where('role', 'examiner')
            ->where('department_id', $departmentId)
            ->exists();

        abort_unless($ok, 422, 'Examiner must belong to the selected department.');
    }

    private function ensureAdvisorInDepartment(int $advisorId, int $departmentId): void
    {
        $ok = User::query()
            ->where('id', $advisorId)
            ->where('role', 'advisor')
            ->where('department_id', $departmentId)
            ->exists();

        abort_unless($ok, 422, 'Advisor must belong to the selected department.');
    }

    private function logAudit(Request $request, string $module, string $action, string $severity, string $description, array $meta = []): void
    {
        AdminAuditLog::query()->create([
            'actor_user_id' => auth()->id(),
            'target_user_id' => null,
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

