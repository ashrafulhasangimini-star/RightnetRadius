<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Session extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'unique_id',
        'nas_ip_address',
        'nas_port',
        'framed_ip_address',
        'called_station_id',
        'calling_station_id',
        'acct_session_id',
        'status',
        'started_at',
        'expires_at',
        'input_octets',
        'output_octets',
        'session_timeout',
        'idle_timeout',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'expires_at' => 'datetime',
        'input_octets' => 'integer',
        'output_octets' => 'integer',
        'session_timeout' => 'integer',
        'idle_timeout' => 'integer',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getTotalBytesAttribute(): float
    {
        return $this->input_octets + $this->output_octets;
    }

    public function getTotalMbAttribute(): float
    {
        return $this->total_bytes / (1024 * 1024);
    }

    public function getTotalGbAttribute(): float
    {
        return $this->total_mb / 1024;
    }

    public function getDurationSecondsAttribute(): int
    {
        if ($this->status === 'online') {
            return now()->diffInSeconds($this->started_at);
        }
        return $this->expires_at->diffInSeconds($this->started_at);
    }

    public function getFormattedDurationAttribute(): string
    {
        $seconds = $this->duration_seconds;
        $hours = intdiv($seconds, 3600);
        $minutes = intdiv($seconds % 3600, 60);
        return "{$hours}h {$minutes}m";
    }
}
