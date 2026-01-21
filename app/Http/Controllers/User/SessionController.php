<?php

namespace App\Http\Controllers\User;

use Illuminate\View\View;

class SessionController extends Controller
{
    public function index(): View
    {
        $user = auth()->user();

        $sessions = $user->sessions()
            ->orderBy('started_at', 'desc')
            ->paginate(20);

        return view('user.sessions', [
            'sessions' => $sessions,
        ]);
    }
}
