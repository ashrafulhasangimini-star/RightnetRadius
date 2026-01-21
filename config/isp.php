<?php

return [
    /*
    |--------------------------------------------------------------------------
    | ISP Configuration
    |--------------------------------------------------------------------------
    | General ISP system configuration and business settings
    */

    'company' => [
        'name' => env('ISP_COMPANY_NAME', 'ISP Company'),
        'email' => env('ISP_COMPANY_EMAIL', 'support@isp.local'),
        'phone' => env('ISP_COMPANY_PHONE', '+880-1234-567890'),
        'address' => env('ISP_COMPANY_ADDRESS', ''),
    ],

    'billing' => [
        'currency' => env('ISP_CURRENCY', 'BDT'),
        'invoice_prefix' => env('INVOICE_PREFIX', 'INV-'),
        'invoice_due_days' => env('INVOICE_DUE_DAYS', 7),
        'minimum_balance' => -1000, // Allow negative balance
        'late_fee_percentage' => 2, // 2% per month
    ],

    'default_limits' => [
        'simultaneous_logins' => 1,
        'session_timeout' => 3600, // seconds
        'idle_timeout' => 1800, // seconds
    ],

    'fup' => [
        'enabled' => true,
        'reduced_speed_percentage' => 10, // Reduce to 10% speed after FUP
    ],

    'notification' => [
        'expiry_warning_days' => 3,
        'fup_warning_at_percentage' => 80,
        'low_balance_amount' => 500,
    ],

    'backup' => [
        'enabled' => env('BACKUP_ENABLED', true),
        'schedule' => env('BACKUP_SCHEDULE', 'daily'),
        'retention_days' => 30,
    ],

    'logging' => [
        'enabled' => true,
        'log_api_requests' => true,
        'log_radius_sync' => true,
        'log_user_actions' => true,
    ],

    'security' => [
        'password_min_length' => 8,
        'password_require_uppercase' => true,
        'password_require_numbers' => true,
        'password_require_special' => false,
        'session_lifetime_minutes' => 480, // 8 hours
        'login_attempts' => 5,
        'lockout_duration_minutes' => 15,
    ],

    'authentication' => [
        'methods' => ['radius', 'local'],
        'default_method' => 'radius',
    ],
];
