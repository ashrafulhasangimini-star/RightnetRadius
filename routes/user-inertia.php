<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\User;
use Inertia\Inertia;

Route::middleware(['auth:sanctum', 'user'])->prefix('user')->group(function () {
    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('User/Dashboard');
    })->name('user.dashboard');

    // Usage
    Route::get('/usage', [User\UsageController::class, 'index'])->name('user.usage.index');

    // Sessions
    Route::get('/sessions', [User\SessionController::class, 'index'])->name('user.sessions.index');

    // Invoices
    Route::get('/invoices', [User\InvoiceController::class, 'index'])->name('user.invoices.index');
    Route::get('/invoices/{invoice}', [User\InvoiceController::class, 'show'])->name('user.invoices.show');

    // Profile
    Route::get('/profile', [User\ProfileController::class, 'edit'])->name('user.profile.edit');
    Route::patch('/profile', [User\ProfileController::class, 'update'])->name('user.profile.update');
    Route::patch('/profile/password', [User\ProfileController::class, 'updatePassword'])->name('user.profile.update-password');

    // Payments
    Route::get('/payments', [User\PaymentController::class, 'index'])->name('user.payments.index');
});
