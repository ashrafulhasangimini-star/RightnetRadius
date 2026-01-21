<?php

namespace App\Http\Controllers\Api;

use App\Models\Transaction;
use App\Services\BillingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = $request->query('per_page', 20);

        $transactions = $user->transactions()
            ->latest('created_at')
            ->paginate($perPage);

        return response()->json($transactions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'method' => 'nullable|in:cash,bank,mobile,invoice',
            'reference' => 'nullable|string',
        ]);

        $billingService = new BillingService();
        $transaction = $billingService->processPayment(
            $request->user(),
            $validated['amount'],
            $validated['method'] ?? 'cash',
            $validated['reference'] ?? ''
        );

        return response()->json($transaction, 201);
    }
}
