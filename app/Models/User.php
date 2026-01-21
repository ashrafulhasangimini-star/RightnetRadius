<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class User extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'username',
        'email',
        'phone',
        'package_id',
        'status',
        'expires_at',
        'mac_address',
        'ip_address',
        'balance',
        'notes',
        'reseller_id',
        'created_by',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Status: active, suspended, expired, disabled
    protected $appends = ['is_active', 'is_expired', 'days_remaining'];

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function reseller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reseller_id');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(Session::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function bindings(): HasMany
    {
        return $this->hasMany(MacIpBinding::class);
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active' && !$this->is_expired;
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function getDaysRemainingAttribute(): ?int
    {
        if (!$this->expires_at) {
            return null;
        }
        return now()->diffInDays($this->expires_at, false);
    }

    public function isOnline(): bool
    {
        return $this->sessions()
            ->where('status', 'online')
            ->where('expires_at', '>', now())
            ->exists();
    }

    public function getOnlineSession(): ?Session
    {
        return $this->sessions()
            ->where('status', 'online')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();
    }
}
