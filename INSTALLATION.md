# RightnetRadius - ISP Management System

A production-ready ISP management system built with Laravel, featuring FreeRADIUS integration, MikroTik support, and comprehensive billing/accounting.

## Features

- **User Management**: Create, edit, disable users with bulk operations
- **RADIUS Integration**: Real-time sync with FreeRADIUS for authentication and accounting
- **MikroTik API**: Direct control of PPPoE and Hotspot users
- **Billing System**: Invoices, payments, balance management
- **Package Management**: Speed, validity, FUP limits with pricing
- **Usage Tracking**: Real-time session monitoring and data accounting
- **Admin Dashboard**: Online users, revenue, reports, alerts
- **User Portal**: Usage summary, invoices, password change
- **REST API**: Full API for third-party integrations
- **Role-Based Access**: Admin, Reseller, Support roles
- **Audit Logging**: Track all administrative actions

## System Requirements

- PHP 8.2+
- Laravel 11
- MySQL/MariaDB 5.7+
- FreeRADIUS (with MySQL backend)
- MikroTik RouterOS with API enabled
- Composer

## Installation

### 1. Clone and Setup

```bash
git clone https://github.com/yourusername/RightnetRadius.git
cd RightnetRadius
composer install
cp .env.example .env
php artisan key:generate
```

### 2. Database Configuration

Edit `.env` with your database credentials:

```env
# Main application database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=rightnet_radius
DB_USERNAME=root
DB_PASSWORD=

# FreeRADIUS database (can be same or different)
RADIUS_DB_CONNECTION=mysql
RADIUS_DB_HOST=127.0.0.1
RADIUS_DB_DATABASE=radius
RADIUS_DB_USERNAME=radius
RADIUS_DB_PASSWORD=
```

### 3. Run Migrations

```bash
php artisan migrate
```

### 4. Create Admin User

```bash
php artisan tinker
> App\Models\AuthUser::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => Hash::make('password'), 'role' => 'admin', 'status' => 'active'])
```

### 5. Configure Services

Edit `.env` for MikroTik connection:

```env
MIKROTIK_API_HOST=192.168.1.1
MIKROTIK_API_PORT=8728
MIKROTIK_API_USER=admin
MIKROTIK_API_PASSWORD=your_password
MIKROTIK_API_SSL=false
```

### 6. Run Development Server

```bash
php artisan serve
# Access: http://localhost:8000
```

## Architecture Overview

### Directory Structure

```
app/
├── Models/              # Eloquent models
├── Services/            # Business logic (RADIUS, MikroTik, Billing)
├── Repositories/        # Data access layer
├── Http/
│   ├── Controllers/
│   │   ├── Admin/      # Admin panel controllers
│   │   ├── User/       # User portal controllers
│   │   └── Api/        # REST API controllers
│   └── Middleware/     # Authentication, authorization
├── Console/
│   └── Commands/       # Scheduled tasks
└── Exceptions/

database/
├── migrations/         # Schema definitions
└── seeders/           # Data seeders

routes/
├── admin.php           # Admin panel routes
├── user.php            # User portal routes
└── api.php            # REST API routes

resources/views/
├── admin/             # Admin panel Blade templates
├── user/              # User portal Blade templates
└── components/        # Reusable components

config/
├── radius.php         # RADIUS settings
├── mikrotik.php       # MikroTik settings
└── isp.php           # ISP business settings
```

## Key Services

### RadiusService
Handles FreeRADIUS integration:
- User authentication syncing
- Password management
- Group assignments
- Bandwidth limits
- Accounting record retrieval

```php
$radiusService = new RadiusService();
$radiusService->syncUser($user);
$radiusService->disableUser($username);
$radiusService->syncAccounting();
```

### MikroTikService
Direct API integration with RouterOS:
- Add/remove PPPoE users
- Disconnect sessions
- Get active connections
- Monitor usage

```php
$mikrotikService = new MikroTikService();
$mikrotikService->addPppoeUser($username, $password);
$mikrotikService->disconnectUser($username);
$sessions = $mikrotikService->getActiveSessions();
```

### BillingService
Comprehensive billing engine:
- Invoice generation
- Payment processing
- Auto-renewal logic
- FUP limit application
- Expiry and disable automation

```php
$billingService = new BillingService();
$billingService->generateInvoice($user);
$billingService->processPayment($user, 500, 'cash');
$billingService->renewSubscription($user);
$billingService->disableExpiredUsers();
```

### UserProvisioningService
User lifecycle management:
- Create users with RADIUS sync
- Update user details
- Delete users cleanly
- MAC/IP binding management

```php
$provisioningService = new UserProvisioningService();
$user = $provisioningService->createUser($data);
$provisioningService->updateUser($user, $data);
$provisioningService->deleteUser($user);
```

## Database Schema

### Core Tables

- **users**: ISP users with packages and expiry
- **admin_users**: Staff with role-based access
- **packages**: Speed profiles with pricing
- **sessions**: Active and completed user sessions
- **invoices**: Billing records
- **transactions**: Payment history
- **mac_ip_bindings**: Device bindings for users
- **mikrotik_devices**: Connected MikroTik routers
- **audit_logs**: Admin action tracking

## API Endpoints

### Authentication
```
POST   /api/login
POST   /api/register
POST   /api/logout
```

### Users
```
GET    /api/users
GET    /api/users/{id}
POST   /api/users
PUT    /api/users/{id}
DELETE /api/users/{id}
```

### Usage & Sessions
```
GET    /api/sessions
GET    /api/usage
GET    /api/usage/summary
GET    /api/invoices
GET    /api/transactions
POST   /api/transactions
```

### Packages
```
GET    /api/packages
GET    /api/packages/{id}
```

## Scheduled Tasks

Set up cron for automated processes:

```bash
* * * * * cd /path/to/app && php artisan schedule:run >> /dev/null 2>&1
```

Key commands to schedule:

```php
// In app/Console/Kernel.php
$schedule->command('isp:disable-expired-users')->hourly();
$schedule->command('isp:sync-radius-accounting')->everyFiveMinutes();
$schedule->command('isp:sync-mikrotik-sessions')->everyFiveMinutes();
$schedule->command('isp:generate-invoices')->monthlyOn(1, '00:00');
```

## Security Best Practices

1. **Environment Variables**: Store sensitive data in `.env`
2. **Database**: Use strong passwords, restrict IPs
3. **RADIUS**: Hash passwords with bcrypt
4. **API**: Rate limiting and token validation
5. **Admin**: Require strong passwords, 2FA recommended
6. **Audit**: All changes logged automatically
7. **Backups**: Regular database backups required

## Deployment

### Production Checklist

- [ ] Set `APP_DEBUG=false` in `.env`
- [ ] Set `APP_ENV=production`
- [ ] Configure proper database backups
- [ ] Set up SSL/TLS certificates
- [ ] Configure session drivers (database/redis)
- [ ] Enable query caching
- [ ] Set up monitoring and alerts
- [ ] Configure log rotation
- [ ] Regular security updates

### Docker Setup (Optional)

```dockerfile
FROM php:8.2-fpm
RUN docker-php-ext-install pdo pdo_mysql
WORKDIR /app
COPY . .
RUN composer install --no-dev
```

## Troubleshooting

### RADIUS Connection Issues
- Verify FreeRADIUS MySQL credentials
- Check radcheck/radusergroup tables exist
- Review FreeRADIUS logs: `/var/log/freeradius/`

### MikroTik Connection Issues
- Verify API port (usually 8728 or 8729 for SSL)
- Check RouterOS user permissions
- Enable API service in MikroTik WebUI
- Review connection timeout settings

### User Creation Fails
- Check radcheck table for duplicates
- Verify password hashing configuration
- Review app logs: `storage/logs/`

## Development

### Running Tests

```bash
php artisan test
```

### Code Standards

```bash
./vendor/bin/pint
```

### Database Seeding

```bash
php artisan db:seed --class=DatabaseSeeder
```

## Support & Contributing

For issues and feature requests, please use the issue tracker.

## License

This project is licensed under the MIT license.

## Credits

Built as a production ISP management solution with:
- Laravel Framework
- FreeRADIUS
- MikroTik RouterOS API

---

**Version**: 1.0.0  
**Last Updated**: January 2026
