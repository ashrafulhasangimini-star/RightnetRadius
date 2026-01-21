<?php

namespace App\Http\Controllers\User;

use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function edit(): View
    {
        $user = auth()->user();

        return view('user.profile', [
            'user' => $user,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = auth()->user();

        $validated = $request->validate([
            'email' => 'nullable|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string',
        ]);

        $user->update($validated);

        return back()->with('success', 'Profile updated successfully');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $user = auth()->user();

        $validated = $request->validate([
            'current_password' => 'required',
            'password' => 'required|min:8|confirmed',
        ]);

        if ($user->username !== $validated['current_password']) {
            return back()->withErrors(['current_password' => 'Current password is incorrect']);
        }

        // Update password in both Laravel and RADIUS
        $user->update(['password' => Hash::make($validated['password'])]);

        // Sync to RADIUS
        (new \App\Services\RadiusService())->syncUser($user);

        return back()->with('success', 'Password updated successfully');
    }
}
