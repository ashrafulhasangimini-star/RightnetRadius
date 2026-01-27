<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class CoaService
{
    /**
     * Send RADIUS Change of Authorization command
     * 
     * @param string $username
     * @param array $attributes
     * @param string $nasIp
     * @param int $coaPort
     * @param string $secret
     * @return array
     */
    public function sendCoaCommand(
        string $username,
        array $attributes,
        string $nasIp = '192.168.1.1',
        int $coaPort = 3799,
        string $secret = 'secret123'
    ): array {
        try {
            // Build RADIUS CoA packet
            $packet = $this->buildCoaPacket($username, $attributes, $secret);
            
            // Send UDP packet to NAS
            $socket = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);
            socket_set_option($socket, SOL_SOCKET, SO_RCVTIMEO, ['sec' => 5, 'usec' => 0]);
            
            socket_sendto($socket, $packet, strlen($packet), 0, $nasIp, $coaPort);
            
            // Wait for ACK
            $response = '';
            $from = '';
            $port = 0;
            socket_recvfrom($socket, $response, 4096, 0, $from, $port);
            
            socket_close($socket);
            
            Log::info("CoA sent to {$nasIp}:{$coaPort} for user {$username}", [
                'attributes' => $attributes,
                'response' => bin2hex($response)
            ]);
            
            return [
                'success' => true,
                'message' => 'CoA command sent successfully',
                'username' => $username,
                'nas_ip' => $nasIp
            ];
            
        } catch (\Exception $e) {
            Log::error("CoA failed: " . $e->getMessage());
            
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Disconnect user session
     */
    public function disconnectUser(string $username, string $nasIp, string $secret): array
    {
        return $this->sendCoaCommand($username, [
            'Acct-Session-Id' => $this->getActiveSessionId($username),
        ], $nasIp, 3799, $secret);
    }
    
    /**
     * Change user speed (Mikrotik Rate-Limit)
     */
    public function changeSpeed(string $username, string $rateLimit, string $nasIp, string $secret): array
    {
        // Rate limit format: "download/upload" (e.g., "10M/10M")
        return $this->sendCoaCommand($username, [
            'Mikrotik-Rate-Limit' => $rateLimit,
        ], $nasIp, 3799, $secret);
    }
    
    /**
     * Update user quota
     */
    public function updateQuota(string $username, int $quotaBytes, string $nasIp, string $secret): array
    {
        return $this->sendCoaCommand($username, [
            'ChilliSpot-Max-Total-Octets' => $quotaBytes,
        ], $nasIp, 3799, $secret);
    }
    
    /**
     * Build RADIUS CoA packet (simplified)
     */
    private function buildCoaPacket(string $username, array $attributes, string $secret): string
    {
        // RADIUS CoA packet structure
        $code = 43; // CoA-Request
        $identifier = rand(0, 255);
        
        // Build attributes
        $attrs = '';
        
        // User-Name attribute (Type: 1)
        $attrs .= pack('C', 1); // Type
        $attrs .= pack('C', 2 + strlen($username)); // Length
        $attrs .= $username;
        
        // Additional attributes
        foreach ($attributes as $name => $value) {
            $attrType = $this->getAttributeType($name);
            if ($attrType) {
                $attrs .= pack('C', $attrType);
                $attrs .= pack('C', 2 + strlen($value));
                $attrs .= $value;
            }
        }
        
        // Build packet
        $length = 20 + strlen($attrs); // Header (20) + Attributes
        
        $packet = pack('C', $code);
        $packet .= pack('C', $identifier);
        $packet .= pack('n', $length);
        $packet .= str_repeat("\x00", 16); // Authenticator (placeholder)
        $packet .= $attrs;
        
        // Calculate authenticator
        $authenticator = md5($packet . $secret);
        
        // Replace authenticator in packet
        return substr($packet, 0, 4) . $authenticator . substr($packet, 20);
    }
    
    /**
     * Get RADIUS attribute type number
     */
    private function getAttributeType(string $name): ?int
    {
        $types = [
            'User-Name' => 1,
            'User-Password' => 2,
            'NAS-IP-Address' => 4,
            'Session-Timeout' => 27,
            'Acct-Session-Id' => 44,
            'Mikrotik-Rate-Limit' => 14, // Vendor-Specific
            'ChilliSpot-Max-Total-Octets' => 21, // Vendor-Specific
        ];
        
        return $types[$name] ?? null;
    }
    
    /**
     * Get active session ID for user
     */
    private function getActiveSessionId(string $username): string
    {
        // Query radacct table for active session
        $session = DB::table('radacct')
            ->where('username', $username)
            ->whereNull('acctstoptime')
            ->orderBy('acctstarttime', 'desc')
            ->first();
            
        return $session->acctsessionid ?? '';
    }
    
    /**
     * Apply FUP (Fair Usage Policy) speed reduction
     */
    public function applyFup(string $username, string $nasIp, string $secret): array
    {
        // Get user's package info
        $user = \App\Models\User::where('username', $username)->first();
        
        if (!$user || !$user->package) {
            return ['success' => false, 'message' => 'User or package not found'];
        }
        
        // Calculate usage
        $usage = $this->calculateMonthlyUsage($username);
        $quota = $user->package->quota_gb * 1024 * 1024 * 1024; // Convert GB to bytes
        
        if ($usage > $quota) {
            // Apply FUP speed
            $fupSpeed = $user->package->fup_speed ?? '1M/1M';
            
            return $this->changeSpeed($username, $fupSpeed, $nasIp, $secret);
        }
        
        return ['success' => true, 'message' => 'Within quota, no FUP applied'];
    }
    
    /**
     * Calculate user's monthly data usage
     */
    private function calculateMonthlyUsage(string $username): int
    {
        $startOfMonth = now()->startOfMonth();
        
        $usage = DB::table('radacct')
            ->where('username', $username)
            ->where('acctstarttime', '>=', $startOfMonth)
            ->sum(DB::raw('acctinputoctets + acctoutputoctets'));
            
        return (int) $usage;
    }
}
