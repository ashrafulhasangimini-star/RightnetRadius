<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MacIpBinding extends Model
{
    protected $table = 'mac_ip_bindings';

    protected $fillable = [
        'user_id',
        'mac_address',
        'ip_address',
        'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
