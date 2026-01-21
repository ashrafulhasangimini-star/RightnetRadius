<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MikroTikProfile extends Model
{
    protected $fillable = [
        'mikrotik_device_id',
        'type',
        'profile_name',
        'target_address_list',
        'max_packet_queue',
        'parent_queue',
        'queue_type',
        'sync_status',
    ];

    // Types: hotspot, pppoe, queue

    public function device(): BelongsTo
    {
        return $this->belongsTo(MikroTikDevice::class);
    }
}
