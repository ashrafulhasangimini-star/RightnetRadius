<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = auth()->user();

        if (!$user || !in_array($user->role, ['admin', 'reseller', 'support'])) {
            abort(403, 'Unauthorized access');
        }

        return $next($request);
    }
}
