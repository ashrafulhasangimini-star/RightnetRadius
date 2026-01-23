import React, { useState, useEffect } from 'react';
import { Download, Upload, Users, HardDrive, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useSessionUpdates, useBandwidthUpdates } from '../hooks/useWebSocket';
import { BandwidthChart, TopUsersChart, HourlyBandwidthChart, SessionsChart } from '../components/BandwidthCharts';
import StatCard from '../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';

const Dashboard = () => {
  const [stats, setStats] = useState({
    downloadMbps: 45.3,
    uploadMbps: 23.8,
    activeSessions: 156,
    totalGbUsed: 1245.32,
  });

  const [bandwidthHistory, setBandwidthHistory] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useSessionUpdates((event) => {
    if (event.type === 'updated') {
      setStats(prev => ({
        ...prev,
        activeSessions: Math.max(0, prev.activeSessions - 1),
      }));
    }
  });

  useBandwidthUpdates((event) => {
    if (event.data) {
      setStats(prev => ({
        ...prev,
        downloadMbps: event.data.downloadMbps || prev.downloadMbps,
        uploadMbps: event.data.uploadMbps || prev.uploadMbps,
        totalGbUsed: event.data.totalGb || prev.totalGbUsed,
        activeSessions: event.data.activeUsers || prev.activeSessions,
      }));
    }
  });

  useEffect(() => {
    fetchDashboardData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchDashboardData, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Fetch bandwidth usage
      const usageRes = await fetch('/api/bandwidth/usage', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usageData = await usageRes.json();

      // Fetch 24-hour history
      const historyRes = await fetch('/api/bandwidth/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const historyData = await historyRes.json();
      setBandwidthHistory(historyData.data || []);

      // Fetch top users
      const topUsersRes = await fetch('/api/bandwidth/top-users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const topUsersData = await topUsersRes.json();
      setTopUsers(topUsersData.data || []);

      // Fetch recent sessions
      const sessionsRes = await fetch('/api/sessions/active', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sessionsData = await sessionsRes.json();
      setRecentSessions(sessionsData.data?.slice(0, 5) || []);

      // Update stats
      if (usageData.success) {
        setStats(prev => ({
          ...prev,
          downloadMbps: usageData.data.download_mbps,
          uploadMbps: usageData.data.upload_mbps,
          activeSessions: usageData.data.active_sessions,
          totalGbUsed: usageData.data.total_gb_used,
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <StatCard
          icon={Download}
          title="Download Speed"
          value={`${stats.downloadMbps.toFixed(1)} Mbps`}
          trend="up"
          trendValue="12%"
          iconBg="bg-meta-5"
          iconColor="text-meta-5"
        />
        <StatCard
          icon={Upload}
          title="Upload Speed"
          value={`${stats.uploadMbps.toFixed(1)} Mbps`}
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2 2xl:gap-7.5">
        {/* Bandwidth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Bandwidth Usage (24 Hours)</CardTitle>
          </CardHeader>
          <CardBody>
            <BandwidthChart data={bandwidthHistory} />
          </CardBody>
        </Card>

        {/* Top Users Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Users by Bandwidth</CardTitle>
          </CardHeader>
          <CardBody>
            <TopUsersChart data={topUsers} />
          </CardBody>
        </Card>
      </div>

      {/* Sessions Chart Full Width */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Activity className="text-primary" size={20} />
              Hourly Bandwidth Distribution
            </div>
          </CardTitle>
        </CardHeader>
        <CardBody>
          <HourlyBandwidthChart data={bandwidthHistory} />
        </CardBody>
      </Card>

      {/* Recent Sessions Table */}
      <Card padding={false}>
        <CardHeader>
          <CardTitle>Recent Active Sessions</CardTitle>
        </CardHeader>
        <div className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Download</TableHead>
                <TableHead>Upload</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSessions.length > 0 ? (
                recentSessions.map((session, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <p className="text-black dark:text-white font-medium">
                        {session.username}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-body">{session.framed_ip || 'N/A'}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-body">
                        {formatDuration(session.duration_seconds || 0)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-body">
                        {formatBytes((session.input_octets || 0) * 1024 * 1024)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-body">
                        {formatBytes((session.output_octets || 0) * 1024 * 1024)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-black dark:text-white font-medium">
                        {formatBytes((session.total_octets || 0) * 1024 * 1024)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">Active</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <p className="text-body">No active sessions found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
