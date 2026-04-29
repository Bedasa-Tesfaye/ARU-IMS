<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'type',
        'report_date',
        'status',
        'feedback',
        'file_path',
        'student_id',
        'application_id',
        'examiner_id',
    ];

    protected $casts = [
        'report_date' => 'date',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function examiner()
    {
        return $this->belongsTo(User::class, 'examiner_id');
    }

    public function review($feedback, $status = 'reviewed')
    {
        $this->update([
            'feedback' => $feedback,
            'status' => $status,
        ]);
    }

    public function approve($feedback = null)
    {
        $this->update([
            'feedback' => $feedback,
            'status' => 'approved',
        ]);
    }

    public function reject($feedback)
    {
        $this->update([
            'feedback' => $feedback,
            'status' => 'rejected',
        ]);
    }

    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    public function scopeReviewed($query)
    {
        return $query->where('status', 'reviewed');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
}
