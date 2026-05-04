<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'type',
        'title',
        'file_path',
        'content',
        'ai_review',
        'version',
        'is_active',
    ];

    protected $casts = [
        'ai_review' => 'array',
        'is_active' => 'boolean',
    ];
}
