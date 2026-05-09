<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Evaluation;
use App\Models\ExaminerReportEvaluation;

class InternshipCompositeGradeService
{
    public const CAMPUS_REPORT_TYPE = 'campus';

    /** Weight of company internship evaluations vs campus examiner evaluation (must sum to 1). */
    public const WEIGHT_COMPANY = 0.45;

    public const WEIGHT_CAMPUS = 0.55;

    public static function letterFromScore(float $score): string
    {
        if ($score >= 90) {
            return 'A';
        }
        if ($score >= 85) {
            return 'A-';
        }
        if ($score >= 80) {
            return 'B+';
        }
        if ($score >= 75) {
            return 'B';
        }
        if ($score >= 70) {
            return 'B-';
        }
        if ($score >= 65) {
            return 'C+';
        }
        if ($score >= 60) {
            return 'C';
        }

        return 'D';
    }

    /**
     * Company side counts toward the composite only when **both** midterm and final exist.
     * `internship_average` is then (midterm + final) / 2 using the latest row of each type.
     *
     * @return array{midterm: ?array<string,mixed>, final: ?array<string,mixed>, internship_average: ?float}
     */
    public function companyInternshipScores(Application $application): array
    {
        $base = Evaluation::query()
            ->where('application_id', $application->id)
            ->whereNotNull('company_id');

        $mid = (clone $base)->where('type', 'midterm')->orderByDesc('evaluation_date')->orderByDesc('id')->first();
        $fin = (clone $base)->where('type', 'final')->orderByDesc('evaluation_date')->orderByDesc('id')->first();

        $avg = ($mid && $fin)
            ? round(
                ((float) $mid->overall_performance + (float) $fin->overall_performance) / 2,
                2
            )
            : null;

        return [
            'midterm' => $mid ? $this->evaluationSummary($mid) : null,
            'final' => $fin ? $this->evaluationSummary($fin) : null,
            'internship_average' => $avg,
        ];
    }

    /**
     * Latest published or evaluated campus assessment for this placement.
     *
     * @return array<string,mixed>|null
     */
    public function campusExaminerEvaluation(Application $application): ?array
    {
        $row = ExaminerReportEvaluation::query()
            ->where('application_id', $application->id)
            ->where('report_type', self::CAMPUS_REPORT_TYPE)
            ->whereIn('status', ['evaluated', 'published'])
            ->orderByDesc('evaluated_at')
            ->orderByDesc('id')
            ->first();

        if (!$row) {
            return null;
        }

        return [
            'id' => $row->id,
            'examiner_id' => $row->examiner_id,
            'overall_score' => $row->overall_score !== null ? (float) $row->overall_score : null,
            'grade' => $row->grade,
            'evaluated_at' => optional($row->evaluated_at)->toIso8601String(),
            'status' => $row->status,
        ];
    }

    /**
     * @return array{
     *   combined_score: ?float,
     *   combined_grade: ?string,
     *   readiness: string
     * }
     */
    public function composite(?float $companyInternshipAverage, ?float $campusOverallScore): array
    {
        $hasCompany = $companyInternshipAverage !== null;
        $hasCampus = $campusOverallScore !== null;

        if (!$hasCompany && !$hasCampus) {
            return ['combined_score' => null, 'combined_grade' => null, 'readiness' => 'pending_both'];
        }
        if (!$hasCompany) {
            return ['combined_score' => null, 'combined_grade' => null, 'readiness' => 'pending_company'];
        }
        if (!$hasCampus) {
            return ['combined_score' => null, 'combined_grade' => null, 'readiness' => 'pending_campus'];
        }

        $combined = round(
            (self::WEIGHT_COMPANY * $companyInternshipAverage) + (self::WEIGHT_CAMPUS * $campusOverallScore),
            2
        );

        return [
            'combined_score' => $combined,
            'combined_grade' => self::letterFromScore($combined),
            'readiness' => 'complete',
        ];
    }

    public function breakdownForApplication(Application $application): array
    {
        $application->loadMissing(['student.department', 'internship.company']);
        $company = $this->companyInternshipScores($application);
        $campus = $this->campusExaminerEvaluation($application);
        $campusScore = $campus['overall_score'] ?? null;
        $composite = $this->composite($company['internship_average'], $campusScore);

        $student = $application->student;

        return [
            'application_id' => $application->id,
            'student' => [
                'id' => $student?->id,
                'name' => $student ? trim(($student->first_name ?? '') . ' ' . ($student->last_name ?? '')) : null,
                'student_code' => $student->student_id ?? null,
                'department' => $student?->department?->name,
            ],
            'company' => [
                'id' => $application->internship?->company_id,
                'name' => $application->internship?->company?->name,
            ],
            'internship_title' => $application->internship?->title,
            'intern_status' => $application->intern_status,
            'company_midterm' => $company['midterm'],
            'company_final' => $company['final'],
            'company_internship_average' => $company['internship_average'],
            'campus_evaluation' => $campus,
            'weights' => [
                'company' => self::WEIGHT_COMPANY,
                'campus' => self::WEIGHT_CAMPUS,
            ],
            'combined_score' => $composite['combined_score'],
            'combined_grade' => $composite['combined_grade'],
            'readiness' => $composite['readiness'],
        ];
    }

    private function evaluationSummary(Evaluation $e): array
    {
        return [
            'id' => $e->id,
            'type' => $e->type,
            'overall_performance' => (int) $e->overall_performance,
            'evaluation_date' => optional($e->evaluation_date)->toDateString(),
        ];
    }
}
