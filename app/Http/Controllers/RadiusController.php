<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Session;
use App\Services\FreeRadiusService;
use Illuminate\Http\Request;

class RadiusController
{
    protected $radiusService;

    public function __construct()
    {
        $this->radiusService = new FreeRadiusService();
    }

    /**
     * Authenticate user via RADIUS
     */
    public function authenticate(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        try {
            $result = $this->radiusService->authenticateUser(
                $validated['username'],
                $validated['password']
            );

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'message' => 'Authentication successful',
                    'session_id' => $result['session_id'],
                    'framed_ip' => $result['framed_ip'],
                    'session_timeout' => $result['session_timeout'] ?? 86400,
                ], 200);
            }

            return response()->json([
                'success' => false,
                'message' => 'Authentication failed',
            ], 401);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Logout user and end session
     */
    public function logout(Request $request)
    {
        $validated = $request->validate([
            'session_id' => 'required|string',
        ]);

        try {
            $result = $this->radiusService->accountingStop(
                $validated['session_id'],
                'User-Request'
            );

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully',
                'accounting_stop' => $result,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
