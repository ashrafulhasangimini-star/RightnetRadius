<?php

namespace App\Http\Controllers;

use App\Models\Session;
use App\Models\User;
use App\Services\FreeRadiusService;
use Illuminate\Http\Request;

class SessionController
{
    protected $radiusService;

    public function __construct()
    {
        $this->radiusService = new FreeRadiusService();
    }

    /**
     * Get active sessions (optionally filtered by username)
     */
    public function getActiveSessions(Request $request)
    {
        $username = $request->query('username');
        
        try {
            $sessions = $this->radiusService->getActiveSessions($username);
            
            return response()->json([
                'success' => true,
                'data' => $sessions,
                'count' => count($sessions),
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get session statistics
     */
    public function getStats(Request $request)
    {
        try {
            $stats = $this->radiusService->getSessionStats();
            
            return response()->json([
                'success' => true,
                'data' => $stats,
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get specific session details
     */
    public function getSession($sessionId)
    {
        try {
            $session = Session::where('session_id', $sessionId)->firstOrFail();
            
            return response()->json([
                'success' => true,
                'data' => $session,
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Session not found',
            ], 404);
        }
    }

    /**
     * Disconnect user session (admin action)
     */
    public function disconnect($sessionId, Request $request)
    {
        $reason = $request->input('reason', 'Admin-Disconnect');
        
        try {
            $result = $this->radiusService->disconnectUser($sessionId, $reason);
            
            return response()->json([
                'success' => true,
                'message' => 'User disconnected',
                'data' => $result,
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Record accounting information
     */
    public function accounting($sessionId, Request $request)
    {
        $type = $request->input('type', 'interim'); // interim, stop
        
        try {
            $data = [
                'session_id' => $sessionId,
                'acct_input_octets' => $request->input('input_octets', 0),
                'acct_output_octets' => $request->input('output_octets', 0),
                'acct_session_time' => $request->input('session_time', 0),
            ];
            
            if ($type === 'interim') {
                $result = $this->radiusService->accountingUpdate($data);
            } else {
                $result = $this->radiusService->accountingStop($sessionId, 'User-Request');
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Accounting recorded',
                'data' => $result,
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get bandwidth usage for authenticated user
     */
    public function getBandwidthUsage(Request $request)
    {
        $username = $request->query('username');
        
        if (!$username) {
            return response()->json([
                'success' => false,
                'message' => 'Username required',
            ], 400);
        }
        
        try {
            $user = User::where('username', $username)->firstOrFail();
            $sessions = Session::where('username', $username)
                ->where('status', 'active')
                ->get();
            
            $totalInput = $sessions->sum('input_octets');
            $totalOutput = $sessions->sum('output_octets');
            $totalData = ($totalInput + $totalOutput) / (1024 * 1024 * 1024); // Convert to GB
            
            return response()->json([
                'success' => true,
                'data' => [
                    'username' => $username,
                    'total_gb' => round($totalData, 2),
                    'input_gb' => round($totalInput / (1024 * 1024 * 1024), 2),
                    'output_gb' => round($totalOutput / (1024 * 1024 * 1024), 2),
                    'active_sessions' => count($sessions),
                ],
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check user's bandwidth quota
     */
    public function checkQuota($username, Request $request)
    {
        try {
            $package = $request->input('package');
            $quota = $this->radiusService->checkQuota($username, $package);
            
            return response()->json([
                'success' => true,
                'data' => $quota,
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Record accounting start
     */
    public function accountingStart(Request $request)
    {
        $data = [
            'session_id' => $request->input('session_id'),
            'username' => $request->input('username'),
            'framed_ip' => $request->input('framed_ip'),
            'nas_ip' => $request->input('nas_ip'),
        ];
        
        try {
            $result = $this->radiusService->accountingStart($data);
            
            return response()->json([
                'success' => true,
                'data' => $result,
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Record interim accounting
     */
    public function accountingInterim(Request $request)
    {
        $data = [
            'session_id' => $request->input('session_id'),
            'acct_input_octets' => $request->input('input_octets', 0),
            'acct_output_octets' => $request->input('output_octets', 0),
            'acct_session_time' => $request->input('session_time', 0),
        ];
        
        try {
            $result = $this->radiusService->accountingUpdate($data);
            
            return response()->json([
                'success' => true,
                'data' => $result,
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Record accounting stop
     */
    public function accountingStop(Request $request)
    {
        $sessionId = $request->input('session_id');
        $reason = $request->input('reason', 'User-Request');
        
        try {
            $result = $this->radiusService->accountingStop($sessionId, $reason);
            
            return response()->json([
                'success' => true,
                'data' => $result,
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get sessions for specific user
     */
    public function getUserSessions($username)
    {
        try {
            $user = User::where('username', $username)->firstOrFail();
            $sessions = Session::where('username', $username)->get();
            
            return response()->json([
                'success' => true,
                'data' => $sessions,
                'count' => count($sessions),
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Disconnect all user sessions
     */
    public function disconnectAll($username)
    {
        try {
            $sessions = Session::where('username', $username)
                ->where('status', 'active')
                ->get();
            
            foreach ($sessions as $session) {
                $this->radiusService->disconnectUser($session->session_id, 'Admin-Disconnect-All');
            }
            
            return response()->json([
                'success' => true,
                'message' => 'All sessions disconnected',
                'count' => count($sessions),
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get session report
     */
    public function getSessionReport(Request $request)
    {
        try {
            $period = $request->input('period', 'today'); // today, week, month
            
            $query = Session::query();
            
            if ($period === 'today') {
                $query->whereDate('created_at', today());
            } elseif ($period === 'week') {
                $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
            } elseif ($period === 'month') {
                $query->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()]);
            }
            
            $sessions = $query->get();
            
            return response()->json([
                'success' => true,
                'period' => $period,
                'data' => [
                    'total_sessions' => count($sessions),
                    'active_sessions' => $sessions->where('status', 'active')->count(),
                    'closed_sessions' => $sessions->where('status', 'closed')->count(),
                    'avg_session_duration' => $sessions->avg('session_duration'),
                    'total_data_gb' => round($sessions->sum(fn($s) => ($s->input_octets + $s->output_octets) / (1024 * 1024 * 1024)), 2),
                ],
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get bandwidth report
     */
    public function getBandwidthReport(Request $request)
    {
        try {
            $period = $request->input('period', 'today');
            
            $query = Session::query();
            
            if ($period === 'today') {
                $query->whereDate('created_at', today());
            } elseif ($period === 'week') {
                $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
            } elseif ($period === 'month') {
                $query->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()]);
            }
            
            $sessions = $query->get();
            
            $totalInput = $sessions->sum('input_octets');
            $totalOutput = $sessions->sum('output_octets');
            
            return response()->json([
                'success' => true,
                'period' => $period,
                'data' => [
                    'download_gb' => round($totalInput / (1024 * 1024 * 1024), 2),
                    'upload_gb' => round($totalOutput / (1024 * 1024 * 1024), 2),
                    'total_gb' => round(($totalInput + $totalOutput) / (1024 * 1024 * 1024), 2),
                    'peak_hour' => $sessions->groupBy(fn($s) => $s->created_at->hour)->map->count()->sortDesc()->keys()->first(),
                ],
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
