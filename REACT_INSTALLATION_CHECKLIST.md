# React Frontend Integration - Installation Checklist

## Pre-Installation Verification

Before you start, ensure you have:

```
✓ Node.js 16+ installed          (check: node --version)
✓ npm 8+ installed               (check: npm --version)  
✓ PHP 8.2+ installed             (check: php --version)
✓ Composer installed             (check: composer --version)
✓ MySQL/MariaDB running          (check: your database is accessible)
✓ Project cloned or created      (path: C:\laragon\www\isp-panel)
```

---

## Installation Steps

### Step 1: Install PHP Dependencies
```bash
cd C:\laragon\www\isp-panel
composer install
```
**Expected output**: `Generating optimized autoload files`

### Step 2: Install Node.js Dependencies
```bash
npm install
```
**Expected output**: `added X packages in Y seconds`

**Installed packages**:
- React 18
- Inertia.js
- Vite (build tool)
- Recharts (charts)
- Tailwind CSS
- Axios (HTTP client)

### Step 3: Generate Laravel Key
```bash
php artisan key:generate
```
**Expected output**: `Application key set successfully.`

### Step 4: Configure Environment
```bash
cp .env.example .env
```
**Edit .env with your settings:**
- `DB_HOST`: 127.0.0.1
- `DB_DATABASE`: rightnet_radius
- `DB_USERNAME`: root
- `DB_PASSWORD`: (your password)
- `RADIUS_DB_*`: RADIUS database credentials
- `MIKROTIK_API_*`: MikroTik connection details

### Step 5: Run Database Migrations
```bash
php artisan migrate
```
**Expected output**: `Migrated: 2024_01_01_000000_create_admin_users_table`

### Step 6: Seed Demo Data (Optional)
```bash
php artisan db:seed
```
**Creates sample admin and user accounts**

---

## Start Development

### Terminal 1: Vite Dev Server (Frontend)
```bash
npm run dev
```
**Expected output**:
```
  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```
✅ **Keep this running** - handles CSS, JS hot reload

### Terminal 2: Laravel Server (Backend)
```bash
php artisan serve
```
**Expected output**:
```
   INFO  Server running on [http://127.0.0.1:8000]

  Press Ctrl+C to quit
```

---

## Access Application

### URLs

| Panel | URL | Default Login |
|-------|-----|----------------|
| Admin Dashboard | http://localhost:8000/admin/dashboard | Email: admin@rightnet.local<br/>Password: admin123 |
| User Dashboard | http://localhost:8000/user/dashboard | Username: user001<br/>Password: user123 |
| API Docs | See REACT_SETUP.md | Token auth via /api/login |

### First Login

1. Open: http://localhost:8000/admin/dashboard
2. Login with admin@rightnet.local / admin123
3. See real-time statistics and charts
4. Charts update every 10 seconds

---

## Verify Installation

### Check 1: Vite is Running
```bash
# In your browser's Network tab (F12 → Network)
Should see requests to: http://localhost:5173/
```

### Check 2: React Components Load
```bash
# In browser console (F12 → Console)
Should see no React errors
```

### Check 3: API Endpoints Work
```bash
# Test in browser console:
fetch('http://localhost:8000/api/admin/dashboard-stats')
  .then(r => r.json())
  .then(console.log)

# Should return: { total_users: X, active_users: Y, ... }
```

### Check 4: Charts Display Data
```bash
# Admin dashboard should show:
✓ StatCards with numbers (red if zero = needs data)
✓ Online Users Chart (line chart)
✓ Revenue Chart (area chart)
```

---

## Common Setup Issues

### Issue 1: "npm not found"
**Solution**: Install Node.js from https://nodejs.org/
```bash
node --version     # Should be 16+
npm --version      # Should be 8+
```

### Issue 2: "Vite compilation error"
**Solution**: Delete node_modules and reinstall
```bash
rmdir /s node_modules
npm install
npm run dev
```

### Issue 3: "Laravel migrations fail"
**Solution**: Check database connection
```bash
# Verify .env
DB_HOST=127.0.0.1
DB_DATABASE=rightnet_radius
DB_USERNAME=root

# Create database if missing
php artisan migrate:fresh
```

### Issue 4: "Charts don't show data"
**Solution**: Check API endpoints
```bash
# Open browser console (F12)
# Should see API calls: /api/admin/dashboard-stats
# If 404: routes might not be registered
php artisan route:list | grep api
```

### Issue 5: "Hot reload not working"
**Solution**: Restart Vite dev server
```bash
# Press Ctrl+C to stop npm run dev
npm run dev  # Start again
```

---

## File Structure After Setup

```
C:\laragon\www\isp-panel\
├── node_modules/              (created by: npm install)
├── .env                        (created by: cp .env.example .env)
├── vendor/                     (created by: composer install)
├── public/
│   └── build/                  (created by: npm run build - NOT YET)
├── resources/js/               (React components)
├── resources/css/              (Tailwind styles)
└── [other files...]
```

---

## Development Workflow

### Editing React Components

1. **Edit a file**:
   ```
   resources/js/Pages/Admin/Dashboard.jsx
   ```

2. **Browser auto-reloads**:
   - Changes visible instantly
   - No manual refresh needed
   - State preserved during reload

3. **File saved → Vite rebuilds → Browser updates** (< 1 second)

### Debugging

1. **Open DevTools**: F12
2. **Console tab**: See React errors
3. **Network tab**: See API calls
4. **React DevTools extension**: Inspect component state

### Adding a New Page

1. Create file: `resources/js/Pages/Admin/Users.jsx`
2. Add route in `routes/admin-inertia.php`
3. Link from sidebar in `AdminLayout.jsx`
4. Vite auto-detects and compiles

---

## Next: Build for Production

When ready to deploy:

```bash
npm run build
```

**This creates**:
- `public/build/index-*.js` - React bundle (150 KB)
- `public/build/index-*.css` - Tailwind bundle (50 KB)
- `public/build/manifest.json` - Asset mapping

**Then deploy**:
1. Commit `public/build/` to git
2. Push to production server
3. On server: No need to run `npm` again
4. Web server serves optimized assets

---

## Troubleshooting Quick Links

| Problem | Solution |
|---------|----------|
| 404 errors | Run `php artisan migrate` |
| Blank dashboard | Check browser console (F12) for errors |
| Charts not loading | Verify `/api/admin/dashboard-stats` returns data |
| Hot reload slow | Reduce polling interval in components |
| Port 8000 in use | `netstat -ano \| findstr :8000` then kill process |
| Port 5173 in use | Change in `vite.config.js`: `server: { port: 5174 }` |

---

## Documentation Map

| Document | Purpose |
|----------|---------|
| **REACT_SETUP.md** | Comprehensive setup guide with troubleshooting |
| **REACT_QUICK_REF.md** | Quick reference for common tasks |
| **REACT_PROJECT_STRUCTURE.md** | Full file structure and architecture |
| **REACT_IMPLEMENTATION_SUMMARY.md** | Technical summary of what's built |
| **This checklist** | Installation steps and verification |

---

## Success Indicators

After following all steps, you should see:

✅ Terminal 1: `npm run dev` showing "Local: http://localhost:5173/"  
✅ Terminal 2: `php artisan serve` showing "Server running on http://127.0.0.1:8000"  
✅ Browser: http://localhost:8000/admin/dashboard loads without errors  
✅ Dashboard: Shows statistics boxes and charts  
✅ Console: No React errors (F12 → Console)  
✅ Network: API calls to `/api/admin/dashboard-stats` succeed (200 status)  
✅ Charts: Line chart for online users updates periodically  

---

## Ready to Deploy?

### Local Testing Complete ✅
- Development server working
- Dashboards rendering
- Charts updating
- API endpoints responding

### Ready for Production ✅
```bash
npm run build
# Creates optimized public/build/ folder
# Deploy this to production
```

---

## Support & Next Steps

### If something doesn't work:
1. Check the **error message** in console (F12)
2. Refer to troubleshooting section above
3. Check **REACT_SETUP.md** for detailed guide
4. Verify all prerequisites installed

### Want to customize?
1. Edit `tailwind.config.js` for colors
2. Edit `resources/css/app.css` for new utilities
3. Edit `resources/js/Components/*.jsx` for UI changes
4. Changes auto-reload with Vite

### Want to add features?
1. Create API endpoint in `app/Http/Controllers/Api/`
2. Create React component in `resources/js/Components/`
3. Use it in `Pages/Admin/Dashboard.jsx` or `Pages/User/Dashboard.jsx`
4. Test and commit

---

## Commands Reference

```bash
# Development
npm run dev              # Start Vite dev server
php artisan serve      # Start Laravel server
npm run lint           # Check JavaScript quality

# Database
php artisan migrate    # Run migrations
php artisan db:seed    # Seed demo data
php artisan migrate:fresh --seed  # Reset database

# Production
npm run build          # Optimize for production
composer install --no-dev  # Production dependencies

# Debugging
php artisan route:list     # View all routes
php artisan tinker         # Interactive shell
npm run build -- --debug   # Build with debug info
```

---

## Installation Timeline

| Step | Time | Command |
|------|------|---------|
| 1. Install composer | 2 min | `composer install` |
| 2. Install npm | 1 min | `npm install` |
| 3. Generate key | 10 sec | `php artisan key:generate` |
| 4. Configure .env | 1 min | Edit .env file |
| 5. Run migrations | 1 min | `php artisan migrate` |
| 6. Seed data | 30 sec | `php artisan db:seed` |
| 7. Start Vite | 5 sec | `npm run dev` |
| 8. Start Laravel | 5 sec | `php artisan serve` |

**Total Time**: ~8 minutes ⏱️

---

## Final Checklist Before Use

```bash
□ Node.js installed (node --version)
□ npm packages installed (ls node_modules)
□ Composer dependencies installed (ls vendor)
□ .env configured (check: DB_DATABASE=rightnet_radius)
□ Database created (verify in MySQL)
□ Migrations run (php artisan migrate)
□ Demo data seeded (php artisan db:seed)
□ Vite dev server running (npm run dev in Terminal 1)
□ Laravel server running (php artisan serve in Terminal 2)
□ Admin dashboard loads (http://localhost:8000/admin/dashboard)
□ Login works (admin@rightnet.local / admin123)
□ Charts display data (Online Users, Revenue charts)
□ API responds (check Network tab in F12)
```

---

**✅ Ready to start!** Follow the Installation Steps section above.

**🚀 First command**: `npm install && composer install`
