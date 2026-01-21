# React Frontend - Command Reference

## 🚀 Quick Start

```bash
# Terminal 1: Frontend (keeps running)
npm run dev

# Terminal 2: Backend (keeps running)
php artisan serve

# Browser
http://localhost:8000/admin/dashboard
```

---

## 📦 Installation

```bash
npm install                    # Install Node dependencies
composer install              # Install PHP dependencies
php artisan key:generate      # Generate app key
cp .env.example .env          # Create .env
php artisan migrate           # Run database migrations
php artisan db:seed           # Add demo data
```

---

## 🔧 Development

```bash
npm run dev                   # Start Vite dev server
php artisan serve             # Start Laravel server
npm run lint                  # Check code quality
php artisan tinker            # Interactive shell
```

---

## 🏗️ Production

```bash
npm run build                 # Optimize for production
                              # Creates public/build/

composer install --no-dev     # Production dependencies only
php artisan config:cache      # Cache configuration
php artisan route:cache       # Cache routes
```

---

## 🗄️ Database

```bash
php artisan migrate           # Run all pending migrations
php artisan migrate:rollback  # Undo last migration batch
php artisan migrate:fresh     # Reset database
php artisan db:seed           # Run seeders
php artisan migrate:fresh --seed  # Reset + seed
```

---

## 🔍 Debugging

```bash
php artisan route:list        # List all routes
php artisan route:list --path=admin  # Routes matching "admin"
php artisan config:show       # Show all config
php artisan cache:clear       # Clear application cache
```

---

## 🌐 Routes & APIs

```bash
# View all routes
php artisan route:list

# Filter by group
php artisan route:list --path=admin

# Test an endpoint
curl http://localhost:8000/api/admin/dashboard-stats
```

---

## 📝 File Operations

```bash
# Create new React component
mkdir resources/js/Components
# Create resources/js/Components/MyComponent.jsx

# Create new page
# Create resources/js/Pages/Admin/MyPage.jsx

# Add new API controller
# Create app/Http/Controllers/Api/MyController.php
```

---

## 🎨 Styling

```bash
# Edit Tailwind colors
# Edit: tailwind.config.js

# Add custom CSS utilities
# Edit: resources/css/app.css

# Changes auto-reload in browser (HMR)
```

---

## 📊 Charts & Components

```bash
# Built-in components available:
<StatCard />           # KPI box
<BandwidthChart />     # Live bandwidth
<UsageChart />         # Usage bar chart
<OnlineUsersChart />   # Online users timeline
<RevenueChart />       # Revenue area chart
```

---

## 🔑 Default Logins

```
Admin:
  Email: admin@rightnet.local
  Password: admin123

User:
  Username: user001
  Password: user123
```

---

## 📱 URLs

```
Admin Dashboard:  http://localhost:8000/admin/dashboard
User Dashboard:   http://localhost:8000/user/dashboard
API Base:         http://localhost:8000/api/
Laravel Docs:     http://localhost:8000/storage/app/docs/
```

---

## 🆘 Troubleshooting

```bash
# Port already in use?
# Close the running process or use different port:
# Edit vite.config.js: server: { port: 5174 }

# Node modules issues?
rm -r node_modules package-lock.json
npm install

# Database issues?
php artisan migrate:fresh --seed

# Can't connect to API?
php artisan route:list | grep api

# Hot reload not working?
# Restart: npm run dev

# Charts showing no data?
# Check browser F12 → Network tab for API errors
```

---

## 🎯 Common Tasks

### Edit Admin Dashboard
```
File: resources/js/Pages/Admin/Dashboard.jsx
Save → Auto-reload in browser
```

### Edit User Dashboard
```
File: resources/js/Pages/User/Dashboard.jsx
Save → Auto-reload in browser
```

### Add New Chart Component
```
1. Create: resources/js/Components/MyChart.jsx
2. Import in dashboard
3. Use: <MyChart />
4. Save → Auto-compiles
```

### Change Colors
```
File: tailwind.config.js
Edit: colors object
Save → Auto-reload
```

### Create New API Endpoint
```
1. Create controller: app/Http/Controllers/Api/MyController.php
2. Add route: routes/api-react.php
3. Call from component: axios.get('/api/...')
```

---

## 🧪 Testing API Endpoints

```javascript
// In browser console (F12):

// Test dashboard stats
fetch('/api/admin/dashboard-stats')
  .then(r => r.json())
  .then(console.log)

// Test user info
fetch('/api/user/info')
  .then(r => r.json())
  .then(console.log)

// Test with headers
fetch('/api/user/info', {
  headers: { 'Accept': 'application/json' }
})
  .then(r => r.json())
  .then(console.log)
```

---

## 📚 Documentation Files

```
REACT_SETUP.md                    ← Full setup guide
REACT_QUICK_REF.md               ← Quick reference
REACT_PROJECT_STRUCTURE.md       ← Architecture
REACT_IMPLEMENTATION_SUMMARY.md  ← Technical details
REACT_INSTALLATION_CHECKLIST.md  ← Step-by-step setup
REACT_BUILD_COMPLETE.md          ← Overview & features
REACT_COMMAND_REFERENCE.md       ← This file
```

---

## 🎁 What's Included

```
✅ React 18 frontend
✅ Inertia.js integration
✅ Vite build tool
✅ Tailwind CSS styling
✅ Recharts visualizations
✅ Admin dashboard
✅ User portal
✅ Real-time charts
✅ API endpoints
✅ Full documentation
```

---

## 🚢 Deployment Checklist

```bash
□ npm install          # Install dependencies
□ npm run build        # Build for production
□ composer install --no-dev  # Production PHP deps
□ php artisan migrate  # Run migrations
□ .env configured      # Set environment
□ public/build/ ready  # Build folder exists
□ Web server set up    # Points to public/
□ Database connection  # Verified
□ API endpoints test   # All 200 OK
□ Ready to deploy!     # Push to production
```

---

## 📞 Quick Fixes

| Issue | Solution |
|-------|----------|
| npm not found | Install Node.js from nodejs.org |
| Vite error | `npm install` and restart `npm run dev` |
| 404 errors | Run `php artisan migrate` |
| Charts blank | Check browser console F12 for errors |
| Port in use | Kill process or change port in vite.config.js |
| Database error | Check .env DB credentials |
| API 500 error | Check Laravel logs: `storage/logs/laravel.log` |

---

## 🔗 Useful Links

- React: https://react.dev
- Inertia: https://inertiajs.com
- Vite: https://vitejs.dev
- Tailwind: https://tailwindcss.com
- Recharts: https://recharts.org
- Laravel: https://laravel.com

---

## ⏱️ Timing

```
npm install:        1 min
composer install:   2 min
Setup:             1 min
Migrations:        1 min
Start servers:     30 sec
Total:             ~5 minutes
```

---

## ✅ Success Indicators

```
✓ npm run dev shows: "Local: http://localhost:5173/"
✓ php artisan serve shows: "Server running on http://127.0.0.1:8000"
✓ Dashboard loads at: http://localhost:8000/admin/dashboard
✓ No errors in F12 console
✓ Charts display data
✓ API calls succeed (Network tab)
```

---

**Ready? Start with:** `npm install && npm run dev`
