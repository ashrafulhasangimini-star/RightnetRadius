<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BillingService;
use App\Models\User;

class GenerateMonthlyInvoices extends Command
{
    protected $signature = 'isp:generate-invoices';
    protected $description = 'Generate monthly invoices for active users';

    public function handle()
    {
        $billingService = new BillingService();

        $activeUsers = User::where('status', 'active')
            ->where('expires_at', '>', now())
            ->has('package')
            ->get();

        $count = 0;
        foreach ($activeUsers as $user) {
            $billingService->generateInvoice($user);
            $count++;
        }

        $this->info("Generated {$count} invoices");
    }
}
