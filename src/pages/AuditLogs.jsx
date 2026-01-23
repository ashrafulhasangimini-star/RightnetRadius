import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Activity, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../components/ui/Table';
import { Input, Select } from '../components/ui/FormElements';
import { Badge } from '../components/ui/Badge';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('today');

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [filter, dateFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = new URL('/api/audit/logs', window.location.origin);
      if (filter !== 'all') {
        url.searchParams.append('action', filter);
      }
      if (dateFilter !== 'all') {
        url.searchParams.append('date', dateFilter);
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        setLogs(Array.isArray(data) ? data : data.logs || []);
      } else {
        // Mock data for demonstration
        setLogs([
          {
            id: 1,
            timestamp: '2024-01-23 14:32:15',
            action: 'login',
            username: 'rajib.khan',
            ip_address: '192.168.1.100',
            details: 'Successful login',
            severity: 'info'
          },
          {
            id: 2,
            timestamp: '2024-01-23 14:28:45',
            action: 'bandwidth_limit',
            username: 'karim.ahmed',
            ip_address: '192.168.1.105',
            details: 'Bandwidth limit exceeded - throttled to 1Mbps',
            severity: 'warning'
          },
          {
            id: 3,
            timestamp: '2024-01-23 14:15:22',
            action: 'authentication_failed',
            username: 'unknown',
            ip_address: '192.168.1.200',
            details: 'Invalid password attempt',
            severity: 'error'
          },
          {
            id: 4,
            timestamp: '2024-01-23 14:10:05',
            action: 'user_block',
            username: 'fatima.islam',
            ip_address: '192.168.1.110',
            details: 'User account blocked by admin',
            severity: 'error'
          },
          {
            id: 5,
            timestamp: '2024-01-23 14:05:33',
            action: 'logout',
            username: 'ali.hassan',
            ip_address: '192.168.1.115',
            details: 'User logged out',
            severity: 'info'
          },
          {
            id: 6,
            timestamp: '2024-01-23 13:58:12',
            action: 'quota_breach',
            username: 'noor.aman',
            ip_address: '192.168.1.120',
            details: 'Monthly quota limit reached',
            severity: 'warning'
          },
          {
            id: 7,
            timestamp: '2024-01-23 13:45:00',
            action: 'disconnect',
            username: 'rajib.khan',
            ip_address: '192.168.1.100',
            details: 'Session disconnected - idle timeout',
            severity: 'warning'
          },
          {
            id: 8,
            timestamp: '2024-01-23 13:30:18',
            action: 'user_unblock',
            username: 'fatima.islam',
            ip_address: '192.168.1.110',
            details: 'User account unblocked by admin',
            severity: 'success'
          },
        ]);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    const config = {
      login: { variant: 'primary', text: 'Login' },
      logout: { variant: 'info', text: 'Logout' },
      bandwidth_limit: { variant: 'warning', text: 'Bandwidth Limit' },
      user_block: { variant: 'danger', text: 'User Block' },
      user_unblock: { variant: 'success', text: 'User Unblock' },
      disconnect: { variant: 'warning', text: 'Disconnect' },
      authentication_failed: { variant: 'danger', text: 'Auth Failed' },
      quota_breach: { variant: 'warning', text: 'Quota Breach' },
    };
    return config[action] || { variant: 'default', text: action };
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'success':
        return <CheckCircle className="text-success" size={18} />;
      case 'error':
        return <XCircle className="text-danger" size={18} />;
      case 'warning':
        return <AlertCircle className="text-warning" size={18} />;
      default:
        return <Info className="text-primary" size={18} />;
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === 'all' || log.action === filter;
    const matchesSearch =
      searchTerm === '' ||
      log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address?.includes(searchTerm) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Audit Logs
          </h2>
          <p className="text-body mt-1">
            Monitor all system activities and security events
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card padding={false}>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-5 bg-opacity-10">
                  <Activity className="text-meta-5" size={20} />
                </div>
                <div>
                  <p className="text-sm text-body">Total Logs</p>
                  <p className="text-title-sm font-bold text-black dark:text-white">
                    {logs.length}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card padding={false}>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-success bg-opacity-10">
                  <CheckCircle className="text-success" size={20} />
                </div>
                <div>
                  <p className="text-sm text-body">Successful</p>
                  <p className="text-title-sm font-bold text-black dark:text-white">
                    {logs.filter(l => l.severity === 'success' || l.severity === 'info').length}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card padding={false}>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-warning bg-opacity-10">
                  <AlertCircle className="text-warning" size={20} />
                </div>
                <div>
                  <p className="text-sm text-body">Warnings</p>
                  <p className="text-title-sm font-bold text-black dark:text-white">
                    {logs.filter(l => l.severity === 'warning').length}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card padding={false}>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-danger bg-opacity-10">
                  <XCircle className="text-danger" size={20} />
                </div>
                <div>
                  <p className="text-sm text-body">Errors</p>
                  <p className="text-title-sm font-bold text-black dark:text-white">
                    {logs.filter(l => l.severity === 'error').length}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Input
                icon={Search}
                placeholder="Search by username, IP, or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Actions' },
                  { value: 'login', label: 'Logins' },
                  { value: 'logout', label: 'Logouts' },
                  { value: 'authentication_failed', label: 'Failed Auth' },
                  { value: 'bandwidth_limit', label: 'Bandwidth' },
                  { value: 'user_block', label: 'Blocks' },
                  { value: 'quota_breach', label: 'Quota' },
                ]}
                className="w-full sm:w-48"
              />

              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                options={[
                  { value: 'today', label: 'Today' },
                  { value: 'yesterday', label: 'Yesterday' },
                  { value: 'week', label: 'Last 7 Days' },
                  { value: 'month', label: 'Last 30 Days' },
                  { value: 'all', label: 'All Time' },
                ]}
                className="w-full sm:w-48"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Logs Table */}
      <Card padding={false}>
        <div className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-center">Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const actionBadge = getActionBadge(log.action);
                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <p className="text-sm text-body whitespace-nowrap">
                          {log.timestamp}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={actionBadge.variant}>
                          {actionBadge.text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-black dark:text-white">
                          {log.username || 'N/A'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-body font-mono text-sm">
                          {log.ip_address || 'N/A'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-body max-w-md truncate">
                          {log.details}
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          {getSeverityIcon(log.severity)}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <div className="py-8">
                      <Activity className="mx-auto text-body mb-2" size={32} />
                      <p className="text-body">No logs found</p>
                      <p className="text-sm text-bodydark2 mt-1">
                        Try adjusting your filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination could be added here */}
      {filteredLogs.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-body">
            Showing {filteredLogs.length} of {logs.length} logs
          </p>
        </div>
      )}
    </div>
  );
}
