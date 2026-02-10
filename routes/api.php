<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CoaController;
use App\Http\Controllers\Api\FupController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReportsController;
use App\Http\Controllers\Api\DashboardController;

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

    // User routes
    Route::prefix('users')->group(function () {
        Route::get('list', function() {
            try {
                $users = \App\Models\User::with('package')
                    ->select('id', 'username', 'email', 'phone', 'status', 'package_id')
                    ->limit(100)
                    ->get();

                return response()->json([
                    'success' => true,
                    'data' => $users
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage()
                ], 500);
            }
        });

        Route::get('{id}', function($id) {
            try {
                $user = \App\Models\User::with('package')->findOrFail($id);

                return response()->json([
                    'success' => true,
                    'data' => $user
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }
        });
    });

    // Package routes
    Route::prefix('packages')->group(function () {
        Route::get('list', function() {
            try {
                $packages = \DB::table('packages')
                    ->select('id', 'name', 'speed', 'price', 'quota_gb', 'fup_speed', 'fup_enabled')
                    ->where('status', 'active')
                    ->get();

                return response()->json([
                    'success' => true,
                    'data' => $packages
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage()
                ], 500);
            }
        });
    });

    // Invoice routes
    Route::prefix('invoices')->group(function () {
        Route::get('list', function() {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        });

        Route::get('{id}', function($id) {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        });
    });

    // Transaction routes
    Route::prefix('transactions')->group(function () {
        Route::get('list', function() {
            return response()->json([
                'success' => true,
                'data' => []
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
