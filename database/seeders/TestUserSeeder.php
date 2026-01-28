<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class TestUserSeeder extends Seeder
{
    public function run(): void
    {
        // Create test admin user
        DB::table('users')->updateOrInsert(
            ['username' => 'admin'],
            [
                'username' => 'admin',
                'email' => 'admin@rightnetradius.local',
                'password' => Hash::make('admin123'),
                'name' => 'System Administrator',
                'phone' => '01712345678',
                'status' => 'active',
                'balance' => 5000,
                'package_id' => null,
                'created_at' => now(),
                'updated_at' => now()
            ]
        );

        // Create test regular users
        $users = [
            [
                'username' => 'user1',
                'email' => 'user1@example.com',
                'password' => Hash::make('password'),
                'name' => 'Test User 1',
                'phone' => '01712345679',
                'status' => 'active',
                'balance' => 1000,
            ],
            [
                'username' => 'user2',
                'email' => 'user2@example.com',
                'password' => Hash::make('password'),
                'name' => 'Test User 2',
                'phone' => '01712345680',
                'status' => 'active',
                'balance' => 500,
            ],
        ];

        foreach ($users as $user) {
            DB::table('users')->updateOrInsert(
                ['username' => $user['username']],
                array_merge($user, [
                    'created_at' => now(),
                    'updated_at' => now()
                ])
            );
        }

        $this->command->info('Test users created successfully!');
        $this->command->info('Admin: username=admin, password=admin123');
        $this->command->info('User: username=user1, password=password');
    }
}
