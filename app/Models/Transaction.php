<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    protected $fillable = [
        'user_id',
        'transaction_number',
        'amount',
        'type',
        'status',
        'method',
        'reference',
        'description',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Types: credit, debit, refund, adjustment
    // Methods: cash, bank, mobile, invoice

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(AuthUser::class, 'created_by');
    }
}
