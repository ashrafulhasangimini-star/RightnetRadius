# RightnetRadius Quick Reference Card

## Quick Start

### Development
```bash
# Setup
composer install
npm install
npm run dev

# Database
php artisan migrate
php artisan db:seed

# Run
php artisan serve
npm run dev
```

### Production
```bash
# Setup
composer install --no-dev --optimize-autoloader
npm ci --production
npm run build

# Configure
cp .env.production .env
php artisan key:generate
php artisan migrate --force

# Deploy (see DEPLOYMENT.md)
```

## API Endpoints

### RADIUS Authentication
```bash
POST /api/radius/authenticate
{
  "username": "user@example.com",
  "password": "password",
  "nas_ip": "192.168.1.1",
  "nas_port": 1234
}
```

### Session Management
```bash
GET    /api/sessions                    # List active sessions
GET    /api/sessions/{sessionId}        # Get session details
POST   /api/sessions/{sessionId}/disconnect  # Disconnect user
GET    /api/bandwidth/usage             # Get bandwidth stats
GET    /api/bandwidth/quota/{username}  # Check quota
```

### Audit Logging
```bash
GET    /api/audit-logs                  # All logs
GET    /api/audit-logs/auth-attempts    # Auth attempts
GET    /api/audit-logs/quota-breaches   # Quota breaches
GET    /api/audit-logs/admin-actions    # Admin actions
GET    /api/audit-logs/stats            # Statistics
GET    /api/audit-logs/export?format=csv # Export logs
```

## Security Configuration

### Environment Variables
```bash
# HTTPS
ENFORCE_HTTPS=true
SSL_CERT_PATH=/etc/ssl/certs/rightnet.crt

# Rate Limiting
RATE_LIMITING_ENABLED=true
RATE_LIMIT_DEFAULT=60

# JWT
SECURITY_JWT_SECRET=your-secret-key
SECURITY_JWT_EXPIRATION=3600

# Database
DB_HOST=127.0.0.1
DB_DATABASE=rightnet_radius
DB_USERNAME=radius_user
DB_PASSWORD=secure_password

# RADIUS
RADIUS_SECRET=shared-radius-secret
RADIUS_PORT=1812

# MikroTik
MIKROTIK_HOST=192.168.1.10
MIKROTIK_USER=admin
MIKROTIK_PASSWORD=password
```

## Rate Limiting Defaults

| Endpoint | Limit | Period |
|----------|-------|--------|
| RADIUS Auth | 10 | 1 min |
| Disconnect | 20 | 5 min |
| User Update | 30 | 1 min |
| General API | 100 | 1 min |

## Audit Log Actions

```
AUTH_ATTEMPT      - Login attempt
SESSION_START     - User connected
SESSION_STOP      - User disconnected
QUOTA_BREACH      - Quota threshold exceeded
BANDWIDTH_CHANGE  - Speed limit modified
PACKAGE_CHANGE    - Package upgraded/downgraded
USER_DISCONNECT   - Admin forced disconnect
```

## Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

## Frontend Components

### Audit Logs
```jsx
import AuditLogs from '@/components/AuditLogs';

// Usage
<AuditLogs />
```

### Bandwidth Charts
```jsx
import { 
  BandwidthChart, 
  TopUsersChart, 
  QuotaChart,
  HourlyBandwidthChart,
  SessionsChart 
} from '@/components/BandwidthCharts';

// Usage
<BandwidthChart data={data} />
```

### WebSocket Hooks
```jsx
import { 
  useSessionUpdates, 
  useBandwidthUpdates, 
  useQuotaWarnings 
} from '@/hooks/useWebSocket';

// Usage
useSessionUpdates((event) => {
  console.log('Session update:', event);
});
```

## Common Tasks

### Add Rate Limit to Route
```php
Route::post('endpoint', Controller@method)
  ->middleware('rate-limit:10,1'); // 10 req per 1 min
```

### Log Audit Entry
```php
app('audit')->logAuthAttempt(
  'username', 
  true, 
  'radius',
  ['method' => 'api']
);
```

### Export Audit Logs
```php
$csv = app('audit')->exportLogs([
  'action' => 'AUTH_ATTEMPT',
  'days' => 30
]);
```

### Query Audit Logs
```php
$logs = app('audit')->getLogs([
  'action' => 'QUOTA_BREACH',
  'start_date' => now()->subDays(7),
  'end_date' => now(),
]);
```

## Monitoring

### Health Check
```bash
curl https://admin.rightnet.local/api/health
```

### Check Services
```bash
systemctl status nginx
systemctl status php8.3-fpm
systemctl status redis-server
systemctl status mysql
```

### View Logs
```bash
tail -f storage/logs/laravel.log
tail -f /var/log/nginx/rightnet-radius-error.log
```

## Database

### Key Tables
- `users` - ISP customers
- `packages` - Service packages
- `sessions` - Active connections
- `audit_logs` - Activity tracking
- `invoices` - Billing records
- `transactions` - Payment history

### Important Queries
```sql
-- Active sessions
SELECT * FROM sessions WHERE status = 'active';

-- Recent quota breaches
SELECT * FROM audit_logs 
WHERE action = 'QUOTA_BREACH' 
ORDER BY created_at DESC;

-- User bandwidth usage
SELECT username, SUM(data_used) as total 
FROM sessions 
WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY username;
```

## RADIUS Attributes

Supported RADIUS attributes:
- `User-Name` - Username
- `User-Password` - Password (encrypted)
- `NAS-IP-Address` - Network device IP
- `NAS-Port` - Port number
- `Service-Type` - Framed User
- `Framed-IP-Address` - User IP
- `Session-Timeout` - Max session duration
- `Acct-Input/Output-Octets` - Data usage
- `Gigawords` - Large byte counters (>4GB)

## MikroTik Commands

Common bandwidth operations:
```php
// Add user with limits
$mikrotik->addPPPoEUser('user', 'pass', 5000000, 2500000);

// Apply bandwidth limit
$mikrotik->setBandwidthLimit('user', 5000000, 2500000);

// Block/unblock user
$mikrotik->blockUser('user');
$mikrotik->unblockUser('user');

// Get active sessions
$sessions = $mikrotik->getActiveSessions();
```

## Troubleshooting

### 502 Bad Gateway
Check PHP-FPM:
```bash
systemctl restart php8.3-fpm
tail -f /var/log/php8.3-fpm.log
```

### Rate Limiting Not Working
Check middleware registration and Redis:
```bash
redis-cli ping  # Should return PONG
redis-cli keys "*rate*"  # Check rate limit keys
```

### Audit Logs Not Saving
Check AuditLog model and table:
```bash
php artisan tinker
>>> DB::table('audit_logs')->count();
```

### HTTPS Not Working
Check SSL certificate:
```bash
openssl x509 -in /etc/ssl/certs/rightnet.crt -text -noout
```

## Performance Tips

1. **Enable Redis caching** - Speeds up session/cache lookups
2. **Use database indexes** - Add indexes to frequently queried columns
3. **Compress assets** - Gzip CSS/JS responses
4. **Cache static files** - Set 1-year expiration
5. **Optimize queries** - Use eager loading (with())
6. **Enable OPCache** - PHP opcode caching

## Security Checklist

- [ ] HTTPS enabled in production
- [ ] Rate limiting configured
- [ ] Audit logging enabled
- [ ] Strong passwords enforced
- [ ] SSL certificates renewed
- [ ] Firewall rules in place
- [ ] Backups scheduled
- [ ] Security headers verified
- [ ] SQL injection tests done
- [ ] Penetration testing completed

## Useful Commands

```bash
# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate

# Clear cache
php artisan cache:clear

# Clear config
php artisan config:clear

# Optimize autoloader
composer dump-autoload -o

# Build frontend
npm run build

# Check routes
php artisan route:list

# Monitor queue
php artisan queue:work

# Schedule test
php artisan schedule:work
```

## Documentation Links

- [SECURITY.md](./SECURITY.md) - Full security guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions
- [README.md](./README.md) - Project overview
- [API Documentation](./docs/API.md) - API reference

## Support

For issues, see SECURITY.md and DEPLOYMENT.md troubleshooting sections.
