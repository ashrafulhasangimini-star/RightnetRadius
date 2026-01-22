import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [authAttempts, setAuthAttempts] = useState([]);
  const [quotaBreaches, setQuotaBreaches] = useState([]);
  const [adminActions, setAdminActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('logs');
  const [filters, setFilters] = useState({
    action: '',
    days: 30,
  });

  useEffect(() => {
    fetchAuditData();
  }, [filters]);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Fetch logs
      const logsRes = await fetch(
        `/api/audit-logs?action=${filters.action}&days=${filters.days}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const logsData = await logsRes.json();
      setLogs(logsData.data || []);

      // Fetch statistics
      const statsRes = await fetch(
        `/api/audit-logs/stats?days=${filters.days}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const statsData = await statsRes.json();
      setStatistics(statsData.data || null);

      // Fetch auth attempts
      const authRes = await fetch(
        `/api/audit-logs/auth-attempts?days=${filters.days}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const authData = await authRes.json();
      setAuthAttempts(authData.data || []);

      // Fetch quota breaches
      const quotaRes = await fetch(
        `/api/audit-logs/quota-breaches?days=${filters.days}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const quotaData = await quotaRes.json();
      setQuotaBreaches(quotaData.data || []);

      // Fetch admin actions
      const adminRes = await fetch(
        `/api/audit-logs/admin-actions?days=${filters.days}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const adminData = await adminRes.json();
      setAdminActions(adminData.data || []);
    } catch (error) {
      console.error('Error fetching audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async (format) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/audit-logs/export?format=${format}&days=${filters.days}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audit-logs.csv';
        a.click();
      } else {
        const data = await response.json();
        const json = JSON.stringify(data.data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audit-logs.json';
        a.click();
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  const getChartData = () => {
    if (!statistics) return [];
    return [
      { name: 'Total Events', value: statistics.total_events },
      { name: 'Auth Attempts', value: statistics.auth_attempts },
      { name: 'Admin Actions', value: statistics.admin_actions },
      { name: 'Quota Breaches', value: statistics.quota_breaches },
    ];
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return <div className="p-6 text-center">Loading audit logs...</div>;
  }

  return (
    <div className="p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">System activity and security monitoring</p>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Total Events</p>
              <p className="text-2xl font-bold text-blue-600">{statistics.total_events}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Failed Auth</p>
              <p className="text-2xl font-bold text-red-600">{statistics.failed_auths}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Admin Actions</p>
              <p className="text-2xl font-bold text-yellow-600">{statistics.admin_actions}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Quota Breaches</p>
              <p className="text-2xl font-bold text-red-500">{statistics.quota_breaches}</p>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Event Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getChartData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Summary Statistics</h3>
            <div className="space-y-2">
              <p>Unique Users: <span className="font-bold">{statistics?.unique_users}</span></p>
              <p>Unique IPs: <span className="font-bold">{statistics?.unique_ips}</span></p>
              <p>Auth Attempts: <span className="font-bold">{statistics?.auth_attempts}</span></p>
              <p>Quota Breaches: <span className="font-bold text-red-600">{statistics?.quota_breaches}</span></p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b flex">
            {['logs', 'auth', 'quota', 'admin'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-semibold capitalize ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600'
                }`}
              >
                {tab === 'logs' ? 'All Logs' : tab === 'auth' ? 'Auth Attempts' : tab === 'quota' ? 'Quota Breaches' : 'Admin Actions'}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="p-4 border-b">
            <div className="flex gap-4">
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="px-3 py-2 border rounded"
              >
                <option value="">All Actions</option>
                <option value="AUTH_ATTEMPT">Auth Attempts</option>
                <option value="QUOTA_BREACH">Quota Breaches</option>
                <option value="SESSION_START">Session Start</option>
                <option value="SESSION_STOP">Session Stop</option>
                <option value="BANDWIDTH_CHANGE">Bandwidth Change</option>
              </select>

              <select
                value={filters.days}
                onChange={(e) => setFilters({ ...filters, days: parseInt(e.target.value) })}
                className="px-3 py-2 border rounded"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
                <option value={90}>Last 90 days</option>
              </select>

              <button
                onClick={() => exportLogs('csv')}
                className="ml-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === 'logs' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Timestamp</th>
                      <th className="text-left py-2">Action</th>
                      <th className="text-left py-2">Resource</th>
                      <th className="text-left py-2">User</th>
                      <th className="text-left py-2">IP Address</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-2">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="py-2"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{log.action}</span></td>
                        <td className="py-2">{log.resource}</td>
                        <td className="py-2">{log.user_id}</td>
                        <td className="py-2">{log.ip_address}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            log.status_code === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status_code}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'auth' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Timestamp</th>
                      <th className="text-left py-2">Username</th>
                      <th className="text-left py-2">Result</th>
                      <th className="text-left py-2">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {authAttempts.map((log, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-2">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="py-2">{JSON.parse(log.new_values)?.username}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            log.status_code === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status_code === 200 ? 'Success' : 'Failed'}
                          </span>
                        </td>
                        <td className="py-2">{log.ip_address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'quota' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Timestamp</th>
                      <th className="text-left py-2">Username</th>
                      <th className="text-left py-2">Used / Quota</th>
                      <th className="text-left py-2">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotaBreaches.map((log, idx) => {
                      const values = JSON.parse(log.new_values) || {};
                      return (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="py-2">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="py-2">{values.username}</td>
                          <td className="py-2">{values.used_gb?.toFixed(2)} / {values.quota_gb} GB</td>
                          <td className="py-2">
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                              {values.percentage}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Timestamp</th>
                      <th className="text-left py-2">Action</th>
                      <th className="text-left py-2">Resource</th>
                      <th className="text-left py-2">Admin User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminActions.map((log, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-2">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="py-2"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">{log.action}</span></td>
                        <td className="py-2">{log.resource}</td>
                        <td className="py-2">{log.user_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
