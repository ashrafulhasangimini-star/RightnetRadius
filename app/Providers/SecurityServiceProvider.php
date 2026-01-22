<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Http\Middleware\TrustProxies;
use Illuminate\Foundation\Http\Middleware\HandleCors;

class SecurityServiceProvider extends ServiceProvider
{
    public function register()
    {
        // Register security services
        $this->app->singleton('audit', function () {
            return new \App\Services\AuditLogService();
        });
    }

    public function boot()
    {
        // Enforce HTTPS in production
        if (config('app.env') === 'production' && config('security.enforce_https')) {
            \URL::forceScheme('https');
        }

        // Set security headers
        $this->setSecurityHeaders();

        // Configure cookie security
        $this->configureSecureCookies();

        // Schedule audit log cleanup
        $this->scheduleAuditCleanup();
    }

    private function setSecurityHeaders()
    {
        $this->app['router']->middleware('web')->group(function () {
            $this->app['router']->pushMiddlewareToGroup('web', function ($request, $next) {
                $response = $next($request);

                // Set security headers
                foreach (config('security.security_headers', []) as $header => $value) {
                    $response->header($header, $value);
                }

                // HSTS header
                if (config('security.hsts_enabled')) {
                    $hsts = 'max-age=' . config('security.hsts_max_age');
                    if (config('security.hsts_include_subdomains')) {
                        $hsts .= '; includeSubDomains';
                    }
                    if (config('security.hsts_preload')) {
                        $hsts .= '; preload';
                    }
                    $response->header('Strict-Transport-Security', $hsts);
                }

                // Content Security Policy
                $response->header('Content-Security-Policy', 
                    "default-src 'self'; " .
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " .
                    "style-src 'self' 'unsafe-inline'; " .
                    "img-src 'self' data: https:; " .
                    "font-src 'self' data:; " .
                    "connect-src 'self' http://localhost:6001 https:; " .
                    "frame-ancestors 'none'"
                );

                return $response;
            });
        });
    }

    private function configureSecureCookies()
    {
        config([
            'session.secure' => config('security.secure_cookies'),
            'session.http_only' => config('security.cookie_http_only'),
            'session.same_site' => config('security.cookie_same_site'),
        ]);
    }

    private function scheduleAuditCleanup()
    {
        // Cleanup happens via scheduled task in app/Console/Kernel.php
        // The schedule is defined in that file
    }
}
