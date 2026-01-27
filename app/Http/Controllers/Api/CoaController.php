<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CoaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CoaController extends Controller
{
    protected $coaService;
    
    public function __construct(CoaService $coaService)
    {
        $this->coaService = $coaService;
    }
    
    /**
     * Change user speed
     * POST /api/coa/change-speed
     */
    public function changeSpeed(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'speed' => 'required|string', // e.g., "10M/10M"
            'nas_ip' => 'required|ip',
            'secret' => 'required|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $result = $this->coaService->changeSpeed(
            $request->username,
            $request->speed,
            $request->nas_ip,
            $request->secret
        );
        
        return response()->json($result);
    }
    
    /**
     * Disconnect user
     * POST /api/coa/disconnect
     */
    public function disconnect(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'nas_ip' => 'required|ip',
            'secret' => 'required|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $result = $this->coaService->disconnectUser(
            $request->username,
            $request->nas_ip,
            $request->secret
        );
        
        return response()->json($result);
    }
    
    /**
     * Update user quota
     * POST /api/coa/update-quota
     */
    public function updateQuota(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'quota_bytes' => 'required|integer',
            'nas_ip' => 'required|ip',
            'secret' => 'required|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $result = $this->coaService->updateQuota(
            $request->username,
            $request->quota_bytes,
            $request->nas_ip,
            $request->secret
        );
        
        return response()->json($result);
    }
    
    /**
     * Apply FUP
     * POST /api/coa/apply-fup
     */
    public function applyFup(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'nas_ip' => 'required|ip',
            'secret' => 'required|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $result = $this->coaService->applyFup(
            $request->username,
            $request->nas_ip,
            $request->secret
        );
        
        return response()->json($result);
    }
}
