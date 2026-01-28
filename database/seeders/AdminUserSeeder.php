<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        // Create Admin User
        User::create([
            'name' => 'System Administrator',
            'username' => 'admin',
            'email' => 'admin@rightnetradius.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'status' => 'active'
        ]);

        // Create Test Customer User
        User::create([
            'name' => 'Test Customer',
            'username' => 'customer',
            'email' => 'customer@example.com',
            'password' => Hash::make('customer123'),
            'role' => 'customer',
            'status' => 'active'
        ]);

        echo "✅ Admin and Customer users created successfully!\n";
        echo "Admin - Username: admin, Password: admin123\n";
        echo "Customer - Username: customer, Password: customer123\n";
    }
}
