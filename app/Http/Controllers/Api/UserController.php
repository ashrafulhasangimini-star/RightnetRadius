<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 20);

        $users = User::paginate($perPage);

        return response()->json($users);
    }

    public function show(User $user): JsonResponse
    {
        $user->load('package', 'sessions');

        return response()->json($user);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => 'required|unique:users',
            'email' => 'nullable|email|unique:users',
            'package_id' => 'nullable|exists:packages,id',
            'expires_at' => 'nullable|date',
        ]);

        $user = User::create($validated);

        return response()->json($user, 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'nullable|email|unique:users,email,' . $user->id,
            'package_id' => 'nullable|exists:packages,id',
            'expires_at' => 'nullable|date',
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json(null, 204);
    }
}
