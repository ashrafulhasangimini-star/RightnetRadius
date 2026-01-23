<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FreeRadiusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // NAS ক্লায়েন্ট সিড করুন (RouterOS, WiFi AP, etc.)
        DB::table('nas_clients')->insertOrIgnore([
            [
                'nas_name' => 'mikrotik-main',
                'nas_ip' => '192.168.1.1',
                'shared_secret' => 'mikrotik_shared_secret_123456',
                'nas_type' => 'mikrotik',
                'description' => 'Main RouterOS Gateway',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nas_name' => 'ubiquiti-ap-1',
                'nas_ip' => '192.168.1.50',
                'shared_secret' => 'ubiquiti_shared_secret_654321',
                'nas_type' => 'ubiquiti',
                'description' => 'UniFi Access Point 1',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nas_name' => 'ubiquiti-ap-2',
                'nas_ip' => '192.168.1.51',
                'shared_secret' => 'ubiquiti_shared_secret_654321',
                'nas_type' => 'ubiquiti',
                'description' => 'UniFi Access Point 2',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nas_name' => 'cisco-switch',
                'nas_ip' => '192.168.1.100',
                'shared_secret' => 'cisco_shared_secret_789012',
                'nas_type' => 'cisco',
                'description' => 'Cisco Network Switch',
                'status' => 'inactive',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        echo "✅ NAS Clients সিড করা হয়েছে\n";

        // RADIUS ইউজার সিড করুন
        DB::table('radius_users')->insertOrIgnore([
            [
                'username' => 'user1',
                'password' => 'password123',
                'email' => 'user1@example.com',
                'status' => 'active',
                'expires_at' => now()->addYears(1),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'user2',
                'password' => 'password456',
                'email' => 'user2@example.com',
                'status' => 'active',
                'expires_at' => now()->addYears(1),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'user3',
                'password' => 'password789',
                'email' => 'user3@example.com',
                'status' => 'active',
                'expires_at' => now()->addYears(1),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'premium_user',
                'password' => 'premium_pass_123',
                'email' => 'premium@example.com',
                'status' => 'active',
                'expires_at' => now()->addYears(1),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'enterprise_user',
                'password' => 'enterprise_pass_123',
                'email' => 'enterprise@example.com',
                'status' => 'active',
                'expires_at' => now()->addYears(1),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        echo "✅ RADIUS ইউজার সিড করা হয়েছে\n";

        // RADIUS গ্রুপ সিড করুন
        DB::table('radius_groups')->insertOrIgnore([
            [
                'group_name' => 'basic',
                'description' => 'বেসিক ইউজার গ্রুপ - 2Mbps পর্যন্ত',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'group_name' => 'standard',
                'description' => 'স্ট্যান্ডার্ড ইউজার গ্রুপ - 10Mbps পর্যন্ত',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'group_name' => 'premium',
                'description' => 'প্রিমিয়াম ইউজার গ্রুপ - সীমাহীন',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'group_name' => 'enterprise',
                'description' => 'এন্টারপ্রাইজ ইউজার গ্রুপ - ডেডিকেটেড ব্যান্ডউইথ',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        echo "✅ RADIUS গ্রুপ সিড করা হয়েছে\n";

        // সাম্পল অ্যাকাউন্টিং লগ সিড করুন (ইউজার নিশ্চিত করুন)
        // নোট: ইউজার প্রথমে তৈরি হতে হবে (above)
        $users = DB::table('users')->get();
        
        if ($users->count() >= 2) {
            DB::table('radius_accounting')->insertOrIgnore([
                [
                    'acct_session_id' => 'session_001_' . time(),
                    'user_id' => $users[0]->id ?? null,
                    'username' => 'user1',
                    'nas_ip' => '192.168.1.1',
                    'nas_port' => 1024,
                    'framed_ip' => '10.0.0.1',
                    'mac_address' => '00:11:22:33:44:55',
                    'acct_status_type' => 'Start',
                    'acct_input_octets' => 0,
                    'acct_output_octets' => 0,
                    'acct_session_time' => 0,
                    'acct_start_time' => now()->subHours(2),
                    'created_at' => now()->subHours(2),
                    'updated_at' => now(),
                ],
            ]);
        }

        echo "✅ অ্যাকাউন্টিং লগ সিড করা হয়েছে\n";

        // RADIUS কনফিগারেশন হিস্টোরি সিড করুন
        DB::table('radius_config_history')->insertOrIgnore([
            [
                'config_key' => 'freeradius_host',
                'old_value' => '127.0.0.1',
                'new_value' => 'localhost',
                'changed_by' => 'admin',
                'reason' => 'প্রাথমিক সেটআপ',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'config_key' => 'freeradius_port',
                'old_value' => '1813',
                'new_value' => '1812',
                'changed_by' => 'admin',
                'reason' => 'পোর্ট আপডেট',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        echo "✅ কনফিগারেশন হিস্টোরি সিড করা হয়েছে\n";

        // RADIUS হেলথ চেক সিড করুন
        DB::table('radius_health_checks')->insertOrIgnore([
            [
                'server_host' => 'localhost',
                'server_port' => 1812,
                'status' => 'ok',
                'response_time' => 5.2,
                'last_error' => null,
                'consecutive_failures' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        echo "✅ হেলথ চেক রেকর্ড সিড করা হয়েছে\n";

        echo "\n✨ সমস্ত FreeRADIUS ডেটা সফলভাবে সিড করা হয়েছে!\n";
    }
}
