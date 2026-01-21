<?php

return [
    /*
    |--------------------------------------------------------------------------
    | FreeRADIUS Server Configuration
    |--------------------------------------------------------------------------
    */

    'enabled' => env('RADIUS_ENABLED', true),
    'server' => env('RADIUS_SERVER', '127.0.0.1'),
    'auth_port' => env('RADIUS_AUTH_PORT', 1812),
    'acct_port' => env('RADIUS_ACCT_PORT', 1813),
    'secret' => env('RADIUS_SECRET', 'testing123'),
    'timeout' => env('RADIUS_TIMEOUT', 3),
    'retries' => env('RADIUS_RETRIES', 3),

    /*
    |--------------------------------------------------------------------------
    | NAS Configuration
    |--------------------------------------------------------------------------
    */

    'nas_ip' => env('NAS_IP', '192.168.1.1'),
    'nas_identifier' => env('NAS_IDENTIFIER', 'RightnetRadius'),
    'nas_port' => env('NAS_PORT', 1812),

    /*
    |--------------------------------------------------------------------------
    | Session Configuration
    |--------------------------------------------------------------------------
    */

    'session_timeout' => env('SESSION_TIMEOUT', 86400),
    'idle_timeout' => env('IDLE_TIMEOUT', 600),
    'interim_accounting_interval' => env('INTERIM_ACCOUNTING_INTERVAL', 600),

    /*
    |--------------------------------------------------------------------------
    | IP Pool Configuration
    |--------------------------------------------------------------------------
    */

    'ip_pool' => [
        'enabled' => env('IP_POOL_ENABLED', true),
        'range_start' => env('IP_POOL_START', '192.168.100.2'),
        'range_end' => env('IP_POOL_END', '192.168.100.254'),
        'subnet_mask' => env('IP_POOL_MASK', '255.255.255.0'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Database Configuration
    |--------------------------------------------------------------------------
    */

    'connection' => env('RADIUS_DB_CONNECTION', 'sqlite'),
    'use_database_users' => env('RADIUS_USE_DB_USERS', true),
    'user_table' => 'users',
    'sessions_table' => 'sessions',

    'tables' => [
        'radcheck' => 'radcheck',
        'radreply' => 'radreply',
        'radusergroup' => 'radusergroup',
        'radacct' => 'radacct',
        'radpostauth' => 'radpostauth',
        'radgroupcheck' => 'radgroupcheck',
        'radgroupreply' => 'radgroupreply',
    ],

    'password_hash' => env('RADIUS_PASSWORD_HASH', 'bcrypt'),

    /*
    |--------------------------------------------------------------------------
    | Accounting Configuration
    |--------------------------------------------------------------------------
    */

    'accounting_enabled' => env('ACCOUNTING_ENABLED', true),
    'interim_updates' => env('INTERIM_UPDATES', true),
    'detailed_accounting' => env('DETAILED_ACCOUNTING', true),

    /*
    |--------------------------------------------------------------------------
    | MikroTik Integration
    |--------------------------------------------------------------------------
    */

    'mikrotik_enabled' => env('MIKROTIK_ENABLED', false),
    'mikrotik_host' => env('MIKROTIK_HOST', '192.168.1.254'),
    'mikrotik_port' => env('MIKROTIK_PORT', 8728),
    'mikrotik_user' => env('MIKROTIK_USER', 'admin'),
    'mikrotik_password' => env('MIKROTIK_PASSWORD', 'password'),

    /*
    |--------------------------------------------------------------------------
    | Logging & Monitoring
    |--------------------------------------------------------------------------
    */

    'log_authentication' => env('RADIUS_LOG_AUTH', true),
    'log_accounting' => env('RADIUS_LOG_ACCT', true),
    'log_level' => env('RADIUS_LOG_LEVEL', 'info'),

    'attributes' => [
        'User-Name' => 'User-Name',
        'User-Password' => 'User-Password',
        'Reply-Message' => 'Reply-Message',
        'Framed-IP-Address' => 'Framed-IP-Address',
        'Framed-IP-Netmask' => 'Framed-IP-Netmask',
        'Session-Timeout' => 'Session-Timeout',
        'Acct-Interim-Interval' => 'Acct-Interim-Interval',
    ],
];
