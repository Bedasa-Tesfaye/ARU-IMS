<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class AppController extends Controller
{
    public function landing()
    {
        return Inertia::render('LandingPage');
    }

    public function login()
    {
        return Inertia::render('Login');
    }

    public function superAdminDashboard()
    {
        return Inertia::render('SuperAdminDashboard', [
            'auth' => auth()->user(),
        ]);
    }
}
