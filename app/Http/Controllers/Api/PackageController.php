<?php

namespace App\Http\Controllers\Api;

use App\Models\Package;
use Illuminate\Http\JsonResponse;

class PackageController extends Controller
{
    public function index(): JsonResponse
    {
        $packages = Package::where('status', 'active')
            ->orderBy('sort_order')
            ->get();

        return response()->json($packages);
    }

    public function show(Package $package): JsonResponse
    {
        if ($package->status !== 'active') {
            return response()->json(['error' => 'Package not found'], 404);
        }

        return response()->json($package);
    }
}
