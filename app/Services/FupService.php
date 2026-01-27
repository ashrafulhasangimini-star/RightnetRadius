<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class FupService
{
    protected $coaService;
    
    public function __construct(CoaService $coaService)
    {
        $this->coaService = $coaService;
    }
    
    /**
     * Check and apply FUP for all active users
     * Run this via scheduled task every hour
     */
    public function checkAndApplyFupForAll(): array
    {
        $results = [
            'checked' => 0,
            'fup_applied' => 0,
            'fup_removed' => 0,
            'errors' => 0
        ];
        
        // Get all active users with FUP-enabled packages
        $users = User::with('package')
            ->whereHas('package', function($q) {
                $q->where('fup_enabled', true)
                  ->where('quota_gb', '>', 0);
            })
            ->where('status', 'active')
            ->get();
            
        foreach ($users as $user) {
            try {
                $results['checked']++;
                $result = $this->checkAndApplyFup($user);
                
                if ($result['fup_applied'] ?? false) {
                    $results['fup_applied']++;
                } elseif ($result['fup_removed'] ?? false) {
                    $results['fup_removed']++;
                }
                
            } catch (\Exception $e) {
                $results['errors']++;
                Log::error("FUP check failed for user {$user->username}: " . $e->getMessage());
            }
        }
        
        return $results;
    }
    
    /**
     * Check and apply FUP for a single user
     */
    public function checkAndApplyFup(User $user): array
    {
        if (!$user->package || !$user->package->fup_enabled) {
            return ['fup_applied' => false, 'message' => 'FUP not enabled'];
        }
        
        // Calculate current month usage
        $usage = $this->calculateMonthlyUsage($user->id);
        $quotaBytes = $user->package->quota_gb * 1024 * 1024 * 1024;
        
        // Get or create FUP usage record
        $fupUsage = DB::table('fup_usage')->updateOrInsert(
            [
                'user_id' => $user->id,
                'usage_date' => now()->format('Y-m-d')
            ],
            [
                'total_bytes' => $usage,
                'quota_bytes' => $quotaBytes,
                'updated_at' => now()
            ]
        );
        
        $fupRecord = DB::table('fup_usage')
            ->where('user_id', $user->id)
            ->where('usage_date', now()->format('Y-m-d'))
            ->first();
        
        // Check if quota exceeded
        if ($usage > $quotaBytes) {
            return $this->applyFup($user, $fupRecord);
        } else {
            return $this->removeFup($user, $fupRecord);
        }
    }
    
    /**
     * Apply FUP speed reduction
     */
    protected function applyFup(User $user, $fupUsage): array
    {
        if ($fupUsage && $fupUsage->fup_applied) {
            return [
                'fup_applied' => false,
                'message' => 'FUP already applied',
                'usage_gb' => round($fupUsage->total_bytes / (1024**3), 2),
                'quota_gb' => round($fupUsage->quota_bytes / (1024**3), 2)
            ];
        }
        
        // Get NAS IP from user's session or config
        $nasIp = $this->getUserNasIp($user);
        $secret = config('radius.secret', 'secret123');
        
        // Send CoA to change speed
        $coaResult = $this->coaService->changeSpeed(
            $user->username,
            $user->package->fup_speed,
            $nasIp,
            $secret
        );
        
        if ($coaResult['success']) {
            DB::table('fup_usage')
                ->where('user_id', $user->id)
                ->where('usage_date', now()->format('Y-m-d'))
                ->update([
                    'fup_applied' => true,
                    'fup_applied_at' => now(),
                    'original_speed' => $user->package->speed,
                    'fup_speed' => $user->package->fup_speed,
                    'updated_at' => now()
                ]);
            
            Log::info("FUP applied for user {$user->username}", [
                'original_speed' => $user->package->speed,
                'fup_speed' => $user->package->fup_speed,
                'usage_gb' => round($fupUsage->total_bytes / (1024**3), 2),
                'quota_gb' => round($fupUsage->quota_bytes / (1024**3), 2)
            ]);
        }
        
        return [
            'fup_applied' => true,
            'coa_result' => $coaResult,
            'usage_gb' => round($fupUsage->total_bytes / (1024**3), 2),
            'quota_gb' => round($fupUsage->quota_bytes / (1024**3), 2),
            'new_speed' => $user->package->fup_speed
        ];
    }
    
    /**
     * Remove FUP (restore original speed)
     */
    protected function removeFup(User $user, $fupUsage): array
    {
        if (!$fupUsage || !$fupUsage->fup_applied) {
            return [
                'fup_removed' => false,
                'message' => 'FUP not applied',
                'usage_gb' => $fupUsage ? round($fupUsage->total_bytes / (1024**3), 2) : 0,
                'quota_gb' => $fupUsage ? round($fupUsage->quota_bytes / (1024**3), 2) : 0
            ];
        }
        
        // Get NAS IP
        $nasIp = $this->getUserNasIp($user);
        $secret = config('radius.secret', 'secret123');
        
        // Send CoA to restore original speed
        $coaResult = $this->coaService->changeSpeed(
            $user->username,
            $user->package->speed,
            $nasIp,
            $secret
        );
        
        if ($coaResult['success']) {
            DB::table('fup_usage')
                ->where('user_id', $user->id)
                ->where('usage_date', now()->format('Y-m-d'))
                ->update([
                    'fup_applied' => false,
                    'updated_at' => now()
                ]);
            
            Log::info("FUP removed for user {$user->username}", [
                'restored_speed' => $user->package->speed
            ]);
        }
        
        return [
            'fup_removed' => true,
            'coa_result' => $coaResult,
            'usage_gb' => round($fupUsage->total_bytes / (1024**3), 2),
            'quota_gb' => round($fupUsage->quota_bytes / (1024**3), 2),
            'restored_speed' => $user->package->speed
        ];
    }
    
    /**
     * Calculate monthly data usage from RADIUS accounting
     */
    protected function calculateMonthlyUsage(int $userId): int
    {
        $user = User::find($userId);
        $startOfMonth = now()->startOfMonth();
        
        $usage = DB::table('radacct')
            ->where('username', $user->username)
            ->where('acctstarttime', '>=', $startOfMonth)
            ->sum(DB::raw('acctinputoctets + acctoutputoctets'));
            
        return (int) $usage;
    }
    
    /**
     * Get user's NAS IP address
     */
    protected function getUserNasIp(User $user): string
    {
        // Try to get from active session
        $session = DB::table('radacct')
            ->where('username', $user->username)
            ->whereNull('acctstoptime')
            ->orderBy('acctstarttime', 'desc')
            ->first();
            
        if ($session) {
            return $session->nasipaddress;
        }
        
        // Fallback to default NAS
        return config('radius.default_nas_ip', '192.168.1.1');
    }
    
    /**
     * Get usage statistics for user
     */
    public function getUserUsageStats(int $userId): array
    {
        $user = User::find($userId);
        
        if (!$user || !$user->package) {
            return [];
        }
        
        $usage = $this->calculateMonthlyUsage($userId);
        $quotaBytes = $user->package->quota_gb * 1024 * 1024 * 1024;
        
        $usageGb = $usage / (1024**3);
        $quotaGb = $user->package->quota_gb;
        $percentage = $quotaGb > 0 ? ($usageGb / $quotaGb) * 100 : 0;
        
        return [
            'usage_bytes' => $usage,
            'usage_gb' => round($usageGb, 2),
            'quota_gb' => $quotaGb,
            'remaining_gb' => round(max(0, $quotaGb - $usageGb), 2),
            'percentage_used' => round($percentage, 2),
            'fup_enabled' => $user->package->fup_enabled,
            'fup_speed' => $user->package->fup_speed,
            'current_speed' => $user->package->speed,
            'is_fup_applied' => $percentage >= 100 && $user->package->fup_enabled,
            'days_until_reset' => now()->endOfMonth()->diffInDays(now())
        ];
    }
    
    /**
     * Reset monthly usage (called on 1st of each month)
     */
    public function resetMonthlyUsage(): int
    {
        // Archive previous month's data
        DB::table('fup_usage')
            ->where('usage_date', '<', now()->startOfMonth())
            ->delete();
            
        Log::info("Monthly FUP usage reset completed");
        
        return DB::table('fup_usage')->count();
    }
}
