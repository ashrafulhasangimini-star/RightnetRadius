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
  Package,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Bell,
  Settings,
  BarChart3
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CustomerDashboard({ admin, onLogout }) {
  const [stats, setStats] = useState({
    download: 5.2,
    upload: 2.8,
    sessions: 1,
    totalData: 45.2,
    quota: 100,
    used: 45.2,
    package: 'Standard Plan',
    bandwidth_limit: '10M',
    status: 'active',
    expiry: '2026-02-28',
    balance: 1000,
    nextBilling: '2026-02-01',
    billingAmount: 1000
  });
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [usageHistory, setUsageHistory] = useState([]);

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
      
      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({
          ...prev,
          download: data.download_speed || prev.download,
          upload: data.upload_speed || prev.upload,
        }));
      }
    } catch (err) {
      console.log('Using mock data');
    }

    // Generate mock usage history
    const usage = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      download: Math.random() * 5 + 1,
      upload: Math.random() * 2 + 0.5,
      total: 0
    }));
    usage.forEach(item => item.total = item.download + item.upload);
    setUsageHistory(usage);

    setLoading(false);
  };

  const quotaPercentage = ((stats.used / stats.quota) * 100).toFixed(1);
  
  const getQuotaColor = () => {
    if (quotaPercentage >= 90) return 'bg-danger';
    if (quotaPercentage >= 70) return 'bg-warning';
    return 'bg-success';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(amount);
  };

  const getDaysUntilExpiry = () => {
    const expiryDate = new Date(stats.expiry);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-whiten dark:bg-boxdark-2">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-whiten dark:bg-boxdark-2">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-9998 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
          <a href="/" className="flex items-center gap-3">
            <Wifi className="text-primary" size={32} />
            <span className="text-xl font-bold text-white">RightnetRadius</span>
          </a>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="block lg:hidden">
            <X className="text-white" size={24} />
          </button>
        </div>

        {/* User Profile */}
        <div className="px-6 py-4">
          <div className="rounded-sm border border-strokedark bg-boxdark p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-lg">
                {admin?.name?.[0] || admin?.username?.[0] || 'U'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{admin?.name || admin?.username}</p>
                <Badge variant="success" className="mt-1">{stats.status}</Badge>
              </div>
            </div>
            
            <div className="space-y-2 border-t border-strokedark pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-bodydark2">Package</span>
                <span className="text-white font-medium">{stats.package}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-bodydark2">Speed</span>
                <span className="text-white font-medium">{stats.bandwidth_limit}</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="mt-5 py-4 px-4 lg:px-6">
          <ul className="mb-6 flex flex-col gap-1.5">
            <li>
              <button onClick={() => setActiveView('overview')}
                className={`group relative flex w-full items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                  activeView === 'overview' && 'bg-graydark dark:bg-meta-4'
                }`}>
                <Activity size={18} /> Overview
              </button>
            </li>
          </ul>
        </nav>

        <div className="mt-auto border-t border-strokedark px-6 py-4">
          <Button onClick={onLogout} variant="danger" className="w-full gap-2">
            <LogOut size={18} /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
          <div className="flex flex-grow items-center justify-between py-4 px-4 shadow-2 md:px-6 2xl:px-11">
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)}
                className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden">
                <Menu size={24} />
              </button>
              <h1 className="text-title-md2 font-semibold text-black dark:text-white">Dashboard</h1>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-screen-2xl p-4 md:p-6 2xl:p-10">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
              <StatCard icon={Download} title="Download" value={`${stats.download} Mbps`} iconBg="bg-meta-5" iconColor="text-meta-5" />
              <StatCard icon={Upload} title="Upload" value={`${stats.upload} Mbps`} iconBg="bg-meta-3" iconColor="text-meta-3" />
              <StatCard icon={Wifi} title="Sessions" value={stats.sessions.toString()} iconBg="bg-meta-6" iconColor="text-meta-6" />
              <StatCard icon={HardDrive} title="Data Used" value={`${stats.used} GB`} iconBg="bg-meta-7" iconColor="text-meta-7" />
            </div>

            {/* Quota */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center justify-between">
                    <span>Data Quota</span>
                    <Badge variant={quotaPercentage >= 90 ? 'danger' : quotaPercentage >= 70 ? 'warning' : 'success'}>
                      {quotaPercentage}%
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="w-full h-4 bg-gray-2 rounded-full overflow-hidden dark:bg-meta-4">
                  <div className={`h-full ${getQuotaColor()}`} style={{ width: `${quotaPercentage}%` }} />
                </div>
                <div className="flex justify-between mt-4">
                  <div>
                    <p className="text-body text-sm">Used</p>
                    <p className="text-xl font-bold">{stats.used} GB</p>
                  </div>
                  <div className="text-right">
                    <p className="text-body text-sm">Total</p>
                    <p className="text-xl font-bold">{stats.quota} GB</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Usage Chart */}
            <Card>
              <CardHeader><CardTitle>Usage History (30 Days)</CardTitle></CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={usageHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="download" stroke="#3C50E0" fill="#3C50E0" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="upload" stroke="#80CAEE" fill="#80CAEE" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
