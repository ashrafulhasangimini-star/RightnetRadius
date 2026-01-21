<?php

return [
    /*
    |--------------------------------------------------------------------------
    | FreeRADIUS Configuration
    |--------------------------------------------------------------------------
    | Configuration for FreeRADIUS database connection and sync settings
    */

    'connection' => env('RADIUS_DB_CONNECTION', 'radius'),

    'tables' => [
        'radcheck' => 'radcheck',
        'radreply' => 'radreply',
        'radusergroup' => 'radusergroup',
        'radacct' => 'radacct',
        'radpostauth' => 'radpostauth',
        'radgroupcheck' => 'radgroupcheck',
        'radgroupreply' => 'radgroupreply',
    ],

    'password_hash' => env('RADIUS_PASSWORD_HASH', 'bcrypt'), // bcrypt, md5, cleartext

    'nas_identifier' => env('RADIUS_NAS_IDENTIFIER', 'MikroTik'),

    'default_group' => 'users',

    'sync' => [
        'enabled' => true,
        'schedule' => 'hourly', // hourly, daily, on-demand
    ],

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
