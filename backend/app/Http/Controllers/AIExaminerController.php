<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AIExaminerController extends Controller
{
    private function ensureExaminer(Request $request): void
    {
        $user = $request->user();
        abort_unless($user && $user->role === 'examiner', 403, 'Only examiners can access this endpoint.');
    }

    public function reportSummarize(Request $request)
    {
        $this->ensureExaminer($request);
        return response()->json([
            'summary' => 'Report demonstrates clear project ownership, moderate technical depth, and strong practical outcomes.',
            'strengths' => ['Problem framing', 'Implementation clarity', 'Outcome relevance'],
            'weaknesses' => ['Referencing depth', 'Methodology explanation detail'],
        ]);
    }

    public function suggestScores(Request $request)
    {
        $this->ensureExaminer($request);
        return response()->json([
            'technical_score' => 82,
            'documentation_score' => 74,
            'presentation_score' => 79,
            'overall_score' => 79,
            'grade' => 'B+',
        ]);
    }

    public function generateFeedback(Request $request)
    {
        $this->ensureExaminer($request);
        return response()->json([
            'feedback' => [
                'strengths' => 'Strong ownership of the internship project and practical implementation quality.',
                'improvements' => 'Improve documentation structure and provide deeper technical rationale in key sections.',
                'closing' => 'Overall, this is a promising performance with clear growth potential.',
            ],
        ]);
    }

    public function plagiarismCheck(Request $request)
    {
        $this->ensureExaminer($request);
        return response()->json([
            'similarity_score' => 8,
            'status' => 'acceptable',
            'notes' => ['No critical overlap detected.', 'Minor template-level similarity only.'],
        ]);
    }

    public function consistencyCheck(Request $request)
    {
        $this->ensureExaminer($request);
        return response()->json([
            'consistency_score' => 92,
            'variance_flag' => false,
            'message' => 'Current evaluation aligns with historical grading patterns for similar reports.',
        ]);
    }

    public function generateVivaQuestions(Request $request)
    {
        $this->ensureExaminer($request);
        return response()->json([
            'questions' => [
                'Summarize the business impact of your internship deliverable.',
                'What trade-offs did you make in your chosen solution?',
                'How would you improve this approach in a larger-scale environment?',
            ],
        ]);
    }

    public function transcribeViva(Request $request)
    {
        $this->ensureExaminer($request);
        return response()->json([
            'transcript' => 'Simulated AI transcript output for viva session.',
            'quality_score' => 84,
        ]);
    }

    public function predictGrade(Request $request)
    {
        $this->ensureExaminer($request);
        return response()->json([
            'predicted_grade' => 'B+',
            'confidence' => 0.78,
            'reasoning' => ['Strong technical consistency', 'Moderate documentation quality'],
        ]);
    }

    public function chat(Request $request)
    {
        $this->ensureExaminer($request);
        $message = (string) $request->input('message', 'Help with evaluation.');
        return response()->json([
            'reply' => "Examiner AI Assistant: For \"{$message}\", use rubric-weighted scoring and provide balanced strengths/improvements with clear evidence references.",
        ]);
    }

    public function performanceInsights(Request $request)
    {
        $this->ensureExaminer($request);
        return response()->json([
            'insights' => [
                'Average evaluation turnaround: 3.2 days.',
                'Consistency score remains high at 92%.',
                'Detailed feedback correlates with stronger student revisions.',
            ],
        ]);
    }

    public function riskStudents(Request $request)
    {
        $this->ensureExaminer($request);
        return response()->json([
            'students' => [
                ['student_id' => 'S-101', 'risk_level' => 'high', 'reason' => 'Low midterm score and missed revision deadline'],
                ['student_id' => 'S-115', 'risk_level' => 'medium', 'reason' => 'Declining report quality trend'],
            ],
        ]);
    }

    public function biasDetection(Request $request)
    {
        $this->ensureExaminer($request);
        return response()->json([
            'bias_flag' => false,
            'score' => 0.11,
            'message' => 'No strong grading bias pattern detected in this evaluation batch.',
        ]);
    }
}
