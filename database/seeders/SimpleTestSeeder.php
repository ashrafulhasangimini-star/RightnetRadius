<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SimpleTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create basic packages
        $packages = [
            [
                'name' => 'Basic 5Mbps',
                'description' => 'Basic internet package',
                'speed_download' => 5,
                'speed_upload' => 5,
                'fup_limit' => 50.00,
                'validity_days' => 30,
                'price' => 800.00,
                'status' => 'active',
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Standard 10Mbps',
                'description' => 'Standard internet package',
                'speed_download' => 10,
                'speed_upload' => 10,
                'fup_limit' => 100.00,
                'validity_days' => 30,
                'price' => 1200.00,
                'status' => 'active',
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        foreach ($packages as $package) {
            DB::table('packages')->insert($package);
        }

        // Create basic users
        $users = [
            [
                'username' => 'user001',
                'email' => 'user001@example.com',
                'phone' => '01711111111',
                'package_id' => 1,
                'status' => 'active',
                'expires_at' => now()->addDays(25),
                'balance' => 0.00,
                'created_at' => now()->subDays(5),
                'updated_at' => now()
            ],
            [
                'username' => 'user002',
                'email' => 'user002@example.com',
                'phone' => '01722222222',
                'package_id' => 2,
                'status' => 'active',
                'expires_at' => now()->addDays(20),
                'balance' => 0.00,
                'created_at' => now()->subDays(10),
                'updated_at' => now()
            ]
        ];

        foreach ($users as $user) {
            DB::table('users')->insert($user);
        }

        // Create basic sessions
        $sessions = [
            [
                'user_id' => 1,
                'unique_id' => 'sess_001_' . uniqid(),
                'nas_ip_address' => '192.168.1.1',
                'nas_port' => 1001,
                'framed_ip_address' => '10.0.0.100',
                'acct_session_id' => 'acct_' . uniqid(),
                'status' => 'online',
                'started_at' => now()->subHours(2),
                'expires_at' => now()->addHours(22),
                'input_octets' => 1024 * 1024 * 500, // 500MB
                'output_octets' => 1024 * 1024 * 100, // 100MB
                'created_at' => now()->subHours(2),
                'updated_at' => now()
            ],
            [
                'user_id' => 2,
                'unique_id' => 'sess_002_' . uniqid(),
                'nas_ip_address' => '192.168.1.1',
                'nas_port' => 1002,
                'framed_ip_address' => '10.0.0.101',
                'acct_session_id' => 'acct_' . uniqid(),
                'status' => 'online',
                'started_at' => now()->subHours(1),
                'expires_at' => now()->addHours(23),
                'input_octets' => 1024 * 1024 * 800, // 800MB
                'output_octets' => 1024 * 1024 * 200, // 200MB
                'created_at' => now()->subHours(1),
                'updated_at' => now()
            ]
        ];

        foreach ($sessions as $session) {
            DB::table('sessions')->insert($session);
        }

        // Create FUP usage data
        $currentMonth = now()->format('Y-m-01');
        $fupData = [
            [
                'user_id' => 1,
                'usage_date' => $currentMonth,
                'total_bytes' => 45 * 1024 * 1024 * 1024, // 45GB
                'quota_bytes' => 50 * 1024 * 1024 * 1024, // 50GB
                'fup_applied' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'user_id' => 2,
                'usage_date' => $currentMonth,
                'total_bytes' => 120 * 1024 * 1024 * 1024, // 120GB (exceeded)
                'quota_bytes' => 100 * 1024 * 1024 * 1024, // 100GB
                'fup_applied' => true,
                'fup_applied_at' => now()->subDays(3),
                'original_speed' => '10M/10M',
                'fup_speed' => '2M/2M',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        foreach ($fupData as $data) {
            DB::table('fup_usage')->insert($data);
        }

        // Create COA requests
        $coaRequests = [
            [
                'user_id' => 2,
                'username' => 'user002',
                'nas_ip' => '192.168.1.1',
                'command_type' => 'speed_change',
                'attributes' => json_encode([
                    'User-Name' => 'user002',
                    'Mikrotik-Rate-Limit' => '2M/2M'
                ]),
                'status' => 'success',
                'response' => 'COA-ACK received',
                'sent_at' => now()->subDays(3),
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(3)
            ]
        ];

        foreach ($coaRequests as $request) {
            DB::table('coa_requests')->insert($request);
        }

        // Create invoices
        $invoices = [
            [
                'user_id' => 1,
                'amount' => 800.00,
                'due_date' => now()->addDays(5),
                'status' => 'paid',
                'paid_at' => now()->subDays(25),
                'created_at' => now()->subDays(30),
                'updated_at' => now()->subDays(25)
            ],
            [
                'user_id' => 2,
                'amount' => 1200.00,
                'due_date' => now()->addDays(10),
                'status' => 'pending',
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5)
            ]
        ];

        foreach ($invoices as $invoice) {
            DB::table('invoices')->insert($invoice);
        }

        // Create transactions
        $transactions = [
            [
                'user_id' => 1,
                'type' => 'credit',
                'amount' => 800.00,
                'description' => 'Payment for Basic 5Mbps package',
                'created_at' => now()->subDays(25),
                'updated_at' => now()->subDays(25)
            ]
        ];

        foreach ($transactions as $transaction) {
            DB::table('transactions')->insert($transaction);
        }

        echo "Simple test data seeding completed!\n";
    }
}