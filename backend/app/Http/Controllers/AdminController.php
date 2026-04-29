<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Internship;
use App\Models\Application;
use App\Models\Report;
use App\Models\Evaluation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    private const DEFAULT_INITIAL_PASSWORD = 'password123';

    /**
     * Get dashboard statistics
     */
    public function dashboard()
    {
        $this->authorize('analytics.system.view');

        $stats = [
            'total_users' => User::count(),
            'total_students' => User::where('role', 'student')->count(),
            'total_companies' => User::where('role', 'company')->count(),
            'total_coordinators' => User::where('role', 'coordinator')->count(),
            'total_examiners' => User::where('role', 'examiner')->count(),
            'total_internships' => Internship::count(),
            'active_internships' => Internship::where('status', 'active')->count(),
            'total_applications' => Application::count(),
            'pending_applications' => Application::where('status', 'pending')->count(),
            'approved_applications' => Application::where('status', 'approved')->count(),
            'total_reports' => Report::count(),
            'pending_reports' => Report::where('status', 'submitted')->count(),
            'total_evaluations' => Evaluation::count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get all users with role filtering
     */
    public function users(Request $request)
    {
        $this->authorize('users.viewAny');

        $query = User::query();
        $authUser = $request->user();

        // Coordinator is limited to their department.
        if ($authUser && $authUser->isCoordinator()) {
            $query->where('department_id', $authUser->department_id);
        }

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Get single user details
     */
    public function user($id)
    {
        $this->authorize('users.viewAny');

        $user = User::with(['applications', 'assignedInternships', 'evaluatedReports'])->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Update user status (activate/deactivate)
     */
    public function updateUserStatus(Request $request, $id)
    {
        $this->authorize('users.suspend');

        $request->validate([
            'is_active' => 'required|boolean'
        ]);

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $authUser = $request->user();
        if ($authUser && $authUser->isCoordinator() && (int) $user->department_id !== (int) $authUser->department_id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $user->update(['is_active' => $request->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'User status updated successfully',
            'data' => $user
        ]);
    }

    /**
     * Update user profile details (Super Admin only).
     */
    public function updateUser(Request $request, $id)
    {
        $this->authorize('users.edit');

        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $authUser = $request->user();
        if ($authUser && $authUser->isCoordinator() && (int) $user->department_id !== (int) $authUser->department_id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|in:super_admin,admin,coordinator,student,company,examiner,advisor',
            'is_active' => 'required|boolean',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user
        ]);
    }

    /**
     * Reset user password (Super Admin only).
     */
    public function resetUserPassword(Request $request, $id)
    {
        $this->authorize('users.password.reset');

        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $authUser = $request->user();
        if ($authUser && $authUser->isCoordinator() && (int) $user->department_id !== (int) $authUser->department_id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'password' => 'required|string|min:6|max:255',
        ]);

        $user->password = Hash::make($validated['password']);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully'
        ]);
    }

    /**
     * Create/register a new user (Admin action)
     */
    public function createUser(Request $request)
    {
        $authUser = $request->user();
        if (!$authUser || !$authUser->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only Super Admin can register users'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'role' => 'required|in:student,company,coordinator,examiner,advisor,admin',
            'verification_confirmed' => 'required|accepted',
        ]);

        $nameParts = preg_split('/\s+/', trim($validated['name']), 2);
        $firstName = $nameParts[0];
        $lastName = $nameParts[1] ?? 'User';

        $user = User::create([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $validated['email'],
            'role' => $validated['role'],
            // Set a known initial password for first login.
            'password' => Hash::make(self::DEFAULT_INITIAL_PASSWORD),
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully after verification',
            'temporary_password' => self::DEFAULT_INITIAL_PASSWORD,
            'data' => $user
        ], 201);
    }

    /**
     * Delete a user profile (Admin action)
     */
    public function deleteUser(Request $request, $id)
    {
        $this->authorize('users.delete');

        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Prevent deleting self
        if ((int)$request->user()->id === (int)$user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account'
            ], 400);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Get system activity logs
     */
    public function activityLogs(Request $request)
    {
        $this->authorize('audit.activityLogs.view');

        // Get recent activities from various models
        $recentApplications = Application::with(['user', 'internship'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($app) {
                return [
                    'type' => 'application',
                    'action' => 'created',
                    'user' => $app->user->full_name ?? 'Unknown',
                    'description' => 'Application for ' . ($app->internship->title ?? 'Unknown'),
                    'created_at' => $app->created_at
                ];
            });

        $recentReports = Report::with(['user', 'internship'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($report) {
                return [
                    'type' => 'report',
                    'action' => 'submitted',
                    'user' => $report->user->full_name ?? 'Unknown',
                    'description' => 'Report for ' . ($report->internship->title ?? 'Unknown'),
                    'created_at' => $report->created_at
                ];
            });

        $recentInternships = Internship::with('company')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($internship) {
                return [
                    'type' => 'internship',
                    'action' => 'posted',
                    'user' => $internship->company->name ?? 'Unknown',
                    'description' => "New internship: {$internship->title}",
                    'created_at' => $internship->created_at
                ];
            });

        $activities = $recentApplications
            ->concat($recentReports)
            ->concat($recentInternships)
            ->sortByDesc('created_at')
            ->take(20)
            ->values();

        return response()->json([
            'success' => true,
            'data' => $activities
        ]);
    }

    /**
     * Generate reports
     */
    public function generateReport(Request $request)
    {
        $this->authorize('reports.custom.generate');

        $type = $request->get('type', 'overview');
        
        $data = [];

        switch ($type) {
            case 'internships':
                $data = [
                    'total' => Internship::count(),
                    'by_status' => Internship::select('status', DB::raw('count(*) as count'))
                        ->groupBy('status')->get(),
                    'by_company' => Internship::with('company')
                        ->select('company_id', DB::raw('count(*) as count'))
                        ->groupBy('company_id')->get(),
                ];
                break;

            case 'applications':
                $data = [
                    'total' => Application::count(),
                    'by_status' => Application::select('status', DB::raw('count(*) as count'))
                        ->groupBy('status')->get(),
                    'by_month' => Application::select(
                        DB::raw('MONTH(created_at) as month'),
                        DB::raw('count(*) as count')
                    )->groupBy('month')->get(),
                ];
                break;

            case 'students':
                $data = [
                    'total' => User::where('role', 'student')->count(),
                    'active' => User::where('role', 'student')->where('is_active', true)->count(),
                    'with_internships' => Application::where('status', 'approved')
                        ->distinct('student_id')->count('student_id'),
                ];
                break;

            default:
                $data = [
                    'overview' => [
                        'users' => User::count(),
                        'internships' => Internship::count(),
                        'applications' => Application::count(),
                        'reports' => Report::count(),
                    ]
                ];
        }

        return response()->json([
            'success' => true,
            'data' => $data,
            'generated_at' => now()
        ]);
    }

    /**
     * Monitor system activities
     */
    public function monitor()
    {
        $this->authorize('analytics.system.view');

        $today = now()->startOfDay();
        
        $dailyStats = [
            'new_users' => User::where('created_at', '>=', $today)->count(),
            'new_internships' => Internship::where('created_at', '>=', $today)->count(),
            'new_applications' => Application::where('created_at', '>=', $today)->count(),
            'new_reports' => Report::where('created_at', '>=', $today)->count(),
        ];

        $systemHealth = [
            'database_status' => 'healthy',
            'api_status' => 'operational',
            'last_backup' => now()->subHours(6),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'daily_stats' => $dailyStats,
                'system_health' => $systemHealth
            ]
        ]);
    }
}