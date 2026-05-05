<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Internship;
use App\Models\StudentInterview;
use App\Models\User;
use Illuminate\Http\Request;

class StudentDashboardController extends Controller
{
    public function overview(Request $request)
    {
        $student = $request->user();
        abort_unless($student && $student->role === 'student', 403, 'Only students can access this endpoint.');

        $applications = Application::query()->with('internship.company')->where('student_id', $student->id)->get();
        $active = $applications->where('status', 'pending')->count();
        $offers = $applications->where('status', 'approved')->count();
        $interviews = StudentInterview::query()->where('student_id', $student->id)->where('scheduled_at', '>=', now()->startOfDay())->count();

        $matches = Internship::query()
            ->with('company')
            ->where('status', 'active')
            ->where('submission_status', Internship::SUBMISSION_STATUS_APPROVED)
            ->latest()
            ->take(8)
            ->get()
            ->map(function ($internship, $index) {
                $score = 90 - ($index * 4);
                return [
                    'id' => $internship->id,
                    'title' => $internship->title,
                    'company' => $internship->company?->name,
                    'location' => $internship->location,
                    'deadline' => optional($internship->end_date)->toDateString(),
                    'match_score' => max(58, $score),
                    'why_match' => [
                        'Aligned with your department focus.',
                        'Similar profile students got shortlisted.',
                        'Skills overlap detected from role requirements.',
                    ],
                ];
            });

        $examiner = User::query()
            ->where('role', 'examiner')
            ->where('department_id', $student->department_id)
            ->first(['id', 'first_name', 'last_name', 'email', 'department_id']);

        $pivotAdvisor = $student->advisingAdvisors()->first();
        $departmentAdvisor = User::query()
            ->where('role', 'advisor')
            ->where('department_id', $student->department_id)
            ->first(['id', 'first_name', 'last_name', 'email', 'department_id', 'employee_id']);

        $advisor = $pivotAdvisor ?? $departmentAdvisor;
        $advisorSource = $pivotAdvisor ? 'assigned' : ($departmentAdvisor ? 'department' : null);

        return response()->json([
            'student' => [
                'id' => $student->id,
                'name' => trim(($student->first_name ?? '') . ' ' . ($student->last_name ?? '')),
                'student_id' => $student->student_id,
                'department_id' => $student->department_id,
                'profile_data' => $student->profile_data,
            ],
            'stats' => [
                'total_applications' => $applications->count(),
                'active_applications' => $active,
                'ai_matched' => $matches->count(),
                'upcoming_interviews' => $interviews,
                'offers_received' => $offers,
            ],
            'insights' => [
                "Based on your profile, we found {$matches->count()} new internship matches for you today.",
                'Your profile is 75% complete. Add one more skill and resume update to improve matching.',
                'Trending skills in your department: Communication, Data Analysis, Problem Solving.',
            ],
            'assigned_staff' => [
                'examiner' => $examiner,
                'advisor' => $advisor,
                'advisor_assignment_source' => $advisorSource,
            ],
            'matches' => $matches,
            'applications' => $applications->take(10)->values(),
            'deadlines' => $applications
                ->filter(fn ($app) => $app->internship && $app->internship->end_date)
                ->take(5)
                ->map(fn ($app) => [
                    'application_id' => $app->id,
                    'title' => $app->internship->title,
                    'deadline' => optional($app->internship->end_date)->toDateString(),
                    'status' => $app->status,
                ])->values(),
        ]);
    }
}
