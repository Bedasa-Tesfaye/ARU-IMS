<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExaminerMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'examiner_id',
        'student_id',
        'thread_key',
        'subject',
        'from_name',
        'from_role',
        'category',
        'body',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];
}
