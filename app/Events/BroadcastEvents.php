<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SessionUpdate implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $sessionId;
    public $username;
    public $inputOctets;
    public $outputOctets;
    public $sessionTime;
    public $timestamp;

    public function __construct($sessionId, $username, $inputOctets, $outputOctets, $sessionTime)
    {
        $this->sessionId = $sessionId;
        $this->username = $username;
        $this->inputOctets = $inputOctets;
        $this->outputOctets = $outputOctets;
        $this->sessionTime = $sessionTime;
        $this->timestamp = now();
    }

    public function broadcastOn()
    {
        return new Channel('sessions');
    }

    public function broadcastAs()
    {
        return 'session.updated';
    }
}

class BandwidthUpdate implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $downloadMbps;
    public $uploadMbps;
    public $totalGb;
    public $activeUsers;
    public $timestamp;

    public function __construct($downloadMbps, $uploadMbps, $totalGb, $activeUsers)
    {
        $this->downloadMbps = $downloadMbps;
        $this->uploadMbps = $uploadMbps;
        $this->totalGb = $totalGb;
        $this->activeUsers = $activeUsers;
        $this->timestamp = now();
    }

    public function broadcastOn()
    {
        return new Channel('bandwidth');
    }

    public function broadcastAs()
    {
        return 'bandwidth.updated';
    }
}

class SessionConnected implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $username;
    public $framedIp;
    public $sessionId;
    public $timestamp;

    public function __construct($username, $framedIp, $sessionId)
    {
        $this->username = $username;
        $this->framedIp = $framedIp;
        $this->sessionId = $sessionId;
        $this->timestamp = now();
    }

    public function broadcastOn()
    {
        return new Channel('sessions');
    }

    public function broadcastAs()
    {
        return 'session.connected';
    }
}

class SessionDisconnected implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $username;
    public $sessionId;
    public $reason;
    public $totalData;
    public $timestamp;

    public function __construct($username, $sessionId, $reason, $totalData)
    {
        $this->username = $username;
        $this->sessionId = $sessionId;
        $this->reason = $reason;
        $this->totalData = $totalData;
        $this->timestamp = now();
    }

    public function broadcastOn()
    {
        return new Channel('sessions');
    }

    public function broadcastAs()
    {
        return 'session.disconnected';
    }
}

class QuotaWarning implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $username;
    public $usedGb;
    public $quotaGb;
    public $percentageUsed;
    public $timestamp;

    public function __construct($username, $usedGb, $quotaGb)
    {
        $this->username = $username;
        $this->usedGb = $usedGb;
        $this->quotaGb = $quotaGb;
        $this->percentageUsed = ($usedGb / $quotaGb) * 100;
        $this->timestamp = now();
    }

    public function broadcastOn()
    {
        return new Channel('notifications');
    }

    public function broadcastAs()
    {
        return 'quota.warning';
    }
}
