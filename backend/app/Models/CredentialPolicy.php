<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CredentialPolicy extends Model
{
    use HasFactory;

    protected $fillable = [
        'password_length',
        'require_uppercase',
        'require_lowercase',
        'require_numbers',
        'require_special',
        'minimum_numbers',
        'minimum_special',
        'password_expiry_days',
        'force_password_change',
        'user_email_domain',
        'partner_email_domain',
        'auto_send_welcome_email',
        'duplicate_strategy',
        'failed_login_limit',
        'lockout_minutes',
    ];

    protected $casts = [
        'require_uppercase' => 'boolean',
        'require_lowercase' => 'boolean',
        'require_numbers' => 'boolean',
        'require_special' => 'boolean',
        'force_password_change' => 'boolean',
        'auto_send_welcome_email' => 'boolean',
    ];
}
