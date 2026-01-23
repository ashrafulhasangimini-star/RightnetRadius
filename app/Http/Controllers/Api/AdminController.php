<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminController extends Controller
{
    public function saveConfig(Request $request)
    {
        $config = $request->validate([
            'radius' => 'array',
            'mikrotik' => 'array',
            'system' => 'array',
        ]);

        // Save to cache for demo purposes
        Cache::put('system_config', $config, now()->addDays(365));

        return response()->json([
            'message' => 'Configuration saved successfully',
            'success' => true,
            'config' => $config,
        ]);
    }

    public function getConfig()
    {
        $config = Cache::get('system_config', [
            'radius' => [
                'host' => '127.0.0.1',
                'port' => 1812,
                'secret' => 'sharedsecret',
                'timeout' => 3,
            ],
            'mikrotik' => [
                'host' => '192.168.1.1',
                'port' => 8728,
                'username' => 'admin',
            ],
            'system' => [
                'max_users' => 1000,
                'default_quota_gb' => 100,
                'enable_audit' => true,
                'enable_websocket' => true,
            ],
        ]);

        return response()->json($config);
    }

    public function systemStatus()
    {
        return response()->json([
            'radius_server' => [
                'status' => 'connected',
                'host' => '127.0.0.1',
                'port' => 1812,
                'requests' => 1234,
                'uptime' => '24h 30m',
            ],
            'mikrotik_api' => [
                'status' => 'connected',
                'host' => '192.168.1.1',
                'port' => 8728,
                'users' => 456,
                'sessions' => 389,
            ],
            'database' => [
                'status' => 'connected',
                'engine' => 'MySQL',
                'tables' => 12,
                'size_mb' => 250,
            ],
            'websocket' => [
                'status' => 'connected',
                'clients' => 23,
                'messages_per_second' => 1245,
            ],
        ]);
    }
}
