<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\NasClient;

class NasClientController extends Controller
{
    public function index(Request $request)
    {
        $query = NasClient::query();
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('nasname', 'like', "%{$search}%")
                  ->orWhere('shortname', 'like', "%{$search}%")
                  ->orWhere('secret', 'like', "%{$search}%");
        }
        
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        $nasClients = $query->orderBy('nasname', 'asc')->paginate($request->per_page ?? 10);
        
        return response()->json([
            'success' => true,
            'data' => $nasClients
        ]);
    }

    public function all()
    {
        $nasClients = NasClient::orderBy('nasname', 'asc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $nasClients
        ]);
    }

    public function show($id)
    {
        $nas = NasClient::find($id);
        
        if (!$nas) {
            return response()->json([
                'success' => false,
                'message' => 'NAS client not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $nas
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nasname' => 'required|string|max:64',
            'shortname' => 'nullable|string|max:32',
            'type' => 'nullable|string|max:30',
            'ports' => 'nullable|integer',
            'secret' => 'required|string|max:60',
            'server' => 'nullable|string|max:64',
            'community' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:200',
        ]);
        
        $nas = NasClient::create([
            'nasname' => $validated['nasname'],
            'shortname' => $validated['shortname'] ?? null,
            'type' => $validated['type'] ?? 'other',
            'ports' => $validated['ports'] ?? null,
            'secret' => $validated['secret'],
            'server' => $validated['server'] ?? null,
            'community' => $validated['community'] ?? null,
            'description' => $validated['description'] ?? null,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'NAS client added successfully',
            'data' => $nas
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $nas = NasClient::find($id);
        
        if (!$nas) {
            return response()->json([
                'success' => false,
                'message' => 'NAS client not found'
            ], 404);
        }
        
        $validated = $request->validate([
            'nasname' => 'sometimes|string|max:64',
            'shortname' => 'nullable|string|max:32',
            'type' => 'nullable|string|max:30',
            'ports' => 'nullable|integer',
            'secret' => 'sometimes|string|max:60',
            'server' => 'nullable|string|max:64',
            'community' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:200',
        ]);
        
        $nas->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'NAS client updated successfully',
            'data' => $nas
        ]);
    }

    public function destroy($id)
    {
        $nas = NasClient::find($id);
        
        if (!$nas) {
            return response()->json([
                'success' => false,
                'message' => 'NAS client not found'
            ], 404);
        }
        
        $nas->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'NAS client deleted successfully'
        ]);
    }

    public function toggleStatus($id)
    {
        $nas = NasClient::find($id);
        
        if (!$nas) {
            return response()->json([
                'success' => false,
                'message' => 'NAS client not found'
            ], 404);
        }
        
        // For NAS clients, we don't have status field, so we use description to store status
        $currentStatus = $nas->description ? json_decode($nas->description, true)['status'] ?? 'active' : 'active';
        $newStatus = $currentStatus === 'active' ? 'inactive' : 'active';
        
        $nas->description = json_encode(['status' => $newStatus, 'notes' => 'RADIUS Client status']);
        $nas->save();
        
        return response()->json([
            'success' => true,
            'message' => 'NAS client status updated successfully',
            'data' => $nas
        ]);
    }

    public function getActiveClients()
    {
        $nasClients = NasClient::where('type', '!=', 'Virtual')
                               ->orderBy('nasname', 'asc')
                               ->get();
        
        return response()->json([
            'success' => true,
            'data' => $nasClients
        ]);
    }
}
