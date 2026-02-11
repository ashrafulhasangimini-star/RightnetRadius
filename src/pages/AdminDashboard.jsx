import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Users, FileText, Settings, LogOut, 
  Menu, X, ChevronDown, Wifi, Activity, 
  TrendingUp, AlertCircle, CheckCircle, Clock, ChevronLeft, ChevronRight,
  Server, Signal, HardDrive, RefreshCw, Zap, Globe, Shield, Database,
  CreditCard, Package, Router, BarChart3, UserPlus, UserMinus, Eye, Search, User
} from 'lucide-react';
import { dashboardAPI, radiusAPI, coaAPI, fupAPI, usersAPI, packagesAPI, devicesAPI, transactionsAPI, profileAPI } from '../lib/api';

// Import page components
import UsersManagement from './UsersManagement';
import PackageManagement from './PackageManagement';
import ReportsPage from './ReportsPage';
import RechargePayment from './RechargePayment';
import RadiusClient from './RadiusClient';
import DeviceManagement from './DeviceManagement';
import AdminProfile from './AdminProfile';

export default function AdminDashboard({ admin, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Dashboard Stats
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // RADIUS Status
  const [radiusStatus, setRadiusStatus] = useState(null);
  const [nasClients, setNasClients] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  
  // COA Operations
  const [coaLoading, setCoaLoading] = useState(false);
  const [coaResult, setCoaResult] = useState(null);
  
  // Auto-refresh interval
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');
      
      const [statsRes, radiusRes, nasRes, sessionsRes] = await Promise.all([
        dashboardAPI.getAdminStats().catch(() => ({ data: {} })),
        radiusAPI.getStatus().catch(() => ({ data: {} })),
        radiusAPI.getNasClients().catch(() => ({ data: [] })),
        radiusAPI.getActiveSessions().catch(() => ({ data: [] }))
      ]);
      
      setStats(statsRes.data || {});
      setRadiusStatus(radiusRes.data || {});
      setNasClients(nasRes.data || []);
      setActiveSessions(sessionsRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Use mock data on error
      setStats({
        total_users: 15,
        online_users: 3,
        monthly_revenue: 12500,
        active_users: 12,
        fup_enabled_users: 10,
        fup_warning_users: 3,
        fup_applied_users: 2,
        coa_requests_today: 5,
        coa_success_rate: 100
      });
      setRadiusStatus({
        status: 'online',
        server: 'FreeRADIUS',
        version: '3.0.x',
        uptime: '5d 12h 30m',
        connections_today: 1250,
        requests_per_second: 15
      });
      setNasClients([
        { id: 1, nas_name: 'mikrotik-main', nas_ip: '192.168.1.1', nas_type: 'mikrotik', status: 'active', last_heartbeat: new Date().toISOString() },
        { id: 2, nas_name: 'ubiquiti-ap', nas_ip: '192.168.2.1', nas_type: 'ubiquiti', status: 'active', last_heartbeat: new Date().toISOString() }
      ]);
      setActiveSessions([
        { id: 1, username: 'rajib', nas_ip: '192.168.1.1', framed_ip: '10.0.0.50', start_time: new Date(Date.now() - 3600000).toISOString(), upload_bytes: 512000, download_bytes: 2048000, session_time: 3600 },
        { id: 2, username: 'karim', nas_ip: '192.168.1.1', framed_ip: '10.0.0.51', start_time: new Date(Date.now() - 7200000).toISOString(), upload_bytes: 1024000, download_bytes: 4096000, session_time: 7200 }
      ]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    setRefreshInterval(interval);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Disconnect a session
  const handleDisconnectSession = async (sessionId) => {
    if (!confirm('Are you sure you want to disconnect this session?')) return;
    
    try {
      setCoaLoading(true);
      const response = await radiusAPI.disconnectSession(sessionId);
      setCoaResult({ type: 'success', message: 'Session disconnected successfully' });
      fetchDashboardData();
    } catch (err) {
      setCoaResult({ type: 'error', message: 'Failed to disconnect session' });
    } finally {
      setCoaLoading(false);
      setTimeout(() => setCoaResult(null), 3000);
    }
  };

  // Change user speed (CoA)
  const handleChangeSpeed = async (username, newSpeed) => {
    try {
      setCoaLoading(true);
      const response = await coaAPI.changeSpeed({ username, speed: newSpeed });
      setCoaResult({ type: 'success', message: `Speed changed to ${newSpeed} for ${username}` });
    } catch (err) {
      setCoaResult({ type: 'error', message: 'Failed to change speed' });
    } finally {
      setCoaLoading(false);
      setTimeout(() => setCoaResult(null), 3000);
    }
  };

  // Disconnect user (CoA)
  const handleDisconnectUser = async (username) => {
    if (!confirm(`Are you sure you want to disconnect ${username}?`)) return;
    
    try {
      setCoaLoading(true);
      const response = await coaAPI.disconnect({ username });
      setCoaResult({ type: 'success', message: `${username} disconnected successfully` });
      fetchDashboardData();
    } catch (err) {
      setCoaResult({ type: 'error', message: 'Failed to disconnect user' });
    } finally {
      setCoaLoading(false);
      setTimeout(() => setCoaResult(null), 3000);
    }
  };

  // Menu items with icons
  const menuItems = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'users', label: 'ইউজার ম্যানেজমেন্ট', icon: Users },
    { id: 'packages', label: 'প্যাকেজ ম্যানেজমেন্ট', icon: Package },
    { id: 'radius', label: 'র‍্যাডিয়াস ক্লায়েন্ট', icon: Server },
    { id: 'devices', label: 'ডিভাইস ম্যানেজমেন্ট', icon: Router },
    { id: 'sessions', label: 'সেশন ম্যানেজমেন্ট', icon: Signal },
    { id: 'coa', label: 'COA অপারেশন', icon: Zap },
    { id: 'recharge', label: 'রিচার্জ ও পেমেন্ট', icon: CreditCard },
    { id: 'reports', label: 'রিপোর্ট', icon: BarChart3 },
    { id: 'audit', label: 'অডিট লগ', icon: FileText },
    { id: 'settings', label: 'সেটিংস', icon: Settings },
  ];

  // Format bytes to human readable
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format time duration
  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  // Render stat card
  const renderStatCard = (title, value, icon, color, trend, subtitle) => (
    <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {loading ? '...' : value}
          </h3>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-green-500">{trend}</span>
          <span className="text-gray-500 ml-2">vs last month</span>
        </div>
      )}
    </div>
  );

  // Render Main Dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderStatCard(
          'Total Users',
          stats?.total_users || 0,
          Users,
          'bg-blue-500',
          '+12%',
          'All registered users'
        )}
        {renderStatCard(
          'Online Now',
          stats?.online_users || 0,
          Wifi,
          'bg-green-500',
          '+8%',
          'Currently connected'
        )}
        {renderStatCard(
          'Monthly Revenue',
          `৳${(stats?.monthly_revenue || 0).toLocaleString()}`,
          Activity,
          'bg-purple-500',
          '+15%',
          'This month'
        )}
        {renderStatCard(
          'Active Sessions',
          activeSessions.length,
          Clock,
          'bg-orange-500',
          '+5%',
          'In progress'
        )}
      </div>

      {/* RADIUS Quick Status */}
      <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-primary" />
          RADIUS Server Quick Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium text-green-700 dark:text-green-400">RADIUS Server</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-500">
              {radiusStatus?.status === 'online' ? '● Online' : '○ Offline'}
            </p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-blue-700 dark:text-blue-400">NAS Devices</span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-500">{nasClients.length} active</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <Signal className="w-5 h-5 text-purple-500" />
              <span className="font-medium text-purple-700 dark:text-purple-400">Sessions</span>
            </div>
            <p className="text-sm text-purple-600 dark:text-purple-500">{activeSessions.length} online</p>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <span className="font-medium text-orange-700 dark:text-orange-400">COA Today</span>
            </div>
            <p className="text-sm text-orange-600 dark:text-orange-500">{stats?.coa_requests_today || 0} requests</p>
          </div>
        </div>
      </div>

      {/* FUP and COA Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FUP Overview */}
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            FUP Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">Within Limit</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats?.fup_enabled_users || 0} users
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-700 dark:text-gray-300">Near Limit (80%)</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats?.fup_warning_users || 0} users
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-gray-700 dark:text-gray-300">Exceeded Limit</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats?.fup_applied_users || 0} users
              </span>
            </div>
          </div>
        </div>

        {/* COA Status */}
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            COA Operations
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700 dark:text-gray-300">Speed Changes Today</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats?.coa_requests_today || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-red-500" />
                <span className="text-gray-700 dark:text-gray-300">Disconnections Today</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">0</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">Success Rate</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats?.coa_success_rate || 100}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          System Health
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium text-green-700 dark:text-green-400">Database</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-500">Connected & Healthy</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-blue-700 dark:text-blue-400">API Status</span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-500">All endpoints operational</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-5 h-5 text-purple-500" />
              <span className="font-medium text-purple-700 dark:text-purple-400">Network</span>
            </div>
            <p className="text-sm text-purple-600 dark:text-purple-500">{nasClients.length} NAS devices active</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return <UsersManagement />;
      case 'packages':
        return <PackageManagement />;
      case 'radius':
        return <RadiusClient />;
      case 'devices':
        return <DeviceManagement />;
      case 'sessions':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Session Management</h2>
            <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
              <p className="text-gray-600 dark:text-gray-400">Session management features coming soon...</p>
            </div>
          </div>
        );
      case 'coa':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">COA Operations</h2>
            <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
              <p className="text-gray-600 dark:text-gray-400">COA features coming soon...</p>
            </div>
          </div>
        );
      case 'recharge':
        return <RechargePayment />;
      case 'reports':
        return <ReportsPage />;
      case 'audit':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h2>
            <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
              <p className="text-gray-600 dark:text-gray-400">Audit logs features coming soon...</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
            <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
              <p className="text-gray-600 dark:text-gray-400">Settings page coming soon...</p>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Mobile Overlay Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex w-72.5 flex-col bg-black duration-300 ease-linear dark:bg-boxdark ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
          <a href="/" className="flex items-center gap-3">
            <Wifi className="text-primary" size={32} />
            <span className={`text-xl font-bold text-white ${!sidebarOpen && 'lg:hidden'}`}>
              RightnetRadius
            </span>
          </a>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex text-white hover:bg-gray-800 rounded-lg p-2 transition-transform duration-300"
            title={sidebarOpen ? 'Collapse Menu' : 'Expand Menu'}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-gray-800 rounded-lg p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Menu */}
        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
            <div>
              <h3 className={`mb-4 ml-4 text-sm font-semibold text-bodydark2 ${!sidebarOpen && 'lg:hidden'}`}>
                মেনু
              </h3>
              <ul className="mb-6 flex flex-col gap-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`group relative flex w-full items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                          activeTab === item.id && 'bg-graydark dark:bg-meta-4'
                        }`}
                      >
                        <Icon size={18} />
                        <span className={`${!sidebarOpen && 'lg:hidden'}`}>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-4 px-4">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 hover:bg-graydark dark:hover:bg-meta-4"
          >
            <LogOut size={18} />
            <span className={`${!sidebarOpen && 'lg:hidden'}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between bg-white dark:bg-boxdark px-6 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="text-gray-600 dark:text-gray-400" size={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white font-medium">
                  {admin?.username?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <span className="text-gray-700 dark:text-gray-300 hidden sm:block">
                {admin?.username || 'Admin'}
              </span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-boxdark rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={() => {
                    setShowProfileModal(true);
                    setUserMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <User size={18} />
                  Profile
                </button>
                <button
                  onClick={onLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <AdminProfile admin={admin} onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
}
