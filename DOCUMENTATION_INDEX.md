# RightnetRadius Documentation Index

Complete documentation for the production-ready RightnetRadius ISP management system.

## 📋 Quick Navigation

### For Deploying to Production
1. **Start Here:** [PRODUCTION_STATUS_REPORT.md](./PRODUCTION_STATUS_REPORT.md) - Executive summary and completion status
2. **Then Read:** [DEPLOYMENT.md](./DEPLOYMENT.md) - Step-by-step deployment instructions
3. **Reference:** [SECURITY.md](./SECURITY.md) - Security policies and configuration

### For Development
1. **Quick Start:** [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Commands and API endpoints
2. **Security Details:** [SECURITY.md](./SECURITY.md) - Middleware and security features
3. **Implementation:** [SECURITY_IMPLEMENTATION_SUMMARY.md](./SECURITY_IMPLEMENTATION_SUMMARY.md) - What was built

### For System Administration
1. **Deployment:** [DEPLOYMENT.md](./DEPLOYMENT.md) - Server setup and maintenance
2. **Operations:** [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Common tasks and troubleshooting
3. **Monitoring:** See Section 8 of [SECURITY.md](./SECURITY.md)

---

## 📚 Documentation Files

### Core Documentation

#### [PRODUCTION_STATUS_REPORT.md](./PRODUCTION_STATUS_REPORT.md) (3,000+ words)
**Purpose:** Executive overview of all implemented features  
**Contains:**
- Project completion summary
- All 5 major deliverables explained
- 14+ new files created
- 4,370+ lines of code statistics
- Build verification results
- Security checklist (30+ items)
- Performance metrics
- Deployment timeline
- Known limitations and future enhancements

**Read Time:** 15-20 minutes  
**Audience:** Project managers, architects, deployment leads

#### [SECURITY.md](./SECURITY.md) (500+ lines)
**Purpose:** Complete security reference and implementation guide  
**Contains:**
- Rate limiting configuration (token bucket algorithm)
- HTTPS/TLS setup with Nginx examples
- SSL certificate installation and auto-renewal
- Audit logging system and 7 API endpoints
- Security middleware explanation
- Password policy requirements (12 chars, uppercase, numbers, special)
- JWT token strategy (1-hour access, 7-day refresh)
- Two-factor authentication setup
- Security headers documentation (7 critical headers)
- CORS configuration and validation
- Data encryption methods
- Monitoring and alerting guidelines
- Deployment checklist (25 items)
- Troubleshooting guide with solutions

**Read Time:** 20-25 minutes  
**Audience:** Security engineers, DevOps, backend developers

#### [DEPLOYMENT.md](./DEPLOYMENT.md) (600+ lines)
**Purpose:** Production deployment guide with complete instructions  
**Contains:**
- Pre-deployment checklist with system requirements
- Step-by-step server setup (PHP, MySQL, Redis, Nginx)
- SSL certificate setup with Let's Encrypt
- Nginx virtual host configuration with security headers
- Systemd service setup for PHP-FPM, Redis, MySQL
- Firewall configuration (UFW) with all required ports
- Monitoring and log rotation setup
- Database and application backup strategy
- Performance tuning for Redis, MySQL, Nginx
- SSL certificate auto-renewal configuration
- Post-deployment verification checklist
- Troubleshooting common issues
- Maintenance tasks (weekly, monthly, quarterly)
- Support resources and documentation links

**Read Time:** 25-30 minutes  
**Audience:** DevOps engineers, system administrators, IT teams

#### [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (400+ lines)
**Purpose:** Developer quick reference for daily use  
**Contains:**
- Development and production setup commands
- All API endpoints (RADIUS, sessions, audit logs)
- Security configuration environment variables
- Rate limiting defaults and per-endpoint limits
- Audit log action types (8 different events)
- Security headers quick lookup
- Frontend component usage examples
- WebSocket hook usage patterns
- Common tasks with code samples
- Database query examples
- Troubleshooting quick fixes (502, connection, permissions)
- Performance optimization tips
- Useful Laravel commands
- Essential bash commands for monitoring

**Read Time:** 10-15 minutes  
**Audience:** Developers, DevOps, system administrators

#### [SECURITY_IMPLEMENTATION_SUMMARY.md](./SECURITY_IMPLEMENTATION_SUMMARY.md) (300+ lines)
**Purpose:** Summary of all security features implemented  
**Contains:**
- 5 major objectives completed
- 14+ files created with descriptions
- 5 security features (rate limiting, HTTPS/TLS, audit logging, headers, JWT)
- 7 API endpoints added for audit logging
- Build status and verification results
- Technology stack overview
- Key features of each component
- Production readiness checklist
- Next steps for deployment

**Read Time:** 15-20 minutes  
**Audience:** Project leads, technical reviewers, architects

---

## 🔧 Technical Documentation

### Service Architecture

#### RADIUS Authentication Service
**File:** `/app/Services/RadiusClientService.php`

Implements RFC 2865 compliant RADIUS protocol with:
- UDP socket communication (port 1812)
- Access-Request/Response handling
- Accounting Start/Interim/Stop lifecycle
- MD5 password encryption
- 53+ attribute support
- Timeout and retry logic

**Key Methods:**
- `authenticate()` - User authentication
- `accountingStart()` - Session start
- `accountingInterim()` - Bandwidth update
- `accountingStop()` - Session termination

#### MikroTik Integration Service
**File:** `/app/Services/MikroTikService.php`

Manages RouterOS API communication with:
- TCP socket connection (port 8728)
- Queue-based bandwidth limiting
- PPPoE user management
- User block/unblock
- Active session monitoring
- Package limit application

**Key Methods:**
- `connect()` - Establish connection
- `addPPPoEUser()` - Create user with bandwidth
- `setBandwidthLimit()` - Apply speed limits
- `getActiveSessions()` - Monitor connections

#### Audit Logging Service
**File:** `/app/Services/AuditLogService.php`

Comprehensive activity tracking with:
- Authentication attempt logging
- Admin action tracking
- Quota breach notifications
- Session lifecycle events
- 90-day retention policy
- CSV/JSON export functionality

**Key Methods:**
- `logAuthAttempt()` - Log login events
- `logSessionEvent()` - Log user connections
- `logQuotaBreach()` - Log quota events
- `getLogs()` - Query with filtering
- `exportLogs()` - Generate reports

---

## 🎨 Frontend Components

### Chart Components
**File:** `/src/components/BandwidthCharts.jsx`

5 reusable Recharts visualizations:
1. **BandwidthChart** - 24-hour download/upload area chart
2. **TopUsersChart** - Stacked bar chart of top 5 users
3. **QuotaChart** - Pie chart of quota usage
4. **HourlyBandwidthChart** - Line chart with hourly peaks
5. **SessionsChart** - Bar chart by session status

### Audit Log Component
**File:** `/src/components/AuditLogs.jsx`

Complete audit log viewer with:
- 4 tabs (All Logs, Auth, Quota, Admin)
- Real-time filtering and search
- Statistics dashboard
- Event distribution visualization
- CSV/JSON export

### WebSocket Hooks
**File:** `/src/hooks/useWebSocket.js`

5 custom React hooks for real-time updates:
1. **useWebSocketBroadcast()** - Initialize Echo
2. **useSessionUpdates()** - Listen to session events
3. **useBandwidthUpdates()** - Listen to bandwidth events
4. **useQuotaWarnings()** - Listen to notifications
5. **usePollingFallback()** - HTTP polling fallback

---

## 🔒 Security Implementation

### Middleware Stack
**File:** `/app/Http/Middleware/SecurityMiddleware.php`

Four security middleware classes:
1. **RateLimitMiddleware** - Token bucket rate limiting
2. **ApiSecurityMiddleware** - HTTPS enforcement, CORS validation, injection detection
3. **AuditLoggingMiddleware** - Automatic audit trail
4. **EncryptionMiddleware** - Sensitive data encryption

### Security Configuration
**File:** `/config/security.php`

Centralized security settings:
- HTTPS/TLS configuration
- Rate limiting thresholds
- JWT parameters
- Password policy
- CORS allowed origins
- Security header settings

### Audit API Endpoints
**File:** `/app/Http/Controllers/AuditLogController.php`

7 new API endpoints:
- `GET /api/audit-logs` - List logs
- `GET /api/audit-logs/summary/{userId}` - User summary
- `GET /api/audit-logs/export` - Export logs
- `GET /api/audit-logs/auth-attempts` - Auth tracking
- `GET /api/audit-logs/quota-breaches` - Quota events
- `GET /api/audit-logs/admin-actions` - Admin actions
- `GET /api/audit-logs/stats` - System statistics

---

## 🚀 Deployment & Operations

### Environment Configuration
**File:** `/.env.production`

Complete production environment template with:
- All database configuration
- HTTPS/TLS settings
- JWT and security keys
- RADIUS and MikroTik settings
- Redis configuration
- Email and logging setup
- Broadcasting configuration

### Systemd Services

Provided service configurations for:
- PHP-FPM (app server)
- Nginx (web server)
- Redis (cache/session store)
- MySQL (database)
- Laravel Queue Worker (background jobs)
- Laravel Scheduler (cron jobs)

### Backup Strategy

Database backups:
- Daily automated backups via cron
- 30-day retention policy
- Gzip compression

Application backups:
- 7-day retention
- Excludes node_modules and vendor
- Includes all source code and configuration

---

## 📊 Monitoring & Maintenance

### Monitoring Points

**Performance Monitoring:**
- Response time tracking
- Database query performance
- Memory usage
- Disk I/O

**Security Monitoring:**
- Rate limit violations
- Failed authentication attempts
- Quota breaches
- Admin action changes

**System Monitoring:**
- CPU and memory usage
- Disk space availability
- Service status (PHP-FPM, Nginx, MySQL, Redis)
- Network connectivity

### Maintenance Schedule

**Daily:**
- Monitor error logs
- Check service health
- Review audit logs for suspicious activity

**Weekly:**
- Analyze performance metrics
- Review security events
- Check disk usage

**Monthly:**
- Security audit
- Performance optimization
- Dependency updates
- Backup restoration test

**Quarterly:**
- Compliance review
- Capacity planning
- Penetration testing
- Disaster recovery drill

---

## 🆘 Troubleshooting Guide

### Common Issues

**502 Bad Gateway**
- Check PHP-FPM socket: `ls -la /run/php/php8.3-fpm.sock`
- Review PHP-FPM logs: `tail -f /var/log/php8.3-fpm.log`
- Restart PHP-FPM: `systemctl restart php8.3-fpm`

**Database Connection Error**
- Verify MySQL running: `systemctl status mysql`
- Test connection: `mysql -u radius_user -p rightnet_radius`
- Check .env credentials

**Rate Limiting Not Working**
- Verify Redis running: `redis-cli ping`
- Check middleware registration
- Review rate limit cache keys: `redis-cli keys "*rate*"`

**HTTPS Not Working**
- Check certificate exists: `ls -la /etc/ssl/certs/rightnet.crt`
- Verify certificate validity: `openssl x509 -text -noout -in /path/to/cert`
- Review Nginx error log: `tail -f /var/log/nginx/error.log`

See [SECURITY.md](./SECURITY.md) Section 13 for more troubleshooting.

---

## 📈 Performance Optimization

### Database Optimization
- Proper indexing on frequently queried columns
- Query optimization with eager loading
- Connection pooling configuration
- Slow query logging enabled

### Caching Strategy
- Redis for session storage
- Redis for cache storage
- 1-hour default TTL
- Database fallback

### Frontend Optimization
- Gzip compression enabled
- Static asset caching (1 year)
- Lazy loading with dynamic imports
- Minified CSS/JS in production

### API Optimization
- Pagination (50 items/page)
- Field filtering available
- Response compression
- Efficient query design

---

## 📖 Learning Resources

### RADIUS Protocol
- [RFC 2865 - Remote Authentication Dial In User Service](https://tools.ietf.org/html/rfc2865)
- [RADIUS Attributes Reference](https://www.iana.org/assignments/radius-types/)
- [RADIUS Security Best Practices](https://tools.ietf.org/html/rfc2865#section-3)

### RouterOS/MikroTik
- [RouterOS API Documentation](https://wiki.mikrotik.com/wiki/Manual:API)
- [Queue Configuration Guide](https://wiki.mikrotik.com/wiki/Manual:Queue)
- [PPPoE Configuration](https://wiki.mikrotik.com/wiki/Manual:PPPoE)

### Security Best Practices
- [OWASP Top 10 2021](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Laravel Security Best Practices](https://laravel.com/docs/security)
- [Nginx Security Hardening](https://nginx.org/en/docs/http/configuring_https_servers.html)

### Web Standards
- [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [HTTP Strict Transport Security (HSTS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
- [CORS Specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## ✅ Pre-Deployment Checklist

Before deploying to production, verify:

### Server Setup
- [ ] PHP 8.3+ installed with required extensions
- [ ] MySQL 8.0+ configured
- [ ] Redis 6.0+ running
- [ ] Nginx 1.20+ installed

### Application Setup
- [ ] `.env.production` configured with all variables
- [ ] Database migrations run
- [ ] Storage directories with correct permissions
- [ ] Composer and npm dependencies installed

### Security Setup
- [ ] SSL certificate obtained and installed
- [ ] Nginx configured with security headers
- [ ] Firewall rules configured
- [ ] HTTPS redirect working
- [ ] Rate limiting enabled

### Verification
- [ ] Health endpoint responding
- [ ] RADIUS port listening (1812)
- [ ] All services running
- [ ] Error logs clean
- [ ] Security headers present

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete checklist.

---

## 📞 Support & Contact

### Documentation Resources
1. **Security Questions:** See [SECURITY.md](./SECURITY.md)
2. **Deployment Issues:** See [DEPLOYMENT.md](./DEPLOYMENT.md)
3. **Quick Help:** See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
4. **Project Status:** See [PRODUCTION_STATUS_REPORT.md](./PRODUCTION_STATUS_REPORT.md)

### External Resources
- Laravel Documentation: https://laravel.com/docs
- Nginx Documentation: https://nginx.org/en/docs/
- MySQL Documentation: https://dev.mysql.com/doc/
- Redis Documentation: https://redis.io/documentation

---

## 📝 Document History

| Date | Version | Status | Changes |
|------|---------|--------|---------|
| Jan 2024 | 2.0 | Production Ready | Complete security implementation, audit logging, HTTPS/TLS, rate limiting |
| - | 1.0 | Development | Initial RADIUS and MikroTik integration |

---

## 📄 License & Credits

**RightnetRadius** - ISP Management System  
**Version:** 2.0  
**Status:** Production Ready  
**Last Updated:** January 2024

---

**Ready to deploy?** Start with [DEPLOYMENT.md](./DEPLOYMENT.md)  
**Need security details?** See [SECURITY.md](./SECURITY.md)  
**Need quick answers?** Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
