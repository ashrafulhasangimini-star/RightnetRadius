import React, { useEffect, useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import UserLayout from '@/Layouts/UserLayout'
import StatCard from '@/Components/StatCard'
import BandwidthChart from '@/Components/BandwidthChart'
import UsageChart from '@/Components/UsageChart'
import {
  CalendarIcon,
  ShieldCheckIcon,
  WifiIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import axios from 'axios'

export default function UserDashboard({ auth }) {
  const [userInfo, setUserInfo] = useState({
    package: {},
    days_remaining: 0,
    is_expired: false,
    is_active: false,
    balance: 0,
    fup_used: 0,
    fup_limit: 0,
  })
  const [online, setOnline] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(`/api/user/info`)
        setUserInfo(response.data)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch user info:', error)
        setLoading(false)
      }
    }

    const checkOnline = async () => {
      try {
        const response = await axios.get(`/api/user/online-status`)
        setOnline(response.data.online)
      } catch (error) {
        console.error('Failed to check online status:', error)
      }
    }

    fetchUserInfo()
    checkOnline()

    const userInfoInterval = setInterval(fetchUserInfo, 30000)
    const onlineInterval = setInterval(checkOnline, 5000)

    return () => {
      clearInterval(userInfoInterval)
      clearInterval(onlineInterval)
    }
  }, [])

  const fupPercentage = userInfo.fup_limit ? (userInfo.fup_used / userInfo.fup_limit) * 100 : 0
  const fupExceeded = fupPercentage > 100

  return (
    <UserLayout user={auth.user}>
      <Head title="Dashboard" />

      <div className="p-6 lg:p-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome, {auth.user.username}</p>
        </div>

        {/* Status Alert */}
        {userInfo.is_expired && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-red-800 font-medium">Your subscription has expired. Please renew to continue using the service.</p>
          </div>
        )}

        {!userInfo.is_active && !userInfo.is_expired && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="text-yellow-800 font-medium">Your account is currently suspended.</p>
          </div>
        )}

        {online && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-green-800 font-medium">✓ You are currently online</p>
          </div>
        )}

        {/* Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Package"
              value={userInfo.package?.name || 'N/A'}
              unit={userInfo.package?.speed_download ? `${userInfo.package.speed_download}Mbps` : ''}
              icon={WifiIcon}
            />
            <StatCard
              label="Days Remaining"
              value={userInfo.days_remaining}
              unit="days"
              icon={CalendarIcon}
              trend={userInfo.days_remaining > 5 ? 0 : -10}
            />
            <StatCard
              label="Account Status"
              value={userInfo.is_active ? 'Active' : 'Inactive'}
              unit={userInfo.is_active ? '✓' : '✗'}
              icon={ShieldCheckIcon}
            />
            <StatCard
              label="Balance"
              value={userInfo.balance}
              unit="৳"
              icon={DocumentTextIcon}
            />
          </div>
        )}

        {/* FUP Status */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fair Usage Policy (FUP)</h3>
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <span className="text-sm font-medium text-gray-700">
                Used: {userInfo.fup_used.toFixed(2)} GB / {userInfo.fup_limit} GB
              </span>
              <span className={`text-sm font-bold ${fupExceeded ? 'text-red-600' : 'text-blue-600'}`}>
                {fupPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  fupPercentage > 100 ? 'bg-red-500' : fupPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(fupPercentage, 100)}%` }}
              />
            </div>
            {fupExceeded && (
              <p className="text-sm text-red-600">
                You have exceeded your FUP limit. Your speed may be reduced.
              </p>
            )}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <BandwidthChart userId={auth.user.id} interval={5000} />
          <UsageChart userId={auth.user.id} timeframe="daily" />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/user/usage"
            className="card-hover"
          >
            <h3 className="text-lg font-semibold text-gray-900">View Usage Details</h3>
            <p className="text-sm text-gray-600 mt-2">Detailed breakdown of your usage</p>
          </Link>
          <Link
            href="/user/invoices"
            className="card-hover"
          >
            <h3 className="text-lg font-semibold text-gray-900">Invoices</h3>
            <p className="text-sm text-gray-600 mt-2">View and pay your invoices</p>
          </Link>
        </div>
      </div>
    </UserLayout>
  )
}
