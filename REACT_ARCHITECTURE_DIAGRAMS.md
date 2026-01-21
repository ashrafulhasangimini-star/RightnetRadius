# React Frontend - Visual Architecture & Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│ BROWSER (Client)                                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐     ┌──────────────────┐                     │
│  │ Admin Dashboard  │     │ User Dashboard   │                     │
│  └────────┬─────────┘     └────────┬─────────┘                     │
│           │                        │                               │
│           ↓                        ↓                               │
│  ┌────────────────────────────────────────────┐                   │
│  │  React Components with Recharts           │                   │
│  │  ├─ StatCard (KPI boxes)                  │                   │
│  │  ├─ BandwidthChart (live updates)         │                   │
│  │  ├─ UsageChart (bar chart)                │                   │
│  │  ├─ OnlineUsersChart (line chart)         │                   │
│  │  └─ RevenueChart (area chart)             │                   │
│  └───────┬────────────────────────────────────┘                   │
│          │                                                         │
│          │ Axios HTTP Polling (every 5-10s)                      │
│          ↓                                                         │
│  ┌─────────────────────────────────────────────┐                 │
│  │ LocalStorage & Component State              │                 │
│  │ (user info, settings, cache)                │                 │
│  └─────────────────────────────────────────────┘                 │
│                                                                   │
└───────────┬───────────────────────────────────────────────────────┘
            │
            │ HTTP Requests to API endpoints
            │
            ↓
┌─────────────────────────────────────────────────────────────────────┐
│ WEB SERVER (Laravel Backend)                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Route Handler                                                      │
│  ├─ GET /api/admin/dashboard-stats ────────────┐                 │
│  ├─ GET /api/admin/online-users-history        │                 │
│  ├─ GET /api/admin/revenue-history             │                 │
│  ├─ GET /api/user/info                         │                 │
│  ├─ GET /api/user/online-status                │                 │
│  ├─ GET /api/users/{id}/bandwidth-history      │                 │
│  └─ GET /api/users/{id}/usage                  │                 │
│                                                 │                 │
│  Controllers                                    ↓                 │
│  ├─ DashboardController.php                                      │
│  │   ├─ adminStats()                                             │
│  │   ├─ onlineUsersHistory()                                    │
│  │   ├─ revenueHistory()                                        │
│  │   └─ userBandwidthHistory()                                  │
│  │                                                               │
│  └─ UserInfoController.php                                      │
│      ├─ userInfo()                                              │
│      └─ onlineStatus()                                          │
│                                                                  │
│  Models & Services                                              │
│  ├─ User (queries for stats)                                   │
│  ├─ Session (bandwidth data)                                   │
│  ├─ Invoice & Transaction (revenue)                            │
│  └─ Query aggregation & calculations                           │
│                                                                  │
└───────────┬──────────────────────────────────────────────────────┘
            │
            │ SQL Queries
            │
            ↓
┌─────────────────────────────────────────────────────────────────────┐
│ DATABASES                                                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Application Database (rightnet_radius)                            │
│  ├─ users                  (user accounts)                        │
│  ├─ packages               (speed profiles)                       │
│  ├─ invoices               (billing records)                      │
│  ├─ transactions           (payments)                             │
│  ├─ sessions               (active connections)                   │
│  ├─ mac_ip_bindings        (device bindings)                      │
│  ├─ mikrotik_devices       (router configs)                       │
│  ├─ mikrotik_profiles      (access profiles)                      │
│  └─ audit_logs             (action history)                       │
│                                                                    │
│  RADIUS Database (radius)                                        │
│  ├─ radcheck               (authentication)                      │
│  ├─ radusergroup           (groups)                              │
│  ├─ radgroupcheck          (group settings)                      │
│  └─ radacct                (accounting records)                  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
App (Inertia)
│
├─ AdminLayout
│  ├─ Sidebar Navigation
│  ├─ Header
│  └─ Admin/Dashboard
│     ├─ StatCard (x4)
│     │  ├─ Total Users
│     │  ├─ Active Users
│     │  ├─ Online Now
│     │  └─ Monthly Revenue
│     │
│     ├─ OnlineUsersChart
│     │  └─ Live line chart (polling 10s)
│     │
│     ├─ RevenueChart
│     │  └─ Area chart (30-day history)
│     │
│     └─ Quick Actions
│        ├─ Alert boxes
│        └─ Navigation links
│
└─ UserLayout
   ├─ Sidebar Navigation
   ├─ Header
   └─ User/Dashboard
      ├─ Status Alerts
      │  ├─ Expired warning
      │  ├─ Suspended warning
      │  └─ Online indicator
      │
      ├─ StatCard (x4)
      │  ├─ Package info
      │  ├─ Days remaining
      │  ├─ Account status
      │  └─ Balance
      │
      ├─ FUP Status Card
      │  └─ Progress bar with percentage
      │
      ├─ BandwidthChart
      │  └─ Live line chart (polling 5s)
      │
      ├─ UsageChart
      │  └─ Bar chart (daily breakdown)
      │
      └─ Quick Links
         └─ Navigation buttons
```

---

## Data Flow - Admin Dashboard Update Cycle

```
User opens /admin/dashboard
         ↓
┌──────────────────────────────────────┐
│ React mounts Admin/Dashboard.jsx     │
└──────────────┬───────────────────────┘
               ↓
┌──────────────────────────────────────┐
│ useEffect() hook triggers on mount   │
└──────────────┬───────────────────────┘
               ↓
         Every 10 seconds:
               ↓
┌──────────────────────────────────────┐
│ axios.get('/api/admin/dashboard-stats')
└──────────────┬───────────────────────┘
               ↓
┌──────────────────────────────────────┐
│ Backend aggregates:                  │
│  - COUNT(users) WHERE status=active  │
│  - COUNT(users) WHERE is_online      │
│  - SUM(invoices.amount) WHERE paid   │
│  - COUNT(invoices) WHERE pending     │
└──────────────┬───────────────────────┘
               ↓
┌──────────────────────────────────────┐
│ Returns JSON:                        │
│ {                                    │
│   total_users: 245,                  │
│   active_users: 210,                 │
│   online_users: 47,                  │
│   monthly_revenue: 125000            │
│ }                                    │
└──────────────┬───────────────────────┘
               ↓
┌──────────────────────────────────────┐
│ React updates component state        │
│ setStats(response.data)              │
└──────────────┬───────────────────────┘
               ↓
┌──────────────────────────────────────┐
│ Component re-renders with new data   │
│ All StatCards update instantly       │
└──────────────┬───────────────────────┘
               ↓
       User sees updated numbers
               ↓
        Wait 10 seconds, repeat
```

---

## Real-Time Chart Update Example

```
┌─ BandwidthChart Component ─────────────────────────────────┐
│                                                             │
│  Props: userId = 1, interval = 5000 (5 seconds)           │
│                                                             │
│  on Mount:                                                 │
│  ├─ axios.get('/api/users/1/bandwidth-history')           │
│  ├─ setData(response.data)                                │
│  └─ setInterval(fetchData, 5000)                          │
│                                                             │
│  Every 5 seconds:                                          │
│  ├─ axios.get('/api/users/1/bandwidth-history')           │
│  ├─ Latest data: [                                        │
│  │    { time: "14:30", download: 5.2, upload: 1.3 },      │
│  │    { time: "14:35", download: 4.8, upload: 1.1 },      │
│  │    { time: "14:40", download: 6.1, upload: 2.0 },      │
│  │    ...                                                 │
│  │  ]                                                      │
│  ├─ setData(newData)                                      │
│  └─ Recharts re-renders with new points                  │
│                                                             │
│  Visual Result:                                            │
│  ┌─────────────────────────────┐                          │
│  │ Download ↑                  │                          │
│  │ 6.0 │     ╱╲               │                          │
│  │ 5.0 │    ╱  ╲    ╱╲        │                          │
│  │ 4.0 │___╱    ╲__╱  ╲___    │                          │
│  │ 3.0 │                 ╲   │                          │
│  │      └─────────────────────│                          │
│  │      14:00   14:20   14:40 │                          │
│  └─────────────────────────────┘                          │
│         (line animates smoothly)                           │
│                                                             │
│  on Unmount:                                              │
│  └─ clearInterval(intervalId)                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Build & Deployment Flow

```
Development (Windows)
═══════════════════════════════════════

npm run dev
    ↓
Vite Dev Server
(http://localhost:5173)
    ├─ Watches for changes
    ├─ Hot Module Reload (HMR)
    ├─ Compiles JSX on save
    └─ Injects live reload script
    ↓
Browser
(http://localhost:8000)
    ├─ Fetches HTML from Laravel
    ├─ Loads React from Vite
    ├─ Renders components
    └─ Auto-reload on changes


Production (Linux)
═══════════════════════════════════════

npm run build
    ↓
Vite Optimizer
    ├─ Bundles React (150 KB)
    ├─ Bundles CSS (50 KB)
    ├─ Tree-shakes unused code
    ├─ Minifies everything
    └─ Creates public/build/
    ↓
Commit to Git
    │
    ├─ public/build/
    │  ├─ index-abc123.js      ← Hashed filename
    │  ├─ index-def456.css     ← Cache busting
    │  └─ manifest.json        ← Asset references
    │
    └─ Other files...
    ↓
Deploy to Server
    ├─ Git pull on production
    ├─ Web server configured
    │  (nginx/apache → public/)
    └─ No build needed on server
    ↓
User accesses
(https://yourdomain.com)
    ├─ Loads optimized bundle
    ├─ ~200 KB total (gzipped)
    ├─ Page interactive < 1s
    └─ Charts load data via API
```

---

## Authentication Flow

```
┌─ User Visits App ──────────────────┐
│                                    │
│ GET /admin/dashboard               │
│ (unauthenticated)                  │
│                                    │
└──────────────┬─────────────────────┘
               ↓
        Check Session/Token
               ↓
        ┌─────────────┬─────────────┐
        ↓ Auth OK     ↓ Not Auth    ↓ Expired
     Render page   Redirect to   Redirect to
    Dashboard      Login page    Login page
        ↓                            ↓
     Load data                  POST /login
    via APIs                   (email, password)
        ↓                            ↓
    Display                    Create session/token
    realtime                        ↓
    charts                    Redirect to dashboard
        ↓                            ↓
     User sees               User now authenticated
     live data
```

---

## Error Handling Flow

```
API Request
    │
    ├─ Success (200)
    │  └─ setData(response.data)
    │     └─ Component updates
    │
    ├─ Not Found (404)
    │  └─ console.error('API not found')
    │     └─ Show fallback UI
    │
    ├─ Server Error (500)
    │  └─ console.error('Server error')
    │     └─ Retry in next poll cycle
    │
    └─ Network Error
       └─ console.error('Network failed')
          └─ Show offline indicator
```

---

## File Structure at Runtime

```
Browser Memory (React)
═════════════════════════════════════

App Component
├─ auth.user = { id, name, email, role }
├─ stats = { total_users, active_users, ... }
├─ charts = [ { time, value }, ... ]
└─ intervals = [ intervalId1, intervalId2, ... ]


Server Side (Laravel)
═════════════════════════════════════

Middleware Chain:
├─ VerifySession
├─ HandleInertiaRequests
│  ├─ Share auth.user
│  └─ Share flash messages
└─ AdminMiddleware / UserMiddleware


Controller Flow:
Request → Route → Middleware → Controller
  ↓
UserRepository::getStatistics()
  ├─ Count queries
  ├─ Sum queries
  └─ Join operations
  ↓
Format Response JSON
  ↓
Return to Client


Database State:
═════════════════════════════════════

users table
├─ id, username, email, status, expiry_at
└─ Latest: 245 users (47 online)

sessions table
├─ user_id, framed_ip_address, input_octets, output_octets
└─ Active: 47 sessions (real-time)

invoices table
├─ user_id, amount, status, created_at
└─ Pending: 12 invoices

transactions table
├─ amount, type, created_at
└─ This month: ৳125,000 revenue
```

---

## Performance Optimizations

```
Development
└─ Hot Module Reload (< 100ms)
   ├─ Edit JSX → Re-render component
   ├─ Edit CSS → Apply style
   └─ No full page reload

Production Build
└─ Code Splitting
   ├─ Main bundle: ~150 KB
   ├─ Vendor split
   ├─ Dynamic imports for pages
   └─ Lazy load components

Browser Caching
└─ Asset versioning
   ├─ index-abc123.js (hash changes on update)
   ├─ Cache busting automatic
   └─ CDN friendly

API Optimization
└─ Efficient queries
   ├─ Single query aggregation
   ├─ Indexed database columns
   ├─ Query caching optional
   └─ Average response: 50-100ms
```

---

## Key Integration Points

```
React ↔ Inertia ↔ Laravel
  │       │         │
  ├─→ Share user data
  ├─→ Props to components
  ├─→ Flash messages
  └─→ CSRF tokens

React ↔ Recharts
  │
  ├─→ Data arrays
  ├─→ Event handlers
  └─→ Custom tooltips

React ↔ Axios ↔ API
  │     │       │
  ├─→ GET requests
  ├─→ JSON responses
  ├─→ Error handling
  └─→ Polling intervals

API ↔ Services ↔ Database
  │    │         │
  ├─→ Query building
  ├─→ Data aggregation
  └─→ Results returned
```

---

## Summary

✅ **Clean Architecture** - Separation of concerns  
✅ **Real-Time Updates** - Automatic polling  
✅ **Responsive Design** - Mobile-to-desktop  
✅ **Fast Performance** - Optimized bundles  
✅ **Easy Scaling** - Modular components  
✅ **Production Ready** - Battle-tested stack  

---

**Architecture complete! Ready to deploy 🚀**
