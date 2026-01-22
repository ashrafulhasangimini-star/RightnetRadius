# Production Security Implementation Guide

## Overview
This document covers the production security features implemented in RightnetRadius, including rate limiting, HTTPS/TLS, audit logging, and additional security hardening measures.

## 1. Rate Limiting

### Configuration
Located in `config/security.php`:
```php
'rate_limiting' => [
    'enabled' => env('RATE_LIMITING_ENABLED', true),
    'default_limit' => env('RATE_LIMIT_DEFAULT', 60),
    'default_decay' => env('RATE_LIMIT_DECAY', 1),
    'endpoints' => [
        'radius.authenticate' => ['limit' => 10, 'decay' => 1],
        'sessions.disconnect' => ['limit' => 20, 'decay' => 5],
        'users.update' => ['limit' => 30, 'decay' => 1],
        'api.*' => ['limit' => 100, 'decay' => 1],
    ],
]
```

### Limits Applied
- **Authentication**: 10 requests per minute (protects against brute force)
- **Session Disconnect**: 20 requests per 5 minutes
- **User Updates**: 30 requests per minute
- **General API**: 100 requests per minute

### Implementation
Register middleware in routes:
```php
Route::middleware(['rate-limit'])->group(function () {
    // Your routes
});
```

## 2. HTTPS/TLS Configuration

### Environment Variables
```bash
# .env
ENFORCE_HTTPS=true
SSL_CERT_PATH=/etc/ssl/certs/rightnet.crt
SSL_KEY_PATH=/etc/ssl/private/rightnet.key
HSTS_ENABLED=true
HSTS_MAX_AGE=31536000
HSTS_INCLUDE_SUBDOMAINS=true
HSTS_PRELOAD=false
SECURE_COOKIES=true
COOKIE_HTTP_ONLY=true
COOKIE_SAME_SITE=strict
```

### SSL Certificate Installation

#### Linux/Ubuntu
```bash
# Generate self-signed certificate (development)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/rightnet.key \
  -out /etc/ssl/certs/rightnet.crt

# Production with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d admin.rightnet.local
```

#### Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name admin.rightnet.local;

    ssl_certificate /etc/ssl/certs/rightnet.crt;
    ssl_certificate_key /etc/ssl/private/rightnet.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # ... rest of config
}
```

## 3. Audit Logging

### Features
- **Authentication Tracking**: Logs all auth attempts with success/failure status
- **Admin Action Logging**: Tracks user disconnects, bandwidth changes, package updates
- **Quota Breach Events**: Records when users exceed 80% of quota
- **Session Events**: Logs session start, interim updates, stop events
- **Retention Policy**: Automatic cleanup of logs older than 90 days

### Logged Events
| Event | Action | Details |
|-------|--------|---------|
| Authentication Attempt | AUTH_ATTEMPT | Username, method, IP, status |
| Session Start | SESSION_START | Username, session ID, framed IP |
| Session Stop | SESSION_STOP | Username, reason, data used |
| Quota Breach | QUOTA_BREACH | Username, used %, quota limit |
| Bandwidth Change | BANDWIDTH_CHANGE | Username, old/new limits |
| Package Change | PACKAGE_CHANGE | Username, old/new package ID |
| User Disconnect | USER_DISCONNECT | Username, session ID, reason |

### API Endpoints

#### Get Audit Logs
```bash
GET /api/audit-logs?action=AUTH_ATTEMPT&days=30
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "action": "AUTH_ATTEMPT",
      "resource": "user:rajib",
      "user_id": 1,
      "ip_address": "192.168.1.100",
      "status_code": 200,
      "new_values": "{...}",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {...}
}
```

#### Get Statistics
```bash
GET /api/audit-logs/stats?days=30
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": {
    "total_events": 1250,
    "auth_attempts": 450,
    "failed_auths": 45,
    "admin_actions": 320,
    "quota_breaches": 180,
    "unique_users": 25,
    "unique_ips": 15
  }
}
```

#### Export Logs
```bash
GET /api/audit-logs/export?format=csv&days=30
Authorization: Bearer {token}
```

## 4. Security Middleware

### ApiSecurityMiddleware
Provides:
- HTTPS enforcement in production
- CORS origin validation
- Suspicious request pattern detection

### RateLimitMiddleware
Implements token bucket algorithm with:
- Per-IP rate limiting
- Request signature hashing
- Configurable limits per endpoint

### EncryptionMiddleware
Encrypts sensitive response data for:
- RADIUS authentication responses
- Bandwidth/quota information

## 5. Password Policy

Configuration:
```php
'password_policy' => [
    'min_length' => 12,
    'require_uppercase' => true,
    'require_lowercase' => true,
    'require_numbers' => true,
    'require_special' => true,
    'expiration_days' => 90,
]
```

Requirements for admin users:
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Password expiration every 90 days

## 6. Security Headers

Automatically set on all responses:

| Header | Value | Purpose |
|--------|-------|---------|
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-Frame-Options | DENY | Prevent clickjacking |
| X-XSS-Protection | 1; mode=block | Enable XSS protection |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer info |
| Permissions-Policy | geolocation=(), microphone=(), camera=() | Disable unnecessary APIs |
| Content-Security-Policy | ... | Restrict resource loading |
| Strict-Transport-Security | max-age=31536000;... | Force HTTPS (HSTS) |

## 7. CORS Configuration

Allowed origins (configurable):
```php
'cors_allowed_origins' => [
    'https://admin.rightnet.local',
    'https://portal.rightnet.local',
]
```

Prevent unauthorized frontend access by:
1. Validating Origin header on every request
2. Rejecting requests from unknown origins
3. Logging suspicious CORS violations

## 8. Data Encryption

### Sensitive Data Protection
- **Passwords**: Encrypted with BCRYPT hashing
- **RADIUS Secrets**: Encrypted in database using AES-256-CBC
- **API Keys**: Stored hashed, never logged
- **Session Data**: Encrypted using Laravel's encryption

## 9. JWT Implementation

Configuration:
```php
'jwt' => [
    'secret' => env('JWT_SECRET'),
    'algorithm' => 'HS256',
    'expiration' => 3600, // 1 hour
    'refresh_expiration' => 604800, // 7 days
]
```

Usage:
```php
// Generate token
$token = JWT::encode(['user_id' => 1, 'username' => 'admin'], config('security.jwt.secret'), 'HS256');

// Verify token
$decoded = JWT::decode($token, config('security.jwt.secret'), ['HS256']);
```

## 10. Two-Factor Authentication (Optional)

Enable in configuration:
```php
'two_factor' => [
    'enabled' => env('TWO_FACTOR_ENABLED', true),
    'otp_window' => 1,
    'backup_codes' => 10,
]
```

Implementation:
```php
// Generate OTP secret
$secret = Google2FA::generateSecretKey();

// Verify OTP
$valid = Google2FA::verifyKey($secret, $otp_input);
```

## 11. Audit Log Cleanup

Automatic cleanup runs daily via scheduler:
```php
// Delete logs older than 90 days
$deleted = app('audit')->cleanupOldLogs(90);
```

Configure in `app/Console/Kernel.php`:
```php
$schedule->call(function () {
    app('audit')->cleanupOldLogs(90);
})->daily()->at('02:00');
```

## 12. Testing Security

### Rate Limiting Test
```bash
# This should succeed (1/10 limit)
curl -H "Authorization: Bearer {token}" \
  https://admin.rightnet.local/api/radius/authenticate

# After 10 requests in 1 minute, should return 429
```

### HTTPS Enforcement Test
```bash
# Should redirect to HTTPS
curl -i http://admin.rightnet.local/api/health
# Should return 403 in production
```

### Audit Log Test
```bash
# Log an authentication attempt
curl -X POST -H "Authorization: Bearer {token}" \
  -d "username=testuser&password=testpass" \
  https://admin.rightnet.local/api/radius/authenticate

# Check logs
curl -H "Authorization: Bearer {token}" \
  https://admin.rightnet.local/api/audit-logs/auth-attempts
```

## 13. Monitoring & Alerting

Key metrics to monitor:
- Failed authentication attempts (>5 in 1 minute = alert)
- Rate limit violations (>100 per hour = investigate)
- Quota breaches (>20 in 1 hour = notify admin)
- Admin actions (log all, alert on sensitive changes)
- CORS violations (any rejected origin = log)

## 14. Deployment Checklist

- [ ] Generate SSL certificates
- [ ] Configure Nginx with SSL/TLS
- [ ] Update `.env` with production URLs
- [ ] Set `ENFORCE_HTTPS=true`
- [ ] Enable rate limiting in config
- [ ] Set strong JWT_SECRET
- [ ] Configure allowed CORS origins
- [ ] Verify audit logs table exists
- [ ] Schedule audit log cleanup job
- [ ] Test HTTPS and redirects
- [ ] Test rate limiting
- [ ] Verify security headers in browser DevTools
- [ ] Monitor first 24 hours for errors

## 15. Troubleshooting

### SSL Certificate Issues
```bash
# Test certificate
openssl x509 -in /etc/ssl/certs/rightnet.crt -text -noout

# Verify certificate chain
openssl s_client -connect admin.rightnet.local:443 -servername admin.rightnet.local
```

### Rate Limiting Not Working
- Check middleware is registered in routes
- Verify Redis is running (if using Redis cache)
- Check cache configuration in `.env`

### Audit Logs Not Saving
- Verify AuditLog model exists
- Check audit logs table migration has run
- Verify permissions on storage/logs directory

## References
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Laravel Security Guide](https://laravel.com/docs/security)
- [RFC 2865 - RADIUS Protocol](https://tools.ietf.org/html/rfc2865)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
