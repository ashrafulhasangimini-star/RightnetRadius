<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RadiusClientService;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RadiusAuthController extends Controller
{
    protected $radiusService;
    protected $auditService;

    public function __construct(RadiusClientService $radiusService, AuditLogService $auditService)
    {
        $this->radiusService = $radiusService;
        $this->auditService = $auditService;
    }

    /**
     * Authenticate user via RADIUS
     */
    public function authenticate(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
            'nas_ip' => 'required|ip',
            'nas_port' => 'required|integer',
        ]);

        try {
            $result = $this->radiusService->authenticate(
                $request->username,
                $request->password,
                $request->nas_ip,
                $request->nas_port
            );

            // Log authentication attempt
            $this->auditService->logAuthAttempt(
                $request->username,
                $result['success'],
                'radius',
                [
                    'nas_ip' => $request->nas_ip,
                    'nas_port' => $request->nas_port,
                ]
            );

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'message' => 'Authentication successful',
                    'session_id' => $result['session_id'],
                    'framed_ip' => $result['framed_ip'],
                    'session_timeout' => $result['session_timeout'] ?? 3600,
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => $result['message'] ?? 'Authentication failed',
                ], 401);
            }
        } catch (\Exception $e) {
            $this->auditService->logAuthAttempt($request->username, false, 'radius', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Authentication service error',
            ], 500);
        }
    }

    /**
     * Start accounting session
     */
    public function accountingStart(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'session_id' => 'required|string',
            'framed_ip' => 'required|ip',
            'nas_ip' => 'required|ip',
        ]);

        try {
            $this->radiusService->accountingStart(
                $request->username,
                $request->session_id,
                $request->framed_ip,
                $request->nas_ip
            );

            $this->auditService->logSessionEvent(
                $request->username,
                'start',
                $request->session_id,
                ['framed_ip' => $request->framed_ip]
            );

            return response()->json([
                'success' => true,
                'message' => 'Accounting started',
                'session_id' => $request->session_id,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Accounting error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update accounting (interim)
     */
    public function accountingInterim(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
            'username' => 'required|string',
            'input_octets' => 'required|integer',
            'output_octets' => 'required|integer',
            'session_time' => 'required|integer',
        ]);

        try {
            $this->radiusService->accountingInterim(
                $request->session_id,
                $request->input_octets,
                $request->output_octets,
                $request->session_time,
                $request->username
            );

            return response()->json([
                'success' => true,
                'message' => 'Accounting updated',
                'data' => [
                    'input_octets' => $request->input_octets,
                    'output_octets' => $request->output_octets,
                    'session_time' => $request->session_time,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Update error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Stop accounting session
     */
    public function accountingStop(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
            'username' => 'required|string',
            'input_octets' => 'required|integer',
            'output_octets' => 'required|integer',
            'session_time' => 'required|integer',
            'terminate_cause' => 'nullable|string',
        ]);

        try {
            $this->radiusService->accountingStop(
                $request->session_id,
                $request->input_octets,
                $request->output_octets,
                $request->session_time,
                $request->username,
                $request->terminate_cause ?? 'User-Request'
            );

            $totalData = ($request->input_octets + $request->output_octets) / (1024 * 1024);

            $this->auditService->logSessionEvent(
                $request->username,
                'stop',
                $request->session_id,
                [
                    'total_data_mb' => round($totalData, 2),
                    'session_time' => $request->session_time,
                    'terminate_cause' => $request->terminate_cause ?? 'User-Request',
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Session ended',
                'total_data_mb' => round($totalData, 2),
                'session_duration' => $request->session_time,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Stop error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check user quota
     */
    public function checkQuota(Request $request, $username)
    {
        try {
            // This would query database for user quota
            // For now, returning mock data
            $quota = [
                'username' => $username,
                'quota_gb' => 100,
                'used_gb' => 45.2,
                'remaining_gb' => 54.8,
                'percentage' => 45.2,
                'status' => 'normal', // warning at 80%, exceeded at 100%
            ];

            if ($quota['percentage'] >= 100) {
                $quota['status'] = 'exceeded';
                $this->auditService->logQuotaBreach(
                    $username,
                    $quota['used_gb'],
                    $quota['quota_gb'],
                    $quota['percentage']
                );
            } elseif ($quota['percentage'] >= 80) {
                $quota['status'] = 'warning';
                $this->auditService->logQuotaBreach(
                    $username,
                    $quota['used_gb'],
                    $quota['quota_gb'],
                    $quota['percentage']
                );
            }

            return response()->json([
                'success' => true,
                'data' => $quota,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
