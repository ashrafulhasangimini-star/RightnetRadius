<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CoaController;
use App\Http\Controllers\Api\FupController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReportsController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\NasClientController;
use App\Http\Controllers\Api\TransactionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/', function () {
    return response()->json([
        'message' => 'Welcome to RightnetRadius API',
        'version' => '2.0',
        'status' => 'operational'
    ]);
});

Route::get('health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'database' => 'connected'
    ]);
});

// Public routes (no authentication required)
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
});

// Test data routes
Route::get('test/users', function () {
    return response()->json([
        'success' => true,
        'data' => [
            ['id' => 1, 'name' => 'Rajib Khan', 'username' => 'rajib', 'email' => 'rajib@example.com', 'status' => 'active'],
            ['id' => 2, 'name' => 'Karim Ahmed', 'username' => 'karim', 'email' => 'karim@example.com', 'status' => 'active'],
            ['id' => 3, 'name' => 'Fatima Islam', 'username' => 'fatima', 'email' => 'fatima@example.com', 'status' => 'inactive'],
        ]
    ]);
});

Route::get('test/packages', function () {
    return response()->json([
        'success' => true,
        'data' => [
            ['id' => 1, 'name' => 'Basic Plan', 'speed' => '5M/5M', 'price' => 500],
            ['id' => 2, 'name' => 'Standard Plan', 'speed' => '10M/10M', 'price' => 1000],
            ['id' => 3, 'name' => 'Premium Plan', 'speed' => '20M/20M', 'price' => 1500],
            ['id' => 4, 'name' => 'Enterprise Plan', 'speed' => '50M/50M', 'price' => 3000],
        ]
    ]);
});

// Protected routes (require authentication)
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user', [AuthController::class, 'user']);
        Route::post('refresh', [AuthController::class, 'refresh']);
    });

    // Profile routes
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::put('/', [ProfileController::class, 'update']);
        Route::post('avatar', [ProfileController::class, 'uploadAvatar']);
        Route::put('password', [ProfileController::class, 'updatePassword']);
        Route::put('notifications', [ProfileController::class, 'updateNotifications']);
    });

    // COA (Change of Authorization) routes
    Route::prefix('coa')->group(function () {
        Route::post('change-speed', [CoaController::class, 'changeSpeed']);
        Route::post('disconnect', [CoaController::class, 'disconnect']);
        Route::post('update-quota', [CoaController::class, 'updateQuota']);
        Route::post('apply-fup', [CoaController::class, 'applyFup']);
    });

    // FUP (Fair Usage Policy) routes
    Route::prefix('fup')->group(function () {
        Route::get('usage/{userId}', [FupController::class, 'getUserUsage']);
        Route::post('check/{userId}', [FupController::class, 'checkFup']);
        Route::post('check-all', [FupController::class, 'checkAllUsers']);
        Route::post('reset-monthly', [FupController::class, 'resetMonthly']);
        Route::get('dashboard', [FupController::class, 'dashboard']);
    });

    // Payment routes
    Route::prefix('payments')->group(function () {
        Route::post('create', [PaymentController::class, 'createPayment']);
        Route::get('status/{transactionId}', [PaymentController::class, 'getPaymentStatus']);
        Route::get('history/{userId}', [PaymentController::class, 'getPaymentHistory']);
    });

    // Notification routes
    Route::prefix('notifications')->group(function () {
        Route::get('{userId}', function($userId) {
            $notifications = \DB::table('notifications')
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $notifications
            ]);
        });

        Route::post('{notificationId}/read', function($notificationId) {
            \DB::table('notifications')
                ->where('id', $notificationId)
                ->update(['read' => true, 'read_at' => now()]);

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read'
            ]);
        });

        Route::post('{userId}/read-all', function($userId) {
            $count = \DB::table('notifications')
                ->where('user_id', $userId)
                ->where('read', false)
                ->update(['read' => true, 'read_at' => now()]);

            return response()->json([
                'success' => true,
                'message' => 'All notifications marked as read',
                'count' => $count
            ]);
        });
    });

    // User Management routes
    Route::prefix('users')->group(function () {
        Route::get('list', [UserController::class, 'index']);
        Route::get('{id}', [UserController::class, 'show']);
        Route::post('create', [UserController::class, 'store']);
        Route::put('{id}', [UserController::class, 'update']);
        Route::delete('{id}', [UserController::class, 'destroy']);
        Route::post('{id}/status', [UserController::class, 'changeStatus']);
        Route::put('{id}/password', [UserController::class, 'updatePassword']);
        Route::get('{id}/stats', [UserController::class, 'getUserStats']);
        Route::get('{id}/sessions', [UserController::class, 'getUserSessions']);
        Route::get('{id}/transactions', [UserController::class, 'getUserTransactions']);
        Route::get('all', [UserController::class, 'all']);
    });

    // Package Management routes
    Route::prefix('packages')->group(function () {
        Route::get('list', [PackageController::class, 'index']);
        Route::get('{id}', [PackageController::class, 'show']);
        Route::post('create', [PackageController::class, 'store']);
        Route::put('{id}', [PackageController::class, 'update']);
        Route::delete('{id}', [PackageController::class, 'destroy']);
        Route::post('{id}/toggle-status', [PackageController::class, 'toggleStatus']);
        Route::get('{id}/stats', [PackageController::class, 'getPackageStats']);
        Route::get('all', [PackageController::class, 'all']);
    });

    // Device Management routes
    Route::prefix('devices')->group(function () {
        Route::get('list', [DeviceController::class, 'index']);
        Route::get('{id}', [DeviceController::class, 'show']);
        Route::post('create', [DeviceController::class, 'store']);
        Route::put('{id}', [DeviceController::class, 'update']);
        Route::delete('{id}', [DeviceController::class, 'destroy']);
        Route::post('{id}/test-connection', [DeviceController::class, 'testConnection']);
        Route::get('{id}/stats', [DeviceController::class, 'getDeviceStats']);
        Route::post('{id}/sync-users', [DeviceController::class, 'syncUsers']);
        Route::post('{id}/toggle-status', [DeviceController::class, 'toggleStatus']);
        Route::get('all', [DeviceController::class, 'all']);
    });

    // NAS Client Management routes
    Route::prefix('radius')->group(function () {
        Route::get('nas-clients', [NasClientController::class, 'index']);
        Route::get('nas-clients/{id}', [NasClientController::class, 'show']);
        Route::post('nas-clients', [NasClientController::class, 'store']);
        Route::put('nas-clients/{id}', [NasClientController::class, 'update']);
        Route::delete('nas-clients/{id}', [NasClientController::class, 'destroy']);
        Route::post('nas-clients/{id}/toggle-status', [NasClientController::class, 'toggleStatus']);
        Route::get('nas-clients-active', [NasClientController::class, 'getActiveClients']);
        
        // Session Management
        Route::get('sessions/active', [NasClientController::class, 'activeSessions']);
        Route::get('sessions/history/{userId}', [NasClientController::class, 'sessionHistory']);
        Route::post('sessions/disconnect/{sessionId}', [NasClientController::class, 'disconnectSession']);
        
        // Server Status
        Route::get('status', [NasClientController::class, 'serverStatus']);
        Route::get('server-info', [NasClientController::class, 'serverInfo']);
    });

    // Transaction routes
    Route::prefix('transactions')->group(function () {
        Route::get('list', [TransactionController::class, 'index']);
        Route::get('{id}', [TransactionController::class, 'show']);
        Route::post('create', [TransactionController::class, 'store']);
        Route::put('{id}/status', [TransactionController::class, 'updateStatus']);
        Route::get('stats', [TransactionController::class, 'getStats']);
        Route::get('payment-methods', [TransactionController::class, 'getPaymentMethods']);
        Route::get('user/{userId}', [TransactionController::class, 'getUserTransactions']);
    });

    // Invoice routes
    Route::prefix('invoices')->group(function () {
        Route::get('list', function() {
            $invoices = \DB::table('invoices')
                ->orderBy('created_at', 'desc')
                ->limit(100)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $invoices
            ]);
        });

        Route::get('{id}', function($id) {
            $invoice = \DB::table('invoices')->find($id);
            return response()->json([
                'success' => true,
                'data' => $invoice
            ]);
        });
    });

    // Enhanced Dashboard routes
    Route::prefix('dashboard')->group(function () {
        // Admin dashboard
        Route::get('admin/stats', [DashboardController::class, 'adminStats']);
        Route::get('admin/online-history', [DashboardController::class, 'onlineUsersHistory']);
        Route::get('admin/revenue-history', [DashboardController::class, 'revenueHistory']);
        
        // FUP dashboard
        Route::get('fup', [DashboardController::class, 'fupDashboard']);
        
        // COA dashboard
        Route::get('coa', [DashboardController::class, 'coaDashboard']);
        
        // User specific dashboard
        Route::get('user/{userId}', [DashboardController::class, 'userDashboard']);
        Route::get('user/{userId}/bandwidth-history', [DashboardController::class, 'userBandwidthHistory']);
        Route::get('user/{userId}/usage', [DashboardController::class, 'userUsage']);
        
        // Package analytics
        Route::get('packages/analytics', [DashboardController::class, 'packageAnalytics']);
        
        // Legacy stats endpoint (for backward compatibility)
        Route::get('stats', [DashboardController::class, 'adminStats']);
    });

    // Reports routes
    Route::prefix('reports')->group(function () {
        Route::get('subscriber', [ReportsController::class, 'subscriber']);
        Route::get('accounting', [ReportsController::class, 'accounting']);
        Route::get('user', [ReportsController::class, 'user']);
        Route::get('profit', [ReportsController::class, 'profit']);
        Route::get('usage', [ReportsController::class, 'usage']);
        Route::get('revenue', [ReportsController::class, 'revenue']);
    });
});

// Payment callback routes (public - called by payment gateways)
Route::prefix('callbacks')->group(function () {
    Route::any('bkash', [PaymentController::class, 'bkashCallback'])->name('payment.bkash.callback');
    Route::any('nagad', [PaymentController::class, 'nagadCallback'])->name('payment.nagad.callback');
});

// Catch-all for undefined routes
Route::fallback(function(){
    return response()->json([
        'success' => false,
        'message' => 'Endpoint not found'
    ], 404);
});
