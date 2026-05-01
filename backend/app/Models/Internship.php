<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Internship extends Model
{
    use HasFactory;

    public const SUBMISSION_STATUS_PENDING = 'pending_review';
    public const SUBMISSION_STATUS_APPROVED = 'approved';
    public const SUBMISSION_STATUS_REJECTED = 'rejected';
    public const SUBMISSION_STATUS_IMPROVEMENT = 'improvement_requested';

    protected $fillable = [
        'title',
        'description',
        'program_field',
        'work_modality',
        'location',
        'type',
        'duration_weeks',
        'stipend',
        'start_date',
        'end_date',
        'status',
        'submission_status',
        'requirements',
        'responsibilities',
        'required_skills',
        'opportunities_during_program',
        'post_program_opportunities',
        'max_applicants',
        'current_applicants',
        'submission_date',
        'routing_department_id',
        'reviewed_by',
        'review_notes',
        'reviewed_at',
        'published_at',
        'sla_deadline_at',
        'company_id',
        'coordinator_id',
    ];

    protected $appends = [
        'is_available',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'stipend' => 'decimal:2',
        'max_applicants' => 'integer',
        'current_applicants' => 'integer',
        'submission_date' => 'datetime',
        'reviewed_at' => 'datetime',
        'published_at' => 'datetime',
        'sla_deadline_at' => 'datetime',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function coordinator()
    {
        return $this->belongsTo(User::class, 'coordinator_id');
    }

    public function routingDepartment()
    {
        return $this->belongsTo(Department::class, 'routing_department_id');
    }

    public function routingDepartments()
    {
        return $this->belongsToMany(
            Department::class,
            'internship_department_routes',
            'internship_id',
            'department_id'
        )->withTimestamps();
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function reports()
    {
        return $this->hasManyThrough(Report::class, Application::class);
    }

    public function evaluations()
    {
        return $this->hasManyThrough(Evaluation::class, Application::class);
    }

    public function isAvailable()
    {
        return $this->status === 'active' &&
               $this->submission_status === self::SUBMISSION_STATUS_APPROVED &&
               $this->current_applicants < $this->max_applicants &&
               $this->start_date > now();
    }

    public function getIsAvailableAttribute()
    {
        return $this->isAvailable();
    }

    public function incrementApplicants()
    {
        $this->increment('current_applicants');
    }

    public function decrementApplicants()
    {
        $this->decrement('current_applicants');
    }
}
