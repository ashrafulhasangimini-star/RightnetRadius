# ============================================
# FreeRADIUS Configuration Files
# ইনস্টলেশন পথ (Windows): C:\Program Files\FreeRADIUS\etc\raddb\
# ইনস্টলেশন পথ (Linux): /etc/freeradius/3.0/
# ============================================

## FILE 1: radiusd.conf (মূল কনফিগারেশন ফাইল)
## Windows: C:\Program Files\FreeRADIUS\etc\raddb\radiusd.conf
## Linux: /etc/freeradius/3.0/radiusd.conf

---BEGIN radiusd.conf---

# নেটওয়ার্ক সেটিংস
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

# সার্ভার সেটিংস
max_request_time = 30
cleanup_delay = 5
max_requests = 4096
hostname_lookups = no
log_stripped_names = no

# সিকিউরিটি
security {
    max_attributes = 200
    reject_delay = 1
    status_server = yes
}

# লগিং
log {
    destination = files
    file = ${logdir}/radius.log
    syslog_facility = daemon
    stripped_names = no
    auth = yes
    auth_badpass = yes
    auth_goodpass = no
}

---END radiusd.conf---

---

## FILE 2: clients.conf (NAS ক্লায়েন্ট কনফিগ)
## Windows: C:\Program Files\FreeRADIUS\etc\raddb\clients.conf
## Linux: /etc/freeradius/3.0/clients.conf

---BEGIN clients.conf---

# ডিফল্ট ক্লায়েন্ট (localhost টেস্টিং)
client 127.0.0.1 {
    secret = testing123
    shortname = localhost
}

# RouterOS / MikroTik - প্রধান রাউটার
client 192.168.1.1 {
    secret = mikrotik_shared_secret_123456
    shortname = mikrotik-main
    description = "Main RouterOS Gateway"
    require_message_authenticator = no
    nastype = mikrotik
}

# WiFi Access Point (Ubiquiti UniFi)
client 192.168.1.50 {
    secret = ubiquiti_shared_secret_654321
    shortname = ubiquiti-ap-1
    description = "UniFi Access Point 1"
    nastype = ubiquiti
}

# WiFi Access Point 2
client 192.168.1.51 {
    secret = ubiquiti_shared_secret_654321
    shortname = ubiquiti-ap-2
    description = "UniFi Access Point 2"
}

# Cisco সুইচ (যদি থাকে)
client 192.168.1.100 {
    secret = cisco_shared_secret_789012
    shortname = cisco-switch
    description = "Cisco Network Switch"
    nastype = cisco
}

# Generic নেটওয়ার্ক ডিভাইস
client 192.168.1.0/24 {
    secret = default_shared_secret_xyz
    shortname = generic-devices
    description = "Generic network devices"
}

---END clients.conf---

---

## FILE 3: users ফাইল (ইউজার ক্রেডেনশিয়াল)
## Windows: C:\Program Files\FreeRADIUS\etc\raddb\users
## Linux: /etc/freeradius/3.0/users
## নোট: এটি Laravel ডাটাবেস থেকে স্বয়ংক্রিয়ভাবে তৈরি হয়

---BEGIN users---

# সাধারণ ইউজার - পাসওয়ার্ড ক্লিয়ারটেক্সট
user1 Cleartext-Password := "password123"
    Service-Type = Framed-User,
    Framed-Protocol = PPP,
    Framed-Compression = Van-Jacobson-TCP-IP,
    Framed-MTU = 1500

user2 Cleartext-Password := "password456"
    Service-Type = Framed-User,
    Framed-Protocol = PPP,
    Session-Timeout = 3600

user3 Cleartext-Password := "password789"
    Service-Type = Framed-User,
    Framed-Protocol = PPP

# প্রিমিয়াম ব্যবহারকারী - উচ্চ ব্যান্ডউইথ
premium_user Cleartext-Password := "premium_pass_123"
    Service-Type = Framed-User,
    Framed-Protocol = PPP,
    Framed-Route = "0.0.0.0/0",
    Session-Timeout = 7200,
    Idle-Timeout = 600

# এন্টারপ্রাইজ ইউজার
enterprise_user Cleartext-Password := "enterprise_pass_123"
    Service-Type = Framed-User,
    Framed-Protocol = PPP,
    Framed-Route = "10.0.0.0/8",
    Session-Timeout = 86400

# বেস্ড ব্যান্ডউইথ লিমিট সহ
limited_user Cleartext-Password := "limited_pass_123"
    Service-Type = Framed-User,
    Framed-Protocol = PPP,
    Framed-IP-Netmask = 255.255.255.0

---END users---

---

## FILE 4: mods-available/sql (ডাটাবেস ইন্টিগ্রেশন)
## Windows: C:\Program Files\FreeRADIUS\etc\raddb\mods-available\sql
## Linux: /etc/freeradius/3.0/mods-available/sql

---BEGIN sql config---

# SQLite কনফিগারেশন
sql {
    driver = rlm_sql_sqlite
    sqlite {
        filename = /path/to/database.sqlite
        busy_timeout = 200
        raid = no
    }
    
    connection_pool {
        start = 5
        min = 3
        max = 10
        spare = 3
        lifetime = 600
        idle_timeout = 60
    }

    # SQL Queries (ডাটাবেস কোয়েরি)
    authorize_check_query = "SELECT id, username, attribute, value FROM radius_check WHERE username = '%{SQL-User-Name}' ORDER BY id"
    authorize_reply_query = "SELECT id, username, attribute, value FROM radius_reply WHERE username = '%{SQL-User-Name}' ORDER BY id"
    
    accounting_onoff_query = "INSERT INTO radius_accounting (acct_session_id, username, nas_ip, acct_status_type, created_at) VALUES ('%{Acct-Session-Id}', '%{User-Name}', '%{NAS-IP-Address}', '%{Acct-Status-Type}', NOW())"
    
    accounting_start_query = "INSERT INTO radius_accounting (acct_session_id, username, nas_ip, nas_port, framed_ip, mac_address, acct_status_type, acct_start_time, created_at) VALUES ('%{Acct-Session-Id}', '%{User-Name}', '%{NAS-IP-Address}', %{NAS-Port}, '%{Framed-IP-Address}', '%{Calling-Station-Id}', 'Start', NOW(), NOW())"
    
    accounting_update_query = "UPDATE radius_accounting SET acct_input_octets = %{Acct-Input-Octets}, acct_output_octets = %{Acct-Output-Octets}, acct_session_time = %{Acct-Session-Time} WHERE acct_session_id = '%{Acct-Session-Id}'"
    
    accounting_stop_query = "UPDATE radius_accounting SET acct_status_type = 'Stop', acct_output_octets = %{Acct-Output-Octets}, acct_input_octets = %{Acct-Input-Octets}, acct_session_time = %{Acct-Session-Time}, acct_stop_time = NOW(), terminate_cause = '%{Acct-Terminate-Cause}' WHERE acct_session_id = '%{Acct-Session-Id}'"
}

---END sql config---

---

## FILE 5: radiusd.conf এ শামিল করার মডিউল

# Default site (/etc/freeradius/3.0/sites-enabled/default) এ যোগ করুন:

authorize {
    preprocess
    auth_log
    files
    # SQL থেকে চেক করুন
    sql
}

authenticate {
    Auth-Type PAP {
        pap
    }
    Auth-Type CHAP {
        chap
    }
}

accounting {
    # SQL এ রেকর্ড করুন
    sql
    detail
}

---

## ইনস্টলেশন নির্দেশাবলী

### Windows এ:
1. FreeRADIUS ডাউনলোড করুন: https://freeradius.org/download/
2. ইনস্টল করুন: C:\Program Files\FreeRADIUS\
3. উপরের ফাইল গুলো কপি করুন: C:\Program Files\FreeRADIUS\etc\raddb\
4. Command Prompt খুলুন এবং চালান:
   cd "C:\Program Files\FreeRADIUS\bin"
   radiusd.exe -X (ডিবাগ মোডে)

### Linux এ:
1. ইনস্টল করুন: sudo apt-get install freeradius freeradius-mysql
2. কনফিগ কপি করুন: /etc/freeradius/3.0/
3. চালান: sudo systemctl start freeradius
4. স্ট্যাটাস চেক: sudo systemctl status freeradius

## টেস্টিং

### RADIUS অথেন্টিকেশন টেস্ট (radtest ব্যবহার করে):
```bash
radtest user1 password123 127.0.0.1 0 testing123
```

প্রত্যাশিত আউটপুট:
```
Sent Access-Request Id 123 from 127.0.0.1:xxxxx to 127.0.0.1:1812
    User-Name = "user1"
    User-Password = "password123"
    NAS-IP-Address = 127.0.0.1

Received Access-Accept Id 123 from 127.0.0.1:1812
    Service-Type = Framed-User
    Framed-Protocol = PPP
```

## নিরাপত্তা পরামর্শ

⚠️ গুরুত্বপূর্ণ:
1. Shared Secret খুবই শক্তিশালী রাখুন (কমপক্ষে 32 অক্ষর)
2. প্রতিটি NAS এর জন্য ভিন্ন সিক্রেট ব্যবহার করুন
3. পাসওয়ার্ড MD5 বা SHA এ এনক্রিপ্ট করুন (প্লেইন টেক্সট নয়)
4. ফায়ারওয়াল কনফিগ করুন - শুধুমাত্র প্রয়োজনীয় NAS এর জন্য অ্যাক্সেস দিন
5. নিয়মিত লগ পরীক্ষা করুন
6. ইউজার ক্রেডেনশিয়াল অডিট করুন

## কর্মক্ষমতা টিউনিং

- connection_pool_size বৃদ্ধি করুন বেশি ইউজারের জন্য
- busy_timeout বৃদ্ধি করুন উচ্চ লোডের জন্য
- ক্যাশ এনেবল করুন দ্রুত প্রতিক্রিয়ার জন্য
- log_file রোটেশন সেটআপ করুন (logrotate)
