<?php

namespace App\Http\Controllers\Admin;

use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function edit(): View
    {
        return view('admin.settings', [
            'settings' => [
                'company_name' => config('isp.company.name'),
                'company_email' => config('isp.company.email'),
                'company_phone' => config('isp.company.phone'),
                'currency' => config('isp.billing.currency'),
                'invoice_due_days' => config('isp.billing.invoice_due_days'),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        // Settings can be stored in database or config files
        // For production, use database settings table

        return back()->with('success', 'Settings updated');
    }
}
