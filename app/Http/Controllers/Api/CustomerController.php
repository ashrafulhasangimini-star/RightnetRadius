<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function dashboard(Request $request)
    {
        return response()->json([
            'download_speed' => 2.5,
            'upload_speed' => 1.2,
            'active_sessions' => 1,
            'total_data' => 45.2,
            'quota_gb' => 100,
            'used_gb' => 45.2,
            'username' => auth()->user()?->name ?? 'Guest User',
            'package' => 'Premium 100GB',
            'renewal_date' => now()->addDays(30)->toDateString(),
        ]);
    }

    public function profile(Request $request)
    {
        return response()->json([
            'id' => 1,
            'username' => auth()->user()?->name ?? 'user1',
            'email' => auth()->user()?->email ?? 'user1@example.com',
            'phone' => '+880-1700-000000',
            'address' => '123 Network Street, Dhaka',
            'package' => 'Premium 100GB',
            'status' => 'active',
            'created_at' => now()->subMonths(3),
            'renewal_date' => now()->addDays(30),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        return response()->json([
            'message' => 'Profile updated successfully',
            'success' => true,
            'profile' => [
                'phone' => $request->phone,
                'address' => $request->address,
            ],
        ]);
    }
}
