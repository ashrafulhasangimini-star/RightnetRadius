<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AuthUser;
use App\Models\Package;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        AuthUser::create([
            'name' => 'System Admin',
            'email' => 'admin@rightnet.local',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        // Create packages
        $packages = [
            [
                'name' => 'Basic (2 Mbps)',
                'description' => 'Entry-level package',
                'speed_download' => 2,
                'speed_upload' => 1,
                'fup_limit' => 20,
                'fup_reset_day' => 1,
                'validity_days' => 30,
                'price' => 300,
                'sort_order' => 1,
                'status' => 'active',
            ],
            [
                'name' => 'Standard (5 Mbps)',
                'description' => 'Popular package',
                'speed_download' => 5,
                'speed_upload' => 2,
                'fup_limit' => 50,
                'fup_reset_day' => 1,
                'validity_days' => 30,
                'price' => 600,
                'sort_order' => 2,
                'status' => 'active',
            ],
            [
                'name' => 'Premium (10 Mbps)',
                'description' => 'High-speed package',
                'speed_download' => 10,
                'speed_upload' => 5,
                'fup_limit' => 100,
                'fup_reset_day' => 1,
                'validity_days' => 30,
                'price' => 1000,
                'sort_order' => 3,
                'status' => 'active',
            ],
            [
                'name' => 'Business (20 Mbps)',
                'description' => 'Business-grade package',
                'speed_download' => 20,
                'speed_upload' => 10,
                'fup_limit' => 200,
                'fup_reset_day' => 1,
                'validity_days' => 30,
                'price' => 2000,
                'sort_order' => 4,
                'status' => 'active',
            ],
        ];

        foreach ($packages as $package) {
            Package::create($package);
        }

        // Create sample users
        $users = [
            [
                'username' => 'user1',
                'email' => 'user1@example.com',
                'phone' => '01700000001',
                'package_id' => 1,
                'status' => 'active',
                'expires_at' => now()->addDays(30),
                'balance' => 0,
            ],
            [
                'username' => 'user2',
                'email' => 'user2@example.com',
                'phone' => '01700000002',
                'package_id' => 2,
                'status' => 'active',
                'expires_at' => now()->addDays(15),
                'balance' => 300,
            ],
            [
                'username' => 'user3',
                'email' => 'user3@example.com',
                'phone' => '01700000003',
                'package_id' => 3,
                'status' => 'active',
                'expires_at' => now()->addDays(60),
                'balance' => 1000,
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}
