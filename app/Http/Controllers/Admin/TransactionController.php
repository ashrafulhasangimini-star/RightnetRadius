<?php

namespace App\Http\Controllers\Admin;

use App\Models\Transaction;
use Illuminate\View\View;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request): View
    {
        $query = Transaction::with('user', 'createdBy');

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $transactions = $query->latest('created_at')->paginate(50);

        return view('admin.transactions.index', [
            'transactions' => $transactions,
        ]);
    }
}
