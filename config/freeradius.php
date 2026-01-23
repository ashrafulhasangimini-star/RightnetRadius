<?php

/**
 * FreeRADIUS Configuration
 * RADIUS প্রোটোকল (RFC 2865) এর সাথে সংযোগের জন্য কনফিগারেশন
 */

return [
    /**
     * FreeRADIUS সার্ভার সেটিংস
     */
    'enabled' => env('FREERADIUS_ENABLED', true),
    
    // সার্ভার হোস্ট এবং পোর্ট
    'host' => env('FREERADIUS_HOST', 'localhost'),
    'port' => env('FREERADIUS_PORT', 1812),
    'acct_port' => env('FREERADIUS_ACCT_PORT', 1813),
    
    // শেয়ার্ড সিক্রেট (খুব গুরুত্বপূর্ণ - শক্তিশালী রাখুন)
    'shared_secret' => env('FREERADIUS_SHARED_SECRET', 'testing123'),
    
    // টাইমআউট সেটিংস
    'timeout' => env('RADIUS_TIMEOUT', 5),
    'retries' => env('RADIUS_RETRIES', 3),
    
    /**
     * RADIUS অথেন্টিকেশন সেটিংস
     */
    'auth' => [
        // অথেন্টিকেশন মেথড
        'method' => env('RADIUS_AUTH_METHOD', 'pap'), // pap, chap, eap
        
        // NAS Identifier
        'nas_identifier' => env('NAS_IDENTIFIER', 'rightnet-radius'),
        
        // NAS IP (যদি স্পষ্ট না হয়)
        'nas_ip' => env('NAS_IP', '127.0.0.1'),
        
        // সার্ভিস টাইপ
        'service_type' => 2, // Framed-User
    ],

    /**
     * অ্যাকাউন্টিং সেটিংস
     */
    'accounting' => [
        // অ্যাকাউন্টিং এনেবল করুন
        'enabled' => env('RADIUS_ACCOUNTING_ENABLED', true),
        
        // অ্যাকাউন্টিং আপডেট ইন্টারভাল (সেকেন্ডে)
        'interim_update_interval' => env('ACCOUNTING_INTERIM_INTERVAL', 300), // 5 মিনিট
        
        // আপডেট করার সময় ডাটাবেসে স্টোর করুন
        'log_updates' => true,
        
        // সেশন টাইমআউট
        'session_timeout' => env('SESSION_TIMEOUT', 3600), // 1 ঘন্টা
    ],

    /**
     * ডাটাবেস সিঙ্ক সেটিংস
     */
    'database' => [
        // SQLite এ ইউজার ক্রেডেনশিয়াল স্টোর করুন
        'sync_enabled' => true,
        
        // স্বয়ংক্রিয় সিঙ্ক ইন্টারভাল (মিনিটে)
        'sync_interval' => 5,
        
        // টেবিল নাম
        'users_table' => 'users',
        'nas_clients_table' => 'nas_clients',
        'accounting_table' => 'radius_accounting',
        'sessions_table' => 'sessions',
    ],

    /**
     * NAS (Network Access Server) ডিফল্ট সেটিংস
     */
    'nas_defaults' => [
        'mikrotik' => [
            'type' => 'mikrotik',
            'description' => 'MikroTik RouterOS',
            'port_range' => [1024, 65535],
        ],
        'ubiquiti' => [
            'type' => 'ubiquiti',
            'description' => 'Ubiquiti UniFi Access Point',
        ],
        'cisco' => [
            'type' => 'cisco',
            'description' => 'Cisco Network Device',
        ],
    ],

    /**
     * নিরাপত্তা সেটিংস
     */
    'security' => [
        // Request Authenticator যাচাই করুন
        'verify_authenticator' => true,
        
        // Message-Authenticator চেক করুন (অপশনাল)
        'require_message_authenticator' => false,
        
        // NAS IP সাদা তালিকা
        'whitelist_nas_ips' => env('RADIUS_WHITELIST_IPS', ''),
        
        // রেট লিমিটিং (প্রতি সেকেন্ডে)
        'rate_limit_enabled' => false,
        'rate_limit_requests' => 100,
    ],

    /**
     * লগিং এবং ডিবাগিং
     */
    'logging' => [
        // সবকিছু লগ করুন
        'enabled' => env('RADIUS_LOGGING', true),
        
        // বিস্তারিত লগিং
        'verbose' => env('APP_DEBUG', false),
        
        // সংবেদনশীল তথ্য লুকান
        'hide_passwords' => true,
        
        // চ্যানেল
        'channel' => env('RADIUS_LOG_CHANNEL', 'single'),
    ],

    /**
     * পারফরম্যান্স অপটিমাইজেশন
     */
    'performance' => [
        // কানেকশন পুল সাইজ
        'connection_pool_size' => 10,
        
        // ক্যাশ TTL (সেকেন্ডে)
        'cache_ttl' => 300,
        
        // ক্যাশ করা ক্রেডেনশিয়াল
        'cache_credentials' => true,
    ],

    /**
     * ব্যাকআপ এবং পুনরুদ্ধার
     */
    'backup' => [
        // অটোম্যাটিক ব্যাকআপ এনেবল
        'enabled' => true,
        
        // ব্যাকআপ ডিরেক্টরি
        'directory' => storage_path('app/backups/radius'),
        
        // সংরক্ষণ সময় (দিনে)
        'retention_days' => 30,
    ],

    /**
     * কাস্টম এট্রিবিউট ম্যাপিং
     */
    'attributes' => [
        // RADIUS Attribute Type Numbers
        'user_name' => 1,
        'user_password' => 2,
        'nas_ip_address' => 4,
        'nas_port' => 5,
        'service_type' => 6,
        'framed_protocol' => 7,
        'framed_ip_address' => 8,
        'framed_routing' => 10,
        'filter_id' => 11,
        'framed_mtu' => 12,
        'framed_compression' => 13,
        'login_ip_host' => 14,
        'login_port' => 15,
        'reply_message' => 18,
        'session_timeout' => 27,
        'acct_session_id' => 44,
        'acct_input_octets' => 42,
        'acct_output_octets' => 43,
        'acct_session_time' => 46,
        'acct_status_type' => 40,
        'nas_port_type' => 61,
    ],

    /**
     * ইন্টিগ্রেশন সেটিংস
     */
    'integrations' => [
        // MikroTik ইন্টিগ্রেশন
        'mikrotik' => [
            'enabled' => true,
            'sync_profiles' => true,
        ],
        
        // WebSocket রিয়েল-টাইম আপডেট
        'websocket' => [
            'enabled' => true,
            'broadcast_events' => true,
        ],
        
        // Billing সিস্টেম সিঙ্ক
        'billing' => [
            'enabled' => true,
            'auto_suspend_on_overuse' => true,
        ],
    ],

    /**
     * ডিফল্ট রেসপন্স অ্যাট্রিবিউট
     */
    'default_reply_attributes' => [
        'Service-Type' => 'Framed-User',
        'Framed-Protocol' => 'PPP',
        'Framed-Compression' => 'Van-Jacobson-TCP-IP',
    ],
];
