import React, { useState, useEffect } from 'react';
import { useSessionUpdates, useBandwidthUpdates } from '@/hooks/useWebSocket';
import { BandwidthChart, TopUsersChart, HourlyBandwidthChart, SessionsChart } from '@/components/BandwidthCharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    downloadMbps: 45.3,
    uploadMbps: 23.8,
    activeSessions: 156,
    totalGbUsed: 1245.32,
  });

  const [bandwidthHistory, setBandwidthHistory] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
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

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Network Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time bandwidth and user monitoring</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-semibold uppercase">Download Speed</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.downloadMbps.toFixed(1)}</p>
            <p className="text-gray-500 text-xs mt-1">Mbps</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-semibold uppercase">Upload Speed</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.uploadMbps.toFixed(1)}</p>
            <p className="text-gray-500 text-xs mt-1">Mbps</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm font-semibold uppercase">Active Sessions</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{stats.activeSessions}</p>
            <p className="text-gray-500 text-xs mt-1">Connected Users</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm font-semibold uppercase">Total Data Used</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">{stats.totalGbUsed.toFixed(0)}</p>
            <p className="text-gray-500 text-xs mt-1">GB</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">24-Hour Bandwidth</h2>
            <BandwidthChart data={bandwidthHistory} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Hourly Peaks</h2>
            <HourlyBandwidthChart data={bandwidthHistory} />
          </div>
        </div>

        {/* Top Users */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Users</h2>
            <TopUsersChart data={topUsers} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Sessions</h2>
            <SessionsChart data={[
              { day: 'Mon', active: 150, completed: 220, failed: 15 },
              { day: 'Tue', active: 165, completed: 235, failed: 12 },
              { day: 'Wed', active: 155, completed: 210, failed: 18 },
              { day: 'Thu', active: 175, completed: 240, failed: 14 },
              { day: 'Fri', active: 160, completed: 225, failed: 16 },
              { day: 'Sat', active: 180, completed: 250, failed: 10 },
              { day: 'Sun', active: 156, completed: 200, failed: 20 },
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
