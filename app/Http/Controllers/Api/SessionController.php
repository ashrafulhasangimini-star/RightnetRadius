<?php

namespace App\Http\Controllers\Api;

use App\Models\Session;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = $request->query('per_page', 20);

        $sessions = $user->sessions()
            ->orderBy('started_at', 'desc')
            ->paginate($perPage);

        return response()->json($sessions);
    }

    public function show(Session $session): JsonResponse
    {
        if ($session->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($session);
    }
}
