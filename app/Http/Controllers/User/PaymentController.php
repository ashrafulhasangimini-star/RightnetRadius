<?php

namespace App\Http\Controllers\User;

use Illuminate\View\View;

class PaymentController extends Controller
{
    public function index(): View
    {
        $user = auth()->user();

        $transactions = $user->transactions()
            ->latest('created_at')
            ->paginate(20);

        return view('user.payments', [
            'transactions' => $transactions,
            'balance' => $user->balance,
        ]);
    }
}
