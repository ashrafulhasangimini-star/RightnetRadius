<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuditLogService
{
    /**
     * Log authentication attempt
     */
    public function logAuthAttempt($username, $success, $method = 'radius', $details = [])
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'AUTH_ATTEMPT',
            'resource' => "user:{$username}",
            'old_values' => null,
            'new_values' => array_merge([
                'username' => $username,
                'method' => $method,
                'success' => $success,
            ], $details),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'status_code' => $success ? 200 : 401,
        ]);

        Log::info("Auth attempt for {$username}: " . ($success ? 'SUCCESS' : 'FAILED'));
    }

    /**
     * Log user session event
     */
    public function logSessionEvent($username, $event, $sessionId, $details = [])
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => "SESSION_" . strtoupper($event),
            'resource' => "session:{$sessionId}",
            'old_values' => null,
            'new_values' => array_merge([
                'username' => $username,
                'session_id' => $sessionId,
                'event' => $event,
            ], $details),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'status_code' => 200,
        ]);

        Log::info("Session {$event} for {$username}: {$sessionId}");
    }

    /**
     * Log quota breach event
     */
    public function logQuotaBreach($username, $usedGb, $quotaGb, $percentage)
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'QUOTA_BREACH',
            'resource' => "user:{$username}",
            'old_values' => null,
            'new_values' => [
                'username' => $username,
                'used_gb' => $usedGb,
                'quota_gb' => $quotaGb,
                'percentage' => $percentage,
                'threshold' => '80%',
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'status_code' => 200,
        ]);

        Log::warning("Quota breach for {$username}: {$percentage}% of {$quotaGb}GB");
    }

    /**
     * Log admin action
     */
    public function logAdminAction($action, $resource, $oldValues = null, $newValues = null)
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'resource' => $resource,
            'old_values' => $oldValues ? json_encode($oldValues) : null,
            'new_values' => $newValues ? json_encode($newValues) : null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'status_code' => 200,
        ]);

        Log::info("Admin action: {$action} on {$resource}");
    }

    /**
     * Log user disconnect
     */
    public function logUserDisconnect($username, $sessionId, $reason, $dataUsed)
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'USER_DISCONNECT',
            'resource' => "session:{$sessionId}",
            'old_values' => null,
            'new_values' => [
                'username' => $username,
                'session_id' => $sessionId,
                'reason' => $reason,
                'data_used_mb' => round($dataUsed / 1024 / 1024, 2),
                'timestamp' => now(),
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'status_code' => 200,
        ]);

        Log::info("User disconnected: {$username} ({$sessionId}) - {$reason}");
    }

    /**
     * Log bandwidth limit change
     */
    public function logBandwidthChange($username, $oldLimit, $newLimit)
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'BANDWIDTH_CHANGE',
            'resource' => "user:{$username}",
            'old_values' => ['bandwidth_limit' => $oldLimit],
            'new_values' => ['bandwidth_limit' => $newLimit],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'status_code' => 200,
        ]);

        Log::info("Bandwidth changed for {$username}: {$oldLimit} -> {$newLimit}");
    }

    /**
     * Log package change
     */
    public function logPackageChange($username, $oldPackage, $newPackage)
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'PACKAGE_CHANGE',
            'resource' => "user:{$username}",
            'old_values' => ['package_id' => $oldPackage],
            'new_values' => ['package_id' => $newPackage],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'status_code' => 200,
        ]);

        Log::info("Package changed for {$username}: {$oldPackage} -> {$newPackage}");
    }

    /**
     * Get audit logs with filters
     */
    public function getLogs($filters = [])
    {
        $query = AuditLog::query();

        if (isset($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        if (isset($filters['resource'])) {
            $query->where('resource', 'like', "%{$filters['resource']}%");
        }

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }

        return $query->orderByDesc('created_at')
                     ->paginate(50);
    }

    /**
     * Get user activity summary
     */
    public function getUserActivitySummary($userId, $days = 30)
    {
        $startDate = now()->subDays($days);

        return [
            'total_actions' => AuditLog::where('user_id', $userId)
                ->where('created_at', '>=', $startDate)
                ->count(),
            'auth_attempts' => AuditLog::where('user_id', $userId)
                ->where('action', 'AUTH_ATTEMPT')
                ->where('created_at', '>=', $startDate)
                ->count(),
            'admin_actions' => AuditLog::where('user_id', $userId)
                ->whereIn('action', ['BANDWIDTH_CHANGE', 'PACKAGE_CHANGE', 'USER_DISCONNECT'])
                ->where('created_at', '>=', $startDate)
                ->count(),
            'quota_breaches' => AuditLog::where('action', 'QUOTA_BREACH')
                ->where('created_at', '>=', $startDate)
                ->count(),
        ];
    }

    /**
     * Cleanup old audit logs (retention policy)
     */
    public function cleanupOldLogs($daysToKeep = 90)
    {
        $cutoffDate = now()->subDays($daysToKeep);
        
        $deleted = AuditLog::where('created_at', '<', $cutoffDate)->delete();

        Log::info("Audit log cleanup: Deleted {$deleted} old entries");

        return $deleted;
    }

    /**
     * Export audit logs to CSV
     */
    public function exportLogs($filters = [])
    {
        $logs = $this->getLogs($filters)->items();

        $csv = "Timestamp,Action,Resource,User ID,IP Address,Status Code\n";

        foreach ($logs as $log) {
            $csv .= sprintf(
                "\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%d\n",
                $log->created_at,
                $log->action,
                $log->resource,
                $log->user_id,
                $log->ip_address,
                $log->status_code
            );
        }

        return $csv;
    }
}
