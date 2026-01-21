<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\User;

Route::middleware(['auth:sanctum', 'user'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [User\DashboardController::class, 'index'])->name('user.dashboard');

    // Usage & Sessions
    Route::get('sessions', [User\SessionController::class, 'index'])->name('user.sessions');
    Route::get('usage', [User\UsageController::class, 'index'])->name('user.usage');

    // Billing
    Route::get('invoices', [User\InvoiceController::class, 'index'])->name('user.invoices');
    Route::get('invoices/{invoice}', [User\InvoiceController::class, 'show'])->name('user.invoices.show');
    Route::get('payments', [User\PaymentController::class, 'index'])->name('user.payments');

    // Account
    Route::get('profile', [User\ProfileController::class, 'edit'])->name('user.profile.edit');
    Route::post('profile', [User\ProfileController::class, 'update'])->name('user.profile.update');
    Route::post('password', [User\ProfileController::class, 'updatePassword'])->name('user.password.update');
});
