<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Session;
use App\Models\Package;
use App\Models\Invoice;
use App\Models\Transaction;
use App\Repositories\UserRepository;
use App\Services\FupService;
use App\Services\CoaService;
use DB;
use Carbon\Carbon;

class DashboardController extends \Illuminate\Routing\Controller
{
    protected $userRepository;
    protected $fupService;
    protected $coaService;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
        // Initialize services manually to avoid dependency issues
        $this->fupService = app(FupService::class);
        $this->coaService = app(CoaService::class);
    }

    /**
     * Get enhanced admin dashboard statistics
     */
    public function adminStats(Request $request)
    {
        // Basic user statistics
        $totalUsers = User::count();
        $activeUsers = User::where('status', 'active')->count();
        $expiredUsers = User::where('status', 'expired')->count();
        $suspendedUsers = User::where('status', 'suspended')->count();
        
        // Online users with active sessions
        $onlineUsers = User::whereHas('sessions', function ($q) {
            $q->where('status', 'online')
                ->where('expires_at', '>', now());
        })->count();

        // FUP Statistics
        $fupStats = $this->getFupStatistics();
        
        // Revenue statistics
        $monthlyRevenue = Invoice::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->where('status', 'paid')
            ->sum('amount');
            
        $todayRevenue = Transaction::whereDate('created_at', today())
            ->where('type', 'credit')
            ->sum('amount');
            
        $pendingInvoices = Invoice::where('status', 'pending')->count();
        $overdueInvoices = Invoice::where('status', 'pending')
            ->where('due_date', '<', now())
            ->count();

        // Package statistics
        $packageStats = Package::select('name', DB::raw('count(users.id) as user_count'))
            ->leftJoin('users', 'packages.id', '=', 'users.package_id')
            ->groupBy('packages.id', 'packages.name')
            ->get();

        // COA statistics
        $coaStats = DB::table('coa_requests')
            ->select('status', DB::raw('count(*) as count'))
            ->whereDate('created_at', today())
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        // Bandwidth usage (top 10 users today)
        $topBandwidthUsers = User::select('users.id', 'users.username', 'users.name', 
                DB::raw('SUM(sessions.input_octets + sessions.output_octets) as total_bytes'))
            ->join('sessions', 'users.id', '=', 'sessions.user_id')
            ->whereDate('sessions.created_at', today())
            ->groupBy('users.id', 'users.username', 'users.name')
            ->orderBy('total_bytes', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($user) {
                $user->total_gb = round($user->total_bytes / 1024 / 1024 / 1024, 2);
                return $user;
            });

        $stats = [
            // Basic stats
            'total_users' => $totalUsers,
            'active_users' => $activeUsers,
            'expired_users' => $expiredUsers,
            'suspended_users' => $suspendedUsers,
            'online_users' => $onlineUsers,
            
            // Revenue stats
            'monthly_revenue' => $monthlyRevenue,
            'today_revenue' => $todayRevenue,
            'pending_invoices' => $pendingInvoices,
            'overdue_invoices' => $overdueInvoices,
            
            // FUP stats
            'fup_enabled_users' => $fupStats['enabled_users'],
            'fup_applied_users' => $fupStats['applied_users'],
            'fup_warning_users' => $fupStats['warning_users'],
            'total_quota_used_gb' => $fupStats['total_quota_used'],
            
            // Package distribution
            'package_distribution' => $packageStats,
            
            // COA stats
            'coa_requests_today' => array_sum($coaStats),
            'coa_success_rate' => $this->calculateCoaSuccessRate($coaStats),
            
            // Top bandwidth users
            'top_bandwidth_users' => $topBandwidthUsers,
            
            // System health
            'system_health' => $this->getSystemHealth(),
        ];

        return response()->json($stats);
    }

    /**
     * Get online users history (last 24 hours)
     */
    public function onlineUsersHistory(Request $request)
    {
        $data = [];
        
        for ($i = 23; $i >= 0; $i--) {
            $time = now()->subHours($i);
            $count = Session::where('status', 'online')
                ->whereDate('updated_at', $time->toDateString())
                ->whereHour('updated_at', $time->hour)
                ->count();

            $data[] = [
                'time' => $time->format('H:i'),
                'count' => $count,
            ];
        }

        return response()->json($data);
    }

    /**
     * Get revenue history
     */
    public function revenueHistory(Request $request)
    {
        $days = $request->input('days', 30);
        $data = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $revenue = DB::table('transactions')
                ->whereDate('created_at', $date->toDateString())
                ->where('type', 'credit')
                ->sum('amount');

            $data[] = [
                'date' => $date->format('M d'),
                'revenue' => $revenue,
            ];
        }

        return response()->json($data);
    }

    /**
     * Get user bandwidth history
     */
    public function userBandwidthHistory($userId)
    {
        $data = [];
        $sessions = Session::where('user_id', $userId)
            ->where('status', 'online')
            ->orderBy('created_at', 'desc')
            ->limit(12)
            ->get();

        foreach ($sessions as $session) {
            $data[] = [
                'time' => $session->created_at->format('H:i'),
                'download' => round($session->input_octets / 1024 / 1024 / 8, 2),
                'upload' => round($session->output_octets / 1024 / 1024 / 8, 2),
            ];
        }

        return response()->json(array_reverse($data));
    }

    /**
     * Get user usage data
     */
    public function userUsage(Request $request, $userId)
    {
        $timeframe = $request->input('timeframe', 'daily');
        $data = [];

        if ($timeframe === 'daily') {
            // Daily breakdown for last 7 days
            for ($i = 6; $i >= 0; $i--) {
                $date = now()->subDays($i);
                $sessions = Session::where('user_id', $userId)
                    ->whereDate('created_at', $date->toDateString())
                    ->get();

                $download = $sessions->sum(fn($s) => $s->input_octets) / 1024 / 1024 / 1024;
                $upload = $sessions->sum(fn($s) => $s->output_octets) / 1024 / 1024 / 1024;

                $data[] = [
                    'date' => $date->format('M d'),
                    'download' => round($download, 2),
                    'upload' => round($upload, 2),
                ];
            }
        }

        return response()->json($data);
    }

    /**
     * Get FUP statistics for admin dashboard
     */
    private function getFupStatistics()
    {
        $enabledUsers = User::whereHas('package', function ($q) {
            $q->where('fup_enabled', true);
        })->count();

        $appliedUsers = DB::table('fup_usage')
            ->where('fup_applied', true)
            ->whereMonth('usage_date', now()->month)
            ->distinct('user_id')
            ->count();

        $warningUsers = DB::table('fup_usage')
            ->join('users', 'fup_usage.user_id', '=', 'users.id')
            ->join('packages', 'users.package_id', '=', 'packages.id')
            ->whereRaw('(fup_usage.total_bytes / 1024 / 1024 / 1024) >= (packages.quota_gb * 0.8)')
            ->where('fup_usage.fup_applied', false)
            ->whereMonth('fup_usage.usage_date', now()->month)
            ->count();

        $totalQuotaUsed = DB::table('fup_usage')
            ->whereMonth('usage_date', now()->month)
            ->sum(DB::raw('total_bytes / 1024 / 1024 / 1024'));

        return [
            'enabled_users' => $enabledUsers,
            'applied_users' => $appliedUsers,
            'warning_users' => $warningUsers,
            'total_quota_used' => round($totalQuotaUsed, 2),
        ];
    }

    /**
     * Calculate COA success rate
     */
    private function calculateCoaSuccessRate($coaStats)
    {
        $total = array_sum($coaStats);
        $success = $coaStats['success'] ?? 0;
        
        return $total > 0 ? round(($success / $total) * 100, 2) : 0;
    }

    /**
     * Get system health indicators
     */
    private function getSystemHealth()
    {
        return [
            'database_status' => 'healthy',
            'radius_status' => $this->checkRadiusStatus(),
            'fup_service_status' => 'active',
            'coa_service_status' => 'active',
            'last_fup_check' => $this->getLastFupCheck(),
        ];
    }

    /**
     * Check RADIUS server status
     */
    private function checkRadiusStatus()
    {
        // Simple check - if we have recent sessions, RADIUS is likely working
        $recentSessions = Session::where('created_at', '>', now()->subMinutes(30))->count();
        return $recentSessions > 0 ? 'healthy' : 'warning';
    }

    /**
     * Get last FUP check time
     */
    private function getLastFupCheck()
    {
        $lastCheck = DB::table('fup_usage')
            ->orderBy('updated_at', 'desc')
            ->first();
            
        return $lastCheck ? $lastCheck->updated_at : null;
    }

    /**
     * Get FUP dashboard data
     */
    public function fupDashboard(Request $request)
    {
        // Top users by usage this month
        $topUsers = DB::table('fup_usage')
            ->join('users', 'fup_usage.user_id', '=', 'users.id')
            ->join('packages', 'users.package_id', '=', 'packages.id')
            ->select('users.id', 'users.username', 'users.name', 'packages.name as package_name',
                'fup_usage.total_bytes', 'packages.quota_gb', 'fup_usage.fup_applied')
            ->whereMonth('fup_usage.usage_date', now()->month)
            ->orderBy('fup_usage.total_bytes', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($user) {
                $user->usage_gb = round($user->total_bytes / 1024 / 1024 / 1024, 2);
                $user->usage_percentage = $user->quota_gb > 0 ? 
                    round(($user->usage_gb / $user->quota_gb) * 100, 2) : 0;
                return $user;
            });

        // FUP applied users
        $fupAppliedUsers = DB::table('fup_usage')
            ->join('users', 'fup_usage.user_id', '=', 'users.id')
            ->join('packages', 'users.package_id', '=', 'packages.id')
            ->select('users.id', 'users.username', 'users.name', 'packages.name as package_name',
                'fup_usage.fup_applied_at', 'fup_usage.original_speed', 'fup_usage.fup_speed')
            ->where('fup_usage.fup_applied', true)
            ->whereMonth('fup_usage.usage_date', now()->month)
            ->orderBy('fup_usage.fup_applied_at', 'desc')
            ->get();

        // Daily usage trend (last 30 days)
        $usageTrend = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $usage = DB::table('fup_usage')
                ->whereDate('usage_date', $date->toDateString())
                ->sum(DB::raw('total_bytes / 1024 / 1024 / 1024'));
                
            $usageTrend[] = [
                'date' => $date->format('M d'),
                'usage_gb' => round($usage, 2),
            ];
        }

        return response()->json([
            'top_users' => $topUsers,
            'fup_applied_users' => $fupAppliedUsers,
            'usage_trend' => $usageTrend,
            'statistics' => $this->getFupStatistics(),
        ]);
    }

    /**
     * Get COA dashboard data
     */
    public function coaDashboard(Request $request)
    {
        // Recent COA requests
        $recentRequests = DB::table('coa_requests')
            ->join('users', 'coa_requests.user_id', '=', 'users.id')
            ->select('coa_requests.*', 'users.username', 'users.name')
            ->orderBy('coa_requests.created_at', 'desc')
            ->limit(50)
            ->get();

        // COA statistics by command type
        $commandStats = DB::table('coa_requests')
            ->select('command_type', 'status', DB::raw('count(*) as count'))
            ->whereDate('created_at', '>=', now()->subDays(7))
            ->groupBy('command_type', 'status')
            ->get();

        // Success rate by NAS
        $nasStats = DB::table('coa_requests')
            ->select('nas_ip', 
                DB::raw('count(*) as total'),
                DB::raw('sum(case when status = "success" then 1 else 0 end) as success'))
            ->whereDate('created_at', '>=', now()->subDays(7))
            ->groupBy('nas_ip')
            ->get()
            ->map(function ($stat) {
                $stat->success_rate = $stat->total > 0 ? 
                    round(($stat->success / $stat->total) * 100, 2) : 0;
                return $stat;
            });

        return response()->json([
            'recent_requests' => $recentRequests,
            'command_statistics' => $commandStats,
            'nas_statistics' => $nasStats,
        ]);
    }

    /**
     * Get user dashboard data
     */
    public function userDashboard(Request $request, $userId)
    {
        $user = User::with(['package', 'sessions' => function ($q) {
            $q->where('status', 'online')->latest();
        }])->findOrFail($userId);

        // Current month usage
        $currentUsage = $this->fupService->getUserUsage($userId);
        
        // Session history (last 10 sessions)
        $sessionHistory = Session::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->id,
                    'started_at' => $session->created_at,
                    'ended_at' => $session->updated_at,
                    'duration' => $session->session_time,
                    'download_mb' => round($session->input_octets / 1024 / 1024, 2),
                    'upload_mb' => round($session->output_octets / 1024 / 1024, 2),
                    'nas_ip' => $session->nas_ip_address,
                    'status' => $session->status,
                ];
            });

        // Invoice history
        $invoiceHistory = Invoice::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Package details with FUP info
        $packageDetails = [
            'id' => $user->package->id,
            'name' => $user->package->name,
            'speed' => $user->package->speed,
            'price' => $user->package->price,
            'quota_gb' => $user->package->quota_gb,
            'fup_enabled' => $user->package->fup_enabled,
            'fup_speed' => $user->package->fup_speed,
            'validity_days' => $user->package->validity_days,
            'simultaneous_sessions' => $user->package->simultaneous_sessions,
        ];

        return response()->json([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'expires_at' => $user->expires_at,
                'created_at' => $user->created_at,
            ],
            'package' => $packageDetails,
            'current_usage' => $currentUsage,
            'session_history' => $sessionHistory,
            'invoice_history' => $invoiceHistory,
            'is_online' => $user->sessions->count() > 0,
            'current_session' => $user->sessions->first(),
        ]);
    }

    /**
     * Get package analytics
     */
    public function packageAnalytics(Request $request)
    {
        $packages = Package::withCount('users')
            ->with(['users' => function ($q) {
                $q->select('id', 'package_id', 'status');
            }])
            ->get()
            ->map(function ($package) {
                $activeUsers = $package->users->where('status', 'active')->count();
                $totalRevenue = Invoice::whereHas('user', function ($q) use ($package) {
                    $q->where('package_id', $package->id);
                })->where('status', 'paid')->sum('amount');

                return [
                    'id' => $package->id,
                    'name' => $package->name,
                    'speed' => $package->speed,
                    'price' => $package->price,
                    'quota_gb' => $package->quota_gb,
                    'fup_enabled' => $package->fup_enabled,
                    'total_users' => $package->users_count,
                    'active_users' => $activeUsers,
                    'total_revenue' => $totalRevenue,
                    'avg_revenue_per_user' => $activeUsers > 0 ? round($totalRevenue / $activeUsers, 2) : 0,
                ];
            });

        return response()->json($packages);
    }
}
