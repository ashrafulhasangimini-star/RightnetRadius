import React, { useEffect, useState } from 'react'
import { Head } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import StatCard from '@/Components/StatCard'
import {
  ExclamationTriangleIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  ShieldExclamationIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { dashboardAPI, fupAPI } from '@/lib/api'

export default function FupDashboard({ auth }) {
  const [stats, setStats] = useState({
    total_fup_users: 0,
    fup_applied_count: 0,
    warning_users_count: 0,
    total_quota_used_gb: 0,
    avg_usage_percentage: 0,
  })
  const [topUsers, setTopUsers] = useState([])
  const [fupAppliedUsers, setFupAppliedUsers] = useState([])
  const [usageTrend, setUsageTrend] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        const response = await dashboardAPI.getFupDashboard()
        setStats(response.data.statistics)
        setTopUsers(response.data.top_users)
        setFupAppliedUsers(response.data.fup_applied_users)
        setUsageTrend(response.data.usage_trend)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch FUP dashboard data:', error)
        setError('Failed to load FUP dashboard data')
        setLoading(false)
      }
    }

    fetchData()
    const intervalId = setInterval(fetchData, 30000)

    return () => clearInterval(intervalId)
  }, [])

  const handleCheckAllUsers = async () => {
    setProcessing(true)
    try {
      await fupAPI.checkAllUsers()
      // Refresh data after checking
      const response = await dashboardAPI.getFupDashboard()
      setStats(response.data.statistics)
      setTopUsers(response.data.top_users)
      setFupAppliedUsers(response.data.fup_applied_users)
    } catch (error) {
      console.error('Failed to check all users:', error)
    }
    setProcessing(false)
  }

  const handleResetMonthly = async () => {
    if (!confirm('Are you sure you want to reset monthly FUP for all users?')) return
    
    setProcessing(true)
    try {
      await fupAPI.resetMonthly()
      // Refresh data after reset
      const response = await dashboardAPI.getFupDashboard()
      setStats(response.data.statistics)
      setTopUsers(response.data.top_users)
      setFupAppliedUsers(response.data.fup_applied_users)
    } catch (error) {
      console.error('Failed to reset monthly FUP:', error)
    }
    setProcessing(false)
  }

  const getUsageColor = (percentage) => {
    if (percentage >= 100) return 'text-red-600 bg-red-100'
    if (percentage >= 80) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <AdminLayout user={auth.user}>
      <Head title="FUP Dashboard" />

      <div className="p-6 lg:p-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">FUP Dashboard</h1>
            <p className="mt-2 text-gray-600">Fair Usage Policy monitoring and management</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCheckAllUsers}
              disabled={processing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
              Check All Users
            </button>
            <button
              onClick={handleResetMonthly}
              disabled={processing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              <ShieldExclamationIcon className="h-4 w-4 mr-2" />
              Reset Monthly
            </button>
          </div>
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
              label="FUP Enabled Users"
              value={stats.total_fup_users}
              unit="users"
              icon={UserGroupIcon}
              color="blue"
            />
            <StatCard
              label="FUP Applied"
              value={stats.fup_applied_count}
              unit="users"
              icon={ExclamationTriangleIcon}
              color="red"
            />
            <StatCard
              label="Warning Zone"
              value={stats.warning_users_count}
              unit="users"
              icon={ClockIcon}
              color="yellow"
            />
            <StatCard
              label="Total Quota Used"
              value={`${stats.total_quota_used_gb} GB`}
              icon={ChartBarIcon}
              color="purple"
            />
            <StatCard
              label="Average Usage"
              value={`${stats.avg_usage_percentage}%`}
              icon={ChartBarIcon}
              color="indigo"
            />
          </div>
        )}

        {/* Usage Trend Chart */}
        {!loading && !error && usageTrend?.length > 0 && (
          <div className="mb-8">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Trend (Last 30 Days)</h3>
              <div className="h-64 flex items-end justify-between gap-1">
                {usageTrend.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{
                        height: `${Math.max((day.usage_gb / Math.max(...usageTrend.map(d => d.usage_gb))) * 200, 4)}px`
                      }}
                      title={`${day.date}: ${day.usage_gb} GB`}
                    ></div>
                    <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                      {day.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top Users and FUP Applied Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Users by Usage */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Users by Usage</h3>
            <div className="space-y-4">
              {topUsers?.slice(0, 10).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{user.username}</span>
                      <span className="text-sm text-gray-500">{user.package_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(user.usage_percentage)}`}
                          style={{ width: `${Math.min(user.usage_percentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getUsageColor(user.usage_percentage)}`}>
                        {user.usage_percentage?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {user.usage_gb} GB / {user.quota_gb} GB
                      {user.fup_applied && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          FUP Applied
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(!topUsers || topUsers.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No usage data available
                </div>
              )}
            </div>
          </div>

          {/* FUP Applied Users */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">FUP Applied Users</h3>
            <div className="space-y-4">
              {fupAppliedUsers?.slice(0, 10).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{user.username}</span>
                      <span className="text-sm text-gray-500">{user.package_name}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <div>Applied: {new Date(user.fup_applied_at).toLocaleDateString()}</div>
                      <div>Speed: {user.original_speed} → {user.fup_speed}</div>
                    </div>
                  </div>
                </div>
              ))}
              {(!fupAppliedUsers || fupAppliedUsers.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No FUP applied users
                </div>
              )}
            </div>
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
