<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentInterview extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'application_id',
        'company_name',
        'position_title',
        'scheduled_at',
        'format',
        'location',
        'interviewer_name',
        'interviewer_email',
        'notes',
        'post_interview_feedback',
        'confidence_score',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
    ];
}
