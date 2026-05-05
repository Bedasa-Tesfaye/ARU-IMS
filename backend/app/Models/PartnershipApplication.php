<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartnershipApplication extends Model
{
    protected $fillable = [
        'reference_id',
        'contact_email',
        'payload',
    ];

    protected $casts = [
        'payload' => 'array',
    ];
}
