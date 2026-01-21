# Quick Start Guide - RightnetRadius

## 5-Minute Setup

### 1. Install Dependencies
```bash
composer install
```

### 2. Create Environment File
```bash
cp .env.example .env
php artisan key:generate
```

### 3. Configure Database
Edit `.env`:
```
DB_DATABASE=rightnet_radius
DB_USERNAME=root
DB_PASSWORD=yourpassword

RADIUS_DB_DATABASE=radius
RADIUS_DB_USERNAME=radius
RADIUS_DB_PASSWORD=yourpassword
```

### 4. Run Migrations
```bash
php artisan migrate
```

### 5. Seed Demo Data
```bash
php artisan db:seed
```

### 6. Start Development Server
```bash
php artisan serve
```

Access at: **http://localhost:8000**

**Admin Login:**
- Email: admin@rightnet.local
- Password: admin123

---

## Key Features Overview

### Admin Panel Features
- **Users**: Create, edit, disable, renew subscriptions
- **Packages**: Manage speed profiles and pricing
- **Billing**: Invoice management and payment tracking
- **Reports**: Revenue, usage, and session reports
- **MikroTik**: Device management and synchronization
- **Audit Logs**: Track all administrative changes

### User Panel Features
- **Dashboard**: Quick overview of status
- **Usage**: Monthly usage and FUP monitoring
- **Invoices**: View and download invoices
- **Payments**: Payment history and balance
- **Profile**: Update personal information

### REST API
Full RESTful API for third-party integrations:
- User management
- Session tracking
- Usage analytics
- Billing operations

---

## Integration with FreeRADIUS

### 1. Verify RADIUS Database
```bash
mysql -u radius -p radius
> SHOW TABLES;
```

Should show: `radcheck`, `radreply`, `radusergroup`, `radacct`, etc.

### 2. Configure RADIUS Connection
Edit `.env`:
```
RADIUS_DB_HOST=localhost
RADIUS_DB_DATABASE=radius
RADIUS_DB_USERNAME=radius
RADIUS_DB_PASSWORD=password
```

### 3. Test RADIUS Sync
```bash
php artisan tinker
> $user = App\Models\User::first();
> (new App\Services\RadiusService())->syncUser($user);
```

---

## Integration with MikroTik

### 1. Enable API on RouterOS
Via MikroTik Web Interface:
- IP → Services → API
- Check "enabled"
- Set port (default: 8728)

### 2. Configure in .env
```
MIKROTIK_API_HOST=192.168.1.1
MIKROTIK_API_PORT=8728
MIKROTIK_API_USER=admin
MIKROTIK_API_PASSWORD=password
MIKROTIK_API_SSL=false
```

### 3. Test Connection
Admin Panel → MikroTik Devices → Add Device → Test

---

## Common Commands

### User Management
```bash
# Create user in RADIUS
php artisan tinker
> $user = App\Models\User::create([...]);
> (new App\Services\RadiusService())->syncUser($user);

# Disable user
> (new App\Services\RadiusService())->disableUser('username');

# Remove user
> (new App\Services\RadiusService())->removeUser('username');
```

### Billing
```bash
# Generate invoices
php artisan isp:generate-invoices

# Disable expired users
php artisan isp:disable-expired-users

# Sync accounting
php artisan isp:sync-radius-accounting
```

### MikroTik
```bash
# Sync sessions
php artisan isp:sync-mikrotik-sessions

# Add PPPoE user
$service = new App\Services\MikroTikService();
$service->addPppoeUser('username', 'password');

# Disconnect user
$service->disconnectUser('username');
```

---

## Database Structure

### Users Table
- username (unique)
- email (unique)
- phone
- package_id (foreign key)
- status (active, suspended, expired, disabled)
- expires_at
- mac_address
- ip_address
- balance (decimal)

### Sessions Table
- user_id
- unique_id
- nas_ip_address
- framed_ip_address
- status (online, offline)
- started_at
- expires_at
- input_octets
- output_octets

### Invoices Table
- user_id
- invoice_number (unique)
- amount
- status (draft, pending, paid, cancelled)
- issued_at
- due_at
- paid_at

---

## API Examples

### Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"user1"}'
```

### Get User Sessions
```bash
curl http://localhost:8000/api/sessions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Usage Summary
```bash
curl http://localhost:8000/api/usage/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Process Payment
```bash
curl -X POST http://localhost:8000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":500,"method":"cash"}'
```

---

## Troubleshooting

### Migration Fails
```bash
# Check connection
php artisan migrate --env=testing --step

# See SQL errors
php artisan migrate --verbose
```

### RADIUS Not Syncing
- Verify RADIUS_DB connection in `.env`
- Check radcheck table exists
- Verify password hash config: `config('radius.password_hash')`

### MikroTik Connection Failed
- Verify API is enabled on RouterOS
- Check firewall allows port 8728
- Test with RouterOS IP directly
- Review MikroTik logs

### User Creation Fails
- Check username doesn't exist
- Verify package_id exists
- Check expires_at is in future

---

## Production Checklist

- [ ] Set `APP_DEBUG=false`
- [ ] Set `APP_ENV=production`
- [ ] Configure SSL certificates
- [ ] Set strong admin passwords
- [ ] Enable database backups
- [ ] Configure rate limiting
- [ ] Set up email notifications
- [ ] Enable 2FA for admins
- [ ] Configure log rotation
- [ ] Set up monitoring/alerts
- [ ] Review security headers
- [ ] Test disaster recovery

---

## Support

For issues, check:
1. Laravel logs: `storage/logs/`
2. RADIUS logs: `/var/log/freeradius/`
3. MikroTik logs: Webfig → Logs
4. Database: Check for constraint errors

---

**Need Help?**
- Documentation: See INSTALLATION.md
- API Docs: Check routes/api.php
- Code Examples: See database/seeders/
