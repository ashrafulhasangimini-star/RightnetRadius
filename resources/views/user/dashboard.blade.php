@extends('layouts.app')

@section('page-title', 'User Dashboard')

@section('content')
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div class="bg-white rounded-lg shadow p-6">
        <div class="text-gray-600 text-sm font-medium">Current Package</div>
        <div class="text-2xl font-bold text-gray-900 mt-2">{{ $user->package->name ?? 'No Package' }}</div>
        <div class="text-sm text-gray-600 mt-2">
            {{ $user->package->formatted_speed ?? 'N/A' }}
        </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
        <div class="text-gray-600 text-sm font-medium">Expires In</div>
        <div class="text-2xl font-bold {{ $user->days_remaining < 7 ? 'text-red-600' : 'text-green-600' }} mt-2">
            {{ $user->days_remaining ?? 'N/A' }} days
        </div>
        @if($user->expires_at)
        <div class="text-sm text-gray-600 mt-2">{{ $user->expires_at->format('M d, Y') }}</div>
        @endif
    </div>

    <div class="bg-white rounded-lg shadow p-6">
        <div class="text-gray-600 text-sm font-medium">Monthly Usage</div>
        <div class="text-2xl font-bold text-gray-900 mt-2">{{ number_format($monthlyUsage / (1024*1024*1024), 2) }} GB</div>
        @if($user->package && $user->package->fup_limit)
        <div class="text-sm text-gray-600 mt-2">Limit: {{ $user->package->fup_limit }} GB</div>
        @endif
    </div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">Active Session</h3>
        @if($onlineSession)
        <div class="space-y-2 text-sm">
            <div><span class="font-medium">IP:</span> {{ $onlineSession->framed_ip_address }}</div>
            <div><span class="font-medium">Connected:</span> {{ $onlineSession->started_at->diffForHumans() }}</div>
            <div><span class="font-medium">Duration:</span> {{ $onlineSession->formatted_duration }}</div>
            <div><span class="font-medium">Downloaded:</span> {{ number_format($onlineSession->input_octets / (1024*1024), 2) }} MB</div>
            <div><span class="font-medium">Uploaded:</span> {{ number_format($onlineSession->output_octets / (1024*1024), 2) }} MB</div>
        </div>
        @else
        <p class="text-gray-600">Not currently online</p>
        @endif
    </div>

    <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
        <div class="space-y-2">
            <a href="{{ route('user.usage') }}" class="block px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">View Detailed Usage</a>
            <a href="{{ route('user.invoices') }}" class="block px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200">View Invoices ({{ $user->invoices()->where('status', 'pending')->count() }})</a>
            <a href="{{ route('user.payments') }}" class="block px-4 py-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200">Payment History</a>
            <a href="{{ route('user.profile.edit') }}" class="block px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200">Edit Profile</a>
        </div>
    </div>
</div>
@endsection
