<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Services\RadiusService;

/**
 * FreeRADIUS ইন্টিগ্রেশন কন্ট্রোলার
 * FreeRADIUS সার্ভার ম্যানেজমেন্ট এবং সিঙ্ক্রোনাইজেশন
 */
class FreeRadiusController extends Controller
{
    protected $radiusService;

    public function __construct(RadiusService $radiusService)
    {
        $this->radiusService = $radiusService;
    }

    /**
     * FreeRADIUS সার্ভার কনফিগারেশন দেখান
     */
    public function getConfig()
    {
        return response()->json([
            'freeradius_enabled' => config('radius.freeradius_enabled', true),
            'freeradius_host' => config('radius.freeradius_host', 'localhost'),
            'freeradius_port' => config('radius.freeradius_port', 1812),
            'freeradius_acct_port' => config('radius.freeradius_acct_port', 1813),
            'shared_secret' => '***' . substr(config('radius.freeradius_secret', ''), -4),
            'timeout' => config('radius.timeout', 5),
            'retries' => config('radius.retries', 3)
        ]);
    }

    /**
     * FreeRADIUS কনফিগারেশন আপডেট করুন
     */
    public function updateConfig(Request $request)
    {
        $validated = $request->validate([
            'freeradius_host' => 'required|ip',
            'freeradius_port' => 'required|integer|between:1,65535',
            'freeradius_acct_port' => 'required|integer|between:1,65535',
            'freeradius_secret' => 'required|string|min:8',
            'timeout' => 'integer|between:1,30',
        ]);

        // কনফিগ আপডেট করুন (.env ফাইলে)
        $envPath = base_path('.env');
        $envContent = file_get_contents($envPath);

        $envContent = preg_replace(
            '/FREERADIUS_HOST=.*/i',
            'FREERADIUS_HOST=' . $validated['freeradius_host'],
            $envContent
        );

        file_put_contents($envPath, $envContent);

        Log::info('FreeRADIUS কনফিগারেশন আপডেট হয়েছে', $validated);

        return response()->json([
            'success' => true,
            'message' => 'Configuration updated successfully',
            'config' => $validated
        ]);
    }

    /**
     * FreeRADIUS সার্ভার স্ট্যাটাস চেক করুন
     */
    public function checkStatus()
    {
        try {
            // পিং চেক
            $host = config('radius.freeradius_host', 'localhost');
            $port = config('radius.freeradius_port', 1812);

            $socket = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);
            if (!$socket) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Socket creation failed'
                ], 500);
            }

            socket_set_option($socket, SOL_SOCKET, SO_RCVTIMEO, ['sec' => 2, 'usec' => 0]);

            $testData = "STATUS_TEST_" . time();
            @socket_sendto($socket, $testData, strlen($testData), 0, $host, $port);

            $received = false;
            @socket_recvfrom($socket, $buf, 1024, 0, $from, $recvPort);
            socket_close($socket);

            return response()->json([
                'status' => 'online',
                'host' => $host,
                'port' => $port,
                'message' => 'FreeRADIUS server is running',
                'timestamp' => now()
            ]);

        } catch (\Exception $e) {
            Log::error('FreeRADIUS Status Check Error: ' . $e->getMessage());

            return response()->json([
                'status' => 'offline',
                'message' => 'FreeRADIUS server is not responding',
                'error' => $e->getMessage(),
                'timestamp' => now()
            ], 503);
        }
    }

    /**
     * সকল RADIUS ক্লায়েন্ট (NAS) দেখান
     */
    public function getNasClients()
    {
        $clients = DB::table('nas_clients')->get();

        return response()->json([
            'count' => $clients->count(),
            'clients' => $clients
        ]);
    }

    /**
     * নতুন NAS ক্লায়েন্ট যোগ করুন (RouterOS, Access Point, etc.)
     */
    public function addNasClient(Request $request)
    {
        $validated = $request->validate([
            'nas_name' => 'required|string|unique:nas_clients',
            'nas_ip' => 'required|ip|unique:nas_clients',
            'shared_secret' => 'required|string|min:8',
            'nas_type' => 'required|in:mikrotik,cisco,ubiquiti,generic',
            'description' => 'nullable|string'
        ]);

        $nasClient = DB::table('nas_clients')->insert([
            'nas_name' => $validated['nas_name'],
            'nas_ip' => $validated['nas_ip'],
            'shared_secret' => $validated['shared_secret'],
            'nas_type' => $validated['nas_type'],
            'description' => $validated['description'] ?? null,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        Log::info('NAS ক্লায়েন্ট যোগ করা হয়েছে', $validated);

        return response()->json([
            'success' => true,
            'message' => 'NAS client added successfully',
            'client' => $validated
        ]);
    }

    /**
     * NAS ক্লায়েন্ট আপডেট করুন
     */
    public function updateNasClient($id, Request $request)
    {
        $validated = $request->validate([
            'nas_name' => 'string',
            'shared_secret' => 'string|min:8',
            'status' => 'in:active,inactive'
        ]);

        DB::table('nas_clients')->where('id', $id)->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'NAS client updated'
        ]);
    }

    /**
     * NAS ক্লায়েন্ট মুছুন
     */
    public function deleteNasClient($id)
    {
        DB::table('nas_clients')->where('id', $id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'NAS client deleted'
        ]);
    }

    /**
     * RADIUS ইউজার দেখান
     */
    public function getRadiusUsers()
    {
        $users = DB::table('users')->get();

        return response()->json([
            'count' => $users->count(),
            'users' => $users
        ]);
    }

    /**
     * RADIUS ক্রেডেনশিয়াল এক্সপোর্ট করুন (FreeRADIUS ফর্ম্যাটে)
     * এটি FreeRADIUS 'users' ফাইলের জন্য ব্যবহার করা যায়
     */
    public function exportRadiusUsers()
    {
        $users = DB::table('users')->get();

        $radiusFormat = "";
        foreach ($users as $user) {
            // Simple format: username Cleartext-Password := "password"
            $radiusFormat .= "{$user->username} Cleartext-Password := \"{$user->password}\"\n";
            $radiusFormat .= "    Service-Type = Framed-User,\n";
            $radiusFormat .= "    Framed-Protocol = PPP,\n";
            $radiusFormat .= "    Framed-Compression = Van-Jacobson-TCP-IP\n\n";
        }

        return response($radiusFormat)
            ->header('Content-Type', 'text/plain')
            ->header('Content-Disposition', 'attachment; filename="radius_users.txt"');
    }

    /**
     * NAS ক্লায়েন্ট এক্সপোর্ট করুন (FreeRADIUS clients.conf ফর্ম্যাটে)
     */
    public function exportNasClients()
    {
        $clients = DB::table('nas_clients')->where('status', 'active')->get();

        $radiusFormat = "# FreeRADIUS NAS Clients Configuration\n";
        $radiusFormat .= "# Generated by ISP Management System\n";
        $radiusFormat .= "# " . now() . "\n\n";

        foreach ($clients as $client) {
            $radiusFormat .= "client {$client->nas_ip} {\n";
            $radiusFormat .= "    shortname = {$client->nas_name}\n";
            $radiusFormat .= "    secret = {$client->shared_secret}\n";
            $radiusFormat .= "    description = {$client->description}\n";
            $radiusFormat .= "    require_message_authenticator = no\n";
            $radiusFormat .= "}\n\n";
        }

        return response($radiusFormat)
            ->header('Content-Type', 'text/plain')
            ->header('Content-Disposition', 'attachment; filename="clients.conf"');
    }

    /**
     * RADIUS ইউজার অথেন্টিকেশন পরীক্ষা করুন
     */
    public function testAuthentication(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
            'nas_ip' => 'required|ip'
        ]);

        try {
            $user = DB::table('users')
                ->where('username', $validated['username'])
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                    'code' => 'USER_NOT_FOUND'
                ]);
            }

            // পাসওয়ার্ড যাচাই করুন
            $passwordValid = ($user->password === $validated['password']);

            if (!$passwordValid) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid password',
                    'code' => 'INVALID_PASSWORD'
                ]);
            }

            if ($user->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'User account is inactive',
                    'code' => 'ACCOUNT_INACTIVE'
                ]);
            }

            Log::info('RADIUS Auth Test Success', [
                'username' => $validated['username'],
                'nas_ip' => $validated['nas_ip']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Authentication successful',
                'code' => 'AUTH_SUCCESS',
                'user' => [
                    'username' => $user->username,
                    'email' => $user->email,
                    'status' => $user->status,
                    'package_id' => $user->package_id
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('RADIUS Auth Test Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'code' => 'AUTH_ERROR'
            ], 500);
        }
    }

    /**
     * RADIUS অ্যাকাউন্টিং লগ দেখান
     */
    public function getAccountingLogs()
    {
        $logs = DB::table('radius_accounting')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($logs);
    }

    /**
     * সার্ভার ডায়াগনস্টিক্স
     */
    public function getDiagnostics()
    {
        return response()->json([
            'freeradius' => [
                'status' => $this->checkFreeRadiusStatus(),
                'host' => config('radius.freeradius_host'),
                'port' => config('radius.freeradius_port'),
                'version' => 'FreeRADIUS 3.0+'
            ],
            'nas_clients' => [
                'total' => DB::table('nas_clients')->count(),
                'active' => DB::table('nas_clients')->where('status', 'active')->count()
            ],
            'radius_users' => [
                'total' => DB::table('users')->count(),
                'active' => DB::table('users')->where('status', 'active')->count()
            ],
            'recent_auth' => DB::table('audit_logs')
                ->where('action', 'RADIUS_AUTH')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),
            'database' => [
                'size' => filesize(database_path('database.sqlite')) / 1024 / 1024,
                'unit' => 'MB'
            ],
            'timestamp' => now()
        ]);
    }

    /**
     * FreeRADIUS স্ট্যাটাস প্রাইভেট মেথড
     */
    private function checkFreeRadiusStatus()
    {
        try {
            $host = config('radius.freeradius_host', 'localhost');
            $port = config('radius.freeradius_port', 1812);

            $socket = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);
            if ($socket) {
                socket_set_option($socket, SOL_SOCKET, SO_RCVTIMEO, ['sec' => 1, 'usec' => 0]);
                @socket_sendto($socket, "PING", 4, 0, $host, $port);
                @socket_recvfrom($socket, $buf, 1024, 0, $from, $port);
                socket_close($socket);
                return 'online';
            }
            return 'offline';
        } catch (\Exception $e) {
            return 'offline';
        }
    }
}
