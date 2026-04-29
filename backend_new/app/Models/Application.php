<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'cover_letter',
        'resume_path',
        'status',
        'rejection_reason',
        'applied_date',
        'approved_date',
        'student_id',
        'internship_id',
        'coordinator_id',
    ];

    protected $casts = [
        'applied_date' => 'date',
        'approved_date' => 'date',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function internship()
    {
        return $this->belongsTo(Internship::class);
    }

    public function coordinator()
    {
        return $this->belongsTo(User::class, 'coordinator_id');
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    public function evaluations()
    {
        return $this->hasMany(Evaluation::class);
    }

    public function approve()
    {
        $this->update([
            'status' => 'approved',
            'approved_date' => now(),
        ]);
    }

    public function reject($reason = null)
    {
        $this->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
        ]);
    }

    public function withdraw()
    {
        $this->update([
            'status' => 'withdrawn',
        ]);
        
        $this->internship->decrementApplicants();
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
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
