<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\FupService;

class CheckFupCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fup:check {--user=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check and apply FUP (Fair Usage Policy) for users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $fupService = app(FupService::class);
        
        if ($this->option('user')) {
            // Check specific user
            $user = \App\Models\User::find($this->option('user'));
            
            if (!$user) {
                $this->error('User not found');
                return 1;
            }
            
            $this->info("Checking FUP for user: {$user->username}");
            $result = $fupService->checkAndApplyFup($user);
            
            $this->table(
                ['Key', 'Value'],
                collect($result)->map(fn($v, $k) => [$k, is_array($v) ? json_encode($v) : $v])
            );
            
        } else {
            // Check all users
            $this->info('Checking FUP for all users...');
            $bar = $this->output->createProgressBar();
            $bar->start();
            
            $result = $fupService->checkAndApplyFupForAll();
            
            $bar->finish();
            $this->newLine(2);
            
            $this->info("FUP Check Completed:");
            $this->table(
                ['Metric', 'Count'],
                [
                    ['Users Checked', $result['checked']],
                    ['FUP Applied', $result['fup_applied']],
                    ['FUP Removed', $result['fup_removed']],
                    ['Errors', $result['errors']],
                ]
            );
        }
        
        return 0;
    }
}
