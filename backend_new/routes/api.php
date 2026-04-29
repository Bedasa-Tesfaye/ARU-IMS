<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\InternshipController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\AdminController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Admin routes
Route::middleware('auth:api')->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/admin/users', [AdminController::class, 'users']);
    Route::post('/admin/users', [AdminController::class, 'createUser']);
    Route::get('/admin/users/{id}', [AdminController::class, 'user']);
    Route::put('/admin/users/{id}/status', [AdminController::class, 'updateUserStatus']);
    Route::put('/admin/users/{id}', [AdminController::class, 'updateUser']);
    Route::post('/admin/users/{id}/reset-password', [AdminController::class, 'resetUserPassword']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
    Route::get('/admin/activity-logs', [AdminController::class, 'activityLogs']);
    Route::get('/admin/reports', [AdminController::class, 'generateReport']);
    Route::get('/admin/monitor', [AdminController::class, 'monitor']);
});

Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::apiResource('internships', InternshipController::class);
    Route::post('/internships/{id}/apply', [InternshipController::class, 'apply']);

    Route::apiResource('applications', ApplicationController::class);
    Route::post('/applications/{id}/approve', [ApplicationController::class, 'approve']);
    Route::post('/applications/{id}/reject', [ApplicationController::class, 'reject']);
    Route::post('/applications/{id}/withdraw', [ApplicationController::class, 'withdraw']);

    Route::apiResource('reports', ReportController::class);
    Route::post('/reports/{id}/review', [ReportController::class, 'review']);
    Route::post('/reports/{id}/assign-examiner', [ReportController::class, 'assignExaminer']);

    Route::apiResource('evaluations', EvaluationController::class);
    Route::get('/evaluations/student/{studentId}', [EvaluationController::class, 'getStudentEvaluations']);
});

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});
