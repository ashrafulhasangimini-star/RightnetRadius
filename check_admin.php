<?php

// Run: php check_admin.php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\AuthUser;

echo "===========================================\n";
echo "  RightnetRadius - Admin User Check\n";
echo "===========================================\n\n";

try {
    $admins = AuthUser::where('role', 'admin')->get();
    
    if ($admins->count() > 0) {
        echo "✅ Found " . $admins->count() . " admin user(s):\n\n";
        
        foreach ($admins as $admin) {
            echo "Name: " . $admin->name . "\n";
            echo "Email: " . $admin->email . "\n";
            echo "Role: " . $admin->role . "\n";
            echo "Status: " . $admin->status . "\n";
            echo "Created: " . $admin->created_at . "\n";
            echo "-------------------------------------------\n";
        }
        
        echo "\n💡 Use these credentials to login:\n";
        echo "Email: " . $admins->first()->email . "\n";
        echo "Password: admin123 (default from seeder)\n\n";
        
    } else {
        echo "❌ No admin users found in database!\n\n";
        echo "Creating default admin user...\n";
        
        $newAdmin = AuthUser::create([
            'name' => 'System Administrator',
            'email' => 'admin@rightnet.local',
            'password' => bcrypt('admin123'),
            'role' => 'admin',
            'status' => 'active'
        ]);
        
        echo "✅ Admin user created successfully!\n\n";
        echo "Login Credentials:\n";
        echo "Email: admin@rightnet.local\n";
        echo "Password: admin123\n\n";
    }
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n\n";
    echo "Please run: php artisan migrate:fresh --seed\n";
}

echo "===========================================\n";
