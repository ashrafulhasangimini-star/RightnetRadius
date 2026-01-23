import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  Wifi, 
  Clock, 
  Activity,
  User,
  LogOut,
  Menu,
  X,
  TrendingUp,
  HardDrive,
  Package
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export default function CustomerDashboard({ admin, onLogout }) {
  const [stats, setStats] = useState({
    download: 0,
    upload: 0,
    sessions: 0,
    totalData: 0,
    quota: 100,
    used: 0,
    package: 'Standard Plan',
    bandwidth_limit: '10M',
    status: 'active',
  });
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    fetchCustomerData();
    const interval = setInterval(fetchCustomerData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCustomerData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/customer/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        setStats({
          download: data.download_speed || 2.5,
          upload: data.upload_speed || 1.2,
          sessions: data.active_sessions || 1,
          totalData: data.total_data || 45.2,
          quota: data.quota_gb || 100,
          used: data.used_gb || 45.2,
          package: data.package || 'Standard Plan',
          bandwidth_limit: data.bandwidth_limit || '10M',
          status: data.status || 'active',
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const quotaPercentage = ((stats.used / stats.quota) * 100).toFixed(1);
  
  const getQuotaColor = () => {
    if (quotaPercentage >= 90) return 'bg-danger';
    if (quotaPercentage >= 70) return 'bg-warning';
    return 'bg-success';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-whiten dark:bg-boxdark-2">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-9998 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
          <a href="/" className="flex items-center gap-3">
            <Wifi className="text-primary" size={32} />
            <span className="text-xl font-bold text-white">RightnetRadius</span>
          </a>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="block lg:hidden"
          >
            <X className="text-white" size={24} />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="px-6 py-4">
          <div className="rounded-sm border border-strokedark bg-boxdark p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-lg">
                {admin.name?.[0] || admin.username?.[0] || 'U'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{admin.name || admin.username}</p>
                <Badge variant="success" className="mt-1">{stats.status}</Badge>
              </div>
            </div>
            
            <div className="space-y-2 border-t border-strokedark pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-bodydark2">Package</span>
                <span className="text-white font-medium">{stats.package}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-bodydark2">Speed Limit</span>
                <span className="text-white font-medium">{stats.bandwidth_limit}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-5 py-4 px-4 lg:px-6">
          <ul className="mb-6 flex flex-col gap-1.5">
            <li>
              <button
                onClick={() => setActiveView('overview')}
                className={`group relative flex w-full items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                  activeView === 'overview' && 'bg-graydark dark:bg-meta-4'
                }`}
              >
                <Activity size={18} />
                Overview
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveView('usage')}
                className={`group relative flex w-full items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                  activeView === 'usage' && 'bg-graydark dark:bg-meta-4'
                }`}
              >
                <HardDrive size={18} />
                Data Usage
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveView('package')}
                className={`group relative flex w-full items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                  activeView === 'package' && 'bg-graydark dark:bg-meta-4'
                }`}
              >
                <Package size={18} />
                My Package
              </button>
            </li>
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="mt-auto border-t border-strokedark px-6 py-4">
          <Button
            onClick={onLogout}
            variant="danger"
            className="w-full gap-2"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="relative flex flex-1 flex-col lg:ml-72.5">
        {/* Header */}
        <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
          <div className="flex flex-grow items-center justify-between py-4 px-4 shadow-2 md:px-6 2xl:px-11">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
              >
                <Menu size={24} />
              </button>
              
              <h1 className="text-title-md2 font-semibold text-black dark:text-white">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-black dark:text-white">
                  {admin.name || admin.username}
                </p>
                <p className="text-xs text-body">{stats.package}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 w-full">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
              <StatCard
                icon={Download}
                title="Download Speed"
                value={`${stats.download.toFixed(1)} Mbps`}
                iconBg="bg-meta-5"
                iconColor="text-meta-5"
              />
              <StatCard
                icon={Upload}
                title="Upload Speed"
                value={`${stats.upload.toFixed(1)} Mbps`}
                iconBg="bg-meta-3"
                iconColor="text-meta-3"
              />
              <StatCard
                icon={Wifi}
                title="Active Sessions"
                value={stats.sessions.toString()}
                iconBg="bg-meta-6"
                iconColor="text-meta-6"
              />
              <StatCard
                icon={HardDrive}
                title="Data Used"
                value={`${stats.used.toFixed(1)} GB`}
                iconBg="bg-meta-7"
                iconColor="text-meta-7"
              />
            </div>

            {/* Data Quota Card */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center justify-between">
                    <span>Data Quota Usage</span>
                    <Badge variant={quotaPercentage >= 90 ? 'danger' : quotaPercentage >= 70 ? 'warning' : 'success'}>
                      {quotaPercentage}% Used
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="w-full h-4 bg-gray-2 rounded-full overflow-hidden dark:bg-meta-4">
                    <div
                      className={`h-full transition-all duration-500 ${getQuotaColor()}`}
                      style={{ width: `${quotaPercentage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-body">Used</p>
                      <p className="text-xl font-bold text-black dark:text-white">
                        {stats.used.toFixed(2)} GB
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-body">Total Quota</p>
                      <p className="text-xl font-bold text-black dark:text-white">
                        {stats.quota} GB
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-stroke dark:border-strokedark">
                    <div className="text-center">
                      <p className="text-xs text-body mb-1">Remaining</p>
                      <p className="text-lg font-semibold text-success">
                        {(stats.quota - stats.used).toFixed(2)} GB
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-body mb-1">Speed Limit</p>
                      <p className="text-lg font-semibold text-primary">
                        {stats.bandwidth_limit}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-body mb-1">Package</p>
                      <p className="text-lg font-semibold text-black dark:text-white">
                        {stats.package.split(' ')[0]}
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Current Session Info */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Session</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success bg-opacity-10">
                          <Activity className="text-success" size={20} />
                        </div>
                        <div>
                          <p className="text-sm text-body">Status</p>
                          <p className="font-medium text-black dark:text-white">Connected</p>
                        </div>
                      </div>
                      <div className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-stroke dark:border-strokedark">
                      <div className="flex justify-between">
                        <span className="text-sm text-body">Session Time</span>
                        <span className="text-sm font-medium text-black dark:text-white">
                          2h 34m
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-body">Download</span>
                        <span className="text-sm font-medium text-black dark:text-white">
                          {stats.download.toFixed(1)} Mbps
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-body">Upload</span>
                        <span className="text-sm font-medium text-black dark:text-white">
                          {stats.upload.toFixed(1)} Mbps
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Package Information</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary bg-opacity-10">
                        <Package className="text-primary" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-body">Current Plan</p>
                        <p className="font-medium text-black dark:text-white">{stats.package}</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-stroke dark:border-strokedark">
                      <div className="flex justify-between">
                        <span className="text-sm text-body">Bandwidth Limit</span>
                        <span className="text-sm font-medium text-black dark:text-white">
                          {stats.bandwidth_limit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-body">Data Quota</span>
                        <span className="text-sm font-medium text-black dark:text-white">
                          {stats.quota} GB/month
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-body">Status</span>
                        <Badge variant="success">{stats.status}</Badge>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
