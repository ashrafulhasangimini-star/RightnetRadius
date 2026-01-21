<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Package extends Model
{
    protected $fillable = [
        'name',
        'description',
        'speed_download',
        'speed_upload',
        'fup_limit',
        'fup_reset_day',
        'validity_days',
        'price',
        'status',
        'sort_order',
    ];

    protected $casts = [
        'speed_download' => 'integer',
        'speed_upload' => 'integer',
        'fup_limit' => 'float',
        'validity_days' => 'integer',
        'price' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function getFormattedSpeedAttribute(): string
    {
        return "{$this->speed_download} Mbps ↓ / {$this->speed_upload} Mbps ↑";
    }

    public function getFormattedPriceAttribute(): string
    {
        return config('isp.billing.currency') . ' ' . number_format($this->price, 2);
    }
}
