<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AIAdvisorController extends Controller
{
    private function advisorOnly(Request $request): void
    {
        abort_unless($request->user() && $request->user()->role === 'advisor', 403);
    }

    public function studentInsights(Request $request)
    {
        $this->advisorOnly($request);
        $sid = (int) $request->input('student_id', 0);

        return response()->json([
            'student_id' => $sid,
            'readiness_score' => 82,
            'summary' => 'Strong foundation; emphasize measurable outcomes on the resume.',
            'skill_gaps' => ['Cloud basics', 'Stakeholder communication'],
            'career_paths' => ['Software engineering', 'Product analytics', 'Research'],
        ]);
    }

    public function applicationReview(Request $request)
    {
        $this->advisorOnly($request);

        return response()->json([
            'resume_match_pct' => 78,
            'missing_keywords' => ['Agile', 'API design'],
            'cover_letter_quality' => 'Good structure; strengthen the company-specific paragraph.',
            'suggested_improvements' => ['Add metrics to project bullets', 'Map skills to the job description'],
            'draft_feedback' => 'Strong draft. Tighten the opening and quantify project impact with numbers.',
        ]);
    }

    public function meetingPrep(Request $request)
    {
        $this->advisorOnly($request);

        return response()->json([
            'agenda' => [
                'Review target roles and deadlines',
                'Walk through top applications',
                'Plan mock interview if needed',
            ],
            'student_snapshot' => 'Active on applications; follow up on pending employer responses.',
        ]);
    }

    public function suggestReply(Request $request)
    {
        $this->advisorOnly($request);
        $thread = (string) $request->input('context', '');

        return response()->json([
            'suggested_reply' => "Thanks for the update. Let's book 20 minutes to review your draft and next steps — would tomorrow afternoon work?",
            'tone' => 'supportive',
            'context_snippet' => mb_substr($thread, 0, 200),
        ]);
    }

    public function documentReview(Request $request)
    {
        $this->advisorOnly($request);

        return response()->json([
            'overall_score' => 76,
            'grammar_spelling' => 'Minor tense consistency in two bullets — otherwise clean.',
            'formatting' => 'Good hierarchy; align dates to the right margin for skimmability.',
            'sections' => [
                ['name' => 'Summary', 'score' => 72, 'tip' => 'Lead with role target and top strengths.'],
                ['name' => 'Experience', 'score' => 80, 'tip' => 'Add metrics (%, users, time saved).'],
                ['name' => 'Skills', 'score' => 74, 'tip' => 'Mirror keywords from target role descriptions.'],
            ],
            'comparison_note' => 'Compared with anonymized successful cohort resumes in similar programs.',
        ]);
    }

    public function riskAlerts(Request $request)
    {
        $this->advisorOnly($request);

        return response()->json([
            'alerts' => [
                ['level' => 'high', 'message' => 'Advisee with no applications in 30 days'],
                ['level' => 'medium', 'message' => 'Lower login frequency for one advisee'],
            ],
        ]);
    }

    public function performanceInsights(Request $request)
    {
        $this->advisorOnly($request);

        return response()->json([
            'response_time_hours' => 4.2,
            'placement_delta_vs_dept' => 15,
            'top_strength' => 'Timely feedback on drafts',
        ]);
    }

    public function chat(Request $request)
    {
        $this->advisorOnly($request);
        $msg = (string) $request->input('message', '');

        return response()->json([
            'reply' => $msg !== ''
                ? 'Advisor AI: Focus on measurable outcomes, deadlines, and proactive follow-ups for: "' . mb_substr($msg, 0, 140) . '"'
                : 'Advisor AI: Ask about mentoring strategies, meeting prep, cohort analytics, or application reviews.',
            'suggested_followups' => [
                'Draft concise feedback for a pending application.',
                'Outline a 20-minute mentoring session agenda.',
                'Summarize at-risk signals to watch this week.',
            ],
            'resources' => [
                ['title' => 'STAR method cheat sheet', 'type' => 'handout'],
                ['title' => 'Resume keyword alignment checklist', 'type' => 'rubric'],
            ],
        ]);
    }

    public function generateReport(Request $request)
    {
        $this->advisorOnly($request);

        return response()->json([
            'outline' => ['Executive summary', 'Cohort statistics', 'At-risk list', 'Recommendations'],
            'narrative' => 'This cohort shows steady application activity with room to improve interview conversion.',
        ]);
    }

    public function trends(Request $request)
    {
        $this->advisorOnly($request);

        return response()->json([
            'skills_in_demand' => ['Python', 'Data literacy', 'Communication'],
            'application_volume_trend' => 'up',
        ]);
    }

    public function mentoringStrategy(Request $request)
    {
        $this->advisorOnly($request);

        return response()->json([
            'strategies' => [
                'Short weekly accountability check-ins',
                'Pair with an alumni mentor in target industry',
                'Rubric-based resume review',
            ],
        ]);
    }
}
