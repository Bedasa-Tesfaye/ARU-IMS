<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DashboardAuditEvent extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'module',
        'action',
        'severity',
        'actor_user_id',
        'target_user_id',
        'description',
        'meta',
        'created_at',
    ];

    protected $casts = [
        'meta' => 'array',
        'created_at' => 'datetime',
    ];
}
