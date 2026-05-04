<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentAchievement extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'code',
        'title',
        'description',
        'achieved_at',
    ];

    protected $casts = [
        'achieved_at' => 'datetime',
    ];
}
