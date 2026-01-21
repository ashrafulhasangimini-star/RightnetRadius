<?php

namespace App\Http\Controllers\Admin;

use App\Models\Invoice;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(Request $request): View
    {
        $query = Invoice::with('user', 'package');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $invoices = $query->latest('issued_at')->paginate(30);

        return view('admin.invoices.index', [
            'invoices' => $invoices,
        ]);
    }

    public function markPaid(Invoice $invoice): RedirectResponse
    {
        $invoice->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        // Add balance to user
        $invoice->user->increment('balance', $invoice->amount);

        return back()->with('success', 'Invoice marked as paid');
    }
}
