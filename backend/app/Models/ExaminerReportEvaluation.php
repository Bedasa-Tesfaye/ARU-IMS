<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExaminerReportEvaluation extends Model
{
    use HasFactory;

    protected $fillable = [
        'examiner_id',
        'student_id',
        'application_id',
        'report_type',
        'status',
        'technical_score',
        'documentation_score',
        'methodology_score',
        'learning_score',
        'presentation_score',
        'overall_score',
        'grade',
        'strengths',
        'improvements',
        'comments',
        'ai_meta',
        'evaluated_at',
    ];

    protected $casts = [
        'ai_meta' => 'array',
        'evaluated_at' => 'datetime',
    ];
}
