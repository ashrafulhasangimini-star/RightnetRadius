<?php

namespace App\Services;

use App\Models\User;
use App\Models\Invoice;
use App\Models\Transaction;
use Carbon\Carbon;

class BillingService
{
    /**
     * Generate invoice for user
     */
    public function generateInvoice(User $user, ?Carbon $periodStart = null, ?Carbon $periodEnd = null): Invoice
    {
        $periodStart = $periodStart ?? now()->startOfMonth();
        $periodEnd = $periodEnd ?? now()->endOfMonth();

        $invoice = Invoice::create([
            'user_id' => $user->id,
            'invoice_number' => $this->generateInvoiceNumber(),
            'amount' => $user->package->price,
            'status' => 'pending',
            'issued_at' => now(),
            'due_at' => now()->addDays(config('isp.billing.invoice_due_days')),
            'package_id' => $user->package_id,
            'period_start' => $periodStart,
            'period_end' => $periodEnd,
        ]);

        return $invoice;
    }

    /**
     * Generate invoice number
     */
    protected function generateInvoiceNumber(): string
    {
        $prefix = config('isp.billing.invoice_prefix', 'INV-');
        $timestamp = now()->format('YmdHis');
        $random = str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

        return "{$prefix}{$timestamp}{$random}";
    }

    /**
     * Process payment
     */
    public function processPayment(User $user, float $amount, string $method = 'cash', string $reference = ''): Transaction
    {
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'transaction_number' => $this->generateTransactionNumber(),
            'amount' => $amount,
            'type' => 'credit',
            'status' => 'completed',
            'method' => $method,
            'reference' => $reference,
        ]);

        // Update user balance
        $user->increment('balance', $amount);

        // Auto-pay pending invoices
        $this->autoPayPendingInvoices($user);

        return $transaction;
    }

    /**
     * Auto-pay pending invoices
     */
    protected function autoPayPendingInvoices(User $user): void
    {
        $balance = $user->fresh()->balance;

        $pendingInvoices = $user->invoices()
            ->where('status', 'pending')
            ->orderBy('due_at')
            ->get();

        foreach ($pendingInvoices as $invoice) {
            if ($balance >= $invoice->amount) {
                $invoice->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                ]);

                $balance -= $invoice->amount;
                $user->decrement('balance', $invoice->amount);
            }
        }
    }

    /**
     * Generate transaction number
     */
    protected function generateTransactionNumber(): string
    {
        return 'TXN-' . now()->format('YmdHis') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
    }

    /**
     * Check and auto-renew subscription
     */
    public function checkAndAutoRenew(User $user): bool
    {
        if (!$user->package) {
            return false;
        }

        $packagePrice = $user->package->price;

        if ($user->balance >= $packagePrice && $user->expires_at->isPast()) {
            $this->renewSubscription($user);
            return true;
        }

        return false;
    }

    /**
     * Renew subscription
     */
    public function renewSubscription(User $user, ?int $days = null): void
    {
        if (!$user->package) {
            return;
        }

        $days = $days ?? $user->package->validity_days;
        $newExpiryDate = now()->addDays($days);

        if ($user->expires_at && $user->expires_at->isFuture()) {
            $newExpiryDate = $user->expires_at->addDays($days);
        }

        $user->update([
            'status' => 'active',
            'expires_at' => $newExpiryDate,
        ]);

        // Deduct from balance
        if ($user->package->price > 0) {
            $user->decrement('balance', $user->package->price);

            Transaction::create([
                'user_id' => $user->id,
                'transaction_number' => $this->generateTransactionNumber(),
                'amount' => $user->package->price,
                'type' => 'debit',
                'status' => 'completed',
                'description' => 'Subscription renewal for ' . $user->package->name,
            ]);
        }

        // Sync with RADIUS
        (new RadiusService())->syncUser($user);
    }

    /**
     * Disable expired users
     */
    public function disableExpiredUsers(): int
    {
        $count = 0;
        $expiredUsers = User::where('status', 'active')
            ->where('expires_at', '<', now())
            ->get();

        foreach ($expiredUsers as $user) {
            $user->update(['status' => 'expired']);
            (new RadiusService())->disableUser($user->username);
            (new MikroTikService())->disconnectUser($user->username);
            $count++;
        }

        return $count;
    }

    /**
     * Apply FUP limits
     */
    public function applyFupLimits(User $user): void
    {
        if (!$user->package || !$user->package->fup_limit) {
            return;
        }

        if (!config('isp.fup.enabled')) {
            return;
        }

        $monthStart = now()->startOfMonth();
        $usage = $user->sessions()
            ->where('started_at', '>=', $monthStart)
            ->sum(\DB::raw('(input_octets + output_octets)'));

        $usageGb = $usage / (1024 * 1024 * 1024);

        if ($usageGb >= $user->package->fup_limit) {
            // Apply reduced speed
            $this->applyReducedSpeed($user);
        }
    }

    /**
     * Apply reduced speed
     */
    protected function applyReducedSpeed(User $user): void
    {
        $percentage = config('isp.fup.reduced_speed_percentage', 10);
        $reducedDownload = intval($user->package->speed_download * $percentage / 100);
        $reducedUpload = intval($user->package->speed_upload * $percentage / 100);

        // Update in RADIUS if needed
        // This would connect to RADIUS and apply temporary limits
    }
}
