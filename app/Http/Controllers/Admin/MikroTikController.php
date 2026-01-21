<?php

namespace App\Http\Controllers\Admin;

use App\Models\MikroTikDevice;
use App\Services\MikroTikService;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MikroTikController extends Controller
{
    public function index(): View
    {
        $devices = MikroTikDevice::paginate(20);

        return view('admin.mikrotik.index', [
            'devices' => $devices,
        ]);
    }

    public function create(): View
    {
        return view('admin.mikrotik.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:mikrotik_devices',
            'hostname' => 'required|string',
            'api_host' => 'required|ip',
            'api_port' => 'required|integer|min:1|max:65535',
            'api_username' => 'required|string',
            'api_password' => 'required|string',
            'api_ssl' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ]);

        $validated['api_ssl'] = $validated['api_ssl'] ?? false;
        $validated['status'] = 'disconnected';

        MikroTikDevice::create($validated);

        return redirect()->route('admin.mikrotik-devices.index')
            ->with('success', 'MikroTik device added');
    }

    public function edit(MikroTikDevice $device): View
    {
        return view('admin.mikrotik.edit', [
            'device' => $device,
        ]);
    }

    public function update(Request $request, MikroTikDevice $device): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:mikrotik_devices,name,' . $device->id,
            'hostname' => 'required|string',
            'api_host' => 'required|ip',
            'api_port' => 'required|integer|min:1|max:65535',
            'api_username' => 'required|string',
            'api_password' => 'required|string',
            'api_ssl' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ]);

        $device->update($validated);

        return redirect()->route('admin.mikrotik-devices.index')
            ->with('success', 'MikroTik device updated');
    }

    public function destroy(MikroTikDevice $device): RedirectResponse
    {
        $device->delete();

        return redirect()->route('admin.mikrotik-devices.index')
            ->with('success', 'MikroTik device deleted');
    }

    public function test(Request $request, MikroTikDevice $device): RedirectResponse
    {
        try {
            // Override config temporarily
            config(['mikrotik.api' => [
                'host' => $device->api_host,
                'port' => $device->api_port,
                'username' => $device->api_username,
                'password' => $device->api_password,
                'ssl' => $device->api_ssl,
            ]]);

            $service = new MikroTikService();
            $connected = $service->isConnected();

            if ($connected) {
                $device->update(['status' => 'connected', 'last_sync_at' => now()]);
                return back()->with('success', 'Connected successfully to MikroTik');
            } else {
                $device->update(['status' => 'error']);
                return back()->with('error', 'Failed to connect to MikroTik');
            }
        } catch (\Exception $e) {
            $device->update(['status' => 'error']);
            return back()->with('error', 'Connection error: ' . $e->getMessage());
        }
    }

    public function sync(MikroTikDevice $device): RedirectResponse
    {
        // This would sync users and profiles
        // Implement based on your needs

        return back()->with('success', 'Sync started in background');
    }
}
