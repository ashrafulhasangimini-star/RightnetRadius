<?php

namespace App\Services;

use RuntimeException;
use Exception;

class MikroTikService
{
    protected $connection;
    protected $socket;

    public function __construct()
    {
        $this->connect();
    }

    public function __destruct()
    {
        $this->disconnect();
    }

    /**
     * Connect to MikroTik API
     */
    protected function connect(): void
    {
        try {
            $config = config('mikrotik.api');
            $protocol = $config['ssl'] ? 'ssl' : 'tcp';
            $address = "{$protocol}://{$config['host']}:{$config['port']}";

            $this->socket = fsockopen(
                $config['host'],
                $config['port'],
                $errno,
                $errstr,
                $config['timeout'] ?? 10
            );

            if (!$this->socket) {
                throw new RuntimeException("Cannot connect to MikroTik: {$errstr} ({$errno})");
            }

            stream_set_timeout($this->socket, $config['timeout'] ?? 10);
            $this->login($config['username'], $config['password']);
        } catch (Exception $e) {
            \Log::error('MikroTik connection error: ' . $e->getMessage());
            throw $e;
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
