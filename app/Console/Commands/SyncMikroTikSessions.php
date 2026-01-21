<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\MikroTikService;
use App\Models\User;

class SyncMikroTikSessions extends Command
{
    protected $signature = 'isp:sync-mikrotik-sessions';
    protected $description = 'Sync active sessions from MikroTik';

    public function handle()
    {
        try {
            $mikrotikService = new MikroTikService();
            $sessions = $mikrotikService->getActiveSessions();

            $synced = 0;
            foreach ($sessions as $session) {
                $user = User::where('username', $session['username'])->first();
                if ($user) {
                    $user->sessions()->updateOrCreate(
                        ['unique_id' => $session['id']],
                        [
                            'nas_ip_address' => '192.168.1.1', // MikroTik IP
                            'framed_ip_address' => $session['ip_address'],
                            'status' => 'online',
                            'started_at' => now(),
                            'input_octets' => $session['input_octets'],
                            'output_octets' => $session['output_octets'],
                        ]
                    );
                    $synced++;
                }
            }

            $this->info("Synced {$synced} active sessions");
        } catch (\Exception $e) {
            $this->error('Sync failed: ' . $e->getMessage());
        }
    }
}
