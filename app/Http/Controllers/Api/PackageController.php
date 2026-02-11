<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Package;

class PackageController extends Controller
{
    public function index(Request $request)
    {
        $query = Package::query();
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('speed_down', 'like', "%{$search}%");
        }
        
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        $packages = $query->orderBy('price', 'asc')->paginate($request->per_page ?? 10);
        
        return response()->json([
            'success' => true,
            'data' => $packages
        ]);
    }

    public function all()
    {
        $packages = Package::where('status', 'active')->orderBy('price', 'asc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $packages
        ]);
    }

    public function show($id)
    {
        $package = Package::find($id);
        
        if (!$package) {
            return response()->json([
                'success' => false,
                'message' => 'Package not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $package
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'speed_down' => 'required|integer',
            'speed_up' => 'required|integer',
            'price' => 'required|numeric|min:0',
            'type' => 'required|in:prepaid,postpaid,hotspot,pppoe',
            'data_limit' => 'nullable|integer',
            'fup_enable' => 'sometimes|boolean',
            'fup_speed_down' => 'nullable|integer',
            'fup_speed_up' => 'nullable|integer',
            'fup_data_limit' => 'nullable|integer',
            'burst_limit_enable' => 'sometimes|boolean',
            'burst_time' => 'nullable|integer',
            'burst_threshold' => 'nullable|integer',
            'priority' => 'nullable|integer',
            'status' => 'sometimes|in:active,inactive',
        ]);
        
        $package = Package::create([
            'name' => $validated['name'],
            'speed_down' => $validated['speed_down'],
            'speed_up' => $validated['speed_up'],
            'price' => $validated['price'],
            'type' => $validated['type'],
            'data_limit' => $validated['data_limit'] ?? null,
            'fup_enable' => $validated['fup_enable'] ?? false,
            'fup_speed_down' => $validated['fup_speed_down'] ?? null,
            'fup_speed_up' => $validated['fup_speed_up'] ?? null,
            'fup_data_limit' => $validated['fup_data_limit'] ?? null,
            'burst_limit_enable' => $validated['burst_limit_enable'] ?? false,
            'burst_time' => $validated['burst_time'] ?? null,
            'burst_threshold' => $validated['burst_threshold'] ?? null,
            'priority' => $validated['priority'] ?? 8,
            'status' => $validated['status'] ?? 'active',
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Package created successfully',
            'data' => $package
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $package = Package::find($id);
        
        if (!$package) {
            return response()->json([
                'success' => false,
                'message' => 'Package not found'
            ], 404);
        }
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'speed_down' => 'sometimes|integer',
            'speed_up' => 'sometimes|integer',
            'price' => 'sometimes|numeric|min:0',
            'type' => 'sometimes|in:prepaid,postpaid,hotspot,pppoe',
            'data_limit' => 'nullable|integer',
            'fup_enable' => 'sometimes|boolean',
            'fup_speed_down' => 'nullable|integer',
            'fup_speed_up' => 'nullable|integer',
            'fup_data_limit' => 'nullable|integer',
            'burst_limit_enable' => 'sometimes|boolean',
            'burst_time' => 'nullable|integer',
            'burst_threshold' => 'nullable|integer',
            'priority' => 'nullable|integer',
            'status' => 'sometimes|in:active,inactive',
        ]);
        
        $package->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Package updated successfully',
            'data' => $package
        ]);
    }

    public function destroy($id)
    {
        $package = Package::find($id);
        
        if (!$package) {
            return response()->json([
                'success' => false,
                'message' => 'Package not found'
            ], 404);
        }
        
        // Check if package has users
        if ($package->users()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete package with active users'
            ], 400);
        }
        
        $package->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Package deleted successfully'
        ]);
    }

    public function toggleStatus($id)
    {
        $package = Package::find($id);
        
        if (!$package) {
            return response()->json([
                'success' => false,
                'message' => 'Package not found'
            ], 404);
        }
        
        $package->status = $package->status === 'active' ? 'inactive' : 'active';
        $package->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Package status updated successfully',
            'data' => $package
        ]);
    }

    public function getPackageStats($id)
    {
        $package = Package::withCount('users')->find($id);
        
        if (!$package) {
            return response()->json([
                'success' => false,
                'message' => 'Package not found'
            ], 404);
        }
        
        $activeUsers = $package->users()->where('status', 'active')->count();
        $revenue = $package->users()->where('status', 'active')->sum('package_price');
        
        return response()->json([
            'success' => true,
            'data' => [
                'total_users' => $package->users_count,
                'active_users' => $activeUsers,
                'monthly_revenue' => $revenue,
            ]
        ]);
    }
}
