<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use App\Models\Package;
use App\Services\UserProvisioningService;
use App\Services\BillingService;
use App\Repositories\UserRepository;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    protected UserRepository $userRepository;
    protected UserProvisioningService $provisioningService;
    protected BillingService $billingService;

    public function __construct(
        UserRepository $userRepository,
        UserProvisioningService $provisioningService,
        BillingService $billingService
    ) {
        $this->userRepository = $userRepository;
        $this->provisioningService = $provisioningService;
        $this->billingService = $billingService;
    }

    public function index(Request $request): View
    {
        $filters = $request->only(['search', 'status', 'package_id', 'is_online']);
        $users = $this->userRepository->getPaginated($filters);
        $packages = Package::where('status', 'active')->get();

        return view('admin.users.index', [
            'users' => $users,
            'packages' => $packages,
            'filters' => $filters,
        ]);
    }

    public function create(): View
    {
        $packages = Package::where('status', 'active')->get();

        return view('admin.users.create', [
            'packages' => $packages,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'username' => 'required|string|unique:users',
            'email' => 'nullable|email|unique:users',
            'phone' => 'nullable|string',
            'package_id' => 'required|exists:packages,id',
            'expires_at' => 'required|date|after:now',
            'mac_address' => 'nullable|string',
            'ip_address' => 'nullable|ip',
            'notes' => 'nullable|string',
        ]);

        try {
            $validated['status'] = 'active';
            $validated['balance'] = 0;

            $user = $this->provisioningService->createUser($validated);

            \Log::info('User created', ['user_id' => $user->id, 'by' => auth()->id()]);

            return redirect()->route('admin.users.show', $user)
                ->with('success', 'User created successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to create user: ' . $e->getMessage());
        }
    }

    public function show(User $user): View
    {
        $user->load('package', 'sessions', 'invoices', 'transactions');

        $onlineSession = $user->getOnlineSession();

        return view('admin.users.show', [
            'user' => $user,
            'onlineSession' => $onlineSession,
        ]);
    }

    public function edit(User $user): View
    {
        $packages = Package::where('status', 'active')->get();

        return view('admin.users.edit', [
            'user' => $user,
            'packages' => $packages,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'email' => 'nullable|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string',
            'package_id' => 'nullable|exists:packages,id',
            'expires_at' => 'nullable|date',
            'mac_address' => 'nullable|string',
            'ip_address' => 'nullable|ip',
            'notes' => 'nullable|string',
        ]);

        try {
            $this->provisioningService->updateUser($user, $validated);

            \Log::info('User updated', ['user_id' => $user->id, 'by' => auth()->id()]);

            return redirect()->route('admin.users.show', $user)
                ->with('success', 'User updated successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update user: ' . $e->getMessage());
        }
    }

    public function destroy(User $user): RedirectResponse
    {
        try {
            $this->provisioningService->deleteUser($user);

            \Log::info('User deleted', ['user_id' => $user->id, 'by' => auth()->id()]);

            return redirect()->route('admin.users.index')
                ->with('success', 'User deleted successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete user: ' . $e->getMessage());
        }
    }

    public function disable(User $user): RedirectResponse
    {
        try {
            $this->provisioningService->updateUser($user, ['status' => 'disabled']);

            return redirect()->route('admin.users.show', $user)
                ->with('success', 'User disabled');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to disable user');
        }
    }

    public function enable(User $user): RedirectResponse
    {
        try {
            $this->provisioningService->updateUser($user, ['status' => 'active']);

            return redirect()->route('admin.users.show', $user)
                ->with('success', 'User enabled');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to enable user');
        }
    }

    public function renew(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'days' => 'nullable|integer|min:1|max:365',
        ]);

        try {
            $this->billingService->renewSubscription($user, $validated['days'] ?? null);

            return redirect()->route('admin.users.show', $user)
                ->with('success', 'Subscription renewed');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to renew subscription');
        }
    }

    public function sessions(User $user): View
    {
        $sessions = $user->sessions()
            ->orderBy('started_at', 'desc')
            ->paginate(20);

        return view('admin.users.sessions', [
            'user' => $user,
            'sessions' => $sessions,
        ]);
    }
}
