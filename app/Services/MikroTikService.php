<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class MikroTikService
{
    private $host;
    private $port;
    private $username;
    private $password;
    private $socket;

    public function __construct()
    {
        $this->host = config('radius.mikrotik_host', '192.168.1.254');
        $this->port = config('radius.mikrotik_port', 8728);
        $this->username = config('radius.mikrotik_user', 'admin');
        $this->password = config('radius.mikrotik_password', 'password');
    }

    /**
     * Connect to MikroTik RouterOS
     */
    public function connect()
    {
        try {
            $this->socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
            if (!$this->socket) {
                throw new \Exception('Cannot create socket');
            }

            $result = @socket_connect($this->socket, $this->host, $this->port);
            if (!$result) {
                throw new \Exception("Cannot connect to MikroTik: {$this->host}:{$this->port}");
            }

            socket_set_option($this->socket, SOL_SOCKET, SO_RCVTIMEO, ['sec' => 5, 'usec' => 0]);
            socket_set_option($this->socket, SOL_SOCKET, SO_SNDTIMEO, ['sec' => 5, 'usec' => 0]);

            \Log::info("Connected to MikroTik: {$this->host}:{$this->port}");
            return true;

        } catch (\Exception $e) {
            \Log::error("MikroTik connection error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Disconnect from MikroTik
     */
    public function disconnect()
    {
        if ($this->socket) {
            socket_close($this->socket);
            $this->socket = null;
        }
    }

    /**
     * Add PPPoE user
     */
    public function addPPPoEUser($username, $password, $maxBitrateDl = null, $maxBitrateUl = null)
    {
        try {
            if (!$this->connect()) {
                return ['success' => false, 'message' => 'Connection failed'];
            }

            // Build commands
            $commands = [
                '/ppp/secret',
                'add',
                '=name=' . $username,
                '=password=' . $password,
                '=service=pppoe',
                '=profile=default',
            ];

            if ($maxBitrateDl) {
                $commands[] = '=max-limit-at-down=' . $maxBitrateDl;
            }

            if ($maxBitrateUl) {
                $commands[] = '=max-limit-at-up=' . $maxBitrateUl;
            }

            $result = $this->sendCommand($commands);
            $this->disconnect();

            if ($result) {
                \Log::info("PPPoE user added: {$username}");
                return ['success' => true, 'message' => 'User created'];
            }

            return ['success' => false, 'message' => 'Failed to create user'];

        } catch (\Exception $e) {
            $this->disconnect();
            \Log::error("MikroTik add user error: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Set bandwidth limit for user
     */
    public function setBandwidthLimit($username, $downloadLimit, $uploadLimit)
    {
        try {
            if (!$this->connect()) {
                return ['success' => false, 'message' => 'Connection failed'];
            }

            // Format limits: "256k" or "1M" or "0" for unlimited
            $dlLimit = $this->formatBandwidth($downloadLimit);
            $ulLimit = $this->formatBandwidth($uploadLimit);

            $commands = [
                '/queue/simple',
                'add',
                '=name=' . $username,
                '=target=' . $username,
                '=max-packet-queue=25',
                '=limit-at-down=' . $dlLimit,
                '=limit-at-up=' . $ulLimit,
                '=max-limit-down=' . $dlLimit,
                '=max-limit-up=' . $ulLimit,
                '=burst-limit-down=' . $dlLimit,
                '=burst-limit-up=' . $ulLimit,
                '=burst-time-down=5s',
                '=burst-time-up=5s',
            ];

            $result = $this->sendCommand($commands);
            $this->disconnect();

            if ($result) {
                \Log::info("Bandwidth limit set for {$username}: DL={$dlLimit} UL={$ulLimit}");
                return ['success' => true, 'message' => 'Bandwidth limit applied'];
            }

            return ['success' => false, 'message' => 'Failed to set limit'];

        } catch (\Exception $e) {
            $this->disconnect();
            \Log::error("MikroTik set limit error: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Disconnect user (drop active connection)
     */
    public function disconnectUser($username)
    {
        try {
            if (!$this->connect()) {
                return ['success' => false, 'message' => 'Connection failed'];
            }

            // Find active PPPoE connection
            $commands = [
                '/interface/pppoe-server/monitor',
                'print',
                '?name=' . $username,
            ];

            $result = $this->sendCommand($commands);
            $this->disconnect();

            if ($result) {
                \Log::info("User disconnected: {$username}");
                return ['success' => true, 'message' => 'User disconnected'];
            }

            return ['success' => false, 'message' => 'Failed to disconnect'];

        } catch (\Exception $e) {
            $this->disconnect();
            \Log::error("MikroTik disconnect error: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Format bandwidth value
     */
    private function formatBandwidth($bitrate)
    {
        if ($bitrate === 0 || $bitrate === null) {
            return '0';
        }

        if ($bitrate >= 1000000) {
            return round($bitrate / 1000000) . 'M';
        } elseif ($bitrate >= 1000) {
            return round($bitrate / 1000) . 'k';
        }

        return (int) $bitrate;
    }

    /**
     * Apply package speed limits
     */
    public function applyPackageLimit($username, $packageId)
    {
        try {
            $package = \App\Models\Package::find($packageId);

            if (!$package) {
                return ['success' => false, 'message' => 'Package not found'];
            }

            // Convert speed from Mbps to bps
            $speedBps = $package->speed_limit * 1024 * 1024;

            return $this->setBandwidthLimit($username, $speedBps, $speedBps);

        } catch (\Exception $e) {
            \Log::error("Apply package limit error: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Get active PPPoE sessions
     */
    public function getActiveSessions()
    {
        try {
            if (!$this->connect()) {
                return ['success' => false, 'sessions' => []];
            }

            $commands = [
                '/interface/pppoe-server/monitor',
                'print',
            ];

            $result = $this->sendCommand($commands);
            $this->disconnect();

            return ['success' => true, 'sessions' => $result ?: []];

        } catch (\Exception $e) {
            $this->disconnect();
            \Log::error("MikroTik get sessions error: " . $e->getMessage());
            return ['success' => false, 'sessions' => []];
        }
    }

    /**
     * Send command via socket
     */
    private function sendCommand($commands)
    {
        try {
            foreach ($commands as $command) {
                $this->sendWord($command);
            }

            $response = [];
            while (true) {
                $word = $this->readWord();

                if ($word === '!done') {
                    break;
                }

                if ($word === '!tag') {
                    $tag = $this->readWord();
                }

                if (str_starts_with($word, '.')) {
                    $key = substr($word, 1);
                    $value = $this->readWord();
                    $response[$key] = $value;
                }
            }

            return $response;

        } catch (\Exception $e) {
            \Log::error("Command execution error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Send word to socket
     */
    private function sendWord($word)
    {
        $length = strlen($word);
        $lengthStr = $this->encodeLength($length);

        $data = $lengthStr . $word;
        $sent = socket_write($this->socket, $data, strlen($data));

        if ($sent === false) {
            throw new \Exception("Cannot send word: {$word}");
        }
    }

    /**
     * Read word from socket
     */
    private function readWord()
    {
        $lengthStr = socket_read($this->socket, 1);

        if ($lengthStr === false || strlen($lengthStr) === 0) {
            throw new \Exception("Cannot read word");
        }

        $length = $this->decodeLength($lengthStr);
        $word = socket_read($this->socket, $length);

        if ($word === false) {
            throw new \Exception("Cannot read word data");
        }

        return $word;
    }

    /**
     * Encode length for MikroTik protocol
     */
    private function encodeLength($length)
    {
        if ($length < 0x80) {
            return chr($length);
        } elseif ($length < 0x4000) {
            return chr((($length >> 8) | 0x80)) . chr($length & 0xFF);
        } elseif ($length < 0x200000) {
            return chr((($length >> 16) | 0xC0)) . chr(($length >> 8) & 0xFF) . chr($length & 0xFF);
        }
    }

    /**
     * Decode length from MikroTik protocol
     */
    private function decodeLength($firstByte)
    {
        $byte = ord($firstByte);

        if (($byte & 0x80) === 0) {
            return $byte;
        } elseif (($byte & 0xC0) === 0x80) {
            return ((($byte & 0x3F) << 8) + ord(socket_read($this->socket, 1)));
        } elseif (($byte & 0xE0) === 0xC0) {
            return ((($byte & 0x1F) << 16) + (ord(socket_read($this->socket, 1)) << 8) + ord(socket_read($this->socket, 1)));
        }
    }

    /**
     * Check if user connection exists
     */
    public function userIsConnected($username)
    {
        $sessions = $this->getActiveSessions();

        if (!$sessions['success']) {
            return false;
        }

        foreach ($sessions['sessions'] as $session) {
            if (isset($session['name']) && $session['name'] === $username) {
                return true;
            }
        }

        return false;
    }

    /**
     * Block user (disable queue)
     */
    public function blockUser($username)
    {
        try {
            if (!$this->connect()) {
                return ['success' => false, 'message' => 'Connection failed'];
            }

            $commands = [
                '/queue/simple',
                'disable',
                '=numbers=' . $username,
            ];

            $result = $this->sendCommand($commands);
            $this->disconnect();

            if ($result) {
                \Log::warning("User blocked: {$username}");
                return ['success' => true, 'message' => 'User blocked'];
            }

            return ['success' => false, 'message' => 'Failed to block user'];

        } catch (\Exception $e) {
            $this->disconnect();
            \Log::error("MikroTik block user error: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Unblock user (enable queue)
     */
    public function unblockUser($username)
    {
        try {
            if (!$this->connect()) {
                return ['success' => false, 'message' => 'Connection failed'];
            }

            $commands = [
                '/queue/simple',
                'enable',
                '=numbers=' . $username,
            ];

            $result = $this->sendCommand($commands);
            $this->disconnect();

            if ($result) {
                \Log::info("User unblocked: {$username}");
                return ['success' => true, 'message' => 'User unblocked'];
            }

            return ['success' => false, 'message' => 'Failed to unblock user'];

        } catch (\Exception $e) {
            $this->disconnect();
            \Log::error("MikroTik unblock user error: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Test connection to MikroTik
     */
    public function testConnection()
    {
        try {
            if (!$this->connect()) {
                return false;
            }

            $this->disconnect();
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}
    }

    /**
     * Disconnect from MikroTik
     */
    protected function disconnect(): void
    {
        if ($this->socket) {
            fclose($this->socket);
        }
    }

    /**
     * Login to MikroTik API
     */
    protected function login(string $username, string $password): void
    {
        $response = $this->query('/login', [
            'name' => $username,
            'password' => $password,
        ]);

        if (isset($response[0]['.ret'])) {
            // Login successful
            return;
        }

        throw new RuntimeException('MikroTik login failed');
    }

    /**
     * Send query to MikroTik
     */
    protected function query(string $path, array $params = []): array
    {
        $words = [$path];

        foreach ($params as $key => $value) {
            $words[] = '=' . $key . '=' . $value;
        }

        $this->send($words);
        $response = $this->read();

        return $response;
    }

    /**
     * Send command to MikroTik
     */
    protected function send(array $words): void
    {
        $command = count($words);
        fwrite($this->socket, pack('N', $command));

        foreach ($words as $word) {
            fwrite($this->socket, pack('N', strlen($word)) . $word);
        }
    }

    /**
     * Read response from MikroTik
     */
    protected function read(): array
    {
        $response = [];

        while (true) {
            $size = unpack('N', fread($this->socket, 4));
            $size = $size[1];

            if ($size === 0) {
                break;
            }

            $word = fread($this->socket, $size);
            $response[] = $word;
        }

        return $response;
    }

    /**
     * Add PPPoE user
     */
    public function addPppoeUser(string $username, string $password, int $downloadLimit = 0, int $uploadLimit = 0): bool
    {
        try {
            $params = [
                'name' => $username,
                'password' => $password,
                'service' => 'pppoe',
            ];

            if ($downloadLimit > 0) {
                $params['limit-bytes-in'] = $downloadLimit;
            }

            if ($uploadLimit > 0) {
                $params['limit-bytes-out'] = $uploadLimit;
            }

            $this->query('/ppp/secret/add', $params);
            return true;
        } catch (Exception $e) {
            \Log::error('MikroTik add PPPoE user error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Remove PPPoE user
     */
    public function removePppoeUser(string $username): bool
    {
        try {
            $users = $this->query('/ppp/secret/print', [
                '.proplist' => '.id,name',
                '?name' => $username,
            ]);

            if (empty($users)) {
                return false;
            }

            foreach ($users as $user) {
                if ($user['name'] == $username) {
                    $this->query('/ppp/secret/remove', [
                        '.id' => $user['.id'],
                    ]);
                }
            }

            return true;
        } catch (Exception $e) {
            \Log::error('MikroTik remove PPPoE user error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Add hotspot user
     */
    public function addHotspotUser(string $username, string $password, string $profile = 'default'): bool
    {
        try {
            $this->query('/ip/hotspot/user/add', [
                'name' => $username,
                'password' => $password,
                'profile' => $profile,
            ]);

            return true;
        } catch (Exception $e) {
            \Log::error('MikroTik add hotspot user error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Disconnect user session
     */
    public function disconnectUser(string $username): bool
    {
        try {
            // Disconnect from PPPoE
            $sessions = $this->query('/ppp/active/print', [
                '.proplist' => '.id,name',
                '?name' => $username,
            ]);

            foreach ($sessions as $session) {
                $this->query('/ppp/active/remove', [
                    '.id' => $session['.id'],
                ]);
            }

            return true;
        } catch (Exception $e) {
            \Log::error('MikroTik disconnect user error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get active sessions
     */
    public function getActiveSessions(): array
    {
        try {
            $sessions = $this->query('/ppp/active/print', [
                '.proplist' => '.id,name,address,uptime,bytes-in,bytes-out',
            ]);

            return $this->parseActiveSessions($sessions);
        } catch (Exception $e) {
            \Log::error('MikroTik get active sessions error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Parse active sessions
     */
    protected function parseActiveSessions(array $rawSessions): array
    {
        $sessions = [];

        foreach ($rawSessions as $session) {
            if (!isset($session['name'])) {
                continue;
            }

            $sessions[] = [
                'id' => $session['.id'],
                'username' => $session['name'],
                'ip_address' => $session['address'] ?? null,
                'uptime' => $session['uptime'] ?? null,
                'input_octets' => $this->parseBytes($session['bytes-in'] ?? '0'),
                'output_octets' => $this->parseBytes($session['bytes-out'] ?? '0'),
            ];
        }

        return $sessions;
    }

    /**
     * Parse MikroTik bytes format
     */
    protected function parseBytes(string $bytes): int
    {
        $bytes = strtoupper($bytes);
        $value = (int)$bytes;

        if (strpos($bytes, 'K') !== false) {
            $value *= 1024;
        } elseif (strpos($bytes, 'M') !== false) {
            $value *= 1024 * 1024;
        } elseif (strpos($bytes, 'G') !== false) {
            $value *= 1024 * 1024 * 1024;
        }

        return $value;
    }

    /**
     * Check connection status
     */
    public function isConnected(): bool
    {
        try {
            $response = $this->query('/system/identity/print');
            return !empty($response);
        } catch (Exception $e) {
            return false;
        }
    }
}
