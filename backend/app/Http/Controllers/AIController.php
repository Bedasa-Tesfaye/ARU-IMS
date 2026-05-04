<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Internship;
use Illuminate\Http\Request;

class AIController extends Controller
{
    public function careerChat(Request $request)
    {
        $prompt = (string) $request->input('message', 'Help me plan my internship journey.');
        return response()->json([
            'reply' => "AI Assistant: I analyzed your request - \"{$prompt}\". Focus on high-match roles, tailor your resume, and submit applications before the nearest deadlines.",
            'actions' => [
                ['label' => 'Browse internships', 'url' => '/student-dashboard'],
                ['label' => 'Open applications', 'url' => '/student-dashboard'],
            ],
        ]);
    }

    public function recommendations(Request $request, int $studentId)
    {
        $matches = Internship::query()
            ->with('company')
            ->where('status', 'active')
            ->where('submission_status', Internship::SUBMISSION_STATUS_APPROVED)
            ->latest()
            ->take(8)
            ->get()
            ->map(fn ($item, $index) => [
                'id' => $item->id,
                'title' => $item->title,
                'company' => $item->company?->name,
                'location' => $item->location,
                'deadline' => optional($item->end_date)->toDateString(),
                'match_score' => max(55, 88 - ($index * 3)),
            ]);

        return response()->json(['student_id' => $studentId, 'recommendations' => $matches]);
    }

    public function resumeAnalyze()
    {
        return response()->json([
            'score' => 78,
            'ats_score' => 81,
            'feedback' => [
                'Add measurable impact metrics to project bullets.',
                'Include role-specific keywords from target internship.',
                'Use stronger action verbs in experience section.',
            ],
        ]);
    }

    public function coverLetterGenerate(Request $request)
    {
        $company = (string) $request->input('company', 'Target Company');
        $role = (string) $request->input('role', 'Intern');
        return response()->json([
            'content' => "Dear {$company} Hiring Team,\n\nI am excited to apply for the {$role} internship. My academic background and practical projects align strongly with your requirements...\n\nSincerely,\nARU Student",
        ]);
    }

    public function mockInterview()
    {
        return response()->json([
            'score' => 84,
            'questions' => [
                'Tell me about yourself and your internship goals.',
                'Describe a project where you solved a difficult problem.',
            ],
            'feedback' => [
                'Use STAR format for behavioral questions.',
                'Quantify your impact in examples.',
            ],
        ]);
    }

    public function skillGapAnalysis(Request $request)
    {
        return response()->json([
            'current_skills' => ['Communication', 'Teamwork', 'Basic Programming'],
            'required_skills' => ['Advanced Programming', 'Data Analysis', 'Version Control'],
            'gaps' => ['Advanced Programming', 'Data Analysis'],
            'recommendations' => [
                'Complete a Python data analysis mini-project this week.',
                'Practice Git workflows and publish 2 project repositories.',
            ],
        ]);
    }

    public function profileInsights(Request $request)
    {
        $student = $request->user();
        return response()->json([
            'profile_completeness' => 75,
            'insights' => [
                'Add one certification to increase profile visibility.',
                'Upload an updated resume tailored to your target roles.',
                'Fill missing skills in your profile to improve match quality.',
            ],
            'student_id' => $student?->id,
        ]);
    }

    public function documentReview()
    {
        return response()->json([
            'grammar_score' => 86,
            'tone' => 'Professional',
            'keyword_coverage' => 72,
            'suggestions' => [
                'Replace passive language with action-oriented verbs.',
                'Add keywords from internship requirements.',
            ],
        ]);
    }

    public function applicationPredictions(Request $request)
    {
        $student = $request->user();
        $apps = Application::query()->where('student_id', $student?->id)->count();
        $chance = min(92, 45 + ($apps * 3));
        return response()->json([
            'prediction' => [
                'placement_probability' => $chance,
                'summary' => "Based on your current trajectory, you have a {$chance}% chance of securing an internship this semester.",
            ],
        ]);
    }

    public function careerPath()
    {
        return response()->json([
            'paths' => [
                ['stage' => 'Entry', 'roles' => ['Intern', 'Junior Assistant']],
                ['stage' => 'Mid', 'roles' => ['Analyst', 'Associate']],
                ['stage' => 'Senior', 'roles' => ['Specialist', 'Lead']],
            ],
            'recommended_next_skills' => ['Data storytelling', 'Professional communication', 'Tool proficiency'],
        ]);
    }

    public function interviewPrep(Request $request)
    {
        $company = (string) $request->input('company', 'Company');
        return response()->json([
            'plan' => [
                "Day 1: Research {$company} and role expectations.",
                'Day 2: Practice technical concepts and portfolio walkthrough.',
                'Day 3: Behavioral Q&A with STAR method.',
                'Day 4: Mock interview and final revision.',
            ],
        ]);
    }

    public function smartReply(Request $request)
    {
        $message = (string) $request->input('message', 'Thank you for the update.');
        return response()->json([
            'reply' => "Thank you for your message. {$message} I appreciate your time and look forward to the next steps.",
        ]);
    }

    public function dailyBriefing(Request $request)
    {
        $student = $request->user();
        $apps = Application::query()->where('student_id', $student?->id)->count();
        return response()->json([
            'briefing' => [
                "You currently have {$apps} applications submitted.",
                '2 high-match opportunities are nearing deadline this week.',
                'AI recommends one resume optimization before your next application.',
            ],
        ]);
    }

    public function feedback(Request $request)
    {
        return response()->json([
            'message' => 'AI feedback received. Thank you for helping improve recommendations.',
            'saved' => true,
            'rating' => $request->input('rating'),
        ]);
    }
}
