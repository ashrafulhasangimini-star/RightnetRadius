# RightnetRadius - ISP Management System
# Architecture & Implementation Guide

## Project Overview

RightnetRadius is a **production-ready ISP management system** built with Laravel, designed to work seamlessly with FreeRADIUS and MikroTik RouterOS.

### Core Components

```
┌─────────────────────────────────────────────────────┐
│          Admin Panel & User Portal                   │
│     (Laravel Blade + Tailwind + Alpine.js)          │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│    REST API Layer (Sanctum Token Auth)              │
│  (/api/users, /api/sessions, /api/invoices, etc)   │
└─────────────────────────────────────────────────────┘
                        ↓
┌──────────────┬──────────────┬──────────────────────┐
│   Services   │  Repositories│  Middleware          │
│              │              │                      │
│ • RADIUS     │ • User       │ • Admin Auth        │
│ • MikroTik   │ • Package    │ • User Auth         │
│ • Billing    │ • Session    │ • Rate Limiting     │
│ • Provision  │ • Invoice    │                      │
└──────────────┴──────────────┴──────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│        Database Layer (Eloquent ORM)                 │
│                                                      │
│  App DB (Users, Packages, Billing)                  │
│  RADIUS DB (Direct RADIUS tables)                   │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────┬──────────────┬──────────────────────┐
│  FreeRADIUS  │  MikroTik    │  Background Jobs     │
│              │  RouterOS    │  (Scheduled)         │
│ • radcheck   │ • API        │                      │
│ • radusergrp │ • Profiles   │ • Expire users       │
│ • radacct    │ • Sessions   │ • Sync accounting    │
│ • radreply   │              │ • Generate invoices  │
└──────────────┴──────────────┴──────────────────────┘
```

---

## Database Architecture

### Primary Application Database

#### Users Table
Stores ISP subscriber information with RADIUS sync status.

```sql
users
├── id (PK)
├── username (unique) → RADIUS sync
├── email
├── phone
├── package_id (FK)
├── status (active|suspended|expired|disabled)
├── expires_at
├── mac_address
├── ip_address
├── balance (prepaid balance)
├── notes
├── reseller_id (FK) → Multi-reseller support
├── created_by (FK) → Audit trail
└── timestamps + soft_delete
```

#### Sessions Table
Real-time session tracking from FreeRADIUS and MikroTik.

```sql
sessions
├── id (PK)
├── user_id (FK)
├── unique_id (from RADIUS)
├── nas_ip_address (NAS server)
├── framed_ip_address (user's IP)
├── status (online|offline)
├── started_at
├── expires_at
├── input_octets (download)
├── output_octets (upload)
└── session_timeout
```

#### Invoices & Transactions
Comprehensive billing system.

```sql
invoices
├── id (PK)
├── user_id (FK)
├── invoice_number (unique)
├── amount
├── status (draft|pending|paid|cancelled)
├── issued_at, due_at, paid_at
├── package_id (FK)
├── period_start, period_end
└── notes

transactions
├── id (PK)
├── user_id (FK)
├── transaction_number (unique)
├── amount
├── type (credit|debit|refund|adjustment)
├── status (pending|completed|failed)
├── method (cash|bank|mobile|invoice)
├── reference
└── description
```

### Secondary RADIUS Database (Direct Access)

The system directly manages FreeRADIUS tables:

```sql
radcheck           → User authentication
radusergroup       → Group assignments
radgroupcheck      → Group attributes (bandwidth, timeout)
radgroupreply      → Group reply attributes
radacct            → Accounting records (read-only)
radpostauth        → Post-auth logs
```

---

## Service Layer Architecture

### 1. RadiusService
**Purpose**: Manage user authentication and accounting with FreeRADIUS.

```php
// Sync user to RADIUS
$radiusService->syncUser($user);

// Disable authentication for suspended users
$radiusService->disableUser($username);

// Remove user completely
$radiusService->removeUser($username);

// Sync accounting records from RADIUS
$radiusService->syncAccounting();
```

**Key Operations**:
- Create radcheck entries with hashed passwords
- Assign users to groups with bandwidth limits
- Set session timeouts and interim intervals
- Retrieve and sync accounting data

### 2. MikroTikService
**Purpose**: Direct API control of RouterOS for PPPoE and Hotspot.

```php
// Add PPPoE user
$mikrotikService->addPppoeUser($username, $password);

// Disconnect active session
$mikrotikService->disconnectUser($username);

// Get all active PPPoE sessions
$sessions = $mikrotikService->getActiveSessions();

// Check connection status
$isConnected = $mikrotikService->isConnected();
```

**Key Operations**:
- Add/remove PPPoE and Hotspot users
- Real-time session management
- Bandwidth limiting at queue level
- Active session monitoring

### 3. BillingService
**Purpose**: Automated billing, invoicing, and subscription management.

```php
// Generate monthly invoice
$billingService->generateInvoice($user, $start, $end);

// Process payment and auto-apply to invoices
$transaction = $billingService->processPayment($user, $amount);

// Auto-renew if balance available
$billingService->checkAndAutoRenew($user);

// Renew subscription manually
$billingService->renewSubscription($user, $days);

// Disable all expired users
$billingService->disableExpiredUsers();

// Apply FUP limits
$billingService->applyFupLimits($user);
```

**Key Features**:
- Monthly/yearly invoicing
- Multi-payment method support
- Automatic invoice payment from balance
- Subscription renewal logic
- FUP (Fair Usage Policy) enforcement

### 4. UserProvisioningService
**Purpose**: Complete user lifecycle management with multi-service sync.

```php
// Create user with RADIUS and MikroTik sync
$user = $provisioningService->createUser($data);

// Update with automatic service sync
$provisioningService->updateUser($user, $changes);

// Delete user from all services
$provisioningService->deleteUser($user);

// Add device binding
$provisioningService->addMacIpBinding($user, $mac, $ip);

// Bulk user creation
$users = $provisioningService->bulkCreateUsers($dataArray);
```

---

## User Authentication Flow

### Admin/Staff Login
```
1. POST /login (email + password)
   ↓
2. Verify credentials in admin_users table
   ↓
3. Generate Sanctum token
   ↓
4. Redirect to admin.dashboard
   ↓
5. All requests validated via AdminMiddleware
```

### ISP User Access
```
1. POST /api/login (username + password)
   ↓
2. Verify in users table + check status
   ↓
3. Generate API token (Sanctum)
   ↓
4. User can access portal at /user/dashboard
   ↓
5. Requests validated via UserMiddleware
```

---

## Billing Workflow

### Monthly Billing Cycle

```
Month Start (Day 1)
    ↓
[00:00] Generate invoices for active users
    ↓
User status checked (active, expired, suspended)
    ↓
If status = active:
    → Create invoice with amount = package.price
    → Set due_date = today + invoice_due_days
    → Mark status = 'pending'
    ↓
Payment received
    ↓
Auto-apply to oldest pending invoice
    ↓
If user.balance > 0:
    → Auto-renew subscription
    → Update expires_at
    → Sync changes to RADIUS
    ↓
Month End
    ↓
[23:59] Disable expired users
    → Update status = 'expired'
    → Sync disable to RADIUS
    → Disconnect from MikroTik
```

### FUP (Fair Usage Policy) Workflow

```
If package.fup_limit > 0:
    ↓
Monthly usage tracking
    ↓
Start of month:
    → Reset counter
    → Monitor usage in real-time
    ↓
When usage >= fup_limit:
    → Apply reduced speed (10% of limit)
    → Log FUP event
    → Notify user (optional)
    ↓
Reduced speed applied until:
    → Next billing cycle starts, OR
    → User renews package
```

---

## API Architecture

### Authentication Flow
```
POST /api/login
    ↓
Response: { token: "abc123...", user: {...} }
    ↓
Include in subsequent requests:
    Header: Authorization: Bearer abc123...
    ↓
Sanctum validates token and returns user
```

### Resource Endpoints

#### Users
```
GET    /api/users              → List all users
GET    /api/users/{id}         → Get user details
POST   /api/users              → Create user
PUT    /api/users/{id}         → Update user
DELETE /api/users/{id}         → Delete user
```

#### Sessions & Usage
```
GET    /api/sessions           → User's sessions
GET    /api/usage              → Detailed usage
GET    /api/usage/summary      → Monthly summary
```

#### Billing
```
GET    /api/invoices           → User's invoices
GET    /api/invoices/{id}      → Invoice details
POST   /api/transactions       → Record payment
GET    /api/transactions       → Payment history
```

---

## Console Commands (Background Jobs)

### Scheduled Commands

```php
// app/Console/Kernel.php
$schedule->command('isp:disable-expired-users')
    ->hourly();
    
$schedule->command('isp:sync-radius-accounting')
    ->everyFiveMinutes();
    
$schedule->command('isp:sync-mikrotik-sessions')
    ->everyFiveMinutes();
    
$schedule->command('isp:generate-invoices')
    ->monthlyOn(1, '00:00');
```

### Manual Execution

```bash
php artisan isp:disable-expired-users
php artisan isp:sync-radius-accounting
php artisan isp:sync-mikrotik-sessions
php artisan isp:generate-invoices
```

---

## Role-Based Access Control

### Roles

| Role | Capabilities |
|------|-------------|
| **admin** | Full system access, user management, billing, reports |
| **reseller** | Manage own users, view reports (limited) |
| **support** | View users, troubleshoot, limited modifications |
| **user** | View own account, usage, invoices, make payments |

### Authorization Middleware

```php
// Admin routes
Route::middleware(['auth:sanctum', 'admin'])->group(...)

// User routes
Route::middleware(['auth:sanctum', 'user'])->group(...)
```

---

## Error Handling & Logging

### Log Channels

- **single**: Default file logging
- **daily**: Rotated daily logs
- **slack**: Integration with Slack (optional)

### Logged Events

```
- User creation/modification/deletion
- RADIUS sync successes/failures
- MikroTik connections/errors
- Payment processing
- Invoice generation
- Expiry events
- Admin actions (audit trail)
```

---

## Security Considerations

### Database Security
- Use strong passwords for database users
- Restrict database IP access
- Enable SSL for database connections
- Regular backups with encryption

### RADIUS Security
- Use bcrypt password hashing
- Separate RADIUS database user account
- Regular RADIUS server updates
- Monitor radpostauth for failed logins

### MikroTik Security
- Use strong admin credentials
- Enable API-only user with limited permissions
- Use SSL for API (port 8729)
- Monitor active connections

### Application Security
- Enable HTTPS only in production
- Set secure session cookies
- CSRF token protection
- Rate limiting on API
- Input validation on all endpoints
- SQL injection prevention (Eloquent ORM)

---

## Performance Optimization

### Caching
- Query result caching
- Session data in Redis/database
- Package information cached

### Database
- Indexes on frequently queried columns
- Efficient queries with eager loading
- Connection pooling

### API
- Pagination for large datasets
- Rate limiting per user
- Response compression

---

## Deployment Considerations

### Required Services
- PHP 8.2+
- MySQL/MariaDB 5.7+
- FreeRADIUS (with MySQL)
- MikroTik RouterOS (or simulation)
- Redis (optional, for caching)

### Web Server
- Nginx or Apache
- SSL/TLS certificate
- Proper document root: `/public`

### Environment Variables
All sensitive configuration in `.env`:
```
DB_* (application database)
RADIUS_DB_* (RADIUS database)
MIKROTIK_API_* (RouterOS API)
MAIL_* (email notifications)
APP_KEY (encryption key)
```

---

## File Structure Reference

```
RightnetRadius/
├── app/
│   ├── Models/                 # Eloquent models
│   │   ├── User.php
│   │   ├── Package.php
│   │   ├── Session.php
│   │   ├── Invoice.php
│   │   ├── Transaction.php
│   │   └── ...
│   ├── Services/               # Business logic
│   │   ├── RadiusService.php
│   │   ├── MikroTikService.php
│   │   ├── BillingService.php
│   │   └── UserProvisioningService.php
│   ├── Repositories/           # Data access
│   │   └── UserRepository.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/         # Admin panel controllers
│   │   │   ├── User/          # User portal controllers
│   │   │   └── Api/           # REST API controllers
│   │   ├── Middleware/        # Auth & custom middleware
│   │   └── Requests/          # Form request validation
│   └── Console/
│       └── Commands/          # Artisan commands
├── routes/
│   ├── admin.php              # Admin routes
│   ├── user.php               # User portal routes
│   └── api.php                # REST API routes
├── database/
│   ├── migrations/            # Schema definitions
│   └── seeders/              # Demo data
├── resources/
│   └── views/
│       ├── admin/            # Admin templates
│       ├── user/             # User portal templates
│       └── layouts/          # Shared layouts
├── config/
│   ├── radius.php            # RADIUS config
│   ├── mikrotik.php          # MikroTik config
│   └── isp.php               # Business settings
├── storage/                  # Logs, uploads
├── .env.example             # Configuration template
├── composer.json            # PHP dependencies
└── README.md               # Project info
```

---

## Quick Reference: Service Integration

### Creating a User

```php
// Controller
$user = (new UserProvisioningService())->createUser([
    'username' => 'user1',
    'email' => 'user@example.com',
    'package_id' => 1,
    'expires_at' => now()->addDays(30),
]);

// What happens automatically:
// 1. User created in database
// 2. Synced to FreeRADIUS (radcheck, radusergroup)
// 3. Synced to MikroTik (PPPoE/Hotspot)
// 4. Audit log created
// 5. If reseller: linked to reseller
```

### Processing a Payment

```php
// User pays 500 BDT
$transaction = (new BillingService())->processPayment(
    $user,
    500,
    'cash',
    'reference_number'
);

// What happens automatically:
// 1. Transaction record created
// 2. User balance increased
// 3. Oldest pending invoice auto-paid
// 4. If balance > renewal cost: auto-renew
// 5. RADIUS synced with new expiry
```

---

**Version**: 1.0.0 | **Last Updated**: January 2026
