<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Internship extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'location',
        'type',
        'duration_weeks',
        'stipend',
        'start_date',
        'end_date',
        'status',
        'requirements',
        'responsibilities',
        'max_applicants',
        'current_applicants',
        'company_id',
        'coordinator_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'stipend' => 'decimal:2',
        'max_applicants' => 'integer',
        'current_applicants' => 'integer',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function coordinator()
    {
        return $this->belongsTo(User::class, 'coordinator_id');
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
               $this->current_applicants < $this->max_applicants &&
               $this->start_date > now();
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
