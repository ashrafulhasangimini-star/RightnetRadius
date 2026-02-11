import React, { useState, useEffect, useCallback } from 'react';
import { 
  Home, Wifi, Clock, AlertCircle, Settings, LogOut, Bell, 
  User, ArrowDown, ArrowUp, Download, Activity, CheckCircle, Menu, X, ChevronLeft, ChevronRight,
  Signal, Zap, Database, RefreshCw, Server, TrendingUp
} from 'lucide-react';
import { dashboardAPI, radiusAPI } from '../lib/api';
import UserProfile from './UserProfile';

export default function UserDashboard({ admin, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // RADIUS Session Data
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [bandwidthHistory, setBandwidthHistory] = useState([]);
  const [usageData, setUsageData] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Fetch user dashboard data
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching user dashboard data...');
      
      const userId = admin?.id || 1;
      
      const [dashboardRes, sessionRes, usageRes, bandwidthRes] = await Promise.all([
        dashboardAPI.getUserDashboard(userId).catch(() => ({ data: {} })),
        radiusAPI.getSessionHistory(userId).catch(() => ({ data: [] })),
        dashboardAPI.getUserUsage(userId).catch(() => ({ data: {} })),
        dashboardAPI.getUserBandwidthHistory(userId).catch(() => ({ data: [] }))
      ]);
      
      const dashboardData = dashboardRes.data || {};
      
      // Build user data from responses
      setUserData({
        name: admin?.username || 'User',
        package: dashboardData.package || 'Premium Plan',
        status: dashboardData.status || 'Active',
        dataUsed: dashboardData.dataUsed || 524.5,
        dataLimit: dashboardData.dataLimit || 1024,
        billingCycle: dashboardData.billingCycle || 'Jan 1 - Jan 31, 2024',
        lastPayment: dashboardData.lastPayment || '2024-01-01',
        dueDate: dashboardData.dueDate || '2024-02-01',
        amount: dashboardData.amount || 1500,
        speed: dashboardData.speed || '100 Mbps',
        sessions: sessionRes.data || [],
        routerIp: dashboardData.routerIp || '192.168.1.1',
        publicIp: dashboardData.publicIp || '103.45.67.89',
        nasIp: dashboardData.nasIp || '192.168.1.1'
      });
      
      // Set current session (first active session or mock)
      const sessions = sessionRes.data || [];
      const activeSession = sessions.find(s => s.active) || {
        id: 1,
        username: admin?.username || 'user',
        framed_ip: '10.0.0.50',
        nas_ip: '192.168.1.1',
        start_time: new Date(Date.now() - 3600000).toISOString(),
        upload_bytes: 512000,
        download_bytes: 2048000,
        session_time: 3600,
        active: true
      };
      setCurrentSession(activeSession);
      setSessionHistory(sessions);
      setBandwidthHistory(bandwidthRes.data || []);
      setUsageData(usageRes.data || {
        daily: { upload: 512, download: 2048 },
        weekly: { upload: 3584, download: 14336 },
        monthly: { upload: 15360, download: 61440 }
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching user data:', err);
      // Use mock data on error
      setUserData({
        name: admin?.username || 'User',
        package: 'Premium Plan',
        status: 'Active',
        dataUsed: 524.5,
        dataLimit: 1024,
        billingCycle: 'Jan 1 - Jan 31, 2024',
        lastPayment: '2024-01-01',
        dueDate: '2024-02-01',
        amount: 1500,
        speed: '100 Mbps',
        sessions: [],
        routerIp: '192.168.1.1',
        publicIp: '103.45.67.89',
        nasIp: '192.168.1.1'
      });
      setCurrentSession({
        id: 1,
        username: admin?.username || 'user',
        framed_ip: '10.0.0.50',
        nas_ip: '192.168.1.1',
        start_time: new Date(Date.now() - 3600000).toISOString(),
        upload_bytes: 512000,
        download_bytes: 2048000,
        session_time: 3600,
        active: true
      });
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [admin]);

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchUserData();
    const interval = setInterval(fetchUserData, 15000); // Refresh every 15 seconds
    setRefreshInterval(interval);
    return () => clearInterval(interval);
  }, [fetchUserData]);

  const customerMenu = [
    { id: 'overview', label: 'সারসংক্ষেপ', icon: Home },
    { id: 'connection', label: 'সংযোগ', icon: Signal },
    { id: 'usage', label: 'ডেটা ব্যবহার', icon: Wifi },
    { id: 'billing', label: 'বিলিং', icon: Clock },
    { id: 'support', label: 'সহায়তা', icon: AlertCircle },
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

  // Calculate usage percentage
  const calculateUsagePercentage = () => {
    if (!userData) return 0;
    return Math.round((userData.dataUsed / userData.dataLimit) * 100);
  };

  // Get usage color
  const getUsageColor = () => {
    const percentage = calculateUsagePercentage();
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  // Render Connection Status
  const renderConnection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Connection Status</h2>
      
      {/* Current Session Status */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Signal className="w-8 h-8" />
              <div>
                <h3 className="text-2xl font-bold">Connected</h3>
                <p className="opacity-90">Your RADIUS session is active</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-sm opacity-80">Username</p>
                <p className="font-semibold">{currentSession?.username || userData?.name || 'User'}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-sm opacity-80">Public IP</p>
                <p className="font-semibold font-mono">{userData?.publicIp || 'N/A'}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-sm opacity-80">Assigned IP</p>
                <p className="font-semibold font-mono">{currentSession?.framed_ip || 'N/A'}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-sm opacity-80">Session Duration</p>
                <p className="font-semibold">{formatDuration(currentSession?.session_time || 0)}</p>
              </div>
            </div>
          </div>
          
          <div className="hidden md:block">
            <Activity className="w-24 h-24 opacity-50" />
          </div>
        </div>
      </div>

      {/* Connection Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ArrowDown className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Download</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatBytes(currentSession?.download_bytes || 0)}
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Real-time download traffic</p>
        </div>

        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ArrowUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Upload</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatBytes(currentSession?.upload_bytes || 0)}
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Real-time upload traffic</p>
        </div>

        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Speed</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {userData?.speed || '100 Mbps'}
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Allocated bandwidth</p>
        </div>
      </div>

      {/* NAS Information */}
      <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-primary" />
          Network Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Router/Gateway IP</p>
            <p className="font-semibold text-gray-900 dark:text-white font-mono">{userData?.routerIp || 'N/A'}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">NAS IP Address</p>
            <p className="font-semibold text-gray-900 dark:text-white font-mono">{userData?.nasIp || 'N/A'}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Authentication Server</p>
            <p className="font-semibold text-gray-900 dark:text-white font-mono">radius.rightnet.local</p>
          </div>
        </div>
      </div>

      {/* Session History */}
      <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Session History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Download</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Upload</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sessionHistory.map((session, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {new Date(session.start_time).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {formatDuration(session.session_time)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {formatBytes(session.download_bytes)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {formatBytes(session.upload_bytes)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      session.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {session.active ? 'Active' : 'Closed'}
                    </span>
                  </td>
                </tr>
              ))}
              {sessionHistory.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No session history available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Usage Analytics
  const renderUsage = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data Usage Analytics</h2>
        <button 
          onClick={fetchUserData}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Usage Overview */}
      <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Usage Overview</h3>
        
        {/* Main Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Data Used</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {userData?.dataUsed || 0} GB
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Limit</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {userData?.dataLimit || 0} GB
              </p>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div 
              className={`h-4 rounded-full transition-all duration-300 ${getUsageColor()}`}
              style={{ width: `${calculateUsagePercentage()}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">{calculateUsagePercentage()}% used</span>
            <span className="text-gray-500 dark:text-gray-400">
              {(userData?.dataLimit - userData?.dataUsed || 0).toFixed(1)} GB remaining
            </span>
          </div>
        </div>

        {/* Usage Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDown className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-blue-700 dark:text-blue-400">Downloads</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatBytes((usageData?.monthly?.download || 0) * 1024 * 1024)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">This month</p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUp className="w-5 h-5 text-green-500" />
              <span className="font-medium text-green-700 dark:text-green-400">Uploads</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatBytes((usageData?.monthly?.upload || 0) * 1024 * 1024)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">This month</p>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span className="font-medium text-purple-700 dark:text-purple-400">Total Traffic</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatBytes(((usageData?.monthly?.download || 0) + (usageData?.monthly?.upload || 0)) * 1024 * 1024)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">This month</p>
          </div>
        </div>
      </div>

      {/* Usage by Time Period */}
      <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Usage by Time Period</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Daily */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Today</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Download</span>
                <span className="text-gray-900 dark:text-white text-sm font-medium">
                  {formatBytes((usageData?.daily?.download || 0) * 1024 * 1024)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
              
              <div className="flex justify-between mt-2">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Upload</span>
                <span className="text-gray-900 dark:text-white text-sm font-medium">
                  {formatBytes((usageData?.daily?.upload || 0) * 1024 * 1024)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>

          {/* Weekly */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">This Week</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Download</span>
                <span className="text-gray-900 dark:text-white text-sm font-medium">
                  {formatBytes((usageData?.weekly?.download || 0) * 1024 * 1024)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
              
              <div className="flex justify-between mt-2">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Upload</span>
                <span className="text-gray-900 dark:text-white text-sm font-medium">
                  {formatBytes((usageData?.weekly?.upload || 0) * 1024 * 1024)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>

          {/* Monthly */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">This Month</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Download</span>
                <span className="text-gray-900 dark:text-white text-sm font-medium">
                  {formatBytes((usageData?.monthly?.download || 0) * 1024 * 1024)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${calculateUsagePercentage()}%` }}></div>
              </div>
              
              <div className="flex justify-between mt-2">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Upload</span>
                <span className="text-gray-900 dark:text-white text-sm font-medium">
                  {formatBytes((usageData?.monthly?.upload || 0) * 1024 * 1024)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Overview
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {userData?.name || 'User'}!</h2>
            <p className="opacity-90 flex items-center gap-2">
              <Signal className="w-4 h-4" />
              {currentSession?.active ? 'Your connection is active' : 'Connection status unknown'}
            </p>
          </div>
          <div className="hidden md:block">
            <Activity className="w-16 h-16 opacity-50" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Data Usage */}
        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Wifi className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className={`text-sm font-medium ${calculateUsagePercentage() >= 90 ? 'text-red-500' : 'text-green-500'}`}>
              {calculateUsagePercentage() >= 90 ? 'Near Limit' : 'Active'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {userData?.dataUsed || 0} GB
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">of {userData?.dataLimit || 0} GB used</p>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full transition-all duration-300 ${getUsageColor()}`}
                style={{ width: `${calculateUsagePercentage()}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{calculateUsagePercentage()}% used</p>
          </div>
        </div>

        {/* Speed */}
        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm text-green-500 font-medium">Stable</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {userData?.speed || '100 Mbps'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Current Speed</p>
        </div>

        {/* Sessions */}
        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm text-green-500 font-medium">
              {currentSession?.active ? 'Online' : 'Offline'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatDuration(currentSession?.session_time || 0)}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Session Duration</p>
        </div>

        {/* Package */}
        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <User className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm text-blue-500 font-medium">{userData?.package || 'Basic'}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {userData?.package || 'Basic Plan'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Current Package</p>
        </div>
      </div>

      {/* Billing Info */}
      <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Billing Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Billing Cycle</p>
            <p className="font-semibold text-gray-900 dark:text-white">{userData?.billingCycle || 'N/A'}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Payment</p>
            <p className="font-semibold text-gray-900 dark:text-white">{userData?.lastPayment || 'N/A'}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Due Date</p>
            <p className="font-semibold text-gray-900 dark:text-white">{userData?.dueDate || 'N/A'}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Amount Due</p>
            <p className="font-semibold text-gray-900 dark:text-white">৳{userData?.amount || 0}</p>
          </div>
        </div>
      </div>

      {/* Quick Connection Info */}
      <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connection Quick Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium text-green-700 dark:text-green-400">RADIUS Status</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-500">
              {currentSession?.active ? '● Authenticated' : '○ Not connected'}
            </p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-blue-700 dark:text-blue-400">Your IP</span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-500 font-mono">{userData?.publicIp || 'N/A'}</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-purple-500" />
              <span className="font-medium text-purple-700 dark:text-purple-400">Bandwidth</span>
            </div>
            <p className="text-sm text-purple-600 dark:text-purple-500">{userData?.speed || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'connection':
        return renderConnection();
      case 'usage':
        return renderUsage();
      case 'billing':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Billing</h2>
            <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
              <p className="text-gray-600 dark:text-gray-400">Billing history coming soon...</p>
            </div>
          </div>
        );
      case 'support':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Support</h2>
            <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
              <p className="text-gray-600 dark:text-gray-400">Support tickets coming soon...</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
            <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
              <p className="text-gray-600 dark:text-gray-400">Account settings coming soon...</p>
            </div>
          </div>
        );
      default:
        return renderOverview();
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
        className={`fixed lg:static inset-y-0 left-0 z-50 flex w-72.5 flex-col bg-gradient-to-b from-blue-900 to-blue-800 duration-300 ease-linear ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
          <a href="/" className="flex items-center gap-3">
            <Wifi className="text-white" size={32} />
            <span className={`text-xl font-bold text-white ${!sidebarOpen && 'lg:hidden'}`}>
              Rightnet
            </span>
          </a>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex text-white hover:bg-white/10 rounded-lg p-2 transition-transform duration-300"
            title={sidebarOpen ? 'Collapse Menu' : 'Expand Menu'}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-white/10 rounded-lg p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Menu */}
        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
            <ul className="mb-6 flex flex-col gap-1.5">
              {customerMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`group relative flex w-full items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-white/80 duration-300 ease-in-out hover:bg-white/10 ${
                        activeTab === item.id && 'bg-white/20'
                      }`}
                    >
                      <Icon size={18} />
                      <span className={`${!sidebarOpen && 'lg:hidden'}`}>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-white/10 pt-4 pb-4 px-4">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-white/80 hover:bg-white/10"
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
              {customerMenu.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center">
                <span className="text-white font-medium">
                  {userData?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-gray-700 dark:text-gray-300 hidden sm:block">
                {userData?.name || 'User'}
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-boxdark rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={() => {
                    setShowProfileModal(true);
                    setDropdownOpen(false);
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
          {error && (
            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg">
              <p className="text-yellow-700 dark:text-yellow-400 text-sm">{error}</p>
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <UserProfile user={userData} onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
}
