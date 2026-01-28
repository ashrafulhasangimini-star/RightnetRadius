# 🔐 RightnetRadius - Default Login Credentials

## Admin Access

### Web Dashboard Admin
```
Email/Username: admin@rightnet.local
Password: admin123
Role: admin
```

**Admin Capabilities:**
- Full system access
- User management
- Package management
- Billing management
- RADIUS configuration
- Audit logs
- Reports and analytics

---

## Customer/User Access

### Test User 1 (Basic Package)
```
Username: user1
Email: user1@example.com
Package: Basic (2 Mbps)
```

### Test User 2 (Standard Package)
```
Username: user2
Email: user2@example.com
Package: Standard (5 Mbps)
```

### Test User 3 (Premium Package)
```
Username: user3
Email: user3@example.com
Package: Premium (10 Mbps)
```

**Customer Capabilities:**
- View personal usage
- Check bandwidth stats
- View package details
- See billing history

---

## RADIUS Authentication

For RADIUS server authentication, users authenticate with:
```
Username: user1 (or user2, user3)
Password: Set via admin panel
```

---

## Creating New Users

### Via Laravel Tinker:
```bash
php artisan tinker
```

```php
use App\Models\AuthUser;

// Create admin
AuthUser::create([
    'name' => 'New Admin',
    'email' => 'newadmin@example.com',
    'password' => bcrypt('password123'),
    'role' => 'admin',
    'status' => 'active'
]);

// Create customer
AuthUser::create([
    'name' => 'Customer Name',
    'email' => 'customer@example.com',
    'password' => bcrypt('password123'),
    'role' => 'customer',
    'status' => 'active'
]);
```

### Via Database Seeder:
```bash
php artisan db:seed --class=AdminUserSeeder
```

### Via Admin Panel:
1. Login as admin
2. Go to Users section
3. Click "Add New User"
4. Fill in details
5. Submit

---

## Reset Password

### Via Tinker:
```bash
php artisan tinker
```

```php
$user = App\Models\AuthUser::where('email', 'admin@rightnet.local')->first();
$user->password = bcrypt('newpassword');
$user->save();
```

### Via Command Line:
```bash
php artisan user:reset-password admin@rightnet.local
```

---

## Security Notes

⚠️ **IMPORTANT FOR PRODUCTION:**

1. **Change default passwords immediately**
2. **Use strong passwords** (min 12 characters, mixed case, numbers, symbols)
3. **Enable two-factor authentication** (if implemented)
4. **Limit admin access** to trusted IPs only
5. **Regular password rotation** policy
6. **Monitor login attempts** via audit logs

### Recommended Password Policy:
- Minimum length: 12 characters
- Must include: uppercase, lowercase, numbers, special characters
- No common words or patterns
- Change every 90 days

---

## Testing Access

### Simple Frontend Test (No API):
```
Username: admin → Shows Admin Dashboard
Username: (anything else) → Shows Customer Dashboard
Password: (anything) → Accepts all
```

### With Backend API:
```
Must use credentials from database
Authentication via /api/auth/login
Requires valid token for protected routes
```

---

## Database Tables

### Users Table (auth_users):
- **id**: Primary key
- **name**: Full name
- **email**: Email address (unique)
- **password**: Hashed password
- **role**: admin/customer
- **status**: active/inactive
- **created_at**: Registration date

### RADIUS Users Table (users):
- **id**: Primary key
- **username**: RADIUS username (unique)
- **email**: Email address
- **package_id**: Foreign key to packages
- **status**: active/inactive/suspended
- **expires_at**: Subscription expiry

---

## Support

For password reset or account issues:
1. Contact system administrator
2. Use password reset feature
3. Check audit logs for login attempts
4. Verify email in database

---

**Last Updated:** January 2025
**System:** RightnetRadius ISP Management
