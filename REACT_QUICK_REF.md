# React Frontend - Quick Reference

## Start Development

**Terminal 1:**
```bash
cd C:\laragon\www\isp-panel
npm run dev
```

**Terminal 2:**
```bash
cd C:\laragon\www\isp-panel
php artisan serve
```

## Access URLs

| Panel | URL | Default Login |
|-------|-----|----------------|
| Admin | http://localhost:8000/admin/dashboard | admin@rightnet.local / admin123 |
| User | http://localhost:8000/user/dashboard | user001 / user123 |
| API Docs | http://localhost:8000/api/... | See REACT_SETUP.md |

## Frontend File Structure

```
resources/js/
├── Layouts/
│   ├── AdminLayout.jsx       ← Admin sidebar & header
│   └── UserLayout.jsx        ← User sidebar & header
├── Pages/
│   ├── Admin/
│   │   └── Dashboard.jsx     ← Admin dashboard with charts
│   └── User/
│       └── Dashboard.jsx     ← User dashboard with usage
├── Components/
│   ├── StatCard.jsx          ← Stat boxes
│   ├── BandwidthChart.jsx    ← Live bandwidth graph
│   ├── UsageChart.jsx        ← Usage bar chart
│   ├── OnlineUsersChart.jsx  ← Online users timeline
│   └── RevenueChart.jsx      ← Revenue area chart
└── app.jsx                   ← Entry point
```

## Key Features

✅ **Real-Time Charts** - 5-10 second automatic updates  
✅ **Responsive Design** - Works on mobile/tablet/desktop  
✅ **Live Bandwidth** - Upload/download speeds per user  
✅ **Admin Statistics** - Total users, active, revenue  
✅ **User Portal** - Usage tracking, FUP status, balance  
✅ **Interactive UI** - Recharts for beautiful visualizations  

## Common Tasks

### Edit Admin Dashboard
```
File: resources/js/Pages/Admin/Dashboard.jsx
Change: Modify components, add charts, adjust styling
Reload: Auto-reload in browser
```

### Edit User Dashboard
```
File: resources/js/Pages/User/Dashboard.jsx
Change: Modify layout, update polling intervals
Reload: Auto-reload in browser
```

### Add New Chart
```
1. Create resources/js/Components/MyChart.jsx
2. Import in Page component
3. Add to JSX: <MyChart />
4. Auto-reload in browser
```

### Modify Styling
```
1. Edit resources/css/app.css or tailwind.config.js
2. Auto-reload in browser
3. No rebuild needed
```

### Update API Call
```
// Example: Change polling interval
<OnlineUsersChart interval={5000} />  // 5 seconds
```

## Build for Production

```bash
npm run build
```

Creates optimized files in `public/build/` for production deployment.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "npm not found" | Install Node.js from nodejs.org |
| Charts blank | Check browser console (F12) for API errors |
| 404 errors | Run `php artisan migrate` and check .env |
| Hot reload not working | Restart `npm run dev` |

## API Endpoints Used

```
GET /api/admin/dashboard-stats
GET /api/admin/online-users-history
GET /api/admin/revenue-history
GET /api/user/info
GET /api/user/online-status
GET /api/users/{id}/bandwidth-history
GET /api/users/{id}/usage
```

See REACT_SETUP.md for full documentation.

---

**Status:** Production Ready ✅  
**Latest Update:** January 21, 2026
