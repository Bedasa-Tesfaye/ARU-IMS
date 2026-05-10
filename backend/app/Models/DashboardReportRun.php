<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DashboardReportRun extends Model
{
    use HasFactory;

    protected $fillable = [
        'module',
        'owner_user_id',
        'report_type',
        'title',
        'status',
        'filters',
        'payload',
        'generated_at',
    ];

    protected $casts = [
        'filters' => 'array',
        'payload' => 'array',
        'generated_at' => 'datetime',
    ];
}
