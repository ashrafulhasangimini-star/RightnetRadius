<?php

use Illuminate\Support\Facades\Route;
use App\Models\User;
use App\Models\Package;
use App\Models\AuthUser;

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
    Route::post('login', [Api\AuthController::class, 'login']);
    Route::post('register', [Api\AuthController::class, 'register']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [Api\AuthController::class, 'logout']);

        // Users
        Route::resource('users', Api\UserController::class)->except(['create', 'edit']);

        // Sessions
        Route::get('sessions', [Api\SessionController::class, 'index']);
        Route::get('sessions/{session}', [Api\SessionController::class, 'show']);

        // Usage
        Route::get('usage', [Api\UsageController::class, 'index']);
        Route::get('usage/summary', [Api\UsageController::class, 'summary']);

        // Invoices
        Route::resource('invoices', Api\InvoiceController::class)->only(['index', 'show']);

        // Transactions
        Route::resource('transactions', Api\TransactionController::class)->only(['index', 'store']);

        // Packages
        Route::resource('packages', Api\PackageController::class)->only(['index', 'show']);
    });
});
