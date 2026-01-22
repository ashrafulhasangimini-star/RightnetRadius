import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Package, CreditCard, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, Wifi, Download, Upload, Clock } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { BandwidthChart, TopUsersChart, HourlyBandwidthChart, SessionsChart } from './BandwidthCharts';

function AdminDashboard({ admin, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [bandwidthData, setBandwidthData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [sessionsChartData, setSessionsChartData] = useState([]);

  useEffect(() => {
    // Mock data
    setUsers([
      { id: 1, name: 'Rajib Khan', email: 'rajib@example.com', package: 'Premium', status: 'active', joined: '2024-01-15' },
      { id: 2, name: 'Karim Ahmed', email: 'karim@example.com', package: 'Standard', status: 'active', joined: '2024-01-10' },
      { id: 3, name: 'Fatima Islam', email: 'fatima@example.com', package: 'Basic', status: 'inactive', joined: '2024-01-05' },
    ]);

    setPackages([
      { id: 1, name: 'Basic Plan', speed: 5, price: 500, users: 150 },
      { id: 2, name: 'Standard Plan', speed: 10, price: 1000, users: 280 },
      { id: 3, name: 'Premium Plan', speed: 20, price: 1500, users: 190 },
      { id: 4, name: 'Enterprise Plan', speed: 50, price: 3000, users: 45 },
    ]);

    // Fetch active sessions
    setSessions([
      { session_id: 'uuid-1', username: 'rajib', framed_ip: '192.168.100.5', started_at: '2024-01-20 10:15:00', duration_seconds: 3600, input_mb: 245.5, output_mb: 128.3, total_mb: 373.8 },
      { session_id: 'uuid-2', username: 'karim', framed_ip: '192.168.100.8', started_at: '2024-01-20 09:45:00', duration_seconds: 5400, input_mb: 512.2, output_mb: 256.7, total_mb: 768.9 },
      { session_id: 'uuid-3', username: 'fatima', framed_ip: '192.168.100.12', started_at: '2024-01-20 11:20:00', duration_seconds: 1800, input_mb: 89.4, output_mb: 45.2, total_mb: 134.6 },
    ]);

    setStats({
      active_sessions: 598,
      download_gb: 1245.32,
      upload_gb: 587.15,
      total_gb: 1832.47,
      avg_session_duration: 3600,
    });

    // Generate sample bandwidth chart data
    const bandwidth = Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      download: Math.floor(Math.random() * 50) + 20,
      upload: Math.floor(Math.random() * 30) + 10,
    }));
    setBandwidthData(bandwidth);

    // Generate hourly data
    const hourly = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      bandwidth: Math.floor(Math.random() * 100) + 50,
      peak: Math.floor(Math.random() * 150) + 80,
    }));
    setHourlyData(hourly);

    // Generate sessions chart data
    const sessionsData = Array.from({ length: 7 }, (_, i) => ({
      date: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      active: Math.floor(Math.random() * 200) + 400,
      completed: Math.floor(Math.random() * 300) + 200,
      failed: Math.floor(Math.random() * 50) + 10,
    }));
    setSessionsChartData(sessionsData);
  }, []);

  const renderDashboard = () => (
    <div className="dashboard-content">
      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon={<Users size={24} />}
          label="Total Users"
          value="715"
          change="+12%"
          trend="up"
        />
        <StatCard
          icon={<Activity size={24} />}
          label="Active Users"
          value="598"
          change="+8%"
          trend="up"
        />
        <StatCard
          icon={<Package size={24} />}
          label="Packages"
          value="4"
          change="0%"
          trend="neutral"
        />
        <StatCard
          icon={<CreditCard size={24} />}
          label="Monthly Revenue"
          value="৳ 856,000"
          change="+15%"
          trend="up"
        />
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>User Growth</h3>
          <div className="chart-placeholder">
            <div style={{height: '200px', background: 'linear-gradient(to top, #3b82f6, #dbeafe)', borderRadius: '8px'}} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Revenue Trend</h3>
          <div className="chart-placeholder">
            <div style={{height: '200px', background: 'linear-gradient(to top, #10b981, #d1fae5)', borderRadius: '8px'}} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-section">
        <h3>Recent Users</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Package</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className="font-medium">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.package}</td>
                  <td>
                    <span className={`status-badge ${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="users-content">
      <div className="section-header">
        <h2>Users Management</h2>
        <button className="btn-primary">Add New User</button>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Package</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="font-medium">{user.name}</td>
                <td>{user.email}</td>
                <td>{user.package}</td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.joined}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-sm btn-secondary">Edit</button>
                    <button className="btn-sm btn-danger">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPackages = () => (
    <div className="packages-content">
      <div className="section-header">
        <h2>Packages Management</h2>
        <button className="btn-primary">Add Package</button>
      </div>

      <div className="packages-grid">
        {packages.map(pkg => (
          <div key={pkg.id} className="package-card">
            <div className="package-header">
              <h3>{pkg.name}</h3>
              <span className="package-price">৳ {pkg.price}</span>
            </div>
            <div className="package-body">
              <p><strong>Speed:</strong> {pkg.speed} Mbps</p>
              <p><strong>Users:</strong> {pkg.users}</p>
            </div>
            <div className="package-footer">
              <button className="btn-sm btn-secondary">Edit</button>
              <button className="btn-sm btn-danger">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="billing-content">
      <div className="section-header">
        <h2>Billing & Revenue</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card-large">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">৳ 856,000</div>
          <div className="stat-change positive">↑ 15% from last month</div>
        </div>
        <div className="stat-card-large">
          <div className="stat-label">Pending Invoices</div>
          <div className="stat-value">12</div>
          <div className="stat-change">৳ 125,000</div>
        </div>
        <div className="stat-card-large">
          <div className="stat-label">Monthly Recurring</div>
          <div className="stat-value">৳ 98,500</div>
          <div className="stat-change positive">↑ 8% growth</div>
        </div>
      </div>

      <div className="recent-section">
        <h3>Recent Invoices</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#INV-001</td>
                <td>Rajib Khan</td>
                <td>৳ 1,500</td>
                <td>2024-01-20</td>
                <td><span className="status-badge paid">Paid</span></td>
              </tr>
              <tr>
                <td>#INV-002</td>
                <td>Karim Ahmed</td>
                <td>৳ 1,000</td>
                <td>2024-01-20</td>
                <td><span className="status-badge paid">Paid</span></td>
              </tr>
              <tr>
                <td>#INV-003</td>
                <td>Fatima Islam</td>
                <td>৳ 500</td>
                <td>2024-01-18</td>
                <td><span className="status-badge pending">Pending</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="reports-content">
      <div className="section-header">
        <h2>Reports</h2>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <h3>User Activity Report</h3>
          <p>Track user login and activity patterns</p>
          <button className="btn-primary">Generate Report</button>
        </div>
        <div className="report-card">
          <h3>Revenue Report</h3>
          <p>Monthly and yearly revenue statistics</p>
          <button className="btn-primary">Generate Report</button>
        </div>
        <div className="report-card">
          <h3>Bandwidth Usage</h3>
          <p>Network bandwidth consumption analysis</p>
          <button className="btn-primary">Generate Report</button>
        </div>
        <div className="report-card">
          <h3>Customer Churn</h3>
          <p>Customer retention and churn analysis</p>
          <button className="btn-primary">Generate Report</button>
        </div>
      </div>
    </div>
  );

  const renderSessions = () => (
    <div className="dashboard-content">
      <div className="content-header">
        <h2>Active User Sessions</h2>
        <p>Real-time monitoring of connected users and bandwidth usage</p>
      </div>

      {/* Session Stats Summary */}
      <div className="stats-grid">
        <StatCard
          icon={<Wifi size={24} />}
          label="Active Sessions"
          value={stats?.active_sessions || '0'}
          change="+5%"
          trend="up"
        />
        <StatCard
          icon={<Download size={24} />}
          label="Download"
          value={`${stats?.download_gb || 0} GB`}
          change="+2.3%"
          trend="up"
        />
        <StatCard
          icon={<Upload size={24} />}
          label="Upload"
          value={`${stats?.upload_gb || 0} GB`}
          change="+1.8%"
          trend="up"
        />
        <StatCard
          icon={<Clock size={24} />}
          label="Avg Duration"
          value={`${Math.floor((stats?.avg_session_duration || 0) / 60)} min`}
          change="0%"
          trend="neutral"
        />
      </div>

      {/* Sessions Table */}
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>IP Address</th>
              <th>Started At</th>
              <th>Duration</th>
              <th>Download</th>
              <th>Upload</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.session_id}>
                <td>{session.username}</td>
                <td className="monospace">{session.framed_ip}</td>
                <td>{session.started_at}</td>
                <td>{Math.floor(session.duration_seconds / 60)} min</td>
                <td>{session.input_mb} MB</td>
                <td>{session.output_mb} MB</td>
                <td><strong>{session.total_mb} MB</strong></td>
                <td>
                  <button className="btn-small btn-danger">Disconnect</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBandwidth = () => (
    <div className="dashboard-content">
      <div className="content-header">
        <h2>Bandwidth Monitor</h2>
        <p>Real-time bandwidth usage and performance metrics</p>
      </div>

      <div className="stats-grid">
        <div className="bandwidth-stat">
          <div className="stat-label">Total Data Today</div>
          <div className="stat-value">{stats?.total_gb || 0} GB</div>
          <div className="progress-bar">
            <div className="progress" style={{width: '65%'}}></div>
          </div>
          <p className="stat-description">Usage: 1.2 TB of 2 TB limit</p>
        </div>
        <div className="bandwidth-stat">
          <div className="stat-label">Peak Hour</div>
          <div className="stat-value">14:00</div>
          <div className="progress-bar">
            <div className="progress" style={{width: '85%'}}></div>
          </div>
          <p className="stat-description">Peak usage: 450 Mbps</p>
        </div>
        <div className="bandwidth-stat">
          <div className="stat-label">Avg Speed</div>
          <div className="stat-value">125 Mbps</div>
          <div className="progress-bar">
            <div className="progress" style={{width: '45%'}}></div>
          </div>
          <p className="stat-description">Average throughput</p>
        </div>
        <div className="bandwidth-stat">
          <div className="stat-label">Users Online</div>
          <div className="stat-value">598</div>
          <div className="progress-bar">
            <div className="progress" style={{width: '80%'}}></div>
          </div>
          <p className="stat-description">Active connections</p>
        </div>
      </div>

      {/* 24-Hour Bandwidth Chart */}
      <div className="chart-container">
        <h3>24-Hour Bandwidth Usage</h3>
        <BandwidthChart data={bandwidthData} />
      </div>

      {/* Hourly Traffic Chart */}
      <div className="chart-container">
        <h3>Hourly Traffic & Peak Analysis</h3>
        <HourlyBandwidthChart data={hourlyData} />
      </div>

      {/* Top Users by Bandwidth */}
      <div className="users-by-bandwidth">
        <h3>Top 5 Users by Bandwidth</h3>
        <TopUsersChart data={[
          { username: 'rajib', usage: 5.2, remaining: 94.8 },
          { username: 'karim', usage: 4.8, remaining: 95.2 },
          { username: 'fatima', usage: 3.2, remaining: 96.8 },
          { username: 'user04', usage: 2.1, remaining: 97.9 },
          { username: 'user05', usage: 1.9, remaining: 98.1 },
        ]} />
      </div>
    </div>
  );

  return (
    <AdminLayout 
      admin={admin} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      onLogout={onLogout}
    >
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'users' && renderUsers()}
      {activeTab === 'packages' && renderPackages()}
      {activeTab === 'billing' && renderBilling()}
      {activeTab === 'sessions' && renderSessions()}
      {activeTab === 'bandwidth' && renderBandwidth()}
      {activeTab === 'reports' && renderReports()}
    </AdminLayout>
  );
}

function StatCard({ icon, label, value, change, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className={`stat-change ${trend}`}>
          {trend === 'up' && <ArrowUpRight size={16} />}
          {trend === 'down' && <ArrowDownRight size={16} />}
          <span>{change}</span>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
