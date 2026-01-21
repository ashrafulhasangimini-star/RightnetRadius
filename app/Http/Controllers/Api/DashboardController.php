<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Session;
use App\Repositories\UserRepository;
use DB;

class DashboardController extends Controller
{
    protected $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * Get admin dashboard statistics
     */
    public function adminStats(Request $request)
    {
        $stats = [
            'total_users' => User::count(),
            'active_users' => User::where('status', 'active')->count(),
            'expired_users' => User::where('status', 'expired')->count(),
            'suspended_users' => User::where('status', 'suspended')->count(),
            'online_users' => $this->userRepository->getOnlineUsers()->count(),
            'monthly_revenue' => DB::table('invoices')
                ->whereMonth('created_at', now()->month)
                ->where('status', 'paid')
                ->sum('amount'),
            'pending_invoices' => DB::table('invoices')
                ->where('status', 'pending')
                ->count(),
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
}
