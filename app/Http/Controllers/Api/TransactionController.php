<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Invoice;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with('user');
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->has('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        
        $transactions = $query->orderBy('created_at', 'desc')
                             ->paginate($request->per_page ?? 10);
        
        return response()->json([
            'success' => true,
            'data' => $transactions
        ]);
    }

    public function show($id)
    {
        $transaction = Transaction::with('user')->find($id);
        
        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $transaction
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'type' => 'required|in:recharge,payment,refund,adjustment',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,bank_transfer,bkash,nagad,rocket,card,other',
            'transaction_id' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'invoice_id' => 'nullable|exists:invoices,id',
        ]);
        
        $transaction = Transaction::create([
            'user_id' => $validated['user_id'],
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'transaction_id' => $validated['transaction_id'] ?? null,
            'description' => $validated['description'] ?? null,
            'invoice_id' => $validated['invoice_id'] ?? null,
            'status' => 'completed',
            'processed_by' => $request->user()->id,
        ]);
        
        // Update user balance
        $user = User::find($validated['user_id']);
        $user->balance = ($user->balance ?? 0) + $validated['amount'];
        $user->save();
        
        // Create invoice if needed
        if ($validated['type'] === 'recharge') {
            Invoice::create([
                'user_id' => $validated['user_id'],
                'invoice_number' => 'INV-' . time() . '-' . $validated['user_id'],
                'amount' => $validated['amount'],
                'status' => 'paid',
                'description' => 'Recharge via ' . $validated['payment_method'],
                'paid_at' => now(),
            ]);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Transaction created successfully',
            'data' => $transaction
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $transaction = Transaction::find($id);
        
        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found'
            ], 404);
        }
        
        $request->validate([
            'status' => 'required|in:pending,completed,cancelled,failed'
        ]);
        
        $oldStatus = $transaction->status;
        $transaction->status = $request->status;
        $transaction->save();
        
        // If status changed from pending to completed, update user balance
        if ($oldStatus === 'pending' && $request->status === 'completed' && $transaction->type === 'recharge') {
            $user = User::find($transaction->user_id);
            $user->balance = ($user->balance ?? 0) + $transaction->amount;
            $user->save();
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Transaction status updated successfully',
            'data' => $transaction
        ]);
    }

    public function getStats(Request $request)
    {
        $query = Transaction::query();
        
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        
        $totalRecharge = (clone $query)->where('type', 'recharge')->where('status', 'completed')->sum('amount');
        $totalPayment = (clone $query)->where('type', 'payment')->where('status', 'completed')->sum('amount');
        $pendingTransactions = (clone $query)->where('status', 'pending')->count();
        
        $transactionsByMethod = Transaction::where('status', 'completed')
                                          ->whereIn('type', ['recharge', 'payment'])
                                          ->selectRaw('payment_method, SUM(amount) as total')
                                          ->groupBy('payment_method')
                                          ->pluck('total', 'payment_method')
                                          ->toArray();
        
        return response()->json([
            'success' => true,
            'data' => [
                'total_recharge' => $totalRecharge,
                'total_payment' => $totalPayment,
                'pending_transactions' => $pendingTransactions,
                'transactions_by_method' => $transactionsByMethod,
            ]
        ]);
    }

    public function getUserTransactions(Request $request, $userId)
    {
        $transactions = Transaction::where('user_id', $userId)
                                   ->orderBy('created_at', 'desc')
                                   ->paginate($request->per_page ?? 10);
        
        return response()->json([
            'success' => true,
            'data' => $transactions
        ]);
    }

    public function getPaymentMethods()
    {
        return response()->json([
            'success' => true,
            'data' => [
                ['id' => 'cash', 'name' => 'Cash'],
                ['id' => 'bank_transfer', 'name' => 'Bank Transfer'],
                ['id' => 'bkash', 'name' => 'bKash'],
                ['id' => 'nagad', 'name' => 'Nagad'],
                ['id' => 'rocket', 'name' => 'Rocket'],
                ['id' => 'card', 'name' => 'Credit/Debit Card'],
                ['id' => 'other', 'name' => 'Other'],
            ]
        ]);
    }
}
