import React, { useEffect, useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import StatCard from '@/Components/StatCard'
import OnlineUsersChart from '@/Components/OnlineUsersChart'
import RevenueChart from '@/Components/RevenueChart'
import {
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'
import axios from 'axios'

export default function AdminDashboard({ auth }) {
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    expired_users: 0,
    suspended_users: 0,
    online_users: 0,
    monthly_revenue: 0,
    pending_invoices: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/admin/dashboard-stats')
        setStats(response.data)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
        setLoading(false)
      }
    }

    fetchStats()
    const intervalId = setInterval(fetchStats, 10000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <AdminLayout user={auth.user}>
      <Head title="Admin Dashboard" />

      <div className="p-6 lg:p-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {auth.user.name}</p>
        </div>

        {/* Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Users"
              value={stats.total_users}
              unit="users"
              icon={UserGroupIcon}
            />
            <StatCard
              label="Active Users"
              value={stats.active_users}
              unit="active"
              icon={CheckCircleIcon}
            />
            <StatCard
              label="Online Now"
              value={stats.online_users}
              unit="online"
              trend={2}
            />
            <StatCard
              label="Monthly Revenue"
              value={stats.monthly_revenue}
              unit="৳"
              icon={CurrencyDollarIcon}
            />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <OnlineUsersChart interval={10000} />
          <RevenueChart days={30} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <ExclamationIcon className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">{stats.expired_users} Expired Users</p>
                  <p className="text-sm text-red-700">Need renewal</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <ExclamationIcon className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">{stats.pending_invoices} Pending Invoices</p>
                  <p className="text-sm text-yellow-700">Awaiting payment</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link
                href="/admin/users"
                className="block p-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <p className="font-medium text-blue-900">Manage Users</p>
                <p className="text-sm text-blue-700">Create, edit, disable users</p>
              </Link>
              <Link
                href="/admin/packages"
                className="block p-3 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition-colors"
              >
                <p className="font-medium text-green-900">Manage Packages</p>
                <p className="text-sm text-green-700">View and edit packages</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
