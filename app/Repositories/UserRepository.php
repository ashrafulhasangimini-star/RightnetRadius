<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Pagination\Paginator;

class UserRepository
{
    /**
     * Get paginated users with filters
     */
    public function getPaginated(array $filters = [], int $perPage = 15)
    {
        $query = User::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('username', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%");
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['package_id'])) {
            $query->where('package_id', $filters['package_id']);
        }

        if (!empty($filters['reseller_id'])) {
            $query->where('reseller_id', $filters['reseller_id']);
        }

        if (!empty($filters['is_online'])) {
            if ($filters['is_online'] === true) {
                $query->whereHas('sessions', function ($q) {
                    $q->where('status', 'online')
                        ->where('expires_at', '>', now());
                });
            }
        }

        return $query->with('package')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get online users
     */
    public function getOnlineUsers(int $perPage = 50)
    {
        return User::whereHas('sessions', function ($q) {
            $q->where('status', 'online')
                ->where('expires_at', '>', now());
        })
        ->with(['package', 'sessions' => function ($q) {
            $q->where('status', 'online')
                ->where('expires_at', '>', now());
        }])
        ->paginate($perPage);
    }

    /**
     * Get expiring users (within N days)
     */
    public function getExpiringUsers(int $days = 7, int $perPage = 50)
    {
        return User::where('status', 'active')
            ->whereBetween('expires_at', [now(), now()->addDays($days)])
            ->with('package')
            ->orderBy('expires_at')
            ->paginate($perPage);
    }

    /**
     * Get users with low balance
     */
    public function getLowBalanceUsers(float $threshold = 500, int $perPage = 50)
    {
        return User::where('status', 'active')
            ->where('balance', '<', $threshold)
            ->with('package')
            ->orderBy('balance')
            ->paginate($perPage);
    }

    /**
     * Get users by reseller
     */
    public function getByReseller(int $resellerId, int $perPage = 15)
    {
        return User::where('reseller_id', $resellerId)
            ->with('package')
            ->paginate($perPage);
    }

    /**
     * Get users by status
     */
    public function getByStatus(string $status, int $perPage = 15)
    {
        return User::where('status', $status)
            ->with('package')
            ->paginate($perPage);
    }

    /**
     * Get user statistics
     */
    public function getStatistics()
    {
        return [
            'total' => User::count(),
            'active' => User::where('status', 'active')->count(),
            'suspended' => User::where('status', 'suspended')->count(),
            'expired' => User::where('status', 'expired')->count(),
            'disabled' => User::where('status', 'disabled')->count(),
            'online' => User::whereHas('sessions', function ($q) {
                $q->where('status', 'online')->where('expires_at', '>', now());
            })->count(),
        ];
    }

    /**
     * Find by username
     */
    public function findByUsername(string $username): ?User
    {
        return User::where('username', $username)->first();
    }

    /**
     * Find by email
     */
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    /**
     * Check if username exists
     */
    public function usernameExists(string $username, ?int $excludeId = null): bool
    {
        $query = User::where('username', $username);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    /**
     * Get monthly revenue
     */
    public function getMonthlyRevenue()
    {
        return User::selectRaw('SUM(package_price) as revenue, COUNT(*) as user_count')
            ->join('packages', 'users.package_id', '=', 'packages.id')
            ->where('users.status', 'active')
            ->where('users.expires_at', '>', now())
            ->first();
    }
}
