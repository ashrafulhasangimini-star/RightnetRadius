<?php

namespace App\Services;

use App\Models\User;
use App\Models\MacIpBinding;
use Illuminate\Support\Facades\DB;
use Exception;

class UserProvisioningService
{
    protected RadiusService $radiusService;
    protected MikroTikService $mikrotikService;

    public function __construct()
    {
        $this->radiusService = new RadiusService();
    }

    /**
     * Create new user with RADIUS sync
     */
    public function createUser(array $data): User
    {
        DB::beginTransaction();

        try {
            $user = User::create($data);

            // Sync with RADIUS
            $this->radiusService->syncUser($user);

            // If we have MikroTik service available, sync there too
            if (isset($data['service_type'])) {
                $this->syncToMikroTik($user, $data['service_type']);
            }

            DB::commit();

            return $user;
        } catch (Exception $e) {
            DB::rollBack();
            \Log::error('User creation failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update user
     */
    public function updateUser(User $user, array $data): User
    {
        DB::beginTransaction();

        try {
            $oldStatus = $user->status;
            $oldPackage = $user->package_id;

            $user->update($data);

            // If status changed, sync appropriately
            if ($oldStatus !== $user->status) {
                $this->handleStatusChange($user, $oldStatus);
            }

            // If package changed, update RADIUS attributes
            if ($oldPackage !== $user->package_id && $user->package) {
                $this->radiusService->syncUser($user);
            }

            DB::commit();

            return $user;
        } catch (Exception $e) {
            DB::rollBack();
            \Log::error('User update failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Handle status changes
     */
    protected function handleStatusChange(User $user, string $oldStatus): void
    {
        switch ($user->status) {
            case 'active':
                $this->radiusService->syncUser($user);
                break;

            case 'suspended':
            case 'disabled':
                $this->radiusService->disableUser($user->username);
                $this->disconnectUserSessions($user);
                break;

            case 'expired':
                $this->radiusService->disableUser($user->username);
                break;
        }
    }

    /**
     * Disconnect user sessions
     */
    protected function disconnectUserSessions(User $user): void
    {
        try {
            $mikrotikService = new MikroTikService();
            $mikrotikService->disconnectUser($user->username);
        } catch (Exception $e) {
            \Log::warning('MikroTik disconnect failed: ' . $e->getMessage());
        }
    }

    /**
     * Sync user to MikroTik
     */
    protected function syncToMikroTik(User $user, string $serviceType): void
    {
        if ($user->status !== 'active') {
            return;
        }

        try {
            $mikrotikService = new MikroTikService();

            if ($serviceType === 'pppoe') {
                $mikrotikService->addPppoeUser($user->username, $user->username);
            } elseif ($serviceType === 'hotspot') {
                $mikrotikService->addHotspotUser($user->username, $user->username);
            }
        } catch (Exception $e) {
            \Log::warning('MikroTik sync failed: ' . $e->getMessage());
        }
    }

    /**
     * Delete user
     */
    public function deleteUser(User $user): bool
    {
        DB::beginTransaction();

        try {
            // Remove from RADIUS
            $this->radiusService->removeUser($user->username);

            // Disconnect from MikroTik
            $this->disconnectUserSessions($user);

            // Delete from database
            $user->delete();

            DB::commit();

            return true;
        } catch (Exception $e) {
            DB::rollBack();
            \Log::error('User deletion failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Add MAC/IP binding
     */
    public function addMacIpBinding(User $user, string $macAddress, string $ipAddress): MacIpBinding
    {
        return MacIpBinding::create([
            'user_id' => $user->id,
            'mac_address' => $macAddress,
            'ip_address' => $ipAddress,
            'status' => 'active',
        ]);
    }

    /**
     * Remove MAC/IP binding
     */
    public function removeMacIpBinding(MacIpBinding $binding): bool
    {
        return $binding->delete();
    }

    /**
     * Bulk create users
     */
    public function bulkCreateUsers(array $users): array
    {
        DB::beginTransaction();

        try {
            $created = [];

            foreach ($users as $userData) {
                $created[] = $this->createUser($userData);
            }

            DB::commit();

            return $created;
        } catch (Exception $e) {
            DB::rollBack();
            \Log::error('Bulk user creation failed: ' . $e->getMessage());
            throw $e;
        }
    }
}
