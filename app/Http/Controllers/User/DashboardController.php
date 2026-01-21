<?php

namespace App\Http\Controllers\User;

use Illuminate\View\View;

class DashboardController extends Controller
{
    public function index(): View
    {
        $user = auth()->user();
        $user->load('package', 'sessions', 'invoices');

        $onlineSession = $user->getOnlineSession();
        $monthlyUsage = $user->sessions()
            ->where('started_at', '>=', now()->startOfMonth())
            ->sum(\DB::raw('(input_octets + output_octets)'));

        $pendingInvoices = $user->invoices()
            ->where('status', 'pending')
            ->sum('amount');

        return view('user.dashboard', [
            'user' => $user,
            'onlineSession' => $onlineSession,
            'monthlyUsage' => $monthlyUsage,
            'pendingInvoices' => $pendingInvoices,
        ]);
    }
}
