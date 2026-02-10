<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class EnhancedDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create enhanced packages with Zalultra features
        $this->createEnhancedPackages();
        
        // Create sample users with different packages
        $this->createSampleUsers();
        
        // Create sample sessions and usage data
        $this->createSampleSessions();
        
        // Create FUP usage data
        $this->createFupUsageData();
        
        // Create COA requests data
        $this->createCoaRequestsData();
        
        // Create invoices and transactions
        $this->createBillingData();
        
        echo "Enhanced data seeding completed!\n";
    }

    private function createEnhancedPackages()
    {
        // First, let's create basic packages that match the original structure
        $basicPackages = [
            [
                'name' => 'Basic 5Mbps',
                'description' => 'Basic internet package with FUP',
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
            ],
            [
                'name' => 'Premium 20Mbps',
                'description' => 'Premium internet package',
                'speed_download' => 20,
                'speed_upload' => 20,
                'fup_limit' => 200.00,
                'validity_days' => 30,
                'price' => 2000.00,
                'status' => 'active',
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Unlimited 50Mbps',
                'description' => 'Unlimited internet package',
                'speed_download' => 50,
                'speed_upload' => 50,
                'fup_limit' => 0.00, // Unlimited
                'validity_days' => 30,
                'price' => 3500.00,
                'status' => 'active',
                'sort_order' => 4,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Trial 2Mbps',
                'description' => 'Trial internet package',
                'speed_download' => 2,
                'speed_upload' => 2,
                'fup_limit' => 10.00,
                'validity_days' => 7,
                'price' => 0.00,
                'status' => 'active',
                'sort_order' => 5,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        foreach ($basicPackages as $package) {
            DB::table('packages')->insert($package);
        }
    }

    private function createSampleUsers()
    {
        $users = [
            [
                'username' => 'user001',
                'email' => 'ahmed@example.com',
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
                'email' => 'fatima@example.com',
                'phone' => '01722222222',
                'package_id' => 2,
                'status' => 'active',
                'expires_at' => now()->addDays(20),
                'balance' => 0.00,
                'created_at' => now()->subDays(10),
                'updated_at' => now()
            ],
            [
                'username' => 'user003',
                'email' => 'ali@example.com',
                'phone' => '01733333333',
                'package_id' => 3,
                'status' => 'active',
                'expires_at' => now()->addDays(28),
                'balance' => 0.00,
                'created_at' => now()->subDays(2),
                'updated_at' => now()
            ],
            [
                'username' => 'user004',
                'email' => 'rashida@example.com',
                'phone' => '01744444444',
                'package_id' => 4,
                'status' => 'active',
                'expires_at' => now()->addDays(30),
                'balance' => 0.00,
                'created_at' => now()->subDays(1),
                'updated_at' => now()
            ],
            [
                'username' => 'user005',
                'email' => 'karim@example.com',
                'phone' => '01755555555',
                'package_id' => 1,
                'status' => 'expired',
                'expires_at' => now()->subDays(2),
                'balance' => 0.00,
                'created_at' => now()->subDays(35),
                'updated_at' => now()
            ],
            [
                'username' => 'trial001',
                'email' => 'trial@example.com',
                'phone' => '01766666666',
                'package_id' => 5,
                'status' => 'active',
                'expires_at' => now()->addDays(5),
                'balance' => 0.00,
                'created_at' => now()->subDays(2),
                'updated_at' => now()
            ]
        ];

        foreach ($users as $user) {
            DB::table('users')->insert($user);
        }
    }

    private function createSampleSessions()
    {
        $sessions = [];
        $userIds = [1, 2, 3, 4, 6]; // Active users

        foreach ($userIds as $userId) {
            // Create multiple sessions for each user
            for ($i = 0; $i < rand(5, 15); $i++) {
                $startTime = now()->subDays(rand(0, 30))->subHours(rand(0, 23));
                $duration = rand(300, 7200); // 5 minutes to 2 hours
                $endTime = $startTime->copy()->addSeconds($duration);
                
                $inputOctets = rand(100000000, 2000000000); // 100MB to 2GB
                $outputOctets = rand(50000000, 500000000);  // 50MB to 500MB

                $sessions[] = [
                    'user_id' => $userId,
                    'username' => 'user' . str_pad($userId, 3, '0', STR_PAD_LEFT),
                    'nas_ip_address' => '192.168.1.' . rand(1, 10),
                    'nas_port' => rand(1000, 9999),
                    'session_id' => 'sess_' . uniqid(),
                    'start_time' => $startTime,
                    'stop_time' => $endTime,
                    'session_time' => $duration,
                    'input_octets' => $inputOctets,
                    'output_octets' => $outputOctets,
                    'status' => $i == 0 && $userId != 5 ? 'online' : 'stopped',
                    'created_at' => $startTime,
                    'updated_at' => $endTime,
                    'expires_at' => $startTime->copy()->addHours(24)
                ];
            }
        }

        foreach ($sessions as $session) {
            DB::table('sessions')->insert($session);
        }
    }

    private function createFupUsageData()
    {
        $currentMonth = now()->format('Y-m-01');
        $lastMonth = now()->subMonth()->format('Y-m-01');
        
        $fupData = [
            // Current month data
            [
                'user_id' => 1,
                'usage_date' => $currentMonth,
                'total_bytes' => 45 * 1024 * 1024 * 1024, // 45GB (90% of 50GB quota)
                'quota_bytes' => 50 * 1024 * 1024 * 1024,
                'fup_applied' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'user_id' => 2,
                'usage_date' => $currentMonth,
                'total_bytes' => 120 * 1024 * 1024 * 1024, // 120GB (exceeded 100GB quota)
                'quota_bytes' => 100 * 1024 * 1024 * 1024,
                'fup_applied' => true,
                'fup_applied_at' => now()->subDays(3),
                'original_speed' => '10M/10M',
                'fup_speed' => '2M/2M',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'user_id' => 3,
                'usage_date' => $currentMonth,
                'total_bytes' => 150 * 1024 * 1024 * 1024, // 150GB (75% of 200GB quota)
                'quota_bytes' => 200 * 1024 * 1024 * 1024,
                'fup_applied' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'user_id' => 6,
                'usage_date' => $currentMonth,
                'total_bytes' => 12 * 1024 * 1024 * 1024, // 12GB (exceeded 10GB trial quota)
                'quota_bytes' => 10 * 1024 * 1024 * 1024,
                'fup_applied' => true,
                'fup_applied_at' => now()->subDays(1),
                'original_speed' => '2M/2M',
                'fup_speed' => '512K/512K',
                'created_at' => now(),
                'updated_at' => now()
            ],
            
            // Last month data
            [
                'user_id' => 1,
                'usage_date' => $lastMonth,
                'total_bytes' => 55 * 1024 * 1024 * 1024, // 55GB (exceeded quota)
                'quota_bytes' => 50 * 1024 * 1024 * 1024,
                'fup_applied' => true,
                'fup_applied_at' => now()->subMonth()->addDays(20),
                'original_speed' => '5M/5M',
                'fup_speed' => '1M/1M',
                'created_at' => now()->subMonth(),
                'updated_at' => now()->subMonth()->addDays(20)
            ],
            [
                'user_id' => 2,
                'usage_date' => $lastMonth,
                'total_bytes' => 85 * 1024 * 1024 * 1024, // 85GB (within quota)
                'quota_bytes' => 100 * 1024 * 1024 * 1024,
                'fup_applied' => false,
                'created_at' => now()->subMonth(),
                'updated_at' => now()->subMonth()->endOfMonth()
            ]
        ];

        foreach ($fupData as $data) {
            DB::table('fup_usage')->insert($data);
        }
    }

    private function createCoaRequestsData()
    {
        $coaRequests = [
            [
                'user_id' => 2,
                'username' => 'user002',
                'nas_ip' => '192.168.1.1',
                'command_type' => 'speed_change',
                'attributes' => json_encode([
                    'User-Name' => 'user002',
                    'Mikrotik-Rate-Limit' => '2M/2M',
                    'WISPr-Bandwidth-Max-Down' => 2000000,
                    'WISPr-Bandwidth-Max-Up' => 2000000
                ]),
                'status' => 'success',
                'response' => 'COA-ACK received',
                'sent_at' => now()->subDays(3),
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(3)
            ],
            [
                'user_id' => 6,
                'username' => 'trial001',
                'nas_ip' => '192.168.1.1',
                'command_type' => 'speed_change',
                'attributes' => json_encode([
                    'User-Name' => 'trial001',
                    'Mikrotik-Rate-Limit' => '512K/512K',
                    'WISPr-Bandwidth-Max-Down' => 512000,
                    'WISPr-Bandwidth-Max-Up' => 512000
                ]),
                'status' => 'success',
                'response' => 'COA-ACK received',
                'sent_at' => now()->subDays(1),
                'created_at' => now()->subDays(1),
                'updated_at' => now()->subDays(1)
            ],
            [
                'user_id' => 5,
                'username' => 'user005',
                'nas_ip' => '192.168.1.1',
                'command_type' => 'disconnect',
                'attributes' => json_encode([
                    'User-Name' => 'user005'
                ]),
                'status' => 'success',
                'response' => 'Disconnect-ACK received',
                'sent_at' => now()->subDays(2),
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2)
            ],
            [
                'user_id' => 1,
                'username' => 'user001',
                'nas_ip' => '192.168.1.2',
                'command_type' => 'speed_change',
                'attributes' => json_encode([
                    'User-Name' => 'user001',
                    'Mikrotik-Rate-Limit' => '5M/5M'
                ]),
                'status' => 'failed',
                'response' => 'COA-NAK received - timeout',
                'sent_at' => now()->subHours(6),
                'created_at' => now()->subHours(6),
                'updated_at' => now()->subHours(6)
            ]
        ];

        foreach ($coaRequests as $request) {
            DB::table('coa_requests')->insert($request);
        }
    }

    private function createBillingData()
    {
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
                'status' => 'paid',
                'paid_at' => now()->subDays(20),
                'created_at' => now()->subDays(25),
                'updated_at' => now()->subDays(20)
            ],
            [
                'user_id' => 3,
                'amount' => 2000.00,
                'due_date' => now()->addDays(28),
                'status' => 'paid',
                'paid_at' => now()->subDays(2),
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(2)
            ],
            [
                'user_id' => 4,
                'amount' => 3500.00,
                'due_date' => now()->addDays(30),
                'status' => 'paid',
                'paid_at' => now()->subDays(1),
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(1)
            ],
            [
                'user_id' => 1,
                'amount' => 800.00,
                'due_date' => now()->addDays(25),
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'user_id' => 5,
                'amount' => 800.00,
                'due_date' => now()->subDays(5),
                'status' => 'pending',
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10)
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
            ],
            [
                'user_id' => 2,
                'type' => 'credit',
                'amount' => 1200.00,
                'description' => 'Payment for Standard 10Mbps package',
                'created_at' => now()->subDays(20),
                'updated_at' => now()->subDays(20)
            ],
            [
                'user_id' => 3,
                'type' => 'credit',
                'amount' => 2000.00,
                'description' => 'Payment for Premium 20Mbps package',
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2)
            ],
            [
                'user_id' => 4,
                'type' => 'credit',
                'amount' => 3500.00,
                'description' => 'Payment for Unlimited 50Mbps package',
                'created_at' => now()->subDays(1),
                'updated_at' => now()->subDays(1)
            ],
            [
                'user_id' => 2,
                'type' => 'debit',
                'amount' => 50.00,
                'description' => 'Late payment fee',
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(15)
            ]
        ];

        foreach ($transactions as $transaction) {
            DB::table('transactions')->insert($transaction);
        }
    }
}