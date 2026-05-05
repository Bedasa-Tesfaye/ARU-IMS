<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AICompanyController extends Controller
{
    private function companyOnly(Request $request): void
    {
        abort_unless($request->user() && $request->user()->isCompany(), 403);
    }

    public function generateJobDescription(Request $request)
    {
        $this->companyOnly($request);
        $role = (string) $request->input('role_type', 'Software Intern');

        return response()->json([
            'title' => $role . ' — Professional Development Track',
            'description' => "Join {$role} and contribute to real projects with mentorship...",
            'bullets' => ['Hands-on delivery', 'Weekly feedback', 'Learning milestones'],
            'attractiveness_score' => 85,
        ]);
    }

    public function optimizePosting(Request $request)
    {
        $this->companyOnly($request);

        return response()->json([
            'inclusivity_notes' => ['Avoid gendered language in requirements', 'Emphasize growth mindset'],
            'keywords' => ['Python', 'Collaboration', 'Analytics'],
            'improvements' => ['Add stipend range', 'Clarify weekly hours'],
        ]);
    }

    public function rankApplicants(Request $request)
    {
        $this->companyOnly($request);

        return response()->json([
            'ranked_application_ids' => array_map('intval', (array) $request->input('application_ids', [1, 2, 3])),
            'rationale' => 'Ordered by skills fit, project depth, and academic signals.',
        ]);
    }

    public function screenCandidate(Request $request)
    {
        $this->companyOnly($request);

        return response()->json([
            'fit_score' => 87,
            'strengths' => ['Relevant coursework', 'Portfolio evidence'],
            'risks' => ['Limited leadership examples'],
        ]);
    }

    public function generateInterviewQuestions(Request $request)
    {
        $this->companyOnly($request);

        return response()->json([
            'technical' => ['Walk through a bug you diagnosed end-to-end.', 'Optimize this dataset pipeline.'],
            'behavioral' => ['Tell me about conflict on a team project.', 'How do you learn new tools quickly?'],
        ]);
    }

    public function suggestReply(Request $request)
    {
        $this->companyOnly($request);

        return response()->json([
            'suggested_reply' => 'Thanks for your application — we would like to schedule a 30-minute interview this week. Do Tuesday 2pm or Wednesday 10am work?',
        ]);
    }

    public function generateEvaluation(Request $request)
    {
        $this->companyOnly($request);

        return response()->json([
            'draft' => 'Overall strong contributor with consistent communication and timely deliverables.',
            'suggested_ratings' => [
                'technical_skills' => 82,
                'communication_skills' => 88,
                'teamwork' => 85,
            ],
        ]);
    }

    public function predictFit(Request $request)
    {
        $this->companyOnly($request);

        return response()->json([
            'likely_accept_offer' => 0.82,
            'performance_prediction' => 79,
        ]);
    }

    public function chat(Request $request)
    {
        $this->companyOnly($request);
        $msg = (string) $request->input('message', '');

        return response()->json([
            'reply' => $msg !== ''
                ? 'Company AI: For recruitment efficiency, prioritize structured interviews and clear next steps: "' . mb_substr($msg, 0, 120) . '"'
                : 'Company AI: Ask about job descriptions, screening, interview plans, or intern performance.',
            'quick_prompts' => ['Draft a rejection email', 'Summarize hiring funnel risks', 'Improve internship title'],
        ]);
    }

    public function marketInsights(Request $request)
    {
        $this->companyOnly($request);

        return response()->json([
            'stipend_benchmark' => 'Median stipend for similar roles in-region: ETB 4,500–6,200/mo (illustrative).',
            'skills_trending' => ['Data literacy', 'Cloud fundamentals', 'Stakeholder communication'],
        ]);
    }

    public function recruitmentAnalytics(Request $request)
    {
        $this->companyOnly($request);

        return response()->json([
            'conversion_lift' => 'Adding learning outcomes improves qualified applicants ~18%.',
            'channel_quality' => ['Campus referrals', 'Department newsletters', 'Public board'],
        ]);
    }

    public function biasCheck(Request $request)
    {
        $this->companyOnly($request);

        return response()->json([
            'flags' => [],
            'recommendations' => ['Use structured rubrics', 'Rotate interview panel'],
        ]);
    }

    public function offerAcceptancePredict(Request $request)
    {
        $this->companyOnly($request);

        return response()->json(['probability' => 0.78, 'drivers' => ['Stipend clarity', 'Mentorship signal']]);
    }

    public function internPerformancePredict(Request $request)
    {
        $this->companyOnly($request);

        return response()->json(['risk_score' => 22, 'watch_items' => ['Task estimation accuracy']]);
    }
}
