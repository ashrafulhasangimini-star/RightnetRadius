<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    protected $fillable = [
        'user_id',
        'invoice_number',
        'amount',
        'status',
        'issued_at',
        'due_at',
        'paid_at',
        'notes',
        'package_id',
        'period_start',
        'period_end',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'issued_at' => 'datetime',
        'due_at' => 'datetime',
        'paid_at' => 'datetime',
        'period_start' => 'datetime',
        'period_end' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function getIsOverdueAttribute(): bool
    {
        return $this->status === 'pending' && $this->due_at && $this->due_at->isPast();
    }

    public function getDaysOverdueAttribute(): ?int
    {
        if (!$this->is_overdue) {
            return null;
        }
        return now()->diffInDays($this->due_at);
    }
}
