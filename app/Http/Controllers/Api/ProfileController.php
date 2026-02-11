<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'avatar' => $user->avatar,
                'role' => $user->role,
                'organization' => $user->organization ?? 'Rightnet ISP',
                'notifications' => json_decode($user->notifications ?? '{}', true),
                'created_at' => $user->created_at,
            ]
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string|max:500',
            'organization' => 'sometimes|string|max:255',
        ]);
        
        $user->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $user
        ]);
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
        
        $user = $request->user();
        
        // Create avatars directory if not exists
        if (!file_exists(public_path('avatars'))) {
            mkdir(public_path('avatars'), 0755, true);
        }
        
        // Delete old avatar if exists
        if ($user->avatar && file_exists(public_path('avatars/' . $user->avatar))) {
            unlink(public_path('avatars/' . $user->avatar));
        }
        
        // Upload new avatar
        $avatar = $request->file('avatar');
        $filename = 'avatar_' . $user->id . '_' . time() . '.' . $avatar->getClientOriginalExtension();
        $avatar->move(public_path('avatars'), $filename);
        
        $user->avatar = $filename;
        $user->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Avatar uploaded successfully',
            'data' => [
                'avatar' => $filename,
                'avatar_url' => url('avatars/' . $filename)
            ]
        ]);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);
        
        $user = $request->user();
        
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 400);
        }
        
        $user->password = Hash::make($request->new_password);
        $user->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully'
        ]);
    }

    public function updateNotifications(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'usage_alerts' => 'boolean',
            'payment_reminders' => 'boolean',
            'service_updates' => 'boolean',
            'security_alerts' => 'boolean',
            'daily_reports' => 'boolean',
        ]);
        
        $user->notifications = json_encode($validated);
        $user->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Notification preferences updated successfully'
        ]);
    }
}
