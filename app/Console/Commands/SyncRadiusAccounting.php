<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\RadiusService;

class SyncRadiusAccounting extends Command
{
    protected $signature = 'isp:sync-radius-accounting';
    protected $description = 'Sync FreeRADIUS accounting records';

    public function handle()
    {
        $radiusService = new RadiusService();
        $radiusService->syncAccounting();

        $this->info('RADIUS accounting synced');
    }
}
