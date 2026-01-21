<?php

namespace App\Services;

use App\Models\User;
use App\Models\Session;
use Illuminate\Support\Facades\DB;
use PDO;

class RadiusService
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
