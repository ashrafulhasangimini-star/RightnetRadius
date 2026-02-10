import React, { useState, useEffect } from 'react';
import { 
  Home, Wifi, Clock, AlertCircle, Settings, LogOut, Bell, 
  User, ArrowDown, ArrowUp, Download, Activity, CheckCircle, Menu, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { dashboardAPI } from '../lib/api';

export default function UserDashboard({ admin, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user dashboard data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        console.log('Fetching user dashboard data...');
        
        const response = await dashboardAPI.getUserDashboard(admin?.id || 1);
        console.log('User API Response:', response.data);
        
        // Check if response has data
        if (response.data && Object.keys(response.data).length > 0) {
          setUserData(response.data);
          setError(null);
        } else {
          // Use mock data if API returns empty
          console.log('Using mock data');
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
            sessions: []
          });
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        // Use mock data on error
        console.log('Using mock data due to error');
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
          sessions: []
        });
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [admin]);

  const customerMenu = [
    { id: 'overview', label: 'সারসংক্ষেপ', icon: Home },
    { id: 'usage', label: 'ডেটা ব্যবহার', icon: Wifi },
    { id: 'billing', label: 'বিলিং', icon: Clock },
    { id: 'support', label: 'সহায়তা', icon: AlertCircle },
    { id: 'settings', label: 'সেটিংস', icon: Settings },
  ];

  const calculateUsagePercentage = () => {
    if (!userData) return 0;
    return Math.round((userData.dataUsed / userData.dataLimit) * 100);
  };

  const getUsageColor = () => {
    const percentage = calculateUsagePercentage();
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {userData?.name || 'User'}!</h2>
        <p className="opacity-90">Your connection is {userData?.status || 'Active'}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Data Usage */}
        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Wifi className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm text-green-500 font-medium">Active</span>
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
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
            <span className="text-sm text-green-500 font-medium">Online</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {userData?.sessions?.length || 0}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Sessions</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'usage':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data Usage</h2>
            <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
              <p className="text-gray-600 dark:text-gray-400">Detailed usage analytics coming soon...</p>
            </div>
          </div>
        );
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
          {/* Toggle Button for Desktop */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex text-white hover:bg-white/10 rounded-lg p-2 transition-transform duration-300"
            title={sidebarOpen ? 'Collapse Menu' : 'Expand Menu'}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
          {/* Close Button for Mobile */}
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
    </div>
  );
}
