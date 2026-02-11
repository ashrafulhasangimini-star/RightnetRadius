<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Package;
use App\Models\Transaction;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('package_id')) {
            $query->where('package_id', $request->package_id);
        }
        
        $users = $query->orderBy('created_at', 'desc')
                      ->paginate($request->per_page ?? 10);
        
        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    public function show($id)
    {
        $user = User::with('package')->find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|email|unique:users',
            'phone' => 'required|string|max:20',
            'password' => 'required|min:8',
            'package_id' => 'required|exists:packages,id',
            'address' => 'nullable|string|max:500',
            'status' => 'sometimes|in:active,inactive,expired,suspended',
        ]);
        
        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'package_id' => $validated['package_id'],
            'address' => $validated['address'] ?? null,
            'status' => $validated['status'] ?? 'active',
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $user
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'username' => 'sometimes|string|max:255|unique:users,username,' . $id,
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'phone' => 'sometimes|string|max:20',
            'package_id' => 'sometimes|exists:packages,id',
            'address' => 'nullable|string|max:500',
            'status' => 'sometimes|in:active,inactive,expired,suspended',
        ]);
        
        $user->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user
        ]);
    }

    public function updatePassword(Request $request, $id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
        
        $request->validate([
            'password' => 'required|min:8'
        ]);
        
        $user->password = Hash::make($request->password);
        $user->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully'
        ]);
    }

    public function destroy($id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
        
        $user->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }

    public function getUserStats($id)
    {
        $user = User::with('package')->find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
        
        // Get session statistics
        $totalSessions = \App\Models\Session::where('username', $user->username)->count();
        $activeSession = \App\Models\Session::where('username', $user->username)
                                           ->where('acctstoptime', null)
                                           ->first();
        
        // Get transaction statistics
        $totalRecharges = Transaction::where('user_id', $id)->sum('amount');
        $totalTransactions = Transaction::where('user_id', $id)->count();
        
        return response()->json([
            'success' => true,
            'data' => [
                'total_sessions' => $totalSessions,
                'active_session' => $activeSession ? true : false,
                'total_recharges' => $totalRecharges,
                'total_transactions' => $totalTransactions,
                'package' => $user->package,
                'status' => $user->status,
                'created_at' => $user->created_at,
            ]
        ]);
    }

    public function getUserSessions(Request $request, $id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
        
        $sessions = \App\Models\Session::where('username', $user->username)
                                       ->orderBy('acctstarttime', 'desc')
                                       ->paginate($request->per_page ?? 10);
        
        return response()->json([
            'success' => true,
            'data' => $sessions
        ]);
    }

    public function getUserTransactions(Request $request, $id)
    {
        $transactions = Transaction::where('user_id', $id)
                                   ->orderBy('created_at', 'desc')
                                   ->paginate($request->per_page ?? 10);
        
        return response()->json([
            'success' => true,
            'data' => $transactions
        ]);
    }

    public function changeStatus(Request $request, $id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
        
        $request->validate([
            'status' => 'required|in:active,inactive,expired,suspended'
        ]);
        
        $user->status = $request->status;
        $user->save();
        
        return response()->json([
            'success' => true,
            'message' => 'User status updated successfully',
            'data' => $user
        ]);
    }
}
