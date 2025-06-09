<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\ResumeController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Test route
Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/users', [PublicController::class, 'getAllUsers']);

// Protected routes
Route::middleware(['auth:api', 'jwt.auth'])->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'update']);

    // Job routes
    Route::apiResource('jobs', JobController::class);
    Route::get('jobs/search', [JobController::class, 'index']);

    // Application routes
    Route::apiResource('applications', ApplicationController::class);
    Route::put('applications/{application}/status', [ApplicationController::class, 'update']);

    // Resume routes
    Route::apiResource('resumes', ResumeController::class);
    Route::get('resumes/{resume}/download', [ResumeController::class, 'download']);

    // Profile routes
    Route::put('/user/profile', [UserController::class, 'updateProfile']);

    // Job routes
    Route::post('jobs/{job}/apply', [JobController::class, 'apply']);
});