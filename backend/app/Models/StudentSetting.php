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
    ];

    protected $casts = [
        'smart_alerts' => 'boolean',
        'deadline_predictions' => 'boolean',
        'profile_nudges' => 'boolean',
        'share_data_for_ai' => 'boolean',
        'high_contrast' => 'boolean',
        'feature_toggles' => 'array',
    ];
}
