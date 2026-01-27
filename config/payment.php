<?php

return [
    /*
    |--------------------------------------------------------------------------
    | bKash Configuration
    |--------------------------------------------------------------------------
    */
    'bkash' => [
        'base_url' => env('BKASH_BASE_URL', 'https://tokenized.pay.bka.sh/v1.2.0-beta'),
        'username' => env('BKASH_USERNAME'),
        'password' => env('BKASH_PASSWORD'),
        'app_key' => env('BKASH_APP_KEY'),
        'app_secret' => env('BKASH_APP_SECRET'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Nagad Configuration
    |--------------------------------------------------------------------------
    */
    'nagad' => [
        'base_url' => env('NAGAD_BASE_URL', 'https://api.mynagad.com:10443/remote-payment-gateway-1.0/api/dfs'),
        'merchant_id' => env('NAGAD_MERCHANT_ID'),
        'merchant_number' => env('NAGAD_MERCHANT_NUMBER'),
        'public_key' => env('NAGAD_PUBLIC_KEY'),
        'private_key' => env('NAGAD_PRIVATE_KEY'),
    ],

    /*
    |--------------------------------------------------------------------------
    | SSL Commerz Configuration
    |--------------------------------------------------------------------------
    */
    'ssl_commerz' => [
        'store_id' => env('SSLCOMMERZ_STORE_ID'),
        'store_password' => env('SSLCOMMERZ_STORE_PASSWORD'),
        'sandbox' => env('SSLCOMMERZ_SANDBOX', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Payment Settings
    |--------------------------------------------------------------------------
    */
    'default_currency' => env('PAYMENT_CURRENCY', 'BDT'),
    'gateway_fee_percentage' => env('PAYMENT_GATEWAY_FEE', 1.5), // 1.5%
];
