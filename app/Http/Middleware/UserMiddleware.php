<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class UserMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = auth()->user();

        if (!$user) {
            abort(403, 'Unauthorized access');
        }

        // Check if user is expired
        if ($user->expires_at && $user->expires_at->isPast()) {
            abort(403, 'Your subscription has expired');
        }

        return $next($request);
    }
}
