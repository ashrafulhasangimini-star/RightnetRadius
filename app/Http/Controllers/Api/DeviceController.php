<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MikroTikDevice;
use App\Services\MikroTikService;

class DeviceController extends Controller
{
    public function index(Request $request)
    {
        $query = MikroTikDevice::query();
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        $devices = $query->orderBy('name', 'asc')->paginate($request->per_page ?? 10);
        
        return response()->json([
            'success' => true,
            'data' => $devices
        ]);
    }

    public function all()
    {
        $devices = MikroTikDevice::where('status', 'active')->orderBy('name', 'asc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $devices
        ]);
    }

    public function show($id)
    {
        $device = MikroTikDevice::find($id);
        
        if (!$device) {
            return response()->json([
                'success' => false,
                'message' => 'Device not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $device
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'ip_address' => 'required|ip',
            'username' => 'required|string|max:255',
            'password' => 'required|string',
            'api_port' => 'nullable|integer',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:500',
            'status' => 'sometimes|in:active,inactive',
        ]);
        
        $device = MikroTikDevice::create([
            'name' => $validated['name'],
            'ip_address' => $validated['ip_address'],
            'username' => $validated['username'],
            'password' => $validated['password'],
            'api_port' => $validated['api_port'] ?? 8728,
            'location' => $validated['location'] ?? null,
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'active',
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Device added successfully',
            'data' => $device
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $device = MikroTikDevice::find($id);
        
        if (!$device) {
            return response()->json([
                'success' => false,
                'message' => 'Device not found'
            ], 404);
        }
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'ip_address' => 'sometimes|ip',
            'username' => 'sometimes|string|max:255',
            'password' => 'sometimes|string',
            'api_port' => 'nullable|integer',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:500',
            'status' => 'sometimes|in:active,inactive',
        ]);
        
        $device->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Device updated successfully',
            'data' => $device
        ]);
    }

    public function destroy($id)
    {
        $device = MikroTikDevice::find($id);
        
        if (!$device) {
            return response()->json([
                'success' => false,
                'message' => 'Device not found'
            ], 404);
        }
        
        $device->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Device deleted successfully'
        ]);
    }

    public function testConnection($id)
    {
        $device = MikroTikDevice::find($id);
        
        if (!$device) {
            return response()->json([
                'success' => false,
                'message' => 'Device not found'
            ], 404);
        }
        
        try {
            $mikrotik = new MikroTikService($device);
            $connection = $mikrotik->testConnection();
            
            return response()->json([
                'success' => $connection,
                'message' => $connection ? 'Connection successful' : 'Connection failed'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Connection error: ' . $e->getMessage()
            ]);
        }
    }

    public function getDeviceStats($id)
    {
        $device = MikroTikDevice::find($id);
        
        if (!$device) {
            return response()->json([
                'success' => false,
                'message' => 'Device not found'
            ], 404);
        }
        
        try {
            $mikrotik = new MikroTikService($device);
            $stats = $mikrotik->getDeviceStats();
            
            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get device stats: ' . $e->getMessage()
            ]);
        }
    }

    public function syncUsers($id)
    {
        $device = MikroTikDevice::find($id);
        
        if (!$device) {
            return response()->json([
                'success' => false,
                'message' => 'Device not found'
            ], 404);
        }
        
        try {
            $mikrotik = new MikroTikService($device);
            $result = $mikrotik->syncUsers();
            
            return response()->json([
                'success' => true,
                'message' => "Synced {$result} users",
                'data' => ['synced' => $result]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sync failed: ' . $e->getMessage()
            ]);
        }
    }

    public function toggleStatus($id)
    {
        $device = MikroTikDevice::find($id);
        
        if (!$device) {
            return response()->json([
                'success' => false,
                'message' => 'Device not found'
            ], 404);
        }
        
        $device->status = $device->status === 'active' ? 'inactive' : 'active';
        $device->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Device status updated successfully',
            'data' => $device
        ]);
    }
}
