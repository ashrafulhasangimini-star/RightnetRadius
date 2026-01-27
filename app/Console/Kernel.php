<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Check and apply FUP every hour
        $schedule->call(function () {
            $fupService = app(\App\Services\FupService::class);
            $result = $fupService->checkAndApplyFupForAll();
            
            \Illuminate\Support\Facades\Log::info('FUP check completed', $result);
        })->hourly();
        
        // Reset monthly FUP usage on 1st of each month
        $schedule->call(function () {
            $fupService = app(\App\Services\FupService::class);
            $count = $fupService->resetMonthlyUsage();
            
            \Illuminate\Support\Facades\Log::info('Monthly FUP reset completed', ['count' => $count]);
        })->monthlyOn(1, '00:00');
        
        // Generate monthly invoices
        $schedule->command('isp:generate-invoices')->monthlyOn(1, '01:00');
        
        // Disable expired users
        $schedule->command('isp:disable-expired-users')->daily();
        
        // Sync RADIUS accounting
        $schedule->command('isp:sync-radius-accounting')->everyFiveMinutes();
        
        // Sync MikroTik sessions
        $schedule->command('isp:sync-mikrotik-sessions')->everyTenMinutes();
        
        // Send payment reminders
        $schedule->call(function () {
            // TODO: Implement payment reminder logic
        })->daily();
        
        // Backup database
        $schedule->command('backup:database')->daily()->at('02:00');
        
        // Clean old logs
        $schedule->command('log:clean')->weekly();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
