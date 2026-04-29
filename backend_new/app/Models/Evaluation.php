<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    use HasFactory;

    protected $fillable = [
        'technical_skills',
        'communication_skills',
        'problem_solving',
        'teamwork',
        'time_management',
        'overall_performance',
        'strengths',
        'weaknesses',
        'recommendations',
        'type',
        'evaluation_date',
        'student_id',
        'application_id',
        'examiner_id',
        'company_id',
    ];

    protected $casts = [
        'evaluation_date' => 'date',
        'technical_skills' => 'integer',
        'communication_skills' => 'integer',
        'problem_solving' => 'integer',
        'teamwork' => 'integer',
        'time_management' => 'integer',
        'overall_performance' => 'integer',
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

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function calculateOverallPerformance()
    {
        $total = $this->technical_skills + 
                 $this->communication_skills + 
                 $this->problem_solving + 
                 $this->teamwork + 
                 $this->time_management;
        
        $this->overall_performance = round($total / 5);
        $this->save();
        
        return $this->overall_performance;
    }

    public function scopeMidterm($query)
    {
        return $query->where('type', 'midterm');
    }

    public function scopeFinal($query)
    {
        return $query->where('type', 'final');
    }
}
