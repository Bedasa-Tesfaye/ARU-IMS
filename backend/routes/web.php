<?php

use App\Http\Controllers\AppController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\InternshipController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\SuperAdminRegistrationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', [AppController::class, 'landing']);

Route::get('/register', [AppController::class, 'login']);
Route::get('/login', [AppController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:web');

Route::get('/public/internships', [InternshipController::class, 'publicIndex']);

Route::middleware('auth:web')->group(function () {
    Route::get('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/superadmin', [AppController::class, 'superAdminDashboard']);

    Route::get('/internships', [InternshipController::class, 'index']);
    Route::post('/internships', [InternshipController::class, 'store']);
    Route::get('/internships/{id}', [InternshipController::class, 'show']);
    Route::put('/internships/{id}', [InternshipController::class, 'update']);
    Route::delete('/internships/{id}', [InternshipController::class, 'destroy']);
    Route::post('/internships/{id}/apply', [InternshipController::class, 'apply']);

    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::post('/applications', [ApplicationController::class, 'store']);
    Route::get('/applications/{id}', [ApplicationController::class, 'show']);
    Route::put('/applications/{id}', [ApplicationController::class, 'update']);
    Route::delete('/applications/{id}', [ApplicationController::class, 'destroy']);

    Route::get('/reports', [ReportController::class, 'index']);
    Route::post('/reports', [ReportController::class, 'store']);
    Route::get('/reports/{id}', [ReportController::class, 'show']);
    Route::put('/reports/{id}', [ReportController::class, 'update']);
    Route::delete('/reports/{id}', [ReportController::class, 'destroy']);

    Route::get('/evaluations', [EvaluationController::class, 'index']);
    Route::post('/evaluations', [EvaluationController::class, 'store']);
    Route::get('/evaluations/{id}', [EvaluationController::class, 'show']);
    Route::put('/evaluations/{id}', [EvaluationController::class, 'update']);
    Route::delete('/evaluations/{id}', [EvaluationController::class, 'destroy']);

    Route::prefix('admin')->group(function () {
        Route::get('/departments', [SuperAdminRegistrationController::class, 'departments']);
        Route::get('/users', [SuperAdminRegistrationController::class, 'users']);
        Route::put('/users/{id}', [SuperAdminRegistrationController::class, 'updateUser']);
        Route::post('/users/{id}/suspend', [SuperAdminRegistrationController::class, 'suspendUser']);
        Route::post('/users/{id}/reset-password', [SuperAdminRegistrationController::class, 'resetUserPassword']);
        Route::delete('/users/{id}', [SuperAdminRegistrationController::class, 'deleteUser']);
        Route::post('/register/student', [SuperAdminRegistrationController::class, 'registerStudent']);
        Route::post('/register/students/bulk', [SuperAdminRegistrationController::class, 'registerStudentsBulk']);
        Route::post('/register/company', [SuperAdminRegistrationController::class, 'registerCompany']);
        Route::post('/register/examiner', [SuperAdminRegistrationController::class, 'registerExaminer']);
        Route::post('/register/advisor', [SuperAdminRegistrationController::class, 'registerAdvisor']);
    });
});
