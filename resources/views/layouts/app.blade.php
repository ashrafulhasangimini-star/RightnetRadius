<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'RightnetRadius') - ISP Management</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <style>
        [x-cloak] { display: none; }
    </style>
</head>
<body class="bg-gray-50">
    <div class="flex h-screen bg-gray-100">
        <!-- Sidebar -->
        @auth
        <aside class="w-64 bg-gray-900 text-white p-4 hidden md:block">
            <div class="mb-8">
                <h1 class="text-2xl font-bold">RightnetRadius</h1>
                <p class="text-xs text-gray-400">ISP Management System</p>
            </div>

            <nav class="space-y-2">
                @if(auth()->user()->isAdmin() || auth()->user()->isReseller())
                    <a href="{{ route('admin.dashboard') }}" class="block px-4 py-2 rounded hover:bg-gray-800">Dashboard</a>
                    <a href="{{ route('admin.users.index') }}" class="block px-4 py-2 rounded hover:bg-gray-800">Users</a>
                    <a href="{{ route('admin.packages.index') }}" class="block px-4 py-2 rounded hover:bg-gray-800">Packages</a>
                    <a href="{{ route('admin.invoices.index') }}" class="block px-4 py-2 rounded hover:bg-gray-800">Invoices</a>
                    <a href="{{ route('admin.reports.revenue') }}" class="block px-4 py-2 rounded hover:bg-gray-800">Reports</a>
                @else
                    <a href="{{ route('user.dashboard') }}" class="block px-4 py-2 rounded hover:bg-gray-800">Dashboard</a>
                    <a href="{{ route('user.usage') }}" class="block px-4 py-2 rounded hover:bg-gray-800">Usage</a>
                    <a href="{{ route('user.invoices') }}" class="block px-4 py-2 rounded hover:bg-gray-800">Invoices</a>
                    <a href="{{ route('user.payments') }}" class="block px-4 py-2 rounded hover:bg-gray-800">Payments</a>
                @endif
            </nav>

            <div class="mt-auto pt-4 border-t border-gray-700">
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit" class="block w-full text-left px-4 py-2 rounded hover:bg-gray-800">Logout</button>
                </form>
            </div>
        </aside>
        @endauth

        <!-- Main Content -->
        <main class="flex-1 overflow-auto">
            @auth
            <header class="bg-white shadow">
                <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div class="flex justify-between items-center">
                        <h2 class="text-xl font-semibold text-gray-900">@yield('page-title')</h2>
                        <div class="text-sm text-gray-600">{{ auth()->user()->name ?? auth()->user()->username }}</div>
                    </div>
                </div>
            </header>
            @endauth

            <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                @if($message = session('success'))
                <div class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    {{ $message }}
                </div>
                @endif

                @if($message = session('error'))
                <div class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {{ $message }}
                </div>
                @endif

                @yield('content')
            </div>
        </main>
    </div>
</body>
</html>
