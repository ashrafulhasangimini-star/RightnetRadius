<?php

namespace App\Services;

use App\Models\Session;
use App\Models\User;
use App\Models\Package;
use Illuminate\Support\Str;

class FreeRadiusService
{
    // RADIUS Constants
    const RADIUS_AUTH_PORT = 1812;
    const RADIUS_ACCT_PORT = 1813;
    const RADIUS_TIMEOUT = 3;
    const RADIUS_RETRIES = 3;
    
    // RADIUS Attribute Types
    const RADIUS_ATTRS = [
        'User-Name' => 1,
        'User-Password' => 2,
        'Reply-Message' => 18,
        'State' => 24,
        'Session-Timeout' => 27,
        'Idle-Timeout' => 28,
        'Termination-Action' => 29,
        'Framed-IP-Address' => 8,
        'Framed-IP-Netmask' => 9,
        'NAS-IP-Address' => 4,
        'NAS-Port' => 5,
        'NAS-Port-Type' => 61,
        'Service-Type' => 6,
        'Framed-Protocol' => 7,
        'Acct-Status-Type' => 40,
        'Acct-Input-Octets' => 42,
        'Acct-Output-Octets' => 43,
        'Acct-Session-Id' => 44,
        'Acct-Session-Time' => 46,
        'Called-Station-Id' => 30,
        'Calling-Station-Id' => 31,
        'NAS-Identifier' => 32,
        'Acct-Delay-Time' => 41,
        'Acct-Authentic' => 45,
    ];

    private $radiusServer;
    private $radiusSecret;
    private $nasIp;
    private $socket;

    public function __construct()
    {
        $this->radiusServer = config('radius.server', '127.0.0.1');
        $this->radiusSecret = config('radius.secret', 'testing123');
        $this->nasIp = config('radius.nas_ip', '192.168.1.1');
    }

    /**
     * Authenticate user with RADIUS server
     */
    public function authenticateUser($username, $password)
    {
        try {
            // Create RADIUS Access-Request packet
            $packet = $this->createAccessRequest($username, $password);
            
            // Send to RADIUS server
            $response = $this->sendRadiusPacket($packet, self::RADIUS_AUTH_PORT);
            
            if (!$response) {
                return [
                    'success' => false,
                    'message' => 'RADIUS server unreachable',
                ];
            }
            
            // Parse response
            $responseCode = $this->parseRadiusResponse($response);
            
            if ($responseCode === 'Access-Accept') {
                // Create database session
                $session = $this->createSession($username, $password);
                
                return [
                    'success' => true,
                    'session_id' => $session->session_id,
                    'framed_ip' => $session->framed_ip,
                    'session_timeout' => 86400,
                    'message' => 'Authentication successful',
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Authentication rejected by RADIUS server',
                ];
            }
            
        } catch (\Exception $e) {
            \Log::error('RADIUS Auth Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Authentication error: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Create RADIUS Access-Request packet
     */
    private function createAccessRequest($username, $password)
    {
        $packet = [
            'code' => 1, // Access-Request
            'id' => random_int(0, 255),
            'attributes' => [],
        ];
        
        // Add User-Name attribute
        $packet['attributes'][] = [
            'type' => 1, // User-Name
            'value' => $username,
        ];
        
        // Add User-Password attribute (encrypted)
        $packet['attributes'][] = [
            'type' => 2, // User-Password
            'value' => $this->encryptPassword($password),
        ];
        
        // Add NAS-IP-Address
        $packet['attributes'][] = [
            'type' => 4, // NAS-IP-Address
            'value' => ip2long($this->nasIp),
        ];
        
        // Add NAS-Port
        $packet['attributes'][] = [
            'type' => 5, // NAS-Port
            'value' => random_int(1, 65535),
        ];
        
        // Add Service-Type
        $packet['attributes'][] = [
            'type' => 6, // Service-Type
            'value' => 2, // Framed-User
        ];
        
        return $packet;
    }

    /**
     * Encrypt password for RADIUS
     */
    private function encryptPassword($password)
    {
        // Simple encryption (in production, use proper RADIUS encryption)
        return md5($this->radiusSecret . $password);
    }

    /**
     * Send RADIUS packet to server
     */
    private function sendRadiusPacket($packet, $port = self::RADIUS_AUTH_PORT)
    {
        try {
            $socket = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);
            if ($socket === false) {
                throw new \Exception('Cannot create socket');
            }
            
            socket_set_option($socket, SOL_SOCKET, SO_RCVTIMEO, [
                'sec' => self::RADIUS_TIMEOUT,
                'usec' => 0,
            ]);
            
            $packetData = $this->encodeRadiusPacket($packet);
            
            $retries = 0;
            while ($retries < self::RADIUS_RETRIES) {
                $sent = @socket_sendto($socket, $packetData, strlen($packetData), 0, $this->radiusServer, $port);
                
                if ($sent === false) {
                    $retries++;
                    continue;
                }
                
                $response = '';
                $from = '';
                $port_recv = 0;
                
                $bytes = @socket_recvfrom($socket, $response, 4096, 0, $from, $port_recv);
                
                socket_close($socket);
                
                if ($bytes !== false) {
                    return $response;
                }
                
                $retries++;
            }
            
            socket_close($socket);
            return null;
            
        } catch (\Exception $e) {
            \Log::error('Socket Error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Encode RADIUS packet
     */
    private function encodeRadiusPacket($packet)
    {
        $data = '';
        $data .= pack('C', $packet['code']); // Code
        $data .= pack('C', $packet['id']); // ID
        
        // Placeholder for length
        $length_pos = strlen($data);
        $data .= pack('n', 0);
        
        // Authenticator (request)
        $data .= md5($this->radiusSecret, true);
        
        // Attributes
        foreach ($packet['attributes'] as $attr) {
            $data .= $this->encodeAttribute($attr['type'], $attr['value']);
        }
        
        // Update length
        $length = strlen($data);
        $data = substr_replace($data, pack('n', $length), $length_pos, 2);
        
        return $data;
    }

    /**
     * Encode single RADIUS attribute
     */
    private function encodeAttribute($type, $value)
    {
        if (is_int($value)) {
            $value = pack('N', $value);
        } elseif (is_string($value)) {
            // String value remains as is
        }
        
        $attr = pack('CC', $type, strlen($value) + 2);
        $attr .= $value;
        return $attr;
    }

    /**
     * Parse RADIUS response
     */
    private function parseRadiusResponse($response)
    {
        if (strlen($response) < 20) {
            return null;
        }
        
        $code = ord($response[0]);
        
        // 2 = Access-Accept, 3 = Access-Reject, 11 = Access-Challenge
        switch ($code) {
            case 2:
                return 'Access-Accept';
            case 3:
                return 'Access-Reject';
            case 11:
                return 'Access-Challenge';
            default:
                return 'Unknown';
        }
    }

    /**
     * Create session in database
     */
    private function createSession($username, $password)
    {
        $user = User::where('username', $username)->firstOrFail();
        
        $sessionId = Str::uuid();
        $framedIp = $this->generateFramedIP();
        
        $session = Session::create([
            'session_id' => $sessionId,
            'username' => $username,
            'user_id' => $user->id,
            'status' => 'active',
            'framed_ip' => $framedIp,
            'nas_ip' => $this->nasIp,
            'nas_port' => random_int(1, 65535),
            'service_type' => 'Framed-User',
            'protocol' => 'PPP',
            'session_start' => now(),
            'session_duration' => 0,
            'input_octets' => 0,
            'output_octets' => 0,
            'acct_delay_time' => 0,
        ]);
        
        return $session;
    }

    /**
     * Generate framed IP address
     */
    private function generateFramedIP()
    {
        // Generate IP from pool: 192.168.100.x
        $lastOctet = random_int(2, 254);
        return "192.168.100." . $lastOctet;
    }

    /**
     * Get active sessions
     */
    public function getActiveSessions($username = null)
    {
        $query = Session::where('status', 'active');
        
        if ($username) {
            $query->where('username', $username);
        }
        
        return $query->get()->map(function ($session) {
            return [
                'session_id' => $session->session_id,
                'username' => $session->username,
                'framed_ip' => $session->framed_ip,
                'started_at' => $session->session_start,
                'duration_seconds' => $session->session_duration ?? 0,
                'input_mb' => round($session->input_octets / (1024 * 1024), 2),
                'output_mb' => round($session->output_octets / (1024 * 1024), 2),
                'total_mb' => round(($session->input_octets + $session->output_octets) / (1024 * 1024), 2),
            ];
        })->toArray();
    }

    /**
     * Accounting Start
     */
    public function accountingStart($data)
    {
        $session = Session::where('session_id', $data['session_id'])->first();
        
        if ($session) {
            $session->update([
                'status' => 'active',
                'session_start' => now(),
            ]);
        }
        
        return [
            'success' => true,
            'session_id' => $data['session_id'],
            'status' => 'started',
        ];
    }

    /**
     * Accounting Interim Update
     */
    public function accountingUpdate($data)
    {
        $session = Session::where('session_id', $data['session_id'])->first();
        
        if ($session) {
            $session->update([
                'input_octets' => $data['acct_input_octets'] ?? $session->input_octets,
                'output_octets' => $data['acct_output_octets'] ?? $session->output_octets,
                'session_duration' => $data['acct_session_time'] ?? $session->session_duration,
            ]);
        }
        
        return [
            'success' => true,
            'session_id' => $data['session_id'],
            'status' => 'interim',
        ];
    }

    /**
     * Accounting Stop
     */
    public function accountingStop($sessionId, $reason = 'User-Request')
    {
        $session = Session::where('session_id', $sessionId)->first();
        
        if ($session) {
            $session->update([
                'status' => 'closed',
                'session_end' => now(),
                'termination_reason' => $reason,
            ]);
        }
        
        return [
            'success' => true,
            'session_id' => $sessionId,
            'status' => 'stopped',
            'reason' => $reason,
        ];
    }

    /**
     * Disconnect user
     */
    public function disconnectUser($sessionId, $reason = 'Admin-Disconnect')
    {
        return $this->accountingStop($sessionId, $reason);
    }

    /**
     * Get session statistics
     */
    public function getSessionStats()
    {
        $activeSessions = Session::where('status', 'active')->get();
        $totalSessions = Session::where('created_at', '>=', now()->subDay())->get();
        
        $totalInput = $activeSessions->sum('input_octets');
        $totalOutput = $activeSessions->sum('output_octets');
        
        return [
            'active_sessions' => $activeSessions->count(),
            'total_sessions_today' => $totalSessions->count(),
            'download_gb' => round($totalInput / (1024 * 1024 * 1024), 2),
            'upload_gb' => round($totalOutput / (1024 * 1024 * 1024), 2),
            'total_gb' => round(($totalInput + $totalOutput) / (1024 * 1024 * 1024), 2),
            'avg_session_duration' => round($activeSessions->avg('session_duration') ?? 0),
        ];
    }

    /**
     * Check quota
     */
    public function checkQuota($username, $package = null)
    {
        $user = User::where('username', $username)->first();
        
        if (!$user) {
            return ['success' => false, 'message' => 'User not found'];
        }
        
        $pkg = $package ? Package::find($package) : $user->package;
        
        if (!$pkg) {
            return ['success' => false, 'message' => 'Package not found'];
        }
        
        $sessions = Session::where('username', $username)->get();
        $usedData = $sessions->sum(function ($s) {
            return ($s->input_octets + $s->output_octets) / (1024 * 1024 * 1024);
        });
        
        $quotaGb = $pkg->data_limit ?? 100;
        $remainingGb = $quotaGb - $usedData;
        $usagePercent = ($usedData / $quotaGb) * 100;
        
        return [
            'success' => true,
            'username' => $username,
            'package' => $pkg->name,
            'quota_gb' => $quotaGb,
            'used_gb' => round($usedData, 2),
            'remaining_gb' => round($remainingGb, 2),
            'usage_percent' => round($usagePercent, 2),
            'quota_exceeded' => $usagePercent > 100,
        ];
    }
}
