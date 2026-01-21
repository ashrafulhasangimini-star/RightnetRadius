<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UsageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $monthStart = now()->startOfMonth();

        $sessions = $user->sessions()
            ->where('started_at', '>=', $monthStart)
            ->get();

        $totalUsage = $sessions->sum(function ($session) {
            return $session->input_octets + $session->output_octets;
        });

        return response()->json([
            'total_bytes' => $totalUsage,
            'total_mb' => $totalUsage / (1024 * 1024),
            'total_gb' => $totalUsage / (1024 * 1024 * 1024),
            'sessions' => $sessions,
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        $monthlyUsage = $user->sessions()
            ->where('started_at', '>=', now()->startOfMonth())
            ->sum(\DB::raw('(input_octets + output_octets)'));

        $fupLimit = $user->package ? $user->package->fup_limit * 1024 * 1024 * 1024 : null;

        return response()->json([
            'monthly_usage_gb' => $monthlyUsage / (1024 * 1024 * 1024),
            'fup_limit_gb' => $fupLimit ? $fupLimit / (1024 * 1024 * 1024) : null,
            'fup_percentage' => $fupLimit ? ($monthlyUsage / $fupLimit) * 100 : null,
        ]);
    }
}
