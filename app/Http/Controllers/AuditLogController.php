<?php

namespace App\Http\Controllers;

use App\Services\AuditLogService;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    protected $auditService;

    public function __construct(AuditLogService $auditService)
    {
        $this->auditService = $auditService;
        $this->middleware('auth:api');
    }

    /**
     * Get audit logs
     * GET /api/audit-logs
     */
    public function index(Request $request)
    {
        $request->validate([
            'action' => 'nullable|string',
            'resource' => 'nullable|string',
            'user_id' => 'nullable|integer',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $logs = $this->auditService->getLogs($request->all());

        return response()->json([
            'success' => true,
            'data' => $logs->items(),
            'pagination' => [
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
            ],
        ]);
    }

    /**
     * Get user activity summary
     * GET /api/audit-logs/summary/:userId
     */
    public function summary($userId)
    {
        $days = request()->get('days', 30);

        $summary = $this->auditService->getUserActivitySummary($userId, $days);

        return response()->json([
            'success' => true,
            'data' => $summary,
        ]);
    }

    /**
     * Export audit logs
     * GET /api/audit-logs/export
     */
    public function export(Request $request)
    {
        $request->validate([
            'format' => 'in:csv,json',
        ]);

        $format = $request->get('format', 'csv');
        $filters = $request->all();

        if ($format === 'csv') {
            $csv = $this->auditService->exportLogs($filters);
            
            return response($csv, 200)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', 'attachment; filename="audit-logs.csv"');
        }

        $logs = $this->auditService->getLogs($filters);

        return response()->json([
            'success' => true,
            'data' => $logs->items(),
            'pagination' => [
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
            ],
        ]);
    }

    /**
     * Get authentication attempts
     * GET /api/audit-logs/auth-attempts
     */
    public function authAttempts(Request $request)
    {
        $request->validate([
            'days' => 'nullable|integer|min:1|max:90',
        ]);

        $days = $request->get('days', 7);
        $startDate = now()->subDays($days);

        $attempts = \App\Models\AuditLog::where('action', 'AUTH_ATTEMPT')
            ->where('created_at', '>=', $startDate)
            ->orderByDesc('created_at')
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $attempts->items(),
            'pagination' => [
                'total' => $attempts->total(),
                'per_page' => $attempts->perPage(),
                'current_page' => $attempts->currentPage(),
            ],
        ]);
    }

    /**
     * Get quota breaches
     * GET /api/audit-logs/quota-breaches
     */
    public function quotaBreaches(Request $request)
    {
        $request->validate([
            'days' => 'nullable|integer|min:1|max:90',
        ]);

        $days = $request->get('days', 30);
        $startDate = now()->subDays($days);

        $breaches = \App\Models\AuditLog::where('action', 'QUOTA_BREACH')
            ->where('created_at', '>=', $startDate)
            ->orderByDesc('created_at')
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $breaches->items(),
            'pagination' => [
                'total' => $breaches->total(),
                'per_page' => $breaches->perPage(),
                'current_page' => $breaches->currentPage(),
            ],
        ]);
    }

    /**
     * Get admin actions
     * GET /api/audit-logs/admin-actions
     */
    public function adminActions(Request $request)
    {
        $request->validate([
            'days' => 'nullable|integer|min:1|max:90',
        ]);

        $days = $request->get('days', 7);
        $startDate = now()->subDays($days);

        $actions = \App\Models\AuditLog::whereIn('action', [
            'BANDWIDTH_CHANGE',
            'PACKAGE_CHANGE',
            'USER_DISCONNECT',
        ])
            ->where('created_at', '>=', $startDate)
            ->orderByDesc('created_at')
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $actions->items(),
            'pagination' => [
                'total' => $actions->total(),
                'per_page' => $actions->perPage(),
                'current_page' => $actions->currentPage(),
            ],
        ]);
    }

    /**
     * Get audit statistics
     * GET /api/audit-logs/stats
     */
    public function statistics(Request $request)
    {
        $request->validate([
            'days' => 'nullable|integer|min:1|max:90',
        ]);

        $days = $request->get('days', 30);
        $startDate = now()->subDays($days);

        $stats = [
            'total_events' => \App\Models\AuditLog::where('created_at', '>=', $startDate)->count(),
            'auth_attempts' => \App\Models\AuditLog::where('action', 'AUTH_ATTEMPT')
                ->where('created_at', '>=', $startDate)
                ->count(),
            'failed_auths' => \App\Models\AuditLog::where('action', 'AUTH_ATTEMPT')
                ->where('status_code', 401)
                ->where('created_at', '>=', $startDate)
                ->count(),
            'admin_actions' => \App\Models\AuditLog::whereIn('action', [
                'BANDWIDTH_CHANGE',
                'PACKAGE_CHANGE',
                'USER_DISCONNECT',
            ])
                ->where('created_at', '>=', $startDate)
                ->count(),
            'quota_breaches' => \App\Models\AuditLog::where('action', 'QUOTA_BREACH')
                ->where('created_at', '>=', $startDate)
                ->count(),
            'unique_users' => \App\Models\AuditLog::where('created_at', '>=', $startDate)
                ->distinct('user_id')
                ->count('user_id'),
            'unique_ips' => \App\Models\AuditLog::where('created_at', '>=', $startDate)
                ->distinct('ip_address')
                ->count('ip_address'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
