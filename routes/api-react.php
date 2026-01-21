<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api;

// Admin APIs
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard-stats', [Api\DashboardController::class, 'adminStats']);
    Route::get('/online-users-history', [Api\DashboardController::class, 'onlineUsersHistory']);
    Route::get('/revenue-history', [Api\DashboardController::class, 'revenueHistory']);
});

// User APIs
Route::middleware(['auth:sanctum', 'user'])->group(function () {
    Route::get('/user/info', [Api\UserInfoController::class, 'userInfo']);
    Route::get('/user/online-status', [Api\UserInfoController::class, 'onlineStatus']);
    Route::get('/users/{userId}/bandwidth-history', [Api\DashboardController::class, 'userBandwidthHistory']);
    Route::get('/users/{userId}/usage', [Api\DashboardController::class, 'userUsage']);
});
