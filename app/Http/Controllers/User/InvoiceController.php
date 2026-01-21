<?php

namespace App\Http\Controllers\User;

use Illuminate\View\View;

class InvoiceController extends Controller
{
    public function index(): View
    {
        $user = auth()->user();

        $invoices = $user->invoices()
            ->with('package')
            ->latest('issued_at')
            ->paginate(10);

        return view('user.invoices', [
            'invoices' => $invoices,
        ]);
    }

    public function show(\App\Models\Invoice $invoice): View
    {
        $user = auth()->user();

        if ($invoice->user_id !== $user->id) {
            abort(403);
        }

        $invoice->load('package');

        return view('user.invoices.show', [
            'invoice' => $invoice,
        ]);
    }
}
