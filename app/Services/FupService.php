<?php

namespace App\Services;

use App\Models\User;
use App\Models\Session;
use App\Models\Package;
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
     * Check FUP for a specific user
     */
    public function checkUserFup($userId)
    {
        $user = User::with('package')->find($userId);
        
        if (!$user || !$user->package || !$user->package->fup_enabled) {
            return ['status' => 'not_applicable', 'message' => 'FUP not enabled for this user'];
        }

        // Calculate current month usage
        $currentUsage = $this->calculateMonthlyUsage($userId);
        $quotaBytes = $user->package->quota_gb * 1024 * 1024 * 1024; // Convert GB to bytes
        
        // Save usage to database
        $this->saveUsageData($userId, $currentUsage, $quotaBytes);

        // Check if FUP should be applied
        if ($currentUsage >= $quotaBytes && !$this->isFupAlreadyApplied($userId)) {
            return $this->applyFup($user, $currentUsage, $quotaBytes);
        }

        // Check if user is in warning zone (80% of quota)
        $warningThreshold = $quotaBytes * 0.8;
        if ($currentUsage >= $warningThreshold && $currentUsage < $quotaBytes) {
            return [
                'status' => 'warning',
                'message' => 'User approaching quota limit',
                'usage_gb' => round($currentUsage / 1024 / 1024 / 1024, 2),
                'quota_gb' => $user->package->quota_gb,
                'percentage_used' => round(($currentUsage / $quotaBytes) * 100, 2)
            ];
        }

        return [
            'status' => 'normal',
            'message' => 'Usage within limits',
            'usage_gb' => round($currentUsage / 1024 / 1024 / 1024, 2),
            'quota_gb' => $user->package->quota_gb,
            'percentage_used' => round(($currentUsage / $quotaBytes) * 100, 2)
        ];
    }

    /**
     * Apply FUP to user
     */
    public function applyFup($user, $currentUsage, $quotaBytes)
    {
        try {
            DB::beginTransaction();

            // Update FUP usage record
            DB::table('fup_usage')->updateOrInsert(
                [
                    'user_id' => $user->id,
                    'usage_date' => now()->format('Y-m-01') // First day of current month
                ],
                [
                    'total_bytes' => $currentUsage,
                    'quota_bytes' => $quotaBytes,
                    'fup_applied' => true,
                    'fup_applied_at' => now(),
                    'original_speed' => $user->package->speed,
                    'fup_speed' => $user->package->fup_speed,
                    'updated_at' => now()
                ]
            );

            // Send COA to change speed
            $coaResult = $this->coaService->changeUserSpeed(
                $user->username,
                $user->package->fup_speed,
                config('radius.default_nas_ip'),
                config('radius.secret')
            );

            DB::commit();

            Log::info("FUP applied to user {$user->username}", [
                'user_id' => $user->id,
                'usage_gb' => round($currentUsage / 1024 / 1024 / 1024, 2),
                'quota_gb' => $user->package->quota_gb,
                'original_speed' => $user->package->speed,
                'fup_speed' => $user->package->fup_speed,
                'coa_result' => $coaResult
            ]);

            return [
                'status' => 'fup_applied',
                'message' => 'FUP applied successfully',
                'usage_gb' => round($currentUsage / 1024 / 1024 / 1024, 2),
                'quota_gb' => $user->package->quota_gb,
                'original_speed' => $user->package->speed,
                'fup_speed' => $user->package->fup_speed,
                'coa_result' => $coaResult
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to apply FUP to user {$user->username}: " . $e->getMessage());
            
            return [
                'status' => 'error',
                'message' => 'Failed to apply FUP: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Calculate monthly usage for a user
     */
    public function calculateMonthlyUsage($userId)
    {
        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();

        $usage = Session::where('user_id', $userId)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->sum(DB::raw('input_octets + output_octets'));

        return $usage ?: 0;
    }

    /**
     * Save usage data to database
     */
    public function saveUsageData($userId, $totalBytes, $quotaBytes)
    {
        DB::table('fup_usage')->updateOrInsert(
            [
                'user_id' => $userId,
                'usage_date' => now()->format('Y-m-01') // First day of current month
            ],
            [
                'total_bytes' => $totalBytes,
                'quota_bytes' => $quotaBytes,
                'updated_at' => now()
            ]
        );
    }

    /**
     * Check if FUP is already applied for current month
     */
    public function isFupAlreadyApplied($userId)
    {
        return DB::table('fup_usage')
            ->where('user_id', $userId)
            ->where('usage_date', now()->format('Y-m-01'))
            ->where('fup_applied', true)
            ->exists();
    }

    /**
     * Get user usage details
     */
    public function getUserUsage($userId)
    {
        $user = User::with('package')->find($userId);
        
        if (!$user || !$user->package) {
            return null;
        }

        $currentUsage = $this->calculateMonthlyUsage($userId);
        $quotaBytes = $user->package->quota_gb * 1024 * 1024 * 1024;
        
        $fupRecord = DB::table('fup_usage')
            ->where('user_id', $userId)
            ->where('usage_date', now()->format('Y-m-01'))
            ->first();

        return [
            'user_id' => $userId,
            'username' => $user->username,
            'package_name' => $user->package->name,
            'usage_gb' => round($currentUsage / 1024 / 1024 / 1024, 2),
            'quota_gb' => $user->package->quota_gb,
            'remaining_gb' => max(0, round(($quotaBytes - $currentUsage) / 1024 / 1024 / 1024, 2)),
            'percentage_used' => $quotaBytes > 0 ? round(($currentUsage / $quotaBytes) * 100, 2) : 0,
            'fup_enabled' => $user->package->fup_enabled,
            'fup_speed' => $user->package->fup_speed,
            'current_speed' => $user->package->speed,
            'is_fup_applied' => $fupRecord ? $fupRecord->fup_applied : false,
            'fup_applied_at' => $fupRecord ? $fupRecord->fup_applied_at : null,
            'days_until_reset' => now()->endOfMonth()->diffInDays(now()) + 1,
            'reset_date' => now()->addMonth()->startOfMonth()->format('Y-m-d')
        ];
    }

    /**
     * Check FUP for all users
     */
    public function checkAllUsersFup()
    {
        $results = [];
        
        // Get all users with FUP enabled packages
        $users = User::whereHas('package', function ($q) {
            $q->where('fup_enabled', true);
        })->with('package')->get();

        foreach ($users as $user) {
            $result = $this->checkUserFup($user->id);
            $results[] = [
                'user_id' => $user->id,
                'username' => $user->username,
                'result' => $result
            ];
        }

        Log::info("FUP check completed for " . count($users) . " users", [
            'total_users' => count($users),
            'results_summary' => collect($results)->groupBy('result.status')->map->count()
        ]);

        return $results;
    }

    /**
     * Reset monthly FUP for all users
     */
    public function resetMonthlyFup()
    {
        try {
            DB::beginTransaction();

            // Get all users who had FUP applied last month
            $lastMonth = now()->subMonth()->format('Y-m-01');
            $fupUsers = DB::table('fup_usage')
                ->join('users', 'fup_usage.user_id', '=', 'users.id')
                ->join('packages', 'users.package_id', '=', 'packages.id')
                ->where('fup_usage.usage_date', $lastMonth)
                ->where('fup_usage.fup_applied', true)
                ->select('users.*', 'packages.speed as original_speed', 'fup_usage.original_speed')
                ->get();

            $resetCount = 0;
            foreach ($fupUsers as $user) {
                // Send COA to restore original speed
                $coaResult = $this->coaService->changeUserSpeed(
                    $user->username,
                    $user->original_speed ?: $user->speed,
                    config('radius.default_nas_ip'),
                    config('radius.secret')
                );

                if ($coaResult['success']) {
                    $resetCount++;
                }
            }

            // Archive last month's data and prepare for new month
            DB::table('fup_usage')
                ->where('usage_date', $lastMonth)
                ->update(['updated_at' => now()]);

            DB::commit();

            Log::info("Monthly FUP reset completed", [
                'total_users' => count($fupUsers),
                'reset_count' => $resetCount,
                'last_month' => $lastMonth
            ]);

            return [
                'success' => true,
                'message' => "FUP reset completed for {$resetCount} users",
                'total_users' => count($fupUsers),
                'reset_count' => $resetCount
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to reset monthly FUP: " . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Failed to reset monthly FUP: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get FUP dashboard statistics
     */
    public function getDashboardStats()
    {
        $currentMonth = now()->format('Y-m-01');
        
        $stats = [
            'total_fup_users' => User::whereHas('package', function ($q) {
                $q->where('fup_enabled', true);
            })->count(),
            
            'fup_applied_count' => DB::table('fup_usage')
                ->where('usage_date', $currentMonth)
                ->where('fup_applied', true)
                ->count(),
                
            'warning_users_count' => $this->getWarningUsersCount(),
            
            'total_quota_used_gb' => round(
                DB::table('fup_usage')
                    ->where('usage_date', $currentMonth)
                    ->sum('total_bytes') / 1024 / 1024 / 1024,
                2
            ),
            
            'avg_usage_percentage' => $this->getAverageUsagePercentage(),
        ];

        return $stats;
    }

    /**
     * Get count of users in warning zone (80%+ usage)
     */
    private function getWarningUsersCount()
    {
        return DB::table('fup_usage')
            ->join('users', 'fup_usage.user_id', '=', 'users.id')
            ->join('packages', 'users.package_id', '=', 'packages.id')
            ->where('fup_usage.usage_date', now()->format('Y-m-01'))
            ->whereRaw('(fup_usage.total_bytes / fup_usage.quota_bytes) >= 0.8')
            ->where('fup_usage.fup_applied', false)
            ->count();
    }

    /**
     * Get average usage percentage across all FUP users
     */
    private function getAverageUsagePercentage()
    {
        $result = DB::table('fup_usage')
            ->where('usage_date', now()->format('Y-m-01'))
            ->where('quota_bytes', '>', 0)
            ->selectRaw('AVG((total_bytes / quota_bytes) * 100) as avg_percentage')
            ->first();

        return $result ? round($result->avg_percentage, 2) : 0;
    }
}
