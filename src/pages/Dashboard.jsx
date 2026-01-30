import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  Users, 
  HardDrive, 
  Activity,
  TrendingUp,
  TrendingDown,
  Wifi,
  Server,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Package
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 1245,
    activeUsers: 892,
    totalBandwidth: 45.3,
    uploadSpeed: 23.8,
    totalRevenue: 245000,
    pendingPayments: 15000,
    activeSessions: 156,
    totalDataUsed: 1245.32,
    systemHealth: 98.5,
  });

  const [bandwidthData, setBandwidthData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [packageDistribution, setPackageDistribution] = useState([]);
  const [hourlyUsage, setHourlyUsage] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch real-time bandwidth
      const bandwidthRes = await fetch('/api/dashboard/bandwidth', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (bandwidthRes.ok) {
        const data = await bandwidthRes.json();
        setStats(prev => ({
          ...prev,
          totalBandwidth: data.download_mbps || prev.totalBandwidth,
          uploadSpeed: data.upload_mbps || prev.uploadSpeed,
        }));
      }
    } catch (error) {
      console.log('Using mock data');
    }

    // Generate mock data for charts
    generateMockData();
  };

  const generateMockData = () => {
    // Bandwidth data (last 24 hours)
    const bandwidth = Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      download: Math.floor(Math.random() * 50) + 20,
      upload: Math.floor(Math.random() * 30) + 10,
      total: 0
    }));
    bandwidth.forEach(item => item.total = item.download + item.upload);
    setBandwidthData(bandwidth);

    // Revenue data (last 12 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenue = months.map((month, i) => ({
      month,
      revenue: Math.floor(Math.random() * 100000) + 150000,
      expenses: Math.floor(Math.random() * 50000) + 80000,
      profit: 0
    }));
    revenue.forEach(item => item.profit = item.revenue - item.expenses);
    setRevenueData(revenue);

    // Package distribution
    const packages = [
      { name: 'Basic (2M)', value: 320, color: '#3C50E0' },
      { name: 'Standard (5M)', value: 450, color: '#80CAEE' },
      { name: 'Premium (10M)', value: 280, color: '#10B981' },
      { name: 'Business (20M)', value: 195, color: '#FFA70B' }
    ];
    setPackageDistribution(packages);

    // Hourly usage pattern
    const hourly = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      users: Math.floor(Math.random() * 200) + 50,
      bandwidth: Math.floor(Math.random() * 100) + 30
    }));
    setHourlyUsage(hourly);

    // Top users
    const users = [
      { id: 1, username: 'rajib.khan', package: 'Premium', usage: 89.5, status: 'active', revenue: 1500 },
      { id: 2, username: 'karim.ahmed', package: 'Standard', usage: 67.8, status: 'active', revenue: 1000 },
      { id: 3, username: 'fatima.islam', package: 'Premium', usage: 78.2, status: 'active', revenue: 1500 },
      { id: 4, username: 'ali.hassan', package: 'Business', usage: 92.1, status: 'active', revenue: 2000 },
      { id: 5, username: 'noor.aman', package: 'Basic', usage: 45.3, status: 'warning', revenue: 600 }
    ];
    setTopUsers(users);

    // Recent activities
    const activities = [
      { id: 1, user: 'rajib.khan', action: 'logged in', time: '2 min ago', type: 'success', icon: CheckCircle },
      { id: 2, user: 'karim.ahmed', action: 'quota 90% reached', time: '15 min ago', type: 'warning', icon: AlertTriangle },
      { id: 3, user: 'fatima.islam', action: 'package upgraded', time: '1 hour ago', type: 'info', icon: TrendingUp },
      { id: 4, user: 'ali.hassan', action: 'payment received', time: '2 hours ago', type: 'success', icon: DollarSign },
      { id: 5, user: 'noor.aman', action: 'FUP limit reached', time: '3 hours ago', type: 'danger', icon: AlertTriangle }
    ];
    setRecentActivities(activities);
  };

  const getQuotaColor = (usage) => {
    if (usage >= 90) return 'text-danger';
    if (usage >= 70) return 'text-warning';
    return 'text-success';
  };

  const getQuotaBgColor = (usage) => {
    if (usage >= 90) return 'bg-danger';
    if (usage >= 70) return 'bg-warning';
    return 'bg-success';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(amount);
  };

  const COLORS = ['#3C50E0', '#80CAEE', '#10B981', '#FFA70B'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Dashboard Overview
          </h2>
          <p className="text-body mt-1">
            Real-time system statistics and monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-success bg-opacity-10 px-3 py-2 rounded-lg">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
            <span className="text-sm text-success font-medium">Live Updates</span>
          </div>
        </div>
      </div>

      {/* Top Stats Cards - Row 1 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          trend="up"
          trendValue={`${stats.activeUsers} active`}
          iconBg="bg-primary"
          iconColor="text-primary"
        />
        <StatCard
          icon={Download}
          title="Download Speed"
          value={`${stats.totalBandwidth.toFixed(1)} Mbps`}
          trend="up"
          trendValue="12%"
          iconBg="bg-meta-5"
          iconColor="text-meta-5"
        />
        <StatCard
          icon={DollarSign}
          title="Monthly Revenue"
          value={formatCurrency(stats.totalRevenue)}
          trend="up"
          trendValue="24%"
          iconBg="bg-success"
          iconColor="text-success"
        />
        <StatCard
          icon={Wifi}
          title="Active Sessions"
          value={stats.activeSessions.toString()}
          trend="down"
          trendValue="3%"
          iconBg="bg-warning"
          iconColor="text-warning"
        />
      </div>

      {/* Secondary Stats - Row 2 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <StatCard
          icon={Upload}
          title="Upload Speed"
          value={`${stats.uploadSpeed.toFixed(1)} Mbps`}
          trend="up"
          trendValue="8%"
          iconBg="bg-meta-3"
          iconColor="text-meta-3"
        />
        <StatCard
          icon={HardDrive}
          title="Total Data Used"
          value={`${stats.totalDataUsed.toFixed(2)} GB`}
          trend="up"
          trendValue="18%"
          iconBg="bg-meta-7"
          iconColor="text-meta-7"
        />
        <StatCard
          icon={AlertTriangle}
          title="Pending Payments"
          value={formatCurrency(stats.pendingPayments)}
          trend="down"
          trendValue="5%"
          iconBg="bg-danger"
          iconColor="text-danger"
        />
        <StatCard
          icon={Server}
          title="System Health"
          value={`${stats.systemHealth}%`}
          trend="up"
          trendValue="Excellent"
          iconBg="bg-meta-3"
          iconColor="text-meta-3"
        />
      </div>

      {/* Charts Row 1 - Bandwidth & Revenue */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2 2xl:gap-7.5">
        {/* Bandwidth Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Bandwidth Usage (24 Hours)</CardTitle>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={bandwidthData}>
                <defs>
                  <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3C50E0" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3C50E0" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#80CAEE" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#80CAEE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="time" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="download" stroke="#3C50E0" fillOpacity={1} fill="url(#colorDownload)" name="Download (Mbps)" />
                <Area type="monotone" dataKey="upload" stroke="#80CAEE" fillOpacity={1} fill="url(#colorUpload)" name="Upload (Mbps)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Profit Analysis</CardTitle>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                <Bar dataKey="profit" fill="#3C50E0" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Charts Row 2 - Package Distribution & Hourly Usage */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2 2xl:gap-7.5">
        {/* Package Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Package Distribution</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={packageDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {packageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {packageDistribution.map((pkg, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded" style={{ backgroundColor: pkg.color }}></div>
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">{pkg.name}</p>
                      <p className="text-xs text-body">{pkg.value} users</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Hourly Usage Pattern */}
        <Card>
          <CardHeader>
            <CardTitle>Hourly Usage Pattern</CardTitle>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={hourlyUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="hour" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#3C50E0" strokeWidth={2} name="Active Users" />
                <Line type="monotone" dataKey="bandwidth" stroke="#10B981" strokeWidth={2} name="Bandwidth (Mbps)" />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Top Users Table */}
      <Card padding={false}>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between">
              <span>Top Users by Usage</span>
              <Badge variant="primary">{topUsers.length} users</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <div className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Data Usage</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary bg-opacity-10">
                        <span className="font-bold text-primary">{user.username[0].toUpperCase()}</span>
                      </div>
                      <p className="font-medium text-black dark:text-white">{user.username}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="primary">{user.package}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="w-full max-w-32">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium ${getQuotaColor(user.usage)}`}>
                          {user.usage}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-2 rounded-full overflow-hidden dark:bg-meta-4">
                        <div
                          className={`h-full ${getQuotaBgColor(user.usage)}`}
                          style={{ width: `${user.usage}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-success">{formatCurrency(user.revenue)}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'success' : 'warning'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <button className="text-primary hover:text-primary-dark text-sm font-medium">
                      View Details
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Activity className="text-primary" size={20} />
              Recent Activities
            </div>
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center justify-between py-3 border-b border-stroke dark:border-strokedark last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      activity.type === 'success' ? 'bg-success bg-opacity-10' :
                      activity.type === 'warning' ? 'bg-warning bg-opacity-10' :
                      activity.type === 'danger' ? 'bg-danger bg-opacity-10' :
                      'bg-primary bg-opacity-10'
                    }`}>
                      <Icon className={`${
                        activity.type === 'success' ? 'text-success' :
                        activity.type === 'warning' ? 'text-warning' :
                        activity.type === 'danger' ? 'text-danger' :
                        'text-primary'
                      }`} size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">
                        <span className="font-bold">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-body flex items-center gap-1">
                        <Clock size={12} />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* System Status Footer */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-body">RADIUS Server</p>
                <p className="text-lg font-bold text-black dark:text-white">Online</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success bg-opacity-10 flex items-center justify-center">
                <Server className="text-success" size={24} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-body">Database</p>
                <p className="text-lg font-bold text-black dark:text-white">Connected</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success bg-opacity-10 flex items-center justify-center">
                <HardDrive className="text-success" size={24} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-body">API Service</p>
                <p className="text-lg font-bold text-black dark:text-white">Running</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success bg-opacity-10 flex items-center justify-center">
                <Activity className="text-success" size={24} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
