<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $action = $request->query('action');
        
        // Mock audit logs for demonstration
        $logs = [
            [
                'id' => 1,
                'username' => 'user1',
                'action' => 'login',
                'ip_address' => '192.168.1.100',
                'details' => 'User logged in via web interface',
                'created_at' => now()->subHours(2),
            ],
            [
                'id' => 2,
                'username' => 'admin',
                'action' => 'bandwidth_limit',
                'ip_address' => '192.168.1.101',
                'details' => 'Set bandwidth limit to 5 Mbps for user1',
                'created_at' => now()->subHours(1),
            ],
            [
                'id' => 3,
                'username' => 'user2',
                'action' => 'auth',
                'ip_address' => '192.168.1.102',
                'details' => 'RADIUS authentication successful',
                'created_at' => now()->subMinutes(30),
            ],
            [
                'id' => 4,
                'username' => 'admin',
                'action' => 'user_block',
                'ip_address' => '192.168.1.101',
                'details' => 'User user3 blocked due to quota breach',
                'created_at' => now()->subMinutes(15),
            ],
            [
                'id' => 5,
                'username' => 'user1',
                'action' => 'quota_breach',
                'ip_address' => '192.168.1.100',
                'details' => 'Quota breach detected: 95% usage',
                'created_at' => now()->subMinutes(5),
            ],
        ];

        if ($action) {
            $logs = array_filter($logs, fn($log) => $log['action'] === $action);
        }

        return response()->json(array_values($logs));
    }

    public function filter(Request $request)
    {
        return $this->index($request);
    }

    public function export()
    {
        return response()->json([
            'message' => 'Export functionality coming soon',
            'format' => 'CSV, JSON, Excel',
        ]);
    }
}
