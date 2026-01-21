<?php

return [
    'default' => env('DB_CONNECTION', 'mysql'),

    'connections' => [
        'mysql' => [
            'driver' => 'mysql',
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', 3306),
            'database' => env('DB_DATABASE', 'rightnet_radius'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'strict' => true,
            'engine' => null,
        ],

        'radius' => [
            'driver' => 'mysql',
            'host' => env('RADIUS_DB_HOST', '127.0.0.1'),
            'port' => env('RADIUS_DB_PORT', 3306),
            'database' => env('RADIUS_DB_DATABASE', 'radius'),
            'username' => env('RADIUS_DB_USERNAME', 'radius'),
            'password' => env('RADIUS_DB_PASSWORD', ''),
            'unix_socket' => env('RADIUS_DB_SOCKET', ''),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'strict' => true,
            'engine' => null,
        ],
    ],

    'migrations' => 'migrations',
];
