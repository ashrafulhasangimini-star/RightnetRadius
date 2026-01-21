<?php

namespace App\Http\Controllers\Admin;

use App\Models\Session;
use Illuminate\View\View;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function revenue(Request $request): View
    {
        $startDate = $request->query('start_date', now()->startOfMonth());
        $endDate = $request->query('end_date', now()->endOfMonth());

        $data = \DB::table('invoices')
            ->join('users', 'invoices.user_id', '=', 'users.id')
            ->selectRaw('DATE(invoices.issued_at) as date, SUM(invoices.amount) as amount, COUNT(*) as count')
            ->whereBetween('invoices.issued_at', [$startDate, $endDate])
            ->where('invoices.status', 'paid')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return view('admin.reports.revenue', [
            'data' => $data,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);
    }

    public function usage(Request $request): View
    {
        $startDate = $request->query('start_date', now()->startOfMonth());
        $endDate = $request->query('end_date', now()->endOfMonth());

        $data = \DB::table('sessions')
            ->selectRaw('DATE(started_at) as date, SUM(input_octets + output_octets) as total_bytes')
            ->whereBetween('started_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return view('admin.reports.usage', [
            'data' => $data,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);
    }

    public function sessions(Request $request): View
    {
        $startDate = $request->query('start_date', now()->startOfMonth());
        $endDate = $request->query('end_date', now());

        $sessions = Session::with('user')
            ->whereBetween('started_at', [$startDate, $endDate])
            ->orderBy('started_at', 'desc')
            ->paginate(50);

        return view('admin.reports.sessions', [
            'sessions' => $sessions,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);
    }
}
