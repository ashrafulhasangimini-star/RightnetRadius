import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, Users, DollarSign, Activity, 
  Wifi, Clock, Download, Calendar, RefreshCw
} from 'lucide-react';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('revenue');
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(false);

  // Mock data for reports
  const revenueData = [
    { month: 'Jan', revenue: 45000, users: 45 },
    { month: 'Feb', revenue: 52000, users: 52 },
    { month: 'Mar', revenue: 48000, users: 48 },
    { month: 'Apr', revenue: 61000, users: 61 },
    { month: 'May', revenue: 55000, users: 55 },
    { month: 'Jun', revenue: 67000, users: 67 },
  ];

  const usageStats = [
    { name: 'Basic Plan', users: 25, usage: 45 },
    { name: 'Standard Plan', users: 40, usage: 65 },
    { name: 'Premium Plan', users: 30, usage: 80 },
    { name: 'Enterprise Plan', users: 5, usage: 95 },
  ];

  const topUsers = [
    { username: 'rajib', usage: 850, package: 'Premium' },
    { username: 'karim', usage: 720, package: 'Standard' },
    { username: 'fatima', usage: 680, package: 'Premium' },
    { username: 'hossain', usage: 590, package: 'Basic' },
    { username: 'sultana', usage: 520, package: 'Standard' },
  ];

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleDownload = () => {
    alert('Downloading report...');
  };

  const renderRevenueChart = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Overview</h3>
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <button 
              onClick={handleRefresh}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="h-64 flex items-end justify-between gap-2">
          {revenueData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-gradient-to-t from-primary to-blue-400 rounded-t-lg transition-all duration-300 hover:from-primary/80"
                style={{ height: `${(item.revenue / 70000) * 100}%`, minHeight: '20px' }}
              ></div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{item.month}</p>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">৳{(item.revenue / 1000).toFixed(0)}k</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">৳3,28,000</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Growth</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">+15.5%</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">New Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">127</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. ARPU</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">৳1,450</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsageReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Usage by Package */}
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bandwidth Usage by Package</h3>
          <div className="space-y-4">
            {usageStats.map((stat, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{stat.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{stat.usage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stat.usage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Data Users</h3>
          <div className="space-y-3">
            {topUsers.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">@{user.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.package}</p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{user.usage} GB</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSessionReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Wifi className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12,450</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Session Duration</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">4h 32m</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Peak Concurrent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">89</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h2>
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Download size={18} />
          Download Report
        </button>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveReport('revenue')}
          className={`px-4 py-2 font-medium border-b-4 transition ${
            activeReport === 'revenue'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-600 hover:text-primary'
          }`}
        >
          Revenue Report
        </button>
        <button
          onClick={() => setActiveReport('usage')}
          className={`px-4 py-2 font-medium border-b-4 transition ${
            activeReport === 'usage'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-600 hover:text-primary'
          }`}
        >
          Usage Report
        </button>
        <button
          onClick={() => setActiveReport('sessions')}
          className={`px-4 py-2 font-medium border-b-4 transition ${
            activeReport === 'sessions'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-600 hover:text-primary'
          }`}
        >
          Session Report
        </button>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {activeReport === 'revenue' && renderRevenueChart()}
          {activeReport === 'usage' && renderUsageReport()}
          {activeReport === 'sessions' && renderSessionReport()}
        </>
      )}
    </div>
  );
}
