<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MikroTikService;
use App\Services\AuditLogService;
use Illuminate\Http\Request;

class BandwidthController extends Controller
{
    protected $mikrotikService;
    protected $auditService;

    public function __construct(MikroTikService $mikrotikService, AuditLogService $auditService)
    {
        $this->mikrotikService = $mikrotikService;
        $this->auditService = $auditService;
    }

    /**
     * Get current bandwidth usage
     */
    public function getUsage(Request $request)
    {
        try {
            // Mock data for bandwidth usage
            $usage = [
                'download_mbps' => rand(10, 100),
                'upload_mbps' => rand(5, 50),
                'total_gb_used' => rand(100, 500),
                'active_sessions' => rand(50, 200),
                'peak_time' => '20:30-21:00',
                'average_user_usage' => rand(5, 20),
                'last_updated' => now()->toIso8601String(),
            ];

            return response()->json([
                'success' => true,
                'data' => $usage,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get 24-hour bandwidth history
     */
    public function getHistory(Request $request)
    {
        try {
            $data = [];
            for ($i = 0; $i < 24; $i++) {
                $data[] = [
                    'time' => sprintf("%02d:00", $i),
                    'download' => rand(20, 80),
                    'upload' => rand(10, 40),
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Set bandwidth limit for user
     */
    public function setLimit(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'download_limit' => 'required|string',
            'upload_limit' => 'required|string',
        ]);

        try {
            $this->mikrotikService->connect();
            $this->mikrotikService->setBandwidthLimit(
                $request->username,
                $request->download_limit,
                $request->upload_limit
            );

            $this->auditService->logBandwidthChange(
                $request->username,
                'previous',
                $request->download_limit . '/' . $request->upload_limit
            );

            return response()->json([
                'success' => true,
                'message' => 'Bandwidth limit updated',
                'username' => $request->username,
                'limits' => [
                    'download' => $request->download_limit,
                    'upload' => $request->upload_limit,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to set limit: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Block user (disable bandwidth)
     */
    public function blockUser(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
        ]);

        try {
            $this->mikrotikService->connect();
            $this->mikrotikService->blockUser($request->username);

            $this->auditService->logAdminAction(
                'USER_BLOCKED',
                "user:{$request->username}",
                null,
                ['reason' => $request->reason ?? 'Admin action']
            );

            return response()->json([
                'success' => true,
                'message' => 'User blocked',
                'username' => $request->username,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Unblock user
     */
    public function unblockUser(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
        ]);

        try {
            $this->mikrotikService->connect();
            $this->mikrotikService->unblockUser($request->username);

            $this->auditService->logAdminAction(
                'USER_UNBLOCKED',
                "user:{$request->username}",
                null,
                ['reason' => $request->reason ?? 'Admin action']
            );

            return response()->json([
                'success' => true,
                'message' => 'User unblocked',
                'username' => $request->username,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Disconnect user session
     */
    public function disconnect(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'reason' => 'nullable|string',
        ]);

        try {
            $this->mikrotikService->connect();
            $this->mikrotikService->disconnectUser($request->username);

            $this->auditService->logUserDisconnect(
                $request->username,
                'session-' . now()->timestamp,
                $request->reason ?? 'Admin disconnect',
                rand(100000000, 5000000000)
            );

            return response()->json([
                'success' => true,
                'message' => 'User disconnected',
                'username' => $request->username,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get top users by bandwidth usage
     */
    public function getTopUsers(Request $request)
    {
        try {
            $users = [];
            $names = ['Rajib Khan', 'Karim Ahmed', 'Fatima Islam', 'Ali Hassan', 'Noor Aman'];
            
            for ($i = 0; $i < 5; $i++) {
                $users[] = [
                    'username' => strtolower(str_replace(' ', '.', $names[$i])),
                    'used_gb' => rand(5, 50),
                    'quota_gb' => 100,
                    'percentage' => rand(5, 90),
                    'active_sessions' => rand(1, 5),
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $users,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
