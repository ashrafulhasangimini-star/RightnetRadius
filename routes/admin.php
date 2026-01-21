<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin;

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [Admin\DashboardController::class, 'index'])->name('admin.dashboard');

    // Users Management
    Route::resource('users', Admin\UserController::class, ['as' => 'admin']);
    Route::post('users/{user}/disable', [Admin\UserController::class, 'disable'])->name('admin.users.disable');
    Route::post('users/{user}/enable', [Admin\UserController::class, 'enable'])->name('admin.users.enable');
    Route::post('users/{user}/renew', [Admin\UserController::class, 'renew'])->name('admin.users.renew');
    Route::get('users/{user}/sessions', [Admin\UserController::class, 'sessions'])->name('admin.users.sessions');

    // Packages
    Route::resource('packages', Admin\PackageController::class, ['as' => 'admin']);

    // Billing & Invoices
    Route::get('invoices', [Admin\InvoiceController::class, 'index'])->name('admin.invoices.index');
    Route::post('invoices/{invoice}/mark-paid', [Admin\InvoiceController::class, 'markPaid'])->name('admin.invoices.mark-paid');
    Route::get('transactions', [Admin\TransactionController::class, 'index'])->name('admin.transactions.index');

    // Reports
    Route::get('reports/revenue', [Admin\ReportController::class, 'revenue'])->name('admin.reports.revenue');
    Route::get('reports/usage', [Admin\ReportController::class, 'usage'])->name('admin.reports.usage');
    Route::get('reports/sessions', [Admin\ReportController::class, 'sessions'])->name('admin.reports.sessions');

    // MikroTik Management
    Route::resource('mikrotik-devices', Admin\MikroTikController::class, ['as' => 'admin']);
    Route::post('mikrotik-devices/{device}/test', [Admin\MikroTikController::class, 'test'])->name('admin.mikrotik-devices.test');
    Route::post('mikrotik-devices/{device}/sync', [Admin\MikroTikController::class, 'sync'])->name('admin.mikrotik-devices.sync');

    // Settings
    Route::get('settings', [Admin\SettingsController::class, 'edit'])->name('admin.settings.edit');
    Route::post('settings', [Admin\SettingsController::class, 'update'])->name('admin.settings.update');

    // Audit Logs
    Route::get('audit-logs', [Admin\AuditLogController::class, 'index'])->name('admin.audit-logs.index');
});
