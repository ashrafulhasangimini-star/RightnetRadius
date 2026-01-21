<?php

namespace App\Http\Controllers\Api;

use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = $request->query('per_page', 10);

        $invoices = $user->invoices()
            ->latest('issued_at')
            ->paginate($perPage);

        return response()->json($invoices);
    }

    public function show(Invoice $invoice): JsonResponse
    {
        if ($invoice->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($invoice);
    }
}
