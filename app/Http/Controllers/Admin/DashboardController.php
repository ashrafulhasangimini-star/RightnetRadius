<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use App\Models\Session;
use App\Models\Invoice;
use App\Repositories\UserRepository;
use Illuminate\View\View;

class DashboardController extends Controller
{
    protected UserRepository $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function index(): View
    {
        $stats = $this->userRepository->getStatistics();

        $onlineNow = User::whereHas('sessions', function ($q) {
            $q->where('status', 'online')->where('expires_at', '>', now());
        })->count();

        $revenueData = $this->userRepository->getMonthlyRevenue();

        $recentUsers = User::with('package')
            ->latest('created_at')
            ->limit(5)
            ->get();

        $expiringUsers = User::where('status', 'active')
            ->whereBetween('expires_at', [now(), now()->addDays(7)])
            ->count();

        $pendingInvoices = Invoice::where('status', 'pending')
            ->where('due_at', '<', now())
            ->count();

        $totalUsage = Session::where('status', 'offline')
            ->where('started_at', '>=', now()->startOfMonth())
            ->sum(\DB::raw('(input_octets + output_octets)'));

        return view('admin.dashboard', [
            'stats' => $stats,
            'onlineNow' => $onlineNow,
            'revenueData' => $revenueData,
            'recentUsers' => $recentUsers,
            'expiringUsers' => $expiringUsers,
            'pendingInvoices' => $pendingInvoices,
            'totalUsage' => $totalUsage,
        ]);
    }
}
