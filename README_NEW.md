# RightnetRadius - Production-Ready ISP Management System

**A comprehensive, enterprise-grade ISP management platform with FreeRADIUS integration, MikroTik RouterOS support, and advanced billing.**

![License](https://img.shields.io/badge/license-MIT-green)
![Laravel](https://img.shields.io/badge/Laravel-11-red)
![PHP](https://img.shields.io/badge/PHP-8.2%2B-blue)

## 🎯 Features

### Core Management
- ✅ **User Management**: Create, edit, disable, bulk operations with RADIUS sync
- ✅ **Package System**: Speed profiles, validity, FUP limits, pricing
- ✅ **Billing Engine**: Invoices, payments, balance management, auto-renewal
- ✅ **Session Tracking**: Real-time online users, usage monitoring, accounting
- ✅ **MAC/IP Binding**: Device binding and access control

### Integrations
- ✅ **FreeRADIUS**: Direct database integration with full user sync
- ✅ **MikroTik API**: PPPoE/Hotspot user management, session control
- ✅ **Real-time Accounting**: Usage tracking and reporting

### UI & API
- ✅ **Admin Dashboard**: Statistics, alerts, quick actions
- ✅ **User Portal**: Usage, invoices, payments, settings
- ✅ **REST API**: Full API for third-party integrations
- ✅ **Role-Based Access**: Admin, Reseller, Support, User roles

### Advanced
- ✅ **FUP Enforcement**: Fair Usage Policy with automatic speed reduction
- ✅ **Expiry Management**: Automatic disable for expired users
- ✅ **Audit Logging**: Complete action tracking
- ✅ **Reports**: Revenue, usage, session analytics
- ✅ **Background Jobs**: Scheduled tasks for billing and sync

## 📋 Requirements

- PHP 8.2+
- Laravel 11
- MySQL/MariaDB 5.7+
- FreeRADIUS (with MySQL backend)
- MikroTik RouterOS (with API enabled)
- Composer

## 🚀 Quick Start

See [QUICKSTART.md](QUICKSTART.md) for 5-minute setup.

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- **[INSTALLATION.md](INSTALLATION.md)** - Complete installation guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and services

## 🏗️ System Architecture

- **Admin Panel**: User, package, and billing management
- **User Portal**: Usage tracking, invoices, payments
- **REST API**: Full programmatic access
- **RADIUS Integration**: Direct database sync with FreeRADIUS
- **MikroTik API**: Real-time user and session management
- **Background Jobs**: Automated billing and expiry

## 🔒 Security

- ✅ Sanctum token authentication
- ✅ Role-based access control
- ✅ Bcrypt password hashing
- ✅ Audit logging for all actions
- ✅ CSRF protection
- ✅ SQL injection prevention (ORM)

## 📊 Included Components

- 10+ Database migrations
- 10+ Eloquent models
- 4 Core services (RADIUS, MikroTik, Billing, Provisioning)
- 20+ API endpoints
- 15+ Admin controllers
- 8+ User portal controllers
- 4 Background job commands
- Complete request validation
- Role-based middleware

## 🚀 Production Ready

- Clean, maintainable code
- Best practice patterns
- Comprehensive error handling
- Security hardening
- Scalable architecture
- Documented and tested

## 📝 For Detailed Information

See project documentation files:
- Architecture overview: [ARCHITECTURE.md](ARCHITECTURE.md)
- Installation guide: [INSTALLATION.md](INSTALLATION.md)
- Quick start: [QUICKSTART.md](QUICKSTART.md)

---

**Version**: 1.0.0  
**Built with Laravel 11 + FreeRADIUS + MikroTik**
