<?php

use Illuminate\Support\Facades\Route;
use App\Models\User;
use App\Models\Package;
use App\Models\AuthUser;
use App\Http\Controllers\RadiusController;
use App\Http\Controllers\SessionController;

// CORS Header
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Test routes
Route::get('/', function () {
    return ['message' => 'Welcome to RightnetRadius API'];
});

Route::get('health', function () {
    return ['status' => 'ok', 'timestamp' => now()];
});

Route::get('users', function () {
    return [
        ['id' => 1, 'name' => 'Rajib Khan', 'email' => 'rajib@example.com', 'status' => 'active'],
        ['id' => 2, 'name' => 'Karim Ahmed', 'email' => 'karim@example.com', 'status' => 'active'],
        ['id' => 3, 'name' => 'Fatima Islam', 'email' => 'fatima@example.com', 'status' => 'inactive'],
    ];
});

Route::get('packages', function () {
    return [
        ['id' => 1, 'name' => 'Basic Plan', 'speed' => 5, 'price' => 500],
        ['id' => 2, 'name' => 'Standard Plan', 'speed' => 10, 'price' => 1000],
        ['id' => 3, 'name' => 'Premium Plan', 'speed' => 20, 'price' => 1500],
        ['id' => 4, 'name' => 'Enterprise Plan', 'speed' => 50, 'price' => 3000],
    ];
});

Route::get('admin-users', function () {
    try {
        return AuthUser::all();
    } catch (\Exception $e) {
        return ['error' => $e->getMessage()];
    }
});

Route::middleware('api')->group(function () {
    // RADIUS Authentication & Sessions
    Route::post('radius/authenticate', [RadiusController::class, 'authenticate']);
    Route::post('radius/logout', [RadiusController::class, 'logout']);
    
    // Session Management
    Route::get('sessions', [SessionController::class, 'getActiveSessions']);
    Route::get('sessions/stats', [SessionController::class, 'getStats']);
    Route::get('sessions/{sessionId}', [SessionController::class, 'getSession']);
    Route::post('sessions/{sessionId}/disconnect', [SessionController::class, 'disconnect']);
    Route::post('sessions/{sessionId}/accounting', [SessionController::class, 'accounting']);
    Route::get('bandwidth/usage', [SessionController::class, 'getBandwidthUsage']);
    Route::get('bandwidth/quota/{username}', [SessionController::class, 'checkQuota']);
    Route::post('accounting/start', [SessionController::class, 'accountingStart']);
    Route::post('accounting/interim', [SessionController::class, 'accountingInterim']);
    Route::post('accounting/stop', [SessionController::class, 'accountingStop']);
    Route::get('users/{username}/sessions', [SessionController::class, 'getUserSessions']);
    Route::post('users/{username}/disconnect-all', [SessionController::class, 'disconnectAll']);
    Route::get('reports/sessions', [SessionController::class, 'getSessionReport']);
    Route::get('reports/bandwidth', [SessionController::class, 'getBandwidthReport']);
    
    // Authentication
    Route::post('login', function() { return ['message' => 'Login endpoint']; });
    Route::post('register', function() { return ['message' => 'Register endpoint']; });

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', function() { return ['message' => 'Logged out']; });

        // Users
        Route::get('user-list', function() { return ['users' => []]; });

        // Usage
        Route::get('usage', function() { return ['usage' => []]; });
        Route::get('usage/summary', function() { return ['summary' => []]; });

        // Invoices
        Route::get('invoices', function() { return ['invoices' => []]; });

        // Transactions
        Route::get('transactions', function() { return ['transactions' => []]; });

        // Packages
        Route::get('package-list', function() { return ['packages' => []]; });
    });
});
