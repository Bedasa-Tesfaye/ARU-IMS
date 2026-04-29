<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\InternshipController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthorityController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public routes
Route::get('/public/internships', [InternshipController::class, 'publicIndex']);

// Admin routes
Route::middleware('auth:api')->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])->middleware('can:analytics.system.view');
    Route::get('/admin/users', [AdminController::class, 'users'])->middleware('can:users.viewAny');
    Route::post('/admin/users', [AdminController::class, 'createUser'])->middleware('can:users.create');
    Route::get('/admin/users/{id}', [AdminController::class, 'user'])->middleware('can:users.viewAny');
    Route::put('/admin/users/{id}/status', [AdminController::class, 'updateUserStatus'])->middleware('can:users.suspend');
    Route::put('/admin/users/{id}', [AdminController::class, 'updateUser'])->middleware('can:users.edit');
    Route::post('/admin/users/{id}/reset-password', [AdminController::class, 'resetUserPassword'])->middleware('can:users.password.reset');
    Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser'])->middleware('can:users.delete');
    Route::get('/admin/activity-logs', [AdminController::class, 'activityLogs'])->middleware('can:audit.activityLogs.view');
    Route::get('/admin/reports', [AdminController::class, 'generateReport'])->middleware('can:reports.custom.generate');
    Route::get('/admin/monitor', [AdminController::class, 'monitor'])->middleware('can:analytics.system.view');
});

Route::middleware('auth:api')->group(function () {
    Route::get('/authority-matrix', [AuthorityController::class, 'matrix']);

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/internships', [InternshipController::class, 'index'])->middleware('can:internships.viewAny');
    Route::post('/internships', [InternshipController::class, 'store'])->middleware('can:internships.create');
    Route::get('/internships/{id}', [InternshipController::class, 'show'])->middleware('can:internships.viewAny');
    Route::put('/internships/{id}', [InternshipController::class, 'update'])->middleware('can:internships.edit');
    Route::delete('/internships/{id}', [InternshipController::class, 'destroy'])->middleware('can:internships.delete');
    Route::post('/internships/{id}/apply', [InternshipController::class, 'apply'])->middleware('can:applications.apply');

    Route::get('/applications', [ApplicationController::class, 'index'])->middleware('can:applications.viewAny');
    Route::post('/applications', [ApplicationController::class, 'store'])->middleware('can:applications.apply');
    Route::get('/applications/{id}', [ApplicationController::class, 'show'])->middleware('can:applications.viewAny');
    Route::put('/applications/{id}', [ApplicationController::class, 'update'])->middleware('can:applications.review');
    Route::delete('/applications/{id}', [ApplicationController::class, 'destroy'])->middleware('can:applications.review');
    Route::post('/applications/{id}/approve', [ApplicationController::class, 'approve'])->middleware('can:applications.approve');
    Route::post('/applications/{id}/reject', [ApplicationController::class, 'reject'])->middleware('can:applications.reject');
    Route::post('/applications/{id}/withdraw', [ApplicationController::class, 'withdraw'])->middleware('can:applications.withdraw');

    Route::get('/reports', [ReportController::class, 'index'])->middleware('can:reports.viewAny');
    Route::post('/reports', [ReportController::class, 'store'])->middleware('can:reports.weekly.submit');
    Route::get('/reports/{id}', [ReportController::class, 'show'])->middleware('can:reports.viewAny');
    Route::put('/reports/{id}', [ReportController::class, 'update'])->middleware('can:reports.weekly.submit');
    Route::delete('/reports/{id}', [ReportController::class, 'destroy'])->middleware('can:reports.weekly.submit');
    Route::post('/reports/{id}/review', [ReportController::class, 'review'])->middleware('can:reports.review');
    Route::post('/reports/{id}/assign-examiner', [ReportController::class, 'assignExaminer'])->middleware('can:assignments.examiner.assign');

    Route::get('/evaluations', [EvaluationController::class, 'index'])->middleware('can:evaluations.results.view');
    Route::post('/evaluations', [EvaluationController::class, 'store'])->middleware('can:evaluations.student.evaluate');
    Route::get('/evaluations/{id}', [EvaluationController::class, 'show'])->middleware('can:evaluations.results.view');
    Route::put('/evaluations/{id}', [EvaluationController::class, 'update'])->middleware('can:evaluations.student.evaluate');
    Route::delete('/evaluations/{id}', [EvaluationController::class, 'destroy'])->middleware('can:evaluations.student.evaluate');
    Route::get('/evaluations/student/{studentId}', [EvaluationController::class, 'getStudentEvaluations'])->middleware('can:evaluations.results.view');
});

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});
