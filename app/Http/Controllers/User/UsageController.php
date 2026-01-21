<?php

namespace App\Http\Controllers\User;

use Illuminate\View\View;

class UsageController extends Controller
{
    public function index(): View
    {
        $user = auth()->user();

        $monthStart = now()->startOfMonth();
        $monthEnd = now()->endOfMonth();

        $monthlyUsage = $user->sessions()
            ->whereBetween('started_at', [$monthStart, $monthEnd])
            ->sum(\DB::raw('(input_octets + output_octets)'));

        $dailyUsage = $user->sessions()
            ->selectRaw('DATE(started_at) as date, SUM(input_octets + output_octets) as total_bytes')
            ->whereBetween('started_at', [$monthStart, $monthEnd])
            ->groupBy('date')
            ->get();

        $fupStatus = $this->calculateFupStatus($user, $monthlyUsage);

        return view('user.usage', [
            'monthlyUsage' => $monthlyUsage,
            'dailyUsage' => $dailyUsage,
            'fupStatus' => $fupStatus,
            'package' => $user->package,
        ]);
    }

    protected function calculateFupStatus($user, float $usage)
    {
        if (!$user->package || !$user->package->fup_limit) {
            return null;
        }

        $limitBytes = $user->package->fup_limit * 1024 * 1024 * 1024;
        $percentage = ($usage / $limitBytes) * 100;

        return [
            'used_gb' => $usage / (1024 * 1024 * 1024),
            'limit_gb' => $user->package->fup_limit,
            'percentage' => min($percentage, 100),
        ];
    }
}
