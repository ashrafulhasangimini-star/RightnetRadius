<?php

namespace App\Http\Controllers\Admin;

use App\Models\AuditLog;
use Illuminate\View\View;

class AuditLogController extends Controller
{
    public function index(): View
    {
        $logs = AuditLog::with('admin_user')
            ->latest('created_at')
            ->paginate(50);

        return view('admin.audit-logs.index', [
            'logs' => $logs,
        ]);
    }
}
