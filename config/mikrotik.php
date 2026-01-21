<?php

return [
    /*
    |--------------------------------------------------------------------------
    | MikroTik API Configuration
    |--------------------------------------------------------------------------
    | Configuration for MikroTik RouterOS API connection and integration
    */

    'api' => [
        'host' => env('MIKROTIK_API_HOST', '192.168.1.1'),
        'port' => env('MIKROTIK_API_PORT', 8728),
        'username' => env('MIKROTIK_API_USER', 'admin'),
        'password' => env('MIKROTIK_API_PASSWORD', ''),
        'ssl' => env('MIKROTIK_API_SSL', false),
        'timeout' => 10,
    ],

    'profiles' => [
        'hotspot' => [
            'enabled' => true,
            'profile_path' => '/ip/hotspot/user/profile',
            'user_path' => '/ip/hotspot/user',
        ],
        'pppoe' => [
            'enabled' => true,
            'profile_path' => '/ppp/profile',
            'user_path' => '/ppp/secret',
        ],
    ],

    'sync' => [
        'enabled' => true,
        'interval' => 300, // 5 minutes in seconds
    ],

    'commands' => [
        'disconnect_user' => '/ppp/active/remove',
        'update_bandwidth' => '/queue/simple/set',
        'get_active_sessions' => '/ppp/active/print',
        'get_hotspot_sessions' => '/ip/hotspot/active/print',
    ],

    'limits' => [
        'max_batch_size' => 50,
        'connection_retry' => 3,
        'retry_delay' => 1000, // ms
    ],
];
