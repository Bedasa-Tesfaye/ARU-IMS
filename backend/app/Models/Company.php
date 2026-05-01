<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'industry',
        'description',
        'website',
        'address',
        'city',
        'country',
        'contact_person',
        'contact_email',
        'contact_phone',
        'is_verified',
        'meta',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'meta' => 'array',
    ];

    public function internships()
    {
        return $this->hasMany(Internship::class);
    }

    public function evaluations()
    {
        return $this->hasMany(Evaluation::class);
    }

    public function users()
    {
        return $this->hasMany(User::class, 'company_id');
    }
}
