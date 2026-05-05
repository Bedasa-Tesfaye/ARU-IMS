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

    public function studentDashboard()
    {
        return Inertia::render('StudentDashboard', [
            'auth' => auth()->user(),
        ]);
    }

    public function examinerDashboard()
    {
        return Inertia::render('ExaminerDashboard', [
            'auth' => auth()->user(),
        ]);
    }

    public function advisorDashboard()
    {
        return Inertia::render('AdvisorDashboard', [
            'auth' => auth()->user(),
        ]);
    }

    public function companyDashboard()
    {
        return Inertia::render('CompanyDashboard', [
            'auth' => auth()->user(),
        ]);
    }
}
