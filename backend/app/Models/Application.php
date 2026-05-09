<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Notification;

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

    protected static function booted()
    {
        // Ensure company gets notified whenever a student applies (Application row created),
        // even if different endpoints/controllers create the application.
        static::created(function (Application $application) {
            try {
                $application->loadMissing(['internship.company.users', 'student']);

                $internship = $application->internship;
                $student = $application->student;
                $companyUsers = $internship?->company?->users()
                    ->where('role', 'company')
                    ->get() ?? collect();

                foreach ($companyUsers as $companyUser) {
                    // Avoid duplicate notifications (e.g., if controller already created one)
                    $exists = Notification::query()
                        ->where('user_id', $companyUser->id)
                        ->where('type', 'internship_application')
                        ->where('meta->application_id', $application->id)
                        ->exists();
                    if ($exists) {
                        continue;
                    }

                    Notification::create([
                        'user_id' => $companyUser->id,
                        'type' => 'internship_application',
                        'title' => 'New internship application',
                        'message' => ($student?->full_name ?? 'A student') . " applied for \"{$internship?->title}\".",
                        'meta' => [
                            'application_id' => $application->id,
                            'internship_id' => $internship?->id,
                            'student_id' => $student?->id,
                            'company_id' => $internship?->company_id,
                        ],
                    ]);
                }
            } catch (\Throwable $e) {
                // Never break application creation because notifications failed.
                // Consider adding logging here if needed.
            }
        });
    }

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
