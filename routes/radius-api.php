<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RadiusController;
use App\Http\Controllers\SessionController;

Route::prefix('api')->group(function () {
    // RADIUS Authentication
    Route::post('/radius/authenticate', [RadiusController::class, 'authenticate']);
    Route::post('/radius/logout', [RadiusController::class, 'logout']);
    
    // Sessions
    Route::get('/sessions', [SessionController::class, 'getActiveSessions']);
    Route::get('/sessions/stats', [SessionController::class, 'getStats']);
    Route::get('/sessions/{sessionId}', [SessionController::class, 'getSession']);
    Route::post('/sessions/{sessionId}/disconnect', [SessionController::class, 'disconnect']);
    Route::post('/sessions/{sessionId}/accounting', [SessionController::class, 'accounting']);
    
    // Bandwidth & Accounting
    Route::get('/bandwidth/usage', [SessionController::class, 'getBandwidthUsage']);
    Route::get('/bandwidth/quota/{username}', [SessionController::class, 'checkQuota']);
    Route::post('/accounting/start', [SessionController::class, 'accountingStart']);
    Route::post('/accounting/interim', [SessionController::class, 'accountingInterim']);
    Route::post('/accounting/stop', [SessionController::class, 'accountingStop']);
    
    // User Package Management
    Route::get('/users/{username}/sessions', [SessionController::class, 'getUserSessions']);
    Route::post('/users/{username}/disconnect-all', [SessionController::class, 'disconnectAll']);
    
    // Reports
    Route::get('/reports/sessions', [SessionController::class, 'getSessionReport']);
    Route::get('/reports/bandwidth', [SessionController::class, 'getBandwidthReport']);
});
