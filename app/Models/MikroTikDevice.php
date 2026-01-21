<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MikroTikDevice extends Model
{
    protected $fillable = [
        'name',
        'hostname',
        'api_host',
        'api_port',
        'api_username',
        'api_password',
        'api_ssl',
        'status',
        'notes',
        'last_sync_at',
    ];

    protected $casts = [
        'api_ssl' => 'boolean',
        'last_sync_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function profiles(): HasMany
    {
        return $this->hasMany(MikroTikProfile::class);
    }

    public function isConnected(): bool
    {
        return $this->status === 'connected';
    }
}
