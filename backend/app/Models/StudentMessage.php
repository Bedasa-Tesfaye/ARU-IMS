<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'thread_key',
        'subject',
        'from_name',
        'from_email',
        'category',
        'sentiment',
        'body',
        'attachment_path',
        'attachment_name',
        'attachment_mime',
        'attachment_size',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];
}
