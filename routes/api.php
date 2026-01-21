<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api;

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
