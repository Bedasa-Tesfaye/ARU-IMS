<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'phone',
        'address',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function applications()
    {
        return $this->hasMany(Application::class, 'student_id');
    }

    public function assignedInternships()
    {
        return $this->hasMany(Internship::class, 'coordinator_id');
    }

    public function supervisedApplications()
    {
        return $this->hasMany(Application::class, 'coordinator_id');
    }

    public function evaluatedReports()
    {
        return $this->hasMany(Report::class, 'examiner_id');
    }

    public function evaluations()
    {
        return $this->hasMany(Evaluation::class, 'examiner_id');
    }

    public function isAdmin()
    {
        return in_array($this->role, ['admin', 'super_admin'], true);
    }

    public function isSuperAdmin()
    {
        return $this->role === 'super_admin';
    }

    public function isCoordinator()
    {
        return $this->role === 'coordinator';
    }

    public function isStudent()
    {
        return $this->role === 'student';
    }

    public function isCompany()
    {
        return $this->role === 'company';
    }

    public function isExaminer()
    {
        return $this->role === 'examiner';
    }
}
