# FreeRADIUS Integration Setup Guide

## আমাদের সিস্টেমে FreeRADIUS ইন্টিগ্রেশন

### সিস্টেম আর্কিটেকচার
```
┌──────────────┐
│  RouterOS    │ (NAS Client)
│ MikroTik     │─────┐
└──────────────┘     │
                     │ RADIUS Protocol
┌──────────────┐     │ (Port 1812, 1813)
│  Wifi Users  │─────┤
└──────────────┘     │
                     │
                     ▼
            ┌─────────────────┐
            │  FreeRADIUS     │
            │  Server         │ (Port 1812/1813)
            │  (Listening)    │
            └─────────────────┘
                     ▲
                     │ SQL Queries
                     │
            ┌─────────────────┐
            │  Laravel API    │
            │  + SQLite       │
            │  (Credentials)  │
            └─────────────────┘
```

## ইনস্টলেশন ধাপ

### 1. FreeRADIUS ডাউনলোড এবং ইনস্টল (Windows)

```powershell
# Windows এর জন্য FreeRADIUS বিন্যাসিত ডাউনলোড করুন
# https://freeradius.org/download/

# অথবা Chocolatey ব্যবহার করুন:
choco install freeradius-server
```

### 2. কনফিগারেশন ফাইল লোকেশন
- Windows: `C:\Program Files\FreeRADIUS\etc\raddb\`
- Linux: `/etc/freeradius/3.0/`

### 3. মূল কনফিগারেশন

#### users ফাইল (`raddb/users`)
```
# User credentials
user1 Cleartext-Password := "password"
user2 Cleartext-Password := "password"
user3 Cleartext-Password := "password"
admin Cleartext-Password := "password"
```

#### clients.conf ফাইল (`raddb/clients.conf`)
```
# RouterOS / MikroTik NAS Configuration
client 192.168.1.1 {
    secret = "your_shared_secret"
    shortname = "mikrotik-router"
    description = "Main RouterOS Device"
    require_message_authenticator = no
}

# নতুন NAS যুক্ত করার জন্য টেমপ্লেট
client 192.168.X.X {
    secret = "shared_secret"
    shortname = "nas-name"
}
```

#### radiusd.conf মূল কনফিগ
```
# Default port
port = 1812
port_acct = 1813

# Listen on all interfaces
listen {
    type = auth
    ipaddr = *
    port = 1812
}

listen {
    type = acct
    ipaddr = *
    port = 1813
}
```

## কীভাবে কাজ করে

### ফ্লো ডায়াগ্রাম
```
Step 1: ইউজার সংযুক্ত হতে চায়
         └─> RouterOS / WiFi Access Point
             └─> RADIUS Authentication Request পাঠায়

Step 2: FreeRADIUS সার্ভার রিসিভ করে
         └─> Laravel ডাটাবেস এ ইউজার অনুসন্ধান করে
             └─> ক্রেডেনশিয়াল যাচাই করে

Step 3: সফল হলে
         └─> Access-Accept পাঠায় RouterOS এ
             └─> ইউজার ইন্টারনেট সংযোগ পায়

Step 4: সেশন শুরু
         └─> RouterOS অ্যাকাউন্টিং ডেটা পাঠায়
             └─> FreeRADIUS -> Laravel -> SQLite
                 └─> Bandwidth, Session Time ট্র্যাক হয়
```

## Laravel ইন্টিগ্রেশন

### RadiusConnection.php ক্লাস
```php
class RadiusConnection {
    protected $radiusServer = 'localhost';
    protected $radiusPort = 1812;
    protected $sharedSecret = 'your_secret';
    
    public function authenticate($username, $password) {
        // RADIUS প্যাকেট তৈরি
        // সার্ভারে পাঠানো
        // রেসপন্স পার্স করা
    }
    
    public function accounting($data) {
        // Accounting ডেটা হ্যান্ডেল করা
    }
}
```

## নিরাপত্তা সেটিংস

### Shared Secret
```
- শক্তিশালী র‍্যান্ডম স্ট্রিং ব্যবহার করুন
- ন্যূনতম 32 অক্ষর
- প্রতিটি NAS এর জন্য ভিন্ন রাখুন
```

### ফায়ারওয়াল পোর্টস
```
1812/UDP - Authentication
1813/UDP - Accounting
উভয় পোর্ট খোলা থাকতে হবে RouterOS এর জন্য
```

## টেস্টিং

### RADIUS Test Client (radtest)
```powershell
radtest user1 password 127.0.0.1 0 testing123
```

### Expected Output
```
Sent Access-Request Id 123 from 127.0.0.1:54321 to 127.0.0.1:1812
    User-Name = "user1"
    User-Password = "password"
    NAS-IP-Address = 127.0.0.1

Received Access-Accept Id 123 from 127.0.0.1:1812
```

## Laravel সিডিং

```php
// DatabaseSeeder.php এ যুক্ত করুন

DB::table('users')->insert([
    ['username' => 'user1', 'password' => bcrypt('password')],
    ['username' => 'user2', 'password' => bcrypt('password')],
    ['username' => 'user3', 'password' => bcrypt('password')],
]);

// RADIUS এর জন্য সরল পাসওয়ার্ড স্টোর করুন
DB::table('radius_users')->insert([
    ['username' => 'user1', 'password' => 'password'],
    ['username' => 'user2', 'password' => 'password'],
]);
```

## সমস্যা সমাধান

### সংযোগ প্রত্যাখ্যাত হলে
- Shared Secret সঠিক কিনা চেক করুন
- Firewall পোর্ট খোলা কিনা দেখুন
- NAS IP Address `clients.conf` এ আছে কিনা যাচাই করুন

### অথেন্টিকেশন ব্যর্থ
- ইউজার ক্রেডেনশিয়াল ডাটাবেসে আছে কিনা চেক করুন
- RADIUS লগ দেখুন: `tail -f /var/log/freeradius/radius.log`

## পরবর্তী পদক্ষেপ

1. FreeRADIUS সার্ভার ইনস্টল করুন
2. কনফিগারেশন ফাইল আপডেট করুন
3. Laravel RadiusConnection ক্লাস যুক্ত করুন
4. RouterOS কে RADIUS সার্ভার হিসেবে যুক্ত করুন
5. টেস্ট এবং ডিবাগ করুন
