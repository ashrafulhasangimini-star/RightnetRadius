<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FupService;
use App\Models\User;
use Illuminate\Http\Request;

class FupController extends Controller
{
    protected $fupService;
    
    public function __construct(FupService $fupService)
    {
        $this->fupService = $fupService;
    }
    
    /**
     * Get user usage statistics
     * GET /api/fup/usage/{userId}
     */
    public function getUserUsage($userId)
    {
        $stats = $this->fupService->getUserUsageStats($userId);
        
        if (empty($stats)) {
            return response()->json([
                'success' => false,
                'message' => 'User or package not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
    
    /**
     * Check and apply FUP for a user
     * POST /api/fup/check/{userId}
     */
    public function checkFup($userId)
    {
        $user = User::find($userId);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
        
        $result = $this->fupService->checkAndApplyFup($user);
        
        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }
    
    /**
     * Check FUP for all users
     * POST /api/fup/check-all
     */
    public function checkAllUsers()
    {
        $result = $this->fupService->checkAndApplyFupForAll();
        
        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }
    
    /**
     * Reset monthly usage
     * POST /api/fup/reset-monthly
     */
    public function resetMonthly()
    {
        $count = $this->fupService->resetMonthlyUsage();
        
        return response()->json([
            'success' => true,
            'message' => 'Monthly usage reset completed',
            'affected_records' => $count
        ]);
    }
    
    /**
     * Get FUP dashboard data
     * GET /api/fup/dashboard
     */
    public function dashboard()
    {
        $data = \Illuminate\Support\Facades\DB::table('fup_usage')
            ->join('users', 'fup_usage.user_id', '=', 'users.id')
            ->select(
                'fup_usage.*',
                'users.username',
                'users.phone',
                \Illuminate\Support\Facades\DB::raw('(total_bytes / quota_bytes * 100) as usage_percentage')
            )
            ->where('fup_usage.usage_date', now()->format('Y-m-d'))
            ->orderBy('usage_percentage', 'desc')
            ->limit(50)
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }
}
