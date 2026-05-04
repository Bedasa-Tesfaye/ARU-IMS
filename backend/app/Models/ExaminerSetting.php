<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExaminerSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'examiner_id',
        'ai_assistance_level',
        'auto_suggest_scores',
        'auto_feedback_drafts',
        'bias_detection',
        'theme',
        'notification_prefs',
        'rubric_templates',
        'max_examinees_capacity',
        'weekly_evaluation_capacity',
    ];

    protected $casts = [
        'auto_suggest_scores' => 'boolean',
        'auto_feedback_drafts' => 'boolean',
        'bias_detection' => 'boolean',
        'notification_prefs' => 'array',
        'rubric_templates' => 'array',
    ];
}
