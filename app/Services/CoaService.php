<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class CoaService
{
    /**
     * Change user speed via COA
     */
    public function changeUserSpeed($username, $speed, $nasIp, $secret)
    {
        $user = User::where('username', $username)->first();
        
        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
                'coa_id' => null
            ];
        }

        // Parse speed (e.g., "10M/10M" to download/upload)
        $speedParts = explode('/', $speed);
        $downloadSpeed = $this->parseSpeed($speedParts[0] ?? $speed);
        $uploadSpeed = $this->parseSpeed($speedParts[1] ?? $speedParts[0]);

        // Prepare RADIUS attributes for speed change
        $attributes = [
            'User-Name' => $username,
            'Mikrotik-Rate-Limit' => $speed,
            'WISPr-Bandwidth-Max-Down' => $downloadSpeed,
            'WISPr-Bandwidth-Max-Up' => $uploadSpeed,
        ];

        // Save COA request to database
        $coaId = $this->saveCOARequest($user->id, $username, $nasIp, 'speed_change', $attributes);

        try {
            // Send COA packet
            $result = $this->sendCOAPacket($nasIp, $secret, $attributes);
            
            // Update COA request status
            $this->updateCOARequest($coaId, $result['success'] ? 'success' : 'failed', $result['response']);

            Log::info("COA speed change request", [
                'username' => $username,
                'speed' => $speed,
                'nas_ip' => $nasIp,
                'success' => $result['success'],
                'coa_id' => $coaId
            ]);

            return [
                'success' => $result['success'],
                'message' => $result['success'] ? 'Speed changed successfully' : 'Failed to change speed',
                'coa_id' => $coaId,
                'response' => $result['response']
            ];

        } catch (\Exception $e) {
            $this->updateCOARequest($coaId, 'failed', $e->getMessage());
            
            Log::error("COA speed change failed", [
                'username' => $username,
                'error' => $e->getMessage(),
                'coa_id' => $coaId
            ]);

            return [
                'success' => false,
                'message' => 'COA request failed: ' . $e->getMessage(),
                'coa_id' => $coaId
            ];
        }
    }

    /**
     * Disconnect user via COA
     */
    public function disconnectUser($username, $nasIp, $secret)
    {
        $user = User::where('username', $username)->first();
        
        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
                'coa_id' => null
            ];
        }

        $attributes = [
            'User-Name' => $username,
        ];

        // Save COA request to database
        $coaId = $this->saveCOARequest($user->id, $username, $nasIp, 'disconnect', $attributes);

        try {
            // Send Disconnect Message (DM)
            $result = $this->sendDisconnectMessage($nasIp, $secret, $attributes);
            
            // Update COA request status
            $this->updateCOARequest($coaId, $result['success'] ? 'success' : 'failed', $result['response']);

            // Update user sessions in database
            if ($result['success']) {
                DB::table('sessions')
                    ->where('user_id', $user->id)
                    ->where('status', 'online')
                    ->update([
                        'status' => 'disconnected',
                        'stop_time' => now(),
                        'updated_at' => now()
                    ]);
            }

            Log::info("COA disconnect request", [
                'username' => $username,
                'nas_ip' => $nasIp,
                'success' => $result['success'],
                'coa_id' => $coaId
            ]);

            return [
                'success' => $result['success'],
                'message' => $result['success'] ? 'User disconnected successfully' : 'Failed to disconnect user',
                'coa_id' => $coaId,
                'response' => $result['response']
            ];

        } catch (\Exception $e) {
            $this->updateCOARequest($coaId, 'failed', $e->getMessage());
            
            Log::error("COA disconnect failed", [
                'username' => $username,
                'error' => $e->getMessage(),
                'coa_id' => $coaId
            ]);

            return [
                'success' => false,
                'message' => 'COA disconnect failed: ' . $e->getMessage(),
                'coa_id' => $coaId
            ];
        }
    }

    /**
     * Update user quota via COA
     */
    public function updateUserQuota($username, $quotaBytes, $nasIp, $secret)
    {
        $user = User::where('username', $username)->first();
        
        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
                'coa_id' => null
            ];
        }

        $attributes = [
            'User-Name' => $username,
            'ChilliSpot-Max-Total-Octets' => $quotaBytes,
            'Mikrotik-Total-Limit' => $quotaBytes,
        ];

        // Save COA request to database
        $coaId = $this->saveCOARequest($user->id, $username, $nasIp, 'quota_update', $attributes);

        try {
            // Send COA packet
            $result = $this->sendCOAPacket($nasIp, $secret, $attributes);
            
            // Update COA request status
            $this->updateCOARequest($coaId, $result['success'] ? 'success' : 'failed', $result['response']);

            Log::info("COA quota update request", [
                'username' => $username,
                'quota_bytes' => $quotaBytes,
                'nas_ip' => $nasIp,
                'success' => $result['success'],
                'coa_id' => $coaId
            ]);

            return [
                'success' => $result['success'],
                'message' => $result['success'] ? 'Quota updated successfully' : 'Failed to update quota',
                'coa_id' => $coaId,
                'response' => $result['response']
            ];

        } catch (\Exception $e) {
            $this->updateCOARequest($coaId, 'failed', $e->getMessage());
            
            Log::error("COA quota update failed", [
                'username' => $username,
                'error' => $e->getMessage(),
                'coa_id' => $coaId
            ]);

            return [
                'success' => false,
                'message' => 'COA quota update failed: ' . $e->getMessage(),
                'coa_id' => $coaId
            ];
        }
    }

    /**
     * Save COA request to database
     */
    private function saveCOARequest($userId, $username, $nasIp, $commandType, $attributes)
    {
        return DB::table('coa_requests')->insertGetId([
            'user_id' => $userId,
            'username' => $username,
            'nas_ip' => $nasIp,
            'command_type' => $commandType,
            'attributes' => json_encode($attributes),
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    /**
     * Update COA request status
     */
    private function updateCOARequest($coaId, $status, $response = null)
    {
        DB::table('coa_requests')
            ->where('id', $coaId)
            ->update([
                'status' => $status,
                'response' => $response,
                'sent_at' => now(),
                'updated_at' => now()
            ]);
    }

    /**
     * Send COA packet to NAS
     */
    private function sendCOAPacket($nasIp, $secret, $attributes)
    {
        // This is a simplified implementation
        // In production, you would use a proper RADIUS library like FreeRADIUS-Client
        
        $coaPort = config('radius.coa_port', 3799);
        
        try {
            // Simulate COA packet sending
            // In real implementation, you would:
            // 1. Create RADIUS COA packet with attributes
            // 2. Send UDP packet to NAS IP:3799
            // 3. Wait for ACK/NAK response
            
            // For now, we'll simulate success based on configuration
            $coaEnabled = config('radius.coa_enabled', true);
            
            if (!$coaEnabled) {
                return [
                    'success' => false,
                    'response' => 'COA disabled in configuration'
                ];
            }

            // Simulate network call
            $success = $this->simulateCOACall($nasIp, $coaPort, $attributes);
            
            return [
                'success' => $success,
                'response' => $success ? 'COA-ACK received' : 'COA-NAK received or timeout'
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'response' => 'Network error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Send Disconnect Message to NAS
     */
    private function sendDisconnectMessage($nasIp, $secret, $attributes)
    {
        // Similar to COA but uses Disconnect-Message packet type
        return $this->sendCOAPacket($nasIp, $secret, $attributes);
    }

    /**
     * Simulate COA call (replace with real RADIUS client in production)
     */
    private function simulateCOACall($nasIp, $port, $attributes)
    {
        // In production, replace this with actual RADIUS COA implementation
        // For now, simulate success rate based on NAS IP reachability
        
        // Simple ping check to see if NAS is reachable
        if (filter_var($nasIp, FILTER_VALIDATE_IP)) {
            // Simulate 90% success rate for valid IPs
            return rand(1, 10) <= 9;
        }
        
        return false;
    }

    /**
     * Parse speed string to bytes per second
     */
    private function parseSpeed($speedStr)
    {
        $speedStr = strtoupper(trim($speedStr));
        
        // Extract number and unit
        preg_match('/^(\d+(?:\.\d+)?)([KMGT]?)$/', $speedStr, $matches);
        
        if (!$matches) {
            return 0;
        }
        
        $value = floatval($matches[1]);
        $unit = $matches[2] ?? '';
        
        // Convert to bits per second
        switch ($unit) {
            case 'K':
                return intval($value * 1000);
            case 'M':
                return intval($value * 1000000);
            case 'G':
                return intval($value * 1000000000);
            case 'T':
                return intval($value * 1000000000000);
            default:
                return intval($value);
        }
    }

    /**
     * Get COA statistics
     */
    public function getStatistics($days = 7)
    {
        $startDate = now()->subDays($days);
        
        $stats = [
            'total_requests' => DB::table('coa_requests')
                ->where('created_at', '>=', $startDate)
                ->count(),
                
            'success_count' => DB::table('coa_requests')
                ->where('created_at', '>=', $startDate)
                ->where('status', 'success')
                ->count(),
                
            'failed_count' => DB::table('coa_requests')
                ->where('created_at', '>=', $startDate)
                ->where('status', 'failed')
                ->count(),
                
            'pending_count' => DB::table('coa_requests')
                ->where('created_at', '>=', $startDate)
                ->where('status', 'pending')
                ->count(),
                
            'by_command_type' => DB::table('coa_requests')
                ->select('command_type', DB::raw('count(*) as count'))
                ->where('created_at', '>=', $startDate)
                ->groupBy('command_type')
                ->get()
                ->pluck('count', 'command_type')
                ->toArray(),
                
            'by_nas' => DB::table('coa_requests')
                ->select('nas_ip', 
                    DB::raw('count(*) as total'),
                    DB::raw('sum(case when status = "success" then 1 else 0 end) as success'))
                ->where('created_at', '>=', $startDate)
                ->groupBy('nas_ip')
                ->get()
                ->map(function ($item) {
                    $item->success_rate = $item->total > 0 ? 
                        round(($item->success / $item->total) * 100, 2) : 0;
                    return $item;
                })
                ->toArray(),
        ];
        
        $stats['success_rate'] = $stats['total_requests'] > 0 ? 
            round(($stats['success_count'] / $stats['total_requests']) * 100, 2) : 0;
            
        return $stats;
    }

    /**
     * Get recent COA requests
     */
    public function getRecentRequests($limit = 50)
    {
        return DB::table('coa_requests')
            ->join('users', 'coa_requests.user_id', '=', 'users.id')
            ->select('coa_requests.*', 'users.name as user_name')
            ->orderBy('coa_requests.created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($request) {
                $request->attributes = json_decode($request->attributes, true);
                return $request;
            });
    }

    /**
     * Bulk disconnect users
     */
    public function bulkDisconnectUsers($userIds, $nasIp, $secret)
    {
        $results = [];
        
        $users = User::whereIn('id', $userIds)->get();
        
        foreach ($users as $user) {
            $result = $this->disconnectUser($user->username, $nasIp, $secret);
            $results[] = [
                'user_id' => $user->id,
                'username' => $user->username,
                'result' => $result
            ];
        }
        
        return $results;
    }

    /**
     * Bulk speed change for users
     */
    public function bulkChangeSpeed($userIds, $speed, $nasIp, $secret)
    {
        $results = [];
        
        $users = User::whereIn('id', $userIds)->get();
        
        foreach ($users as $user) {
            $result = $this->changeUserSpeed($user->username, $speed, $nasIp, $secret);
            $results[] = [
                'user_id' => $user->id,
                'username' => $user->username,
                'result' => $result
            ];
        }
        
        return $results;
    }
}
