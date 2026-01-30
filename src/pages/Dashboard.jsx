import React, { useState, useEffect } from 'react';
import { Download, Upload, Users, HardDrive, Activity } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';

const Dashboard = () => {
  const [stats, setStats] = useState({
    downloadMbps: 45.3,
    uploadMbps: 23.8,
    activeSessions: 156,
    totalGbUsed: 1245.32,
  });

  const [loading, setLoading] = useState(false);

  // Mock data fetch
  useEffect(() => {
    // Simulate data fetch
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        downloadMbps: (Math.random() * 50 + 20).toFixed(1),
        uploadMbps: (Math.random() * 30 + 10).toFixed(1),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Dashboard Overview
        </h2>
        <p className="text-body mt-1">
          Real-time system statistics and monitoring
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <StatCard
          icon={Download}
          title="Download Speed"
          value={`${stats.downloadMbps} Mbps`}
          trend="up"
          trendValue="12%"
          iconBg="bg-meta-5"
          iconColor="text-meta-5"
        />
        <StatCard
          icon={Upload}
          title="Upload Speed"
          value={`${stats.uploadMbps} Mbps`}
          trend="up"
          trendValue="8%"
          iconBg="bg-meta-3"
          iconColor="text-meta-3"
        />
        <StatCard
          icon={Users}
          title="Active Sessions"
          value={stats.activeSessions.toString()}
          trend="down"
          trendValue="3%"
          iconBg="bg-meta-6"
          iconColor="text-meta-6"
        />
        <StatCard
          icon={HardDrive}
          title="Total Data Used"
          value={`${stats.totalGbUsed.toFixed(2)} GB`}
          trend="up"
          trendValue="24%"
          iconBg="bg-meta-7"
          iconColor="text-meta-7"
        />
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Activity className="text-primary" size={20} />
                System Status
              </div>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-body">RADIUS Server</span>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-success"></div>
                  <span className="text-sm font-medium text-success">Online</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body">Database</span>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-success"></div>
                  <span className="text-sm font-medium text-success">Connected</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body">API Service</span>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-success"></div>
                  <span className="text-sm font-medium text-success">Running</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body">WebSocket</span>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-warning"></div>
                  <span className="text-sm font-medium text-warning">Standby</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-body">Total Users</span>
                <span className="text-lg font-semibold text-black dark:text-white">1,245</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body">Active Users</span>
                <span className="text-lg font-semibold text-black dark:text-white">892</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body">Packages</span>
                <span className="text-lg font-semibold text-black dark:text-white">4</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body">Revenue (Month)</span>
                <span className="text-lg font-semibold text-success">৳ 2,45,000</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {[
              { user: 'rajib.khan', action: 'logged in', time: '2 minutes ago', type: 'success' },
              { user: 'karim.ahmed', action: 'data quota reached 90%', time: '15 minutes ago', type: 'warning' },
              { user: 'fatima.islam', action: 'package upgraded', time: '1 hour ago', type: 'info' },
              { user: 'ali.hassan', action: 'logged out', time: '2 hours ago', type: 'default' },
              { user: 'noor.aman', action: 'authentication failed', time: '3 hours ago', type: 'danger' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-stroke dark:border-strokedark last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${
                    activity.type === 'success' ? 'bg-success' :
                    activity.type === 'warning' ? 'bg-warning' :
                    activity.type === 'danger' ? 'bg-danger' :
                    activity.type === 'info' ? 'bg-primary' : 'bg-body'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white">
                      <span className="font-bold">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-body">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Dashboard;
