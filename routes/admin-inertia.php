<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin;
use Inertia\Inertia;

Route::middleware(['auth:admin', 'admin'])->prefix('admin')->group(function () {
    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('admin.dashboard');

    // Users
    Route::get('/users', [Admin\UserController::class, 'index'])->name('admin.users.index');
    Route::get('/users/create', [Admin\UserController::class, 'create'])->name('admin.users.create');
    Route::post('/users', [Admin\UserController::class, 'store'])->name('admin.users.store');
    Route::get('/users/{user}', [Admin\UserController::class, 'show'])->name('admin.users.show');
    Route::get('/users/{user}/edit', [Admin\UserController::class, 'edit'])->name('admin.users.edit');
    Route::patch('/users/{user}', [Admin\UserController::class, 'update'])->name('admin.users.update');
    Route::delete('/users/{user}', [Admin\UserController::class, 'destroy'])->name('admin.users.destroy');
    Route::post('/users/{user}/disable', [Admin\UserController::class, 'disable'])->name('admin.users.disable');
    Route::post('/users/{user}/enable', [Admin\UserController::class, 'enable'])->name('admin.users.enable');
    Route::post('/users/{user}/renew', [Admin\UserController::class, 'renew'])->name('admin.users.renew');

    // Packages
    Route::get('/packages', [Admin\PackageController::class, 'index'])->name('admin.packages.index');
    Route::get('/packages/create', [Admin\PackageController::class, 'create'])->name('admin.packages.create');
    Route::post('/packages', [Admin\PackageController::class, 'store'])->name('admin.packages.store');
    Route::get('/packages/{package}/edit', [Admin\PackageController::class, 'edit'])->name('admin.packages.edit');
    Route::patch('/packages/{package}', [Admin\PackageController::class, 'update'])->name('admin.packages.update');
    Route::delete('/packages/{package}', [Admin\PackageController::class, 'destroy'])->name('admin.packages.destroy');

    // Invoices
    Route::get('/invoices', [Admin\InvoiceController::class, 'index'])->name('admin.invoices.index');
    Route::post('/invoices/{invoice}/mark-paid', [Admin\InvoiceController::class, 'markPaid'])->name('admin.invoices.mark-paid');

    // Reports
    Route::get('/reports', [Admin\ReportController::class, 'index'])->name('admin.reports.index');
    Route::get('/reports/revenue', [Admin\ReportController::class, 'revenue'])->name('admin.reports.revenue');
    Route::get('/reports/usage', [Admin\ReportController::class, 'usage'])->name('admin.reports.usage');
    Route::get('/reports/sessions', [Admin\ReportController::class, 'sessions'])->name('admin.reports.sessions');

    // MikroTik
    Route::get('/mikrotik', [Admin\MikroTikController::class, 'index'])->name('admin.mikrotik.index');
    Route::post('/mikrotik', [Admin\MikroTikController::class, 'store'])->name('admin.mikrotik.store');
    Route::post('/mikrotik/{device}/test', [Admin\MikroTikController::class, 'test'])->name('admin.mikrotik.test');
    Route::delete('/mikrotik/{device}', [Admin\MikroTikController::class, 'destroy'])->name('admin.mikrotik.destroy');

    // Audit Logs
    Route::get('/audit-logs', [Admin\AuditLogController::class, 'index'])->name('admin.audit-logs.index');

    // Settings
    Route::get('/settings', [Admin\SettingsController::class, 'index'])->name('admin.settings.index');
    Route::post('/settings', [Admin\SettingsController::class, 'update'])->name('admin.settings.update');
});
