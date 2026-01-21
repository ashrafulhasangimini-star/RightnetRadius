# React Frontend Setup Guide

## Overview

The frontend has been completely refactored to use **React** with **Inertia.js**, providing a modern, interactive experience for both admin and user panels with real-time charts and live data updates.

## Technology Stack

- **React 18** - UI framework
- **Inertia.js** - Server-driven React components
- **Vite** - Frontend build tool (fast development server)
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Beautiful, interactive charts
- **Axios** - HTTP client for API calls

## Prerequisites

Before starting, ensure you have:

```bash
# Node.js 16+ (includes npm)
node --version
npm --version

# PHP 8.2+ and Composer
php --version
composer --version
```

## Installation Steps (Windows/Laragon)

### 1. Install PHP Dependencies

```bash
cd C:\laragon\www\isp-panel
composer install
```

### 2. Install Node.js Dependencies

```bash
npm install
```

This will install:
- React, React-DOM
- Inertia.js for React
- Vite and Laravel Vite Plugin
- Recharts for data visualization
- Tailwind CSS and utilities

### 3. Generate Application Key

```bash
php artisan key:generate
```

### 4. Database Setup

```bash
# Create database
php artisan migrate

# Seed demo data (optional)
php artisan db:seed
```

### 5. Configure Inertia Middleware

Inertia middleware should be auto-registered by the service provider. Verify in `config/app.php` that middleware is loaded:

```php
'middleware' => [
    // ... other middleware
    \App\Http\Middleware\HandleInertiaRequests::class,
],
```

### 6. Start Development Server

**Terminal 1 - PHP/Laravel:**
```bash
# From C:\laragon\www\isp-panel
php artisan serve

# Should output: Laravel development server started at http://127.0.0.1:8000
```

**Terminal 2 - Vite (Keep running):**
```bash
# From C:\laragon\www\isp-panel
npm run dev

# Should output: ➜ Local: http://localhost:5173/
```

### 7. Access the Application

- **Admin Panel**: http://localhost:8000/admin/dashboard
- **User Panel**: http://localhost:8000/user/dashboard
- **API**: http://localhost:8000/api/...

## Default Login Credentials

**Admin:**
- Email: `admin@rightnet.local`
- Password: `admin123`

**User (test account):**
- Username: `user001`
- Password: `user123`

## Directory Structure

```
resources/
├── js/
│   ├── app.jsx                  ← React entry point
│   ├── Pages/
│   │   ├── Admin/
│   │   │   └── Dashboard.jsx
│   │   └── User/
│   │       └── Dashboard.jsx
│   ├── Layouts/
│   │   ├── AdminLayout.jsx
│   │   └── UserLayout.jsx
│   └── Components/
│       ├── StatCard.jsx
│       ├── BandwidthChart.jsx
│       ├── UsageChart.jsx
│       ├── OnlineUsersChart.jsx
│       └── RevenueChart.jsx
├── css/
│   └── app.css                  ← Tailwind CSS
└── views/
    └── app.blade.php            ← Root Blade template

vite.config.js                   ← Vite configuration
tailwind.config.js               ← Tailwind configuration
postcss.config.js                ← PostCSS configuration
package.json                     ← Node dependencies
```

## Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Format and lint JavaScript
npm run lint
```

## Features

### Real-Time Data Updates

Charts and statistics update automatically:
- **Admin Dashboard**: Updates every 10 seconds
- **User Dashboard**: Updates every 5 seconds
- **Bandwidth Chart**: Live updates (5-second polling)

### Interactive Charts

Using **Recharts**:
- **Bandwidth Chart** - Live upload/download speeds
- **Usage Chart** - Daily/monthly data breakdown
- **Online Users Chart** - Real-time active user count
- **Revenue Chart** - Financial trends

### Responsive Design

- Mobile-first layout with Tailwind CSS
- Collapsible sidebar on mobile
- Touch-friendly interfaces

### State Management

- React hooks for local state
- API data fetching with Axios
- Automatic intervals for live updates

## API Endpoints for Frontend

The React frontend uses these API endpoints for live data:

```
GET    /api/admin/dashboard-stats          ← Admin statistics
GET    /api/admin/online-users-history     ← Online users timeline
GET    /api/admin/revenue-history          ← Revenue trends

GET    /api/user/info                      ← Current user info
GET    /api/user/online-status             ← Online status
GET    /api/users/{id}/bandwidth-history   ← Bandwidth data
GET    /api/users/{id}/usage               ← Usage breakdown
```

## Development Workflow

1. **Start Vite Dev Server** (hot reload):
   ```bash
   npm run dev
   ```

2. **Start Laravel Server**:
   ```bash
   php artisan serve
   ```

3. **Edit Files** - Changes auto-reload in browser
   - Modify `.jsx` files in `resources/js/`
   - Modify `.css` in `resources/css/`
   - No manual refresh needed!

4. **Create New Pages**:
   ```
   resources/js/Pages/Admin/Users.jsx
   resources/js/Pages/User/Usage.jsx
   ```

5. **Create New Components**:
   ```
   resources/js/Components/MyComponent.jsx
   ```

## Building for Production

### Windows

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build frontend:
   ```bash
   npm run build
   ```

3. This creates `public/build/` directory with optimized assets

### Linux (Production Server)

Same commands work on Linux:

```bash
npm install
npm run build
```

The build output is identical and OS-agnostic.

## Troubleshooting

### "Vite not found"

```bash
npm install
npm run dev
```

### Charts not loading

Check browser console (F12) for API errors. Ensure API endpoints are configured:

```javascript
// In Components/BandwidthChart.jsx, etc.
const response = await axios.get(`/api/users/${userId}/bandwidth-history`)
```

### Hot reload not working

- Restart `npm run dev`
- Clear browser cache (Ctrl+Shift+Delete)
- Check `vite.config.js` is present

### Laravel routes not found

Ensure routes include Inertia middleware:

```php
// routes/admin-inertia.php
Route::middleware(['auth:admin', 'admin'])->group(function () {
    Route::get('/dashboard', fn() => Inertia::render('Admin/Dashboard'));
});
```

### Database errors

Verify `.env` has correct database credentials:
```
DB_HOST=127.0.0.1
DB_DATABASE=rightnet_radius
DB_USERNAME=root
DB_PASSWORD=
```

## Performance Tips

1. **Reduce polling interval** (currently 5-10 seconds):
   ```jsx
   <BandwidthChart interval={3000} />  // 3 seconds
   ```

2. **Lazy load components**:
   ```jsx
   const RevenueChart = lazy(() => import('@/Components/RevenueChart'))
   ```

3. **Enable caching** in `.env`:
   ```
   CACHE_DRIVER=redis  // or file
   ```

4. **Optimize images** before uploading

## Adding New Pages

1. Create new React component:
   ```jsx
   // resources/js/Pages/Admin/Users.jsx
   import AdminLayout from '@/Layouts/AdminLayout'
   import { Head } from '@inertiajs/react'

   export default function Users({ auth }) {
     return (
       <AdminLayout user={auth.user}>
         <Head title="Users" />
         {/* Your content */}
       </AdminLayout>
     )
   }
   ```

2. Add route in `routes/admin-inertia.php`:
   ```php
   Route::get('/users', fn() => Inertia::render('Admin/Users'))
   ```

3. Link from sidebar in `AdminLayout.jsx`

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Run `npm run dev` in one terminal
3. ✅ Run `php artisan serve` in another
4. ✅ Open http://localhost:8000
5. ✅ Login with admin@rightnet.local / admin123

Happy coding! 🚀
