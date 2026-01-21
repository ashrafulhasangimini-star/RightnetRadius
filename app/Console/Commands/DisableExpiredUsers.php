<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BillingService;

class DisableExpiredUsers extends Command
{
    protected $signature = 'isp:disable-expired-users';
    protected $description = 'Disable users whose subscription has expired';

    public function handle()
    {
        $billingService = new BillingService();
        $count = $billingService->disableExpiredUsers();

        $this->info("Disabled {$count} expired users");
    }
}
