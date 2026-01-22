<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Models\Session;
use App\Models\User;

class RadiusClientService
{
    // RADIUS packet types
    const CODE_ACCESS_REQUEST = 1;
    const CODE_ACCESS_ACCEPT = 2;
    const CODE_ACCESS_REJECT = 3;
    const CODE_ACCOUNTING_REQUEST = 4;
    const CODE_ACCOUNTING_RESPONSE = 5;
    const CODE_ACCESS_CHALLENGE = 11;
    const CODE_STATUS_SERVER = 12;
    const CODE_DISCONNECT_REQUEST = 40;
    const CODE_DISCONNECT_ACK = 41;
    const CODE_DISCONNECT_NAK = 42;

    // RADIUS attribute types
    const ATTR_USER_NAME = 1;
    const ATTR_USER_PASSWORD = 2;
    const ATTR_NAS_IP_ADDRESS = 4;
    const ATTR_NAS_PORT = 5;
    const ATTR_SERVICE_TYPE = 6;
    const ATTR_FRAMED_PROTOCOL = 7;
    const ATTR_FRAMED_IP_ADDRESS = 8;
    const ATTR_FRAMED_IP_NETMASK = 9;
    const ATTR_FRAMED_ROUTING = 10;
    const ATTR_FILTER_ID = 11;
    const ATTR_FRAMED_MTU = 12;
    const ATTR_FRAMED_COMPRESSION = 13;
    const ATTR_LOGIN_IP_HOST = 14;
    const ATTR_LOGIN_SERVICE = 15;
    const ATTR_LOGIN_TCP_PORT = 16;
    const ATTR_REPLY_MESSAGE = 18;
    const ATTR_CALLED_STATION_ID = 30;
    const ATTR_CALLING_STATION_ID = 31;
    const ATTR_NAS_IDENTIFIER = 32;
    const ATTR_PROXY_STATE = 33;
    const ATTR_LOGIN_LAT_SERVICE = 34;
    const ATTR_LOGIN_LAT_NODE = 35;
    const ATTR_LOGIN_LAT_GROUP = 36;
    const ATTR_FRAMED_APPLETALK_LINK = 37;
    const ATTR_FRAMED_APPLETALK_NETWORK = 38;
    const ATTR_FRAMED_APPLETALK_ZONE = 39;
    const ATTR_ACCT_STATUS_TYPE = 40;
    const ATTR_ACCT_DELAY_TIME = 41;
    const ATTR_ACCT_INPUT_OCTETS = 42;
    const ATTR_ACCT_OUTPUT_OCTETS = 43;
    const ATTR_ACCT_SESSION_ID = 44;
    const ATTR_ACCT_AUTHENTIC = 45;
    const ATTR_ACCT_SESSION_TIME = 46;
    const ATTR_ACCT_INPUT_PACKETS = 47;
    const ATTR_ACCT_OUTPUT_PACKETS = 48;
    const ATTR_ACCT_TERMINATE_CAUSE = 49;
    const ATTR_ACCT_MULTI_SESSION_ID = 50;
    const ATTR_ACCT_LINK_COUNT = 51;
    const ATTR_ACCT_INPUT_GIGAWORDS = 52;
    const ATTR_ACCT_OUTPUT_GIGAWORDS = 53;
    const ATTR_EVENT_TIMESTAMP = 55;

    // Accounting status types
    const ACCT_STATUS_START = 1;
    const ACCT_STATUS_INTERIM_UPDATE = 3;
    const ACCT_STATUS_STOP = 2;

    private $serverIp;
    private $authPort;
    private $acctPort;
    private $secret;
    private $socket;
    private $requestId = 0;
    private $timeout = 3;

    public function __construct()
    {
        $this->serverIp = config('radius.server', '127.0.0.1');
        $this->authPort = config('radius.auth_port', 1812);
        $this->acctPort = config('radius.acct_port', 1813);
        $this->secret = config('radius.secret', 'testing123');
        $this->timeout = config('radius.timeout', 3);
    }

    /**
     * Authenticate user with RADIUS server
     */
    public function authenticate($username, $password, $nasIp = null, $nasPort = null)
    {
        try {
            // Build Access-Request packet
            $packet = $this->buildAccessRequest(
                $username,
                $password,
                $nasIp ?? config('radius.nas_ip', '192.168.1.1'),
                $nasPort ?? rand(1024, 65535)
            );

            // Send to RADIUS server
            $response = $this->sendPacket($packet, $this->authPort);

            if (!$response) {
                \Log::warning("RADIUS server unreachable: {$this->serverIp}:{$this->authPort}");
                return ['success' => false, 'message' => 'RADIUS server unreachable'];
            }

            // Parse response
            list($code, $attributes) = $this->parsePacket($response);

            if ($code === self::CODE_ACCESS_ACCEPT) {
                // Extract framed IP
                $framedIp = $this->extractAttribute($attributes, self::ATTR_FRAMED_IP_ADDRESS);
                if (!$framedIp) {
                    $framedIp = $this->generateFramedIP();
                }

                // Create session
                $session = $this->createSession($username, $framedIp);

                \Log::info("RADIUS authentication successful for user: {$username}");

                return [
                    'success' => true,
                    'session_id' => $session->session_id,
                    'framed_ip' => $framedIp,
                    'session_timeout' => 86400,
                ];
            } elseif ($code === self::CODE_ACCESS_REJECT) {
                \Log::warning("RADIUS authentication rejected for user: {$username}");
                return ['success' => false, 'message' => 'Authentication failed'];
            }

            return ['success' => false, 'message' => 'RADIUS server error'];

        } catch (\Exception $e) {
            \Log::error("RADIUS authentication error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Authentication error'];
        }
    }

    /**
     * Send accounting start packet
     */
    public function accountingStart($username, $sessionId, $framedIp, $nasIp = null)
    {
        try {
            $packet = $this->buildAccountingRequest(
                $username,
                $sessionId,
                self::ACCT_STATUS_START,
                0, 0, 0,
                $nasIp ?? config('radius.nas_ip', '192.168.1.1')
            );

            $response = $this->sendPacket($packet, $this->acctPort);

            if (!$response) {
                \Log::warning("RADIUS accounting server unreachable");
                return ['success' => false];
            }

            list($code) = $this->parsePacket($response);

            if ($code === self::CODE_ACCOUNTING_RESPONSE) {
                \Log::info("RADIUS accounting start for session: {$sessionId}");
                return ['success' => true];
            }

            return ['success' => false];

        } catch (\Exception $e) {
            \Log::error("RADIUS accounting start error: " . $e->getMessage());
            return ['success' => false];
        }
    }

    /**
     * Send interim accounting update
     */
    public function accountingInterim($sessionId, $inputOctets, $outputOctets, $sessionTime, $username)
    {
        try {
            $packet = $this->buildAccountingRequest(
                $username,
                $sessionId,
                self::ACCT_STATUS_INTERIM_UPDATE,
                $inputOctets,
                $outputOctets,
                $sessionTime
            );

            $response = $this->sendPacket($packet, $this->acctPort);

            if ($response) {
                list($code) = $this->parsePacket($response);
                if ($code === self::CODE_ACCOUNTING_RESPONSE) {
                    return ['success' => true];
                }
            }

            return ['success' => false];

        } catch (\Exception $e) {
            \Log::error("RADIUS accounting interim error: " . $e->getMessage());
            return ['success' => false];
        }
    }

    /**
     * Send accounting stop packet
     */
    public function accountingStop($sessionId, $inputOctets, $outputOctets, $sessionTime, $username, $terminateCause = 0)
    {
        try {
            $packet = $this->buildAccountingRequest(
                $username,
                $sessionId,
                self::ACCT_STATUS_STOP,
                $inputOctets,
                $outputOctets,
                $sessionTime,
                null,
                $terminateCause
            );

            $response = $this->sendPacket($packet, $this->acctPort);

            if ($response) {
                list($code) = $this->parsePacket($response);
                if ($code === self::CODE_ACCOUNTING_RESPONSE) {
                    \Log::info("RADIUS accounting stop for session: {$sessionId}");
                    return ['success' => true];
                }
            }

            return ['success' => false];

        } catch (\Exception $e) {
            \Log::error("RADIUS accounting stop error: " . $e->getMessage());
            return ['success' => false];
        }
    }

    /**
     * Build Access-Request packet
     */
    private function buildAccessRequest($username, $password, $nasIp, $nasPort)
    {
        $requestId = ++$this->requestId % 256;

        $attributes = [];

        // User-Name
        $attributes[] = $this->encodeAttribute(self::ATTR_USER_NAME, $username);

        // User-Password (encrypted)
        $attributes[] = $this->encodeAttribute(
            self::ATTR_USER_PASSWORD,
            $this->encryptPassword($password, md5('', false))
        );

        // NAS-IP-Address
        $attributes[] = $this->encodeAttribute(self::ATTR_NAS_IP_ADDRESS, ip2long($nasIp));

        // NAS-Port
        $attributes[] = $this->encodeAttribute(self::ATTR_NAS_PORT, $nasPort);

        // Service-Type (Framed-User = 2)
        $attributes[] = $this->encodeAttribute(self::ATTR_SERVICE_TYPE, 2);

        // Framed-Protocol (PPP = 1)
        $attributes[] = $this->encodeAttribute(self::ATTR_FRAMED_PROTOCOL, 1);

        // NAS-Identifier
        $attributes[] = $this->encodeAttribute(self::ATTR_NAS_IDENTIFIER, config('radius.nas_identifier', 'RightnetRadius'));

        $attrString = implode('', $attributes);

        return [
            'code' => self::CODE_ACCESS_REQUEST,
            'id' => $requestId,
            'length' => 20 + strlen($attrString),
            'authenticator' => md5($this->secret, true),
            'attributes' => $attrString,
        ];
    }

    /**
     * Build Accounting-Request packet
     */
    private function buildAccountingRequest($username, $sessionId, $statusType, $inputOctets, $outputOctets, $sessionTime, $nasIp = null, $terminateCause = 0)
    {
        $requestId = ++$this->requestId % 256;

        if (!$nasIp) {
            $nasIp = config('radius.nas_ip', '192.168.1.1');
        }

        $attributes = [];

        // Acct-Status-Type
        $attributes[] = $this->encodeAttribute(self::ATTR_ACCT_STATUS_TYPE, $statusType);

        // User-Name
        $attributes[] = $this->encodeAttribute(self::ATTR_USER_NAME, $username);

        // Acct-Session-Id
        $attributes[] = $this->encodeAttribute(self::ATTR_ACCT_SESSION_ID, $sessionId);

        // NAS-IP-Address
        $attributes[] = $this->encodeAttribute(self::ATTR_NAS_IP_ADDRESS, ip2long($nasIp));

        // Acct-Input-Octets
        if ($inputOctets > 0xFFFFFFFF) {
            $attributes[] = $this->encodeAttribute(self::ATTR_ACCT_INPUT_OCTETS, $inputOctets & 0xFFFFFFFF);
            $attributes[] = $this->encodeAttribute(self::ATTR_ACCT_INPUT_GIGAWORDS, $inputOctets >> 32);
        } else {
            $attributes[] = $this->encodeAttribute(self::ATTR_ACCT_INPUT_OCTETS, $inputOctets);
        }

        // Acct-Output-Octets
        if ($outputOctets > 0xFFFFFFFF) {
            $attributes[] = $this->encodeAttribute(self::ATTR_ACCT_OUTPUT_OCTETS, $outputOctets & 0xFFFFFFFF);
            $attributes[] = $this->encodeAttribute(self::ATTR_ACCT_OUTPUT_GIGAWORDS, $outputOctets >> 32);
        } else {
            $attributes[] = $this->encodeAttribute(self::ATTR_ACCT_OUTPUT_OCTETS, $outputOctets);
        }

        // Acct-Session-Time
        $attributes[] = $this->encodeAttribute(self::ATTR_ACCT_SESSION_TIME, $sessionTime);

        // Acct-Authentic (RADIUS = 1)
        $attributes[] = $this->encodeAttribute(self::ATTR_ACCT_AUTHENTIC, 1);

        // Acct-Terminate-Cause (if stop)
        if ($statusType === self::ACCT_STATUS_STOP && $terminateCause > 0) {
            $attributes[] = $this->encodeAttribute(self::ATTR_ACCT_TERMINATE_CAUSE, $terminateCause);
        }

        $attrString = implode('', $attributes);

        return [
            'code' => self::CODE_ACCOUNTING_REQUEST,
            'id' => $requestId,
            'length' => 20 + strlen($attrString),
            'authenticator' => md5($this->secret, true),
            'attributes' => $attrString,
        ];
    }

    /**
     * Encode RADIUS attribute
     */
    private function encodeAttribute($type, $value)
    {
        if (is_int($value)) {
            $value = pack('N', $value);
        }

        return pack('CC', $type, strlen($value) + 2) . $value;
    }

    /**
     * Encrypt password using MD5 (RFC 2865)
     */
    private function encryptPassword($password, $requestAuth)
    {
        $encrypted = '';
        $lastHash = '';
        $passwordLen = strlen($password);
        $chunkCount = ceil($passwordLen / 16);

        for ($i = 0; $i < $chunkCount; $i++) {
            $chunk = substr($password, $i * 16, 16);
            $chunk = str_pad($chunk, 16, "\0", STR_PAD_RIGHT);

            if ($i === 0) {
                $hash = md5($this->secret . $requestAuth, true);
            } else {
                $hash = md5($this->secret . $lastHash, true);
            }

            $encrypted .= $chunk ^ $hash;
            $lastHash = substr($encrypted, $i * 16, 16);
        }

        return $encrypted;
    }

    /**
     * Send RADIUS packet
     */
    private function sendPacket($packet, $port)
    {
        try {
            $socket = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);
            if (!$socket) {
                throw new \Exception('Cannot create socket');
            }

            // Set socket timeout
            socket_set_option($socket, SOL_SOCKET, SO_RCVTIMEO, [
                'sec' => $this->timeout,
                'usec' => 0,
            ]);

            // Build packet
            $packetData = pack('CCn', $packet['code'], $packet['id'], $packet['length']);
            $packetData .= $packet['authenticator'];
            $packetData .= $packet['attributes'];

            // Send packet
            $sent = @socket_sendto($socket, $packetData, strlen($packetData), 0, $this->serverIp, $port);

            if ($sent === false) {
                socket_close($socket);
                return null;
            }

            // Receive response
            $response = '';
            $from = '';
            $portRecv = 0;
            $bytes = @socket_recvfrom($socket, $response, 4096, 0, $from, $portRecv);

            socket_close($socket);

            return ($bytes !== false) ? $response : null;

        } catch (\Exception $e) {
            \Log::error("Socket error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Parse RADIUS packet response
     */
    private function parsePacket($packet)
    {
        if (strlen($packet) < 20) {
            return [null, []];
        }

        $code = ord($packet[0]);
        $id = ord($packet[1]);
        $length = unpack('n', substr($packet, 2, 2))[1];
        $authenticator = substr($packet, 4, 16);
        $attributesData = substr($packet, 20, $length - 20);

        $attributes = [];
        $offset = 0;

        while ($offset < strlen($attributesData)) {
            $attrType = ord($attributesData[$offset]);
            $attrLen = ord($attributesData[$offset + 1]);

            if ($attrLen < 2) break;

            $attrValue = substr($attributesData, $offset + 2, $attrLen - 2);
            $attributes[$attrType] = $attrValue;

            $offset += $attrLen;
        }

        return [$code, $attributes];
    }

    /**
     * Extract attribute value
     */
    private function extractAttribute($attributes, $type)
    {
        if (!isset($attributes[$type])) {
            return null;
        }

        $value = $attributes[$type];

        switch ($type) {
            case self::ATTR_FRAMED_IP_ADDRESS:
            case self::ATTR_NAS_IP_ADDRESS:
                return long2ip(unpack('N', $value)[1]);

            case self::ATTR_ACCT_INPUT_OCTETS:
            case self::ATTR_ACCT_OUTPUT_OCTETS:
            case self::ATTR_ACCT_SESSION_TIME:
                return unpack('N', $value)[1];

            default:
                return $value;
        }
    }

    /**
     * Generate framed IP from pool
     */
    private function generateFramedIP()
    {
        $lastOctet = random_int(2, 254);
        return "192.168.100." . $lastOctet;
    }

    /**
     * Create session in database
     */
    private function createSession($username, $framedIp)
    {
        return Session::create([
            'session_id' => (string) Str::uuid(),
            'username' => $username,
            'status' => 'active',
            'framed_ip' => $framedIp,
            'nas_ip' => config('radius.nas_ip', '192.168.1.1'),
            'nas_port' => random_int(1024, 65535),
            'service_type' => 'Framed-User',
            'protocol' => 'PPP',
            'session_start' => now(),
            'session_duration' => 0,
            'input_octets' => 0,
            'output_octets' => 0,
            'acct_delay_time' => 0,
        ]);
    }
}
