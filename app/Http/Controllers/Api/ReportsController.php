<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Package;
use App\Models\Session;
use App\Models\Invoice;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportsController extends Controller
{
    /**
     * Get subscriber statistics and charts
     */
    public function subscriber()
    {
        try {
            // Basic subscriber stats
            $totalSubscribers = User::count();
            $activeSubscribers = User::where('status', 'active')->count();
            $newSubscribers = User::whereMonth('created_at', Carbon::now()->month)
                                 ->whereYear('created_at', Carbon::now()->year)
                                 ->count();
            $suspendedSubscribers = User::where('status', 'suspended')->count();

            // Calculate growth percentage
            $lastMonthSubscribers = User::whereMonth('created_at', Carbon::now()->subMonth()->month)
                                      ->whereYear('created_at', Carbon::now()->subMonth()->year)
                                      ->count();
            $subscriberGrowth = $lastMonthSubscribers > 0 
                ? round((($newSubscribers - $lastMonthSubscribers) / $lastMonthSubscribers) * 100, 1)
                : 0;

            // Growth chart data (last 12 months)
            $growthChart = [];
            for ($i = 11; $i >= 0; $i--) {
                $date = Carbon::now()->subMonths($i);
                $count = User::whereYear('created_at', '<=', $date->year)
                           ->whereMonth('created_at', '<=', $date->month)
                           ->count();
                
                $growthChart[] = [
                    'month' => $date->format('M Y'),
                    'subscribers' => $count
                ];
            }

            // Package distribution
            $packageDistribution = Package::withCount('users')
                ->get()
                ->map(function ($package) {
                    return [
                        'name' => $package->name,
                        'value' => $package->users_count
                    ];
                })
                ->toArray();

            return response()->json([
                'total_subscribers' => $totalSubscribers,
                'active_subscribers' => $activeSubscribers,
                'new_subscribers' => $newSubscribers,
                'suspended_subscribers' => $suspendedSubscribers,
                'subscriber_growth' => $subscriberGrowth,
                'growth_chart' => $growthChart,
                'package_distribution' => $packageDistribution
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch subscriber data'], 500);
        }
    }

    /**
     * Get accounting statistics and charts
     */
    public function accounting()
    {
        try {
            // Basic accounting stats
            $monthlyRevenue = Invoice::where('status', 'paid')
                                   ->whereMonth('paid_at', Carbon::now()->month)
                                   ->whereYear('paid_at', Carbon::now()->year)
                                   ->sum('amount');

            $pendingInvoices = Invoice::where('status', 'pending')->sum('amount');
            
            $dailyRevenue = Invoice::where('status', 'paid')
                                 ->whereDate('paid_at', Carbon::today())
                                 ->sum('amount');

            $totalTransactions = Transaction::whereMonth('created_at', Carbon::now()->month)
                                          ->whereYear('created_at', Carbon::now()->year)
                                          ->count();

            // Calculate revenue growth
            $lastMonthRevenue = Invoice::where('status', 'paid')
                                     ->whereMonth('paid_at', Carbon::now()->subMonth()->month)
                                     ->whereYear('paid_at', Carbon::now()->subMonth()->year)
                                     ->sum('amount');
            
            $revenueGrowth = $lastMonthRevenue > 0 
                ? round((($monthlyRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
                : 0;

            // Revenue chart (last 12 months)
            $revenueChart = [];
            for ($i = 11; $i >= 0; $i--) {
                $date = Carbon::now()->subMonths($i);
                $revenue = Invoice::where('status', 'paid')
                                ->whereMonth('paid_at', $date->month)
                                ->whereYear('paid_at', $date->year)
                                ->sum('amount');
                
                $revenueChart[] = [
                    'month' => $date->format('M Y'),
                    'revenue' => $revenue
                ];
            }

            // Payment methods breakdown
            $paymentMethods = Transaction::select('method', DB::raw('SUM(amount) as amount'))
                                       ->whereMonth('created_at', Carbon::now()->month)
                                       ->whereYear('created_at', Carbon::now()->year)
                                       ->groupBy('method')
                                       ->get()
                                       ->toArray();

            return response()->json([
                'monthly_revenue' => $monthlyRevenue,
                'pending_invoices' => $pendingInvoices,
                'daily_revenue' => $dailyRevenue,
                'total_transactions' => $totalTransactions,
                'revenue_growth' => $revenueGrowth,
                'revenue_chart' => $revenueChart,
                'payment_methods' => $paymentMethods
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch accounting data'], 500);
        }
    }

    /**
     * Get user activity statistics and charts
     */
    public function user()
    {
        try {
            // Basic user stats
            $onlineUsers = Session::where('status', 'online')->count();
            $dailyLogins = Session::whereDate('started_at', Carbon::today())->count();
            
            // Average session time in minutes
            $avgSessionTime = Session::where('status', 'offline')
                                   ->whereNotNull('ended_at')
                                   ->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, started_at, ended_at)) as avg_time')
                                   ->value('avg_time') ?? 0;

            $activeSessions = Session::where('status', 'online')->count();

            // Hourly usage (last 24 hours)
            $hourlyUsage = [];
            for ($i = 23; $i >= 0; $i--) {
                $hour = Carbon::now()->subHours($i);
                $users = Session::whereBetween('started_at', [
                    $hour->format('Y-m-d H:00:00'),
                    $hour->format('Y-m-d H:59:59')
                ])->count();
                
                $hourlyUsage[] = [
                    'hour' => $hour->format('H:00'),
                    'users' => $users
                ];
            }

            // Device types (mock data - you can implement based on user agent)
            $deviceTypes = [
                ['name' => 'Mobile', 'value' => 45],
                ['name' => 'Desktop', 'value' => 35],
                ['name' => 'Tablet', 'value' => 15],
                ['name' => 'Other', 'value' => 5]
            ];

            return response()->json([
                'online_users' => $onlineUsers,
                'daily_logins' => $dailyLogins,
                'avg_session_time' => round($avgSessionTime, 0),
                'active_sessions' => $activeSessions,
                'hourly_usage' => $hourlyUsage,
                'device_types' => $deviceTypes
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch user data'], 500);
        }
    }

    /**
     * Get profit analysis statistics and charts
     */
    public function profit()
    {
        try {
            // Basic profit calculations
            $monthlyRevenue = Invoice::where('status', 'paid')
                                   ->whereMonth('paid_at', Carbon::now()->month)
                                   ->whereYear('paid_at', Carbon::now()->year)
                                   ->sum('amount');

            // Mock expenses (you can create an expenses table)
            $monthlyExpenses = $monthlyRevenue * 0.3; // Assuming 30% expenses
            $totalProfit = $monthlyRevenue - $monthlyExpenses;
            $profitMargin = $monthlyRevenue > 0 ? round(($totalProfit / $monthlyRevenue) * 100, 1) : 0;
            $roi = 85; // Mock ROI

            // Calculate profit growth
            $lastMonthRevenue = Invoice::where('status', 'paid')
                                     ->whereMonth('paid_at', Carbon::now()->subMonth()->month)
                                     ->whereYear('paid_at', Carbon::now()->subMonth()->year)
                                     ->sum('amount');
            $lastMonthProfit = $lastMonthRevenue * 0.7;
            $profitGrowth = $lastMonthProfit > 0 
                ? round((($totalProfit - $lastMonthProfit) / $lastMonthProfit) * 100, 1)
                : 0;

            // Profit vs Revenue chart (last 12 months)
            $profitVsRevenue = [];
            for ($i = 11; $i >= 0; $i--) {
                $date = Carbon::now()->subMonths($i);
                $revenue = Invoice::where('status', 'paid')
                                ->whereMonth('paid_at', $date->month)
                                ->whereYear('paid_at', $date->year)
                                ->sum('amount');
                $profit = $revenue * 0.7; // 70% profit margin
                
                $profitVsRevenue[] = [
                    'month' => $date->format('M Y'),
                    'revenue' => $revenue,
                    'profit' => $profit
                ];
            }

            // Expense breakdown (mock data)
            $expenseBreakdown = [
                ['name' => 'Infrastructure', 'value' => 40],
                ['name' => 'Staff', 'value' => 30],
                ['name' => 'Marketing', 'value' => 15],
                ['name' => 'Utilities', 'value' => 10],
                ['name' => 'Other', 'value' => 5]
            ];

            return response()->json([
                'total_profit' => $totalProfit,
                'monthly_expenses' => $monthlyExpenses,
                'profit_margin' => $profitMargin,
                'roi' => $roi,
                'profit_growth' => $profitGrowth,
                'profit_vs_revenue' => $profitVsRevenue,
                'expense_breakdown' => $expenseBreakdown
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch profit data'], 500);
        }
    }

    /**
     * Get usage statistics and charts
     */
    public function usage()
    {
        try {
            // Basic usage stats
            $totalDataUsage = Session::sum('input_octets') + Session::sum('output_octets');
            $totalDataUsageGB = round($totalDataUsage / (1024 * 1024 * 1024), 2);

            // Average bandwidth (mock calculation)
            $avgBandwidth = 25.5; // Mbps

            // Peak usage (mock data)
            $peakUsage = Session::whereTime('started_at', '>=', '20:00')
                              ->whereTime('started_at', '<=', '23:59')
                              ->sum('input_octets');
            $peakUsageGB = round($peakUsage / (1024 * 1024 * 1024), 2);

            // FUP violations (mock data)
            $fupViolations = User::where('status', 'active')
                               ->whereHas('sessions', function($query) {
                                   $query->whereMonth('started_at', Carbon::now()->month);
                               })
                               ->count() * 0.1; // 10% violation rate

            // Daily usage chart (last 30 days)
            $dailyUsage = [];
            for ($i = 29; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i);
                $usage = Session::whereDate('started_at', $date)
                              ->sum('input_octets');
                $usageGB = round($usage / (1024 * 1024 * 1024), 2);
                
                $dailyUsage[] = [
                    'date' => $date->format('M d'),
                    'usage' => $usageGB
                ];
            }

            // Top users by usage
            $topUsers = User::select('users.username', DB::raw('SUM(sessions.input_octets + sessions.output_octets) as total_usage'))
                          ->join('sessions', 'users.id', '=', 'sessions.user_id')
                          ->whereMonth('sessions.started_at', Carbon::now()->month)
                          ->groupBy('users.id', 'users.username')
                          ->orderBy('total_usage', 'desc')
                          ->limit(10)
                          ->get()
                          ->map(function($user) {
                              return [
                                  'username' => $user->username,
                                  'usage' => round($user->total_usage / (1024 * 1024 * 1024), 2)
                              ];
                          })
                          ->toArray();

            return response()->json([
                'total_data_usage' => $totalDataUsageGB,
                'avg_bandwidth' => $avgBandwidth,
                'peak_usage' => $peakUsageGB,
                'fup_violations' => round($fupViolations),
                'daily_usage' => $dailyUsage,
                'top_users' => $topUsers
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch usage data'], 500);
        }
    }
}