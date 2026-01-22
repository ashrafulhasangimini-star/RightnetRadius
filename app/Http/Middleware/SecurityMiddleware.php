<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiter;

class RateLimitMiddleware
{
    protected $rateLimiter;

    public function __construct(RateLimiter $rateLimiter)
    {
        $this->rateLimiter = $rateLimiter;
    }

    public function handle(Request $request, Closure $next)
    {
        $key = $this->resolveRequestSignature($request);
        $limit = 60; // requests per minute
        $decay = 1; // minutes

        if ($this->rateLimiter->tooManyAttempts($key, $limit, $decay)) {
            return response()->json([
                'success' => false,
                'message' => 'Too many requests. Please try again later.',
            ], 429);
        }

        $this->rateLimiter->hit($key, $decay * 60);

        return $next($request)->header('X-RateLimit-Limit', $limit);
    }

    protected function resolveRequestSignature(Request $request)
    {
        return hash('sha256', $request->method() . '|' . $request->getHost() . '|' . $request->ip());
    }
}

class ApiSecurityMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // HTTPS enforcement in production
        if (config('app.env') === 'production' && !$request->secure()) {
            return response()->json([
                'success' => false,
                'message' => 'HTTPS required',
            ], 403);
        }

        // CORS validation
        if (!$this->validateCorsOrigin($request)) {
            return response()->json([
                'success' => false,
                'message' => 'CORS origin not allowed',
            ], 403);
        }

        // Check for suspicious patterns
        if ($this->isSuspiciousRequest($request)) {
            \Log::warning("Suspicious request detected: {$request->ip()} - {$request->path()}");
            return response()->json([
                'success' => false,
                'message' => 'Request denied',
            ], 403);
        }

        return $next($request);
    }

    private function validateCorsOrigin(Request $request)
    {
        $allowedOrigins = config('cors.allowed_origins', [
            'http://localhost:5173',
            'http://localhost:3000',
        ]);

        $origin = $request->header('Origin');
        return $origin && in_array($origin, $allowedOrigins);
    }

    private function isSuspiciousRequest(Request $request)
    {
        // Check for SQL injection patterns
        $suspiciousPatterns = [
            '/(\bUNION\b.*\bSELECT\b)|(\bDROP\b.*\bTABLE\b)|(\bINSERT\b.*\bINTO\b)/i',
            '/(<script|javascript:|onerror=)/i',
            '/(\.\.\%2f|\.\.\\\\)/i',
        ];

        $input = $request->getContent();

        foreach ($suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $input)) {
                return true;
            }
        }

        return false;
    }
}

class AuditLoggingMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Log important operations
        if ($this->shouldLog($request)) {
            $this->logAuditEntry($request, $response);
        }

        return $response;
    }

    private function shouldLog(Request $request)
    {
        $auditMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
        $auditPaths = ['api/radius', 'api/sessions', 'api/users'];

        $method = $request->method();
        $path = $request->path();

        return in_array($method, $auditMethods) && 
               collect($auditPaths)->some(function ($audit) use ($path) {
                   return str_contains($path, $audit);
               });
    }

    private function logAuditEntry(Request $request, $response)
    {
        try {
            \App\Models\AuditLog::create([
                'user_id' => auth()->id(),
                'action' => $request->method(),
                'resource' => $request->path(),
                'old_values' => null,
                'new_values' => $this->sanitize($request->all()),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'status_code' => $response->status(),
                'timestamp' => now(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Audit logging error: ' . $e->getMessage());
        }
    }

    private function sanitize($data)
    {
        // Remove sensitive data from logs
        $sensitive = ['password', 'secret', 'token', 'api_key'];
        
        return collect($data)->map(function ($value, $key) use ($sensitive) {
            if (in_array(strtolower($key), $sensitive)) {
                return '***REDACTED***';
            }
            return $value;
        })->toArray();
    }
}

class EncryptionMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Encrypt sensitive response data
        $response = $next($request);

        if ($this->shouldEncrypt($request) && $response->isSuccessful()) {
            $content = json_decode($response->getContent(), true);
            
            if (isset($content['data'])) {
                $content['data'] = $this->encryptData($content['data']);
                $response->setContent(json_encode($content));
            }
        }

        return $response;
    }

    private function shouldEncrypt(Request $request)
    {
        // Encrypt sensitive endpoints
        $sensitiveEndpoints = ['radius/authenticate', 'bandwidth', 'quota'];
        
        return collect($sensitiveEndpoints)->some(function ($endpoint) use ($request) {
            return str_contains($request->path(), $endpoint);
        });
    }

    private function encryptData($data)
    {
        // Implement encryption as needed
        return $data;
    }
}
