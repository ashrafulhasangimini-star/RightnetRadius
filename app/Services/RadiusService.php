<?php

namespace App\Services;

use App\Models\User;
use App\Models\Session;
use Illuminate\Support\Facades\DB;
use PDO;

class RadiusService
{
    private $radiusHost;
    private $radiusPort;
    private $radiusSecret;

    public function __construct()
    {
        $this->radiusHost = config('radius.host', '127.0.0.1');
        $this->radiusPort = config('radius.port', 1812);
        $this->radiusSecret = config('radius.secret', 'shared_secret');
    }

    /**
     * Authenticate user via RADIUS
     */
    public function authenticateUser($username, $password)
    {
        try {
            // Validate credentials
            $user = User::where('email', $username)->first();
            
            if (!$user || !$this->validatePassword($password, $user->password)) {
                return [
                    'success' => false,
                    'error' => 'Invalid credentials'
                ];
            }

            // Create RADIUS session
            $session = Session::create([
                'user_id' => $user->id,
                'session_id' => uniqid('radius_', true),
                'nas_ip' => request()->ip() ?? '127.0.0.1',
                'nas_port' => rand(1024, 65535),
                'framed_ip' => $this->assignFramedIP(),
                'start_time' => now(),
                'status' => 'active'
            ]);

            return [
                'success' => true,
                'user_id' => $user->id,
                'session_id' => $session->session_id,
                'username' => $user->email,
                'framed_ip' => $session->framed_ip,
                'session_timeout' => 3600,
                'idle_timeout' => 600
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Validate password
     */
    private function validatePassword($inputPassword, $hashedPassword)
    {
        // Simple mock validation - in production use proper hashing
        return $inputPassword === $hashedPassword || password_verify($inputPassword, $hashedPassword);
    }

    /**
     * Assign framed IP address
     */
    private function assignFramedIP()
    {
        $lastOctet = DB::table('sessions')->max('framed_ip');
        if (!$lastOctet) {
            $nextOctet = 100;
        } else {
            $parts = explode('.', $lastOctet);
            $nextOctet = intval($parts[3]) + 1;
            if ($nextOctet > 254) $nextOctet = 100;
        }
        
        return "10.0.0.$nextOctet";
    }

    /**
     * Accounting start
     */
    public function accountingStart($username, $sessionId, $nasIp = null, $nasPort = null)
    {
        return [
            'success' => true,
            'accounting_id' => uniqid('acct_', true),
            'timestamp' => now(),
            'type' => 'Start'
        ];
    }

    /**
     * Accounting interim update
     */
    public function accountingUpdate($sessionId, $inputOctets, $outputOctets)
    {
        return [
            'success' => true,
            'input_octets' => $inputOctets,
            'output_octets' => $outputOctets,
            'timestamp' => now(),
            'type' => 'Interim-Update'
        ];
    }

    /**
     * Accounting stop
     */
    public function accountingStop($sessionId, $inputOctets, $outputOctets, $sessionTime)
    {
        $session = Session::where('session_id', $sessionId)->first();
        
        if ($session) {
            $session->update([
                'input_octets' => $inputOctets,
                'output_octets' => $outputOctets,
                'session_time' => $sessionTime,
                'stop_time' => now(),
                'status' => 'stopped'
            ]);
        }

        return [
            'success' => true,
            'accounting_id' => uniqid('acct_', true),
            'input_octets' => $inputOctets,
            'output_octets' => $outputOctets,
            'session_time' => $sessionTime,
            'timestamp' => now(),
            'type' => 'Stop'
        ];
    }

    /**
     * Get active sessions
     */
    public function getActiveSessions($username = null)
    {
        $query = Session::where('status', 'active')
            ->with('user');

        if ($username) {
            $query->whereHas('user', function($q) use ($username) {
                $q->where('email', $username);
            });
        }

        $sessions = $query->get()->map(function($session) {
            return [
                'session_id' => $session->session_id,
                'username' => $session->user->email ?? 'Unknown',
                'nas_ip' => $session->nas_ip,
                'input_octets' => $session->input_octets ?? 0,
                'output_octets' => $session->output_octets ?? 0,
                'session_time' => $session->session_time ?? 0,
                'idle_time' => intval((now()->diffInSeconds($session->start_time)) - ($session->session_time ?? 0)),
                'framed_ip' => $session->framed_ip,
                'start_time' => $session->start_time,
                'package' => $session->user->package_id ?? 0
            ];
        })->toArray();

        return $sessions;
    }

    /**
     * Disconnect user
     */
    public function disconnectUser($sessionId, $reason = 'Admin disconnect')
    {
        $session = Session::where('session_id', $sessionId)->first();
        
        if ($session) {
            $session->update([
                'status' => 'stopped',
                'stop_time' => now()
            ]);
        }

        return [
            'success' => true,
            'session_id' => $sessionId,
            'reason' => $reason,
            'timestamp' => now()
        ];
    }

    /**
     * Get session statistics
     */
    public function getSessionStats()
    {
        $sessions = $this->getActiveSessions();

        $totalInputOctets = array_sum(array_column($sessions, 'input_octets'));
        $totalOutputOctets = array_sum(array_column($sessions, 'output_octets'));
        $totalDataTransferred = ($totalInputOctets + $totalOutputOctets) / (1024 * 1024 * 1024); // GB

        return [
            'active_sessions' => count($sessions),
            'total_input_gb' => $totalInputOctets / (1024 * 1024 * 1024),
            'total_output_gb' => $totalOutputOctets / (1024 * 1024 * 1024),
            'total_data_gb' => $totalDataTransferred,
            'peak_time' => '14:30 UTC',
            'average_session_duration' => $sessions ? intval(array_sum(array_column($sessions, 'session_time')) / count($sessions)) : 0,
            'timestamp' => now()
        ];
    }

    /**
     * Check bandwidth quota
     */
    public function checkQuota($username, $package)
    {
        $sessions = $this->getActiveSessions($username);
        
        $totalUsed = 0;
        foreach ($sessions as $session) {
            $totalUsed += ($session['input_octets'] + $session['output_octets']);
        }

        $totalUsedMb = $totalUsed / (1024 * 1024);
        $quotaMb = $package['quota_mb'] ?? 10240; // 10GB default
        $remaining = max(0, $quotaMb - $totalUsedMb);

        return [
            'username' => $username,
            'package' => $package['name'],
            'quota_mb' => $quotaMb,
            'used_mb' => $totalUsedMb,
            'remaining_mb' => $remaining,
            'percentage' => ($totalUsedMb / $quotaMb) * 100
        ];
    }
}
{
    protected PDO $pdo;
    protected string $connection;

    public function __construct()
    {
        $this->connection = config('radius.connection', 'radius');
    }

    protected function getConnection(): PDO
    {
        if (!isset($this->pdo)) {
            $config = config("database.connections.{$this->connection}");
            $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']}";
            $this->pdo = new PDO($dsn, $config['username'], $config['password']);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        }
        return $this->pdo;
    }

    /**
     * Create or update user in FreeRADIUS
     */
    public function syncUser(User $user): bool
    {
        try {
            $pdo = $this->getConnection();

            // Clear existing user entries
            $this->clearUserRadcheck($user->username);

            // Add authentication check
            $this->addRadcheck($user->username, 'User-Password', $this->hashPassword($user->username), '==');

            // Add user to default group
            $this->addRadUserGroup($user->username, config('radius.default_group'));

            // Add session timeouts
            $this->addRadgroupcheck(config('radius.default_group'), 'Session-Timeout', '3600', ':=');
            $this->addRadgroupcheck(config('radius.default_group'), 'Acct-Interim-Interval', '60', ':=');

            // Add bandwidth attributes
            if ($user->package) {
                $this->updateBandwidth($user->package);
            }

            return true;
        } catch (\Exception $e) {
            \Log::error('RADIUS sync error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Add radcheck entry
     */
    protected function addRadcheck(string $username, string $attribute, string $value, string $op = '=='): void
    {
        $pdo = $this->getConnection();
        $table = config('radius.tables.radcheck');

        $stmt = $pdo->prepare("INSERT INTO {$table} (username, attribute, op, value) VALUES (?, ?, ?, ?)");
        $stmt->execute([$username, $attribute, $op, $value]);
    }

    /**
     * Add user to group
     */
    protected function addRadUserGroup(string $username, string $group_name): void
    {
        $pdo = $this->getConnection();
        $table = config('radius.tables.radusergroup');

        $stmt = $pdo->prepare("INSERT INTO {$table} (username, groupname, priority) VALUES (?, ?, ?)");
        $stmt->execute([$username, $group_name, 1]);
    }

    /**
     * Add group check attributes
     */
    protected function addRadgroupcheck(string $group_name, string $attribute, string $value, string $op = '==', int $priority = 1): void
    {
        $pdo = $this->getConnection();
        $table = config('radius.tables.radgroupcheck');

        $sql = "INSERT INTO {$table} (groupname, attribute, op, value, priority) 
                VALUES (?, ?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE value = VALUES(value)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$group_name, $attribute, $op, $value, $priority]);
    }

    /**
     * Hash password for RADIUS
     */
    protected function hashPassword(string $username): string
    {
        $method = config('radius.password_hash', 'bcrypt');

        return match ($method) {
            'md5' => md5($username),
            'bcrypt' => password_hash($username, PASSWORD_BCRYPT),
            default => $username, // cleartext
        };
    }

    /**
     * Clear all radcheck entries for user
     */
    protected function clearUserRadcheck(string $username): void
    {
        $pdo = $this->getConnection();
        $table = config('radius.tables.radcheck');

        $stmt = $pdo->prepare("DELETE FROM {$table} WHERE username = ?");
        $stmt->execute([$username]);
    }

    /**
     * Update bandwidth for package
     */
    protected function updateBandwidth(object $package): void
    {
        $pdo = $this->getConnection();
        $groupTable = config('radius.tables.radgroupcheck');
        $groupName = "package_{$package->id}";

        // Download limit
        $this->addRadgroupcheck(
            $groupName,
            'Mikrotik-Recv-Limit',
            intval($package->speed_download * 1000 * 1024), // Convert Mbps to Kbps
            ':='
        );

        // Upload limit
        $this->addRadgroupcheck(
            $groupName,
            'Mikrotik-Xmit-Limit',
            intval($package->speed_upload * 1000 * 1024),
            ':='
        );
    }

    /**
     * Disable user in RADIUS
     */
    public function disableUser(string $username): bool
    {
        try {
            $pdo = $this->getConnection();
            $table = config('radius.tables.radcheck');

            $stmt = $pdo->prepare("INSERT INTO {$table} (username, attribute, op, value) 
                                 VALUES (?, ?, ?, ?)
                                 ON DUPLICATE KEY UPDATE value = VALUES(value)");
            $stmt->execute([$username, 'Auth-Type', ':=', 'Reject']);

            return true;
        } catch (\Exception $e) {
            \Log::error('RADIUS disable error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Remove user from RADIUS
     */
    public function removeUser(string $username): bool
    {
        try {
            $pdo = $this->getConnection();

            $this->clearUserRadcheck($username);

            $userGroupTable = config('radius.tables.radusergroup');
            $stmt = $pdo->prepare("DELETE FROM {$userGroupTable} WHERE username = ?");
            $stmt->execute([$username]);

            return true;
        } catch (\Exception $e) {
            \Log::error('RADIUS remove error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Sync accounting records
     */
    public function syncAccounting(): void
    {
        try {
            $pdo = $this->getConnection();
            $acctTable = config('radius.tables.radacct');

            // Get unsynced accounting records from FreeRADIUS
            $sql = "SELECT * FROM {$acctTable} WHERE acctstoptime IS NOT NULL ORDER BY acctstoptime DESC LIMIT 100";
            $records = $pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);

            foreach ($records as $record) {
                $this->syncAcctRecord($record);
            }
        } catch (\Exception $e) {
            \Log::error('RADIUS accounting sync error: ' . $e->getMessage());
        }
    }

    /**
     * Sync individual accounting record
     */
    protected function syncAcctRecord(array $record): void
    {
        $user = User::where('username', $record['username'])->first();
        if (!$user) {
            return;
        }

        Session::updateOrCreate(
            ['unique_id' => $record['acctuniqueid'] ?? $record['acctsessionid']],
            [
                'user_id' => $user->id,
                'nas_ip_address' => $record['nasipaddress'] ?? '0.0.0.0',
                'nas_port' => $record['nasport'] ?? 0,
                'framed_ip_address' => $record['framedipaddress'] ?? null,
                'called_station_id' => $record['calledstationid'] ?? null,
                'calling_station_id' => $record['callingstationid'] ?? null,
                'acct_session_id' => $record['acctsessionid'] ?? null,
                'status' => 'offline',
                'started_at' => $record['acctstarttime'] ?? now(),
                'expires_at' => $record['acctstoptime'] ?? now(),
                'input_octets' => $record['acctinputoctets'] ?? 0,
                'output_octets' => $record['acctoutputoctets'] ?? 0,
            ]
        );
    }
}
