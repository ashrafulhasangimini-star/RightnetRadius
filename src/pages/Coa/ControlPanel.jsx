import React, { useEffect, useState } from 'react'
import { Head } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import StatCard from '@/Components/StatCard'
import {
  SignalIcon,
  UserMinusIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { dashboardAPI, coaAPI, usersAPI } from '@/lib/api'

export default function CoaControlPanel({ auth }) {
  const [stats, setStats] = useState({
    total_requests: 0,
    success_count: 0,
    failed_count: 0,
    pending_count: 0,
    success_rate: 0,
  })
  const [recentRequests, setRecentRequests] = useState([])
  const [commandStats, setCommandStats] = useState([])
  const [nasStats, setNasStats] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)
  
  // Form states
  const [selectedUsers, setSelectedUsers] = useState([])
  const [speedValue, setSpeedValue] = useState('5M/5M')
  const [nasIp, setNasIp] = useState('192.168.1.1')
  const [secret, setSecret] = useState('secret123')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        const [coaResponse, usersResponse] = await Promise.all([
          dashboardAPI.getCoaDashboard(),
          usersAPI.getList()
        ])
        
        setStats(coaResponse.data.statistics || {})
        setRecentRequests(coaResponse.data.recent_requests || [])
        setCommandStats(coaResponse.data.command_statistics || [])
        setNasStats(coaResponse.data.nas_statistics || [])
        setUsers(usersResponse.data.data || [])
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch COA dashboard data:', error)
        setError('Failed to load COA dashboard data')
        setLoading(false)
      }
    }

    fetchData()
    const intervalId = setInterval(fetchData, 30000)

    return () => clearInterval(intervalId)
  }, [])

  const handleSpeedChange = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user')
      return
    }

    setProcessing(true)
    try {
      const promises = selectedUsers.map(userId => {
        const user = users.find(u => u.id === userId)
        return coaAPI.changeSpeed({
          username: user.username,
          speed: speedValue,
          nas_ip: nasIp,
          secret: secret
        })
      })

      await Promise.all(promises)
      
      // Refresh data
      const response = await dashboardAPI.getCoaDashboard()
      setRecentRequests(response.data.recent_requests || [])
      setSelectedUsers([])
      
      alert('Speed change requests sent successfully')
    } catch (error) {
      console.error('Failed to change speed:', error)
      alert('Failed to send speed change requests')
    }
    setProcessing(false)
  }

  const handleDisconnect = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user')
      return
    }

    if (!confirm(`Are you sure you want to disconnect ${selectedUsers.length} user(s)?`)) {
      return
    }

    setProcessing(true)
    try {
      const promises = selectedUsers.map(userId => {
        const user = users.find(u => u.id === userId)
        return coaAPI.disconnect({
          username: user.username,
          nas_ip: nasIp,
          secret: secret
        })
      })

      await Promise.all(promises)
      
      // Refresh data
      const response = await dashboardAPI.getCoaDashboard()
      setRecentRequests(response.data.recent_requests || [])
      setSelectedUsers([])
      
      alert('Disconnect requests sent successfully')
    } catch (error) {
      console.error('Failed to disconnect users:', error)
      alert('Failed to send disconnect requests')
    }
    setProcessing(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return CheckCircleIcon
      case 'failed': return XCircleIcon
      case 'pending': return ClockIcon
      default: return ClockIcon
    }
  }

  return (
    <AdminLayout user={auth.user}>
      <Head title="COA Control Panel" />

      <div className="p-6 lg:p-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">COA Control Panel</h1>
          <p className="mt-2 text-gray-600">Change of Authorization management and monitoring</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatCard
              label="Total Requests"
              value={stats.total_requests}
              unit="requests"
              icon={ArrowPathIcon}
              color="blue"
            />
            <StatCard
              label="Successful"
              value={stats.success_count}
              unit="requests"
              icon={CheckCircleIcon}
              color="green"
            />
            <StatCard
              label="Failed"
              value={stats.failed_count}
              unit="requests"
              icon={XCircleIcon}
              color="red"
            />
            <StatCard
              label="Pending"
              value={stats.pending_count}
              unit="requests"
              icon={ClockIcon}
              color="yellow"
            />
            <StatCard
              label="Success Rate"
              value={`${stats.success_rate}%`}
              icon={SignalIcon}
              color="purple"
            />
          </div>
        )}

        {/* COA Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Speed Change Panel */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Speed Change</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Users
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md">
                  {users.slice(0, 20).map((user) => (
                    <label key={user.id} className="flex items-center p-2 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id])
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        {user.username} ({user.status})
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedUsers.length} user(s) selected
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Speed
                </label>
                <select
                  value={speedValue}
                  onChange={(e) => setSpeedValue(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="1M/1M">1 Mbps</option>
                  <option value="2M/2M">2 Mbps</option>
                  <option value="5M/5M">5 Mbps</option>
                  <option value="10M/10M">10 Mbps</option>
                  <option value="20M/20M">20 Mbps</option>
                  <option value="50M/50M">50 Mbps</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NAS IP
                  </label>
                  <input
                    type="text"
                    value={nasIp}
                    onChange={(e) => setNasIp(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secret
                  </label>
                  <input
                    type="password"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSpeedChange}
                  disabled={processing || selectedUsers.length === 0}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <SignalIcon className="h-4 w-4 mr-2" />
                  Change Speed
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={processing || selectedUsers.length === 0}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  <UserMinusIcon className="h-4 w-4 mr-2" />
                  Disconnect
                </button>
              </div>
            </div>
          </div>

          {/* NAS Statistics */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">NAS Statistics</h3>
            <div className="space-y-4">
              {nasStats.map((nas, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{nas.nas_ip}</p>
                    <p className="text-sm text-gray-500">
                      {nas.success}/{nas.total} requests
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      nas.success_rate >= 90 ? 'text-green-600' :
                      nas.success_rate >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {nas.success_rate}%
                    </p>
                    <p className="text-xs text-gray-500">Success Rate</p>
                  </div>
                </div>
              ))}
              {nasStats.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No NAS statistics available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent COA Requests */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent COA Requests</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Command</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAS IP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentRequests.slice(0, 20).map((request) => {
                  const StatusIcon = getStatusIcon(request.status)
                  return (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.user_name || request.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="capitalize">{request.command_type.replace('_', ' ')}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.nas_ip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                        {request.response || 'No response'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {recentRequests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No COA requests found
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
