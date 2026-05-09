<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AppController extends Controller
{
    public function landing()
    {
        return Inertia::render('LandingPage');
    }

    public function becomePartner()
    {
        return Inertia::render('BecomePartner');
    }

    public function login()
    {
        if (Auth::guard('web')->check()) {
            $user = Auth::guard('web')->user();

            if ($user?->must_change_password) {
                return redirect('/force-password-change');
            }

            if ($user?->role === 'super_admin' || $user?->role === 'admin' || $user?->role === 'coordinator') {
                return redirect('/superadmin');
            }

            if ($user?->role === 'student') {
                return redirect('/student-dashboard');
            }

            if ($user?->role === 'examiner') {
                return redirect('/examiner-dashboard');
            }

            if ($user?->role === 'advisor') {
                return redirect('/advisor-dashboard');
            }

            if ($user?->role === 'company') {
                return redirect('/company-dashboard');
            }
        }

        return Inertia::render('Login');
    }

    public function forcePasswordChange(Request $request)
    {
        return Inertia::render('ForcePasswordChange', [
            'auth' => auth()->user(),
            'next' => (string) $request->query('next', ''),
        ]);
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
