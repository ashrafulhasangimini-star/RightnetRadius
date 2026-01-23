<?php

use Illuminate\Support\Facades\Route;
use App\Models\User;
use App\Models\Package;
use App\Models\AuthUser;
use App\Http\Controllers\RadiusController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\AuditLogController;

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
    // Authentication
    Route::post('auth/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
    Route::post('auth/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
    
    // RADIUS Authentication & Sessions
    Route::post('radius/authenticate', [\App\Http\Controllers\Api\RadiusAuthController::class, 'authenticate']);
    Route::post('accounting/start', [\App\Http\Controllers\Api\RadiusAuthController::class, 'accountingStart']);
    Route::post('accounting/interim', [\App\Http\Controllers\Api\RadiusAuthController::class, 'accountingInterim']);
    Route::post('accounting/stop', [\App\Http\Controllers\Api\RadiusAuthController::class, 'accountingStop']);
    Route::get('bandwidth/quota/{username}', [\App\Http\Controllers\Api\RadiusAuthController::class, 'checkQuota']);
    
    // Bandwidth Management
    Route::get('bandwidth/usage', [\App\Http\Controllers\Api\BandwidthController::class, 'getUsage']);
    Route::get('bandwidth/history', [\App\Http\Controllers\Api\BandwidthController::class, 'getHistory']);
    Route::get('bandwidth/top-users', [\App\Http\Controllers\Api\BandwidthController::class, 'getTopUsers']);
    Route::post('bandwidth/limit', [\App\Http\Controllers\Api\BandwidthController::class, 'setLimit']);
    Route::post('bandwidth/block', [\App\Http\Controllers\Api\BandwidthController::class, 'blockUser']);
    Route::post('bandwidth/unblock', [\App\Http\Controllers\Api\BandwidthController::class, 'unblockUser']);
    Route::post('bandwidth/disconnect', [\App\Http\Controllers\Api\BandwidthController::class, 'disconnect']);
    
    // Audit Logs
    Route::get('audit/logs', [\App\Http\Controllers\Api\AuditLogController::class, 'index']);
    Route::get('audit/logs/filter', [\App\Http\Controllers\Api\AuditLogController::class, 'filter']);
    Route::get('audit/logs/export', [\App\Http\Controllers\Api\AuditLogController::class, 'export']);
    
    // Customer Dashboard
    Route::get('customer/dashboard', [\App\Http\Controllers\Api\CustomerController::class, 'dashboard']);
    Route::get('customer/profile', [\App\Http\Controllers\Api\CustomerController::class, 'profile']);
    Route::post('customer/profile/update', [\App\Http\Controllers\Api\CustomerController::class, 'updateProfile']);
    
    // Admin Configuration
    Route::post('admin/config', [\App\Http\Controllers\Api\AdminController::class, 'saveConfig']);
    Route::get('admin/config', [\App\Http\Controllers\Api\AdminController::class, 'getConfig']);
    Route::get('admin/status', [\App\Http\Controllers\Api\AdminController::class, 'systemStatus']);
    
    // Session Management
    Route::get('sessions', [\App\Http\Controllers\Api\SessionController::class, 'getActiveSessions']);
    Route::get('sessions/stats', [\App\Http\Controllers\Api\SessionController::class, 'getStats']);
    Route::get('users/{username}/sessions', [\App\Http\Controllers\Api\SessionController::class, 'getUserSessions']);
    Route::post('users/{username}/disconnect-all', [\App\Http\Controllers\Api\SessionController::class, 'disconnectAll']);

    // FreeRADIUS Integration Routes
    Route::prefix('freeradius')->group(function () {
        // Configuration Management
        Route::get('config', [\App\Http\Controllers\FreeRadiusController::class, 'getConfig']);
        Route::put('config', [\App\Http\Controllers\FreeRadiusController::class, 'updateConfig']);
        
        // Server Status & Health Check
        Route::get('status', [\App\Http\Controllers\FreeRadiusController::class, 'checkStatus']);
        Route::get('diagnostics', [\App\Http\Controllers\FreeRadiusController::class, 'getDiagnostics']);
        
        // NAS Clients Management (RouterOS, WiFi Access Points, etc.)
        Route::get('nas-clients', [\App\Http\Controllers\FreeRadiusController::class, 'getNasClients']);
        Route::post('nas-clients', [\App\Http\Controllers\FreeRadiusController::class, 'addNasClient']);
        Route::put('nas-clients/{id}', [\App\Http\Controllers\FreeRadiusController::class, 'updateNasClient']);
        Route::delete('nas-clients/{id}', [\App\Http\Controllers\FreeRadiusController::class, 'deleteNasClient']);
        
        // RADIUS Users Management
        Route::get('users', [\App\Http\Controllers\FreeRadiusController::class, 'getRadiusUsers']);
        
        // Export Functions (for FreeRADIUS server configuration)
        Route::get('export/users', [\App\Http\Controllers\FreeRadiusController::class, 'exportRadiusUsers']);
        Route::get('export/clients', [\App\Http\Controllers\FreeRadiusController::class, 'exportNasClients']);
        
        // Authentication Testing
        Route::post('test-auth', [\App\Http\Controllers\FreeRadiusController::class, 'testAuthentication']);
        
        // Accounting Logs
        Route::get('accounting-logs', [\App\Http\Controllers\FreeRadiusController::class, 'getAccountingLogs']);
    });

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
