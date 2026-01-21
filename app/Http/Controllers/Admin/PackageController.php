<?php

namespace App\Http\Controllers\Admin;

use App\Models\Package;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    public function index(): View
    {
        $packages = Package::orderBy('sort_order')
            ->paginate(20);

        return view('admin.packages.index', [
            'packages' => $packages,
        ]);
    }

    public function create(): View
    {
        return view('admin.packages.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:packages',
            'description' => 'nullable|string',
            'speed_download' => 'required|integer|min:1',
            'speed_upload' => 'required|integer|min:1',
            'fup_limit' => 'nullable|numeric|min:0',
            'fup_reset_day' => 'nullable|integer|min:1|max:31',
            'validity_days' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'sort_order' => 'nullable|integer',
        ]);

        $validated['status'] = 'active';

        Package::create($validated);

        return redirect()->route('admin.packages.index')
            ->with('success', 'Package created successfully');
    }

    public function edit(Package $package): View
    {
        return view('admin.packages.edit', [
            'package' => $package,
        ]);
    }

    public function update(Request $request, Package $package): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:packages,name,' . $package->id,
            'description' => 'nullable|string',
            'speed_download' => 'required|integer|min:1',
            'speed_upload' => 'required|integer|min:1',
            'fup_limit' => 'nullable|numeric|min:0',
            'fup_reset_day' => 'nullable|integer|min:1|max:31',
            'validity_days' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'sort_order' => 'nullable|integer',
        ]);

        $package->update($validated);

        return redirect()->route('admin.packages.index')
            ->with('success', 'Package updated successfully');
    }

    public function destroy(Package $package): RedirectResponse
    {
        $package->update(['status' => 'inactive']);

        return redirect()->route('admin.packages.index')
            ->with('success', 'Package deactivated');
    }
}
