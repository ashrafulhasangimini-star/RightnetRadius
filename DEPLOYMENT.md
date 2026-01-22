# RightnetRadius Production Deployment Guide

## Pre-Deployment Checklist

### System Requirements
- [ ] Ubuntu 20.04 LTS or later
- [ ] PHP 8.3+ with extensions: bcmath, ctype, curl, json, mbstring, openssl, pdo, tokenizer, sockets, redis
- [ ] MySQL 8.0 or PostgreSQL 12+
- [ ] Nginx 1.20+
- [ ] Redis 6.0+
- [ ] Node.js 18+ (for frontend build)

### Security Requirements
- [ ] SSL/TLS certificate from Let's Encrypt or CA
- [ ] Strong password policy enforced
- [ ] Firewall rules configured
- [ ] SSH key-based authentication enabled
- [ ] Rate limiting enabled
- [ ] Audit logging configured

## Step 1: Server Setup

### 1.1 Create Application User
```bash
sudo useradd -m -s /bin/bash rightnet
sudo usermod -aG sudo rightnet
sudo su - rightnet
```

### 1.2 Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP and extensions
sudo apt install -y php8.3-fpm php8.3-mysql php8.3-redis \
  php8.3-bcmath php8.3-curl php8.3-json php8.3-mbstring \
  php8.3-openssl php8.3-tokenizer php8.3-sockets

# Install MySQL
sudo apt install -y mysql-server

# Install Redis
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 1.3 Configure PHP-FPM
```bash
# Edit PHP configuration
sudo nano /etc/php/8.3/fpm/php.ini

# Recommended settings:
# memory_limit = 512M
# max_execution_time = 60
# upload_max_filesize = 100M
# post_max_size = 100M
# max_input_vars = 5000

# Restart PHP-FPM
sudo systemctl restart php8.3-fpm
```

### 1.4 Configure MySQL
```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p <<EOF
CREATE DATABASE rightnet_radius CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'radius_user'@'localhost' IDENTIFIED BY 'SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON rightnet_radius.* TO 'radius_user'@'localhost';
FLUSH PRIVILEGES;
EOF
```

## Step 2: Application Deployment

### 2.1 Clone Repository
```bash
cd /var/www
sudo git clone https://github.com/yourusername/RightnetRadius.git rightnet-radius
sudo chown -R rightnet:rightnet rightnet-radius
cd rightnet-radius
```

### 2.2 Install PHP Dependencies
```bash
composer install --no-dev --optimize-autoloader
```

### 2.3 Configure Environment
```bash
# Copy production environment file
cp .env.production .env

# Edit configuration
nano .env
# Update all variables as needed

# Generate application key
php artisan key:generate
```

### 2.4 Setup Database
```bash
# Run migrations
php artisan migrate --force

# Seed initial data (if applicable)
php artisan db:seed

# Create storage directories
mkdir -p storage/logs
mkdir -p storage/cache
chmod -R 775 storage bootstrap/cache
```

### 2.5 Install Frontend Dependencies
```bash
npm ci --production
npm run build
```

## Step 3: Nginx Configuration

### 3.1 SSL Certificate
```bash
# Using Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --standalone -d admin.rightnet.local -d portal.rightnet.local
```

### 3.2 Nginx Virtual Host
```bash
# Create configuration file
sudo nano /etc/nginx/sites-available/rightnet-radius
```

```nginx
# HTTP redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name admin.rightnet.local portal.rightnet.local;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.rightnet.local portal.rightnet.local;
    
    root /var/www/rightnet-radius/public;
    index index.php;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/admin.rightnet.local/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.rightnet.local/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:" always;
    
    # File uploads
    client_max_body_size 100M;
    
    # Logging
    access_log /var/log/nginx/rightnet-radius-access.log;
    error_log /var/log/nginx/rightnet-radius-error.log;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # PHP-FPM
    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
    
    # Front controller
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ /env {
        deny all;
    }
}
```

### 3.3 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/rightnet-radius /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## Step 4: Systemd Services

### 4.1 PHP-FPM Service
```bash
# Already managed by systemd, ensure it's running
sudo systemctl enable php8.3-fpm
sudo systemctl start php8.3-fpm
```

### 4.2 Redis Service
```bash
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### 4.3 Laravel Queue Worker (if using background jobs)
```bash
# Create service file
sudo nano /etc/systemd/system/rightnet-queue.service
```

```ini
[Unit]
Description=RightnetRadius Queue Worker
After=network.target

[Service]
User=rightnet
Group=www-data
WorkingDirectory=/var/www/rightnet-radius
ExecStart=/usr/bin/php /var/www/rightnet-radius/artisan queue:work --queue=default --delay=3 --sleep=3 --tries=3
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable rightnet-queue
sudo systemctl start rightnet-queue
```

### 4.4 Laravel Scheduler
```bash
# Add to crontab
sudo crontab -e -u rightnet
```

```
* * * * * php /var/www/rightnet-radius/artisan schedule:run >> /dev/null 2>&1
```

## Step 5: Firewall Configuration

```bash
# UFW Setup
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow essential ports
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 1812/udp    # RADIUS
sudo ufw allow 1813/udp    # RADIUS Accounting
sudo ufw allow 6001/tcp    # WebSocket (internal only)

# Enable firewall
sudo ufw enable

# Internal network (if needed)
sudo ufw allow from 192.168.1.0/24 to any port 6001
```

## Step 6: Monitoring & Logging

### 6.1 Log Rotation
```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/rightnet-radius
```

```
/var/log/nginx/rightnet-radius-*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}

/var/www/rightnet-radius/storage/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 rightnet rightnet
}
```

### 6.2 Monitoring Services
```bash
# Install Supervisor for process monitoring (optional)
sudo apt install -y supervisor

# Or use systemd-watchdog built-in
# Edit service files:
# WatchdogSec=10
# WatchdogUSec=1000000
```

## Step 7: Backup Strategy

### 7.1 Database Backup
```bash
# Create backup script
nano /home/rightnet/backup-database.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups/rightnet"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="rightnet_radius"

mkdir -p $BACKUP_DIR
mysqldump -u root -p $DB_NAME | gzip > $BACKUP_DIR/db_$TIMESTAMP.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
```

```bash
chmod +x /home/rightnet/backup-database.sh
sudo crontab -e -u rightnet
# 0 2 * * * /home/rightnet/backup-database.sh
```

### 7.2 Application Backup
```bash
nano /home/rightnet/backup-app.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups/rightnet"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/rightnet-radius"

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/app_$TIMESTAMP.tar.gz \
  --exclude=node_modules \
  --exclude=vendor \
  --exclude=.git \
  $APP_DIR

# Keep only last 7 days
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +7 -delete
```

## Step 8: Performance Tuning

### 8.1 Redis Configuration
```bash
sudo nano /etc/redis/redis.conf
```

```
maxmemory 256mb
maxmemory-policy allkeys-lru
save ""              # Disable RDB if using AOF
appendonly yes       # Enable AOF for persistence
```

### 8.2 MySQL Configuration
```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

```
[mysqld]
# Connection pool
max_connections = 200
max_allowed_packet = 64M

# InnoDB tuning
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2

# Query cache
query_cache_size = 0
query_cache_type = 0

# Slow query logging
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow-query.log
long_query_time = 2
```

## Step 9: SSL Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Create renewal service
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Step 10: Post-Deployment Verification

```bash
# Test application
curl -I https://admin.rightnet.local/

# Check security headers
curl -I https://admin.rightnet.local/ | grep -i "security\|cache\|strict"

# Test RADIUS port
echo "test" | nc -u localhost 1812

# Check services
systemctl status php8.3-fpm
systemctl status nginx
systemctl status redis-server
systemctl status mysql

# Check logs
tail -f /var/log/nginx/rightnet-radius-error.log
tail -f /var/www/rightnet-radius/storage/logs/laravel.log
```

## Troubleshooting

### Issue: 502 Bad Gateway
```bash
# Check PHP-FPM socket
ls -la /run/php/php8.3-fpm.sock
# Check PHP-FPM logs
tail -f /var/log/php8.3-fpm.log
```

### Issue: Database Connection Error
```bash
# Test MySQL connection
mysql -u radius_user -p rightnet_radius -h localhost
# Check database credentials in .env
grep DB_ /var/www/rightnet-radius/.env
```

### Issue: Permission Denied
```bash
# Fix permissions
sudo chown -R rightnet:www-data /var/www/rightnet-radius
sudo chmod -R 755 /var/www/rightnet-radius
sudo chmod -R 775 /var/www/rightnet-radius/storage
```

## Maintenance

### Weekly Tasks
- [ ] Check disk usage
- [ ] Review error logs
- [ ] Monitor database size

### Monthly Tasks
- [ ] Update security patches
- [ ] Review audit logs
- [ ] Check backup integrity

### Quarterly Tasks
- [ ] Security audit
- [ ] Performance review
- [ ] Capacity planning

## Support & Documentation
- [Laravel Documentation](https://laravel.com/docs)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [RADIUS Protocol](https://tools.ietf.org/html/rfc2865)
