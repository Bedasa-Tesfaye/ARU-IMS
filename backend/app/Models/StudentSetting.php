<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'ai_assistance_level',
        'smart_alerts',
        'deadline_predictions',
        'profile_nudges',
        'share_data_for_ai',
        'theme',
        'high_contrast',
        'font_scale',
        'feature_toggles',
        'notify_new_matches',
        'notify_status_changes',
        'notify_interview_reminders',
        'privacy_profile_visibility',
        'privacy_document_visibility',
        'language',
    ];

    protected $casts = [
        'smart_alerts' => 'boolean',
        'deadline_predictions' => 'boolean',
        'profile_nudges' => 'boolean',
        'share_data_for_ai' => 'boolean',
        'high_contrast' => 'boolean',
        'notify_new_matches' => 'boolean',
        'notify_status_changes' => 'boolean',
        'notify_interview_reminders' => 'boolean',
        'feature_toggles' => 'array',
    ];
}
