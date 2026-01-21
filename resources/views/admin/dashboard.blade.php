@extends('layouts.app')

@section('page-title', 'Admin Dashboard')

@section('content')
<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
    <div class="bg-white rounded-lg shadow p-6">
        <div class="text-gray-600 text-sm font-medium">Total Users</div>
        <div class="text-3xl font-bold text-gray-900 mt-2">{{ $stats['total'] }}</div>
        <div class="text-xs text-gray-500 mt-1">{{ $stats['active'] }} active</div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
        <div class="text-gray-600 text-sm font-medium">Online Now</div>
        <div class="text-3xl font-bold text-green-600 mt-2">{{ $onlineNow }}</div>
        <div class="text-xs text-gray-500 mt-1">Last 5 minutes</div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
        <div class="text-gray-600 text-sm font-medium">Monthly Revenue</div>
        <div class="text-3xl font-bold text-gray-900 mt-2">{{ config('isp.billing.currency') }} {{ number_format($revenueData->revenue ?? 0, 0) }}</div>
        <div class="text-xs text-gray-500 mt-1">{{ $revenueData->user_count ?? 0 }} users</div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
        <div class="text-gray-600 text-sm font-medium">Alerts</div>
        <div class="text-3xl font-bold text-orange-600 mt-2">{{ $pendingInvoices }}</div>
        <div class="text-xs text-gray-500 mt-1">Overdue invoices</div>
    </div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
    <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">Recent Users</h3>
        <div class="space-y-3">
            @forelse($recentUsers as $user)
            <div class="flex justify-between items-center py-2 border-b">
                <div>
                    <div class="font-medium">{{ $user->username }}</div>
                    <div class="text-sm text-gray-600">{{ $user->package->name ?? 'No package' }}</div>
                </div>
                <span class="px-2 py-1 text-xs rounded {{ $user->status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800' }}">
                    {{ $user->status }}
                </span>
            </div>
            @empty
            <p class="text-gray-500 text-sm">No users yet</p>
            @endforelse
        </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
        <div class="space-y-2">
            <a href="{{ route('admin.users.create') }}" class="block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create User</a>
            <a href="{{ route('admin.packages.create') }}" class="block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Create Package</a>
            <a href="{{ route('admin.invoices.index') }}" class="block px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">View Invoices</a>
        </div>
    </div>
</div>
@endsection
