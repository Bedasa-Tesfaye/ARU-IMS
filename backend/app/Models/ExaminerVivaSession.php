<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExaminerVivaSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'examiner_id',
        'student_id',
        'application_id',
        'scheduled_at',
        'format',
        'room_or_link',
        'status',
        'communication_score',
        'technical_score',
        'problem_solving_score',
        'confidence_score',
        'overall_score',
        'result',
        'feedback',
        'ai_questions',
        'ai_transcript_meta',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'ai_questions' => 'array',
        'ai_transcript_meta' => 'array',
    ];
}
