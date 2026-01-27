<?php

return [
    /*
    |--------------------------------------------------------------------------
    | RADIUS Server Configuration
    |--------------------------------------------------------------------------
    */
    'server' => [
        'host' => env('RADIUS_SERVER_HOST', 'localhost'),
        'auth_port' => env('RADIUS_AUTH_PORT', 1812),
        'acct_port' => env('RADIUS_ACCT_PORT', 1813),
        'secret' => env('RADIUS_SECRET', 'secret123'),
        'timeout' => env('RADIUS_TIMEOUT', 5),
    ],

    /*
    |--------------------------------------------------------------------------
    | Default NAS Configuration
    |--------------------------------------------------------------------------
    */
    'default_nas_ip' => env('RADIUS_DEFAULT_NAS_IP', '192.168.1.1'),
    'default_nas_port' => env('RADIUS_DEFAULT_NAS_PORT', 3799), // COA port

    /*
    |--------------------------------------------------------------------------
    | COA (Change of Authorization) Configuration
    |--------------------------------------------------------------------------
    */
    'coa' => [
        'enabled' => env('COA_ENABLED', true),
        'port' => env('COA_PORT', 3799),
        'timeout' => env('COA_TIMEOUT', 5),
    ],

    /*
    |--------------------------------------------------------------------------
    | FUP (Fair Usage Policy) Configuration
    |--------------------------------------------------------------------------
    */
    'fup' => [
        'enabled' => env('FUP_ENABLED', true),
        'check_interval' => env('FUP_CHECK_INTERVAL', 60), // minutes
        'default_speed' => env('FUP_DEFAULT_SPEED', '1M/1M'),
        'grace_period' => env('FUP_GRACE_PERIOD', 3), // days
        'notification_threshold' => env('FUP_NOTIFICATION_THRESHOLD', 80), // percentage
    ],

    /*
    |--------------------------------------------------------------------------
    | Session Configuration
    |--------------------------------------------------------------------------
    */
    'session' => [
        'timeout' => env('RADIUS_SESSION_TIMEOUT', 86400), // 24 hours
        'interim_interval' => env('RADIUS_INTERIM_INTERVAL', 300), // 5 minutes
        'max_concurrent' => env('RADIUS_MAX_CONCURRENT_SESSIONS', 1),
    ],

    /*
    |--------------------------------------------------------------------------
    | Accounting Configuration
    |--------------------------------------------------------------------------
    */
    'accounting' => [
        'enabled' => env('RADIUS_ACCOUNTING_ENABLED', true),
        'archive_after_days' => env('RADIUS_ARCHIVE_AFTER_DAYS', 90),
        'delete_after_days' => env('RADIUS_DELETE_AFTER_DAYS', 365),
    ],

    /*
    |--------------------------------------------------------------------------
    | Database Configuration
    |--------------------------------------------------------------------------
    */
    'database' => [
        'connection' => env('RADIUS_DB_CONNECTION', 'mysql'),
        'host' => env('RADIUS_DB_HOST', env('DB_HOST', '127.0.0.1')),
        'port' => env('RADIUS_DB_PORT', env('DB_PORT', '3306')),
        'database' => env('RADIUS_DB_DATABASE', env('DB_DATABASE', 'radius')),
        'username' => env('RADIUS_DB_USERNAME', env('DB_USERNAME', 'root')),
        'password' => env('RADIUS_DB_PASSWORD', env('DB_PASSWORD', '')),
    ],

    /*
    |--------------------------------------------------------------------------
    | MikroTik Integration
    |--------------------------------------------------------------------------
    */
    'mikrotik' => [
        'enabled' => env('MIKROTIK_ENABLED', true),
        'api_host' => env('MIKROTIK_API_HOST', '192.168.1.1'),
        'api_port' => env('MIKROTIK_API_PORT', 8728),
        'api_user' => env('MIKROTIK_API_USER', 'admin'),
        'api_password' => env('MIKROTIK_API_PASSWORD', ''),
        'api_ssl' => env('MIKROTIK_API_SSL', false),
    ],
];
