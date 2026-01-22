<?php

return [
    /*
    |--------------------------------------------------------------------------
    | HTTPS Configuration
    |--------------------------------------------------------------------------
    |
    | Configure HTTPS, TLS, and security headers for production deployment
    |
    */

    'enforce_https' => env('ENFORCE_HTTPS', true),

    'ssl_cert_path' => env('SSL_CERT_PATH', '/etc/ssl/certs/rightnet.crt'),
    'ssl_key_path' => env('SSL_KEY_PATH', '/etc/ssl/private/rightnet.key'),

    'hsts_enabled' => env('HSTS_ENABLED', true),
    'hsts_max_age' => env('HSTS_MAX_AGE', 31536000), // 1 year
    'hsts_include_subdomains' => env('HSTS_INCLUDE_SUBDOMAINS', true),
    'hsts_preload' => env('HSTS_PRELOAD', false),

    'secure_cookies' => env('SECURE_COOKIES', true),
    'cookie_http_only' => env('COOKIE_HTTP_ONLY', true),
    'cookie_same_site' => env('COOKIE_SAME_SITE', 'strict'),

    'cors_allowed_origins' => [
        'https://admin.rightnet.local',
        'https://portal.rightnet.local',
        'http://localhost:5173', // Development
        'http://localhost:3000',  // Development
    ],

    'security_headers' => [
        'X-Content-Type-Options' => 'nosniff',
        'X-Frame-Options' => 'DENY',
        'X-XSS-Protection' => '1; mode=block',
        'Referrer-Policy' => 'strict-origin-when-cross-origin',
        'Permissions-Policy' => 'geolocation=(), microphone=(), camera=()',
    ],

    'rate_limiting' => [
        'enabled' => env('RATE_LIMITING_ENABLED', true),
        'default_limit' => env('RATE_LIMIT_DEFAULT', 60),
        'default_decay' => env('RATE_LIMIT_DECAY', 1),
        'endpoints' => [
            'radius.authenticate' => ['limit' => 10, 'decay' => 1],
            'sessions.disconnect' => ['limit' => 20, 'decay' => 5],
            'users.update' => ['limit' => 30, 'decay' => 1],
            'api.*' => ['limit' => 100, 'decay' => 1],
        ],
    ],

    'jwt' => [
        'secret' => env('JWT_SECRET', 'your-secret-key'),
        'algorithm' => env('JWT_ALGORITHM', 'HS256'),
        'expiration' => env('JWT_EXPIRATION', 3600), // 1 hour
        'refresh_expiration' => env('JWT_REFRESH_EXPIRATION', 604800), // 7 days
    ],

    'password_policy' => [
        'min_length' => 12,
        'require_uppercase' => true,
        'require_lowercase' => true,
        'require_numbers' => true,
        'require_special' => true,
        'expiration_days' => 90,
    ],

    'two_factor' => [
        'enabled' => env('TWO_FACTOR_ENABLED', true),
        'otp_window' => 1,
        'backup_codes' => 10,
    ],

    'encryption' => [
        'cipher' => 'AES-256-CBC',
        'hash_algorithm' => 'sha256',
    ],
];
