<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;

class UserInfoController extends Controller
{
    /**
     * Get current user info
     */
    public function userInfo(Request $request)
    {
        $user = $request->user();
        $user->load('package');

        return response()->json([
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'package' => $user->package ? [
                'id' => $user->package->id,
                'name' => $user->package->name,
                'speed_download' => $user->package->speed_download,
                'speed_upload' => $user->package->speed_upload,
                'fup_limit' => $user->package->fup_limit,
                'validity_days' => $user->package->validity_days,
            ] : null,
            'days_remaining' => $user->days_remaining,
            'is_expired' => $user->is_expired,
            'is_active' => $user->is_active,
            'balance' => $user->balance,
            'fup_used' => $user->sessions()->sum('input_octets') / 1024 / 1024 / 1024
                + $user->sessions()->sum('output_octets') / 1024 / 1024 / 1024,
            'fup_limit' => $user->package?->fup_limit ?? 0,
            'expiry_at' => $user->expiry_at,
        ]);
    }

    /**
     * Check if user is online
     */
    public function onlineStatus(Request $request)
    {
        $user = $request->user();
        $online = $user->isOnline();

        return response()->json([
            'online' => $online,
            'session' => $online ? $user->getOnlineSession() : null,
        ]);
    }
}
