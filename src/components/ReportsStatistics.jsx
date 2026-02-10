import React, { useState, useEffect } from 'react'
import {
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  SignalIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WifiIcon
} from '@heroicons/react/24/outline'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import axios from 'axios'

const ReportsStatistics = () => {
  const [activeTab, setActiveTab] = useState('subscriber')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    subscriber: {},
    accounting: {},
    user: {},
    profit: {},
    usage: {}
  })

  const tabs = [
    { id: 'subscriber', name: 'Subscriber', icon: UserGroupIcon },
    { id: 'accounting', name: 'Accounting', icon: BanknotesIcon },
    { id: 'user', name: 'User', icon: UsersIcon },
    { id: 'profit', name: 'Profit Analysis', icon: ArrowTrendingUpIcon },
    { id: 'usage', name: 'Usage', icon: SignalIcon }
  ]

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [subscriberRes, accountingRes, userRes, profitRes, usageRes] = await Promise.all([
        axios.get('/api/reports/subscriber'),
        axios.get('/api/reports/accounting'),
        axios.get('/api/reports/user'),
        axios.get('/api/reports/profit'),
        axios.get('/api/reports/usage')
      ])

      setData({
        subscriber: subscriberRes.data,
        accounting: accountingRes.data,
        user: userRes.data,
        profit: profitRes.data,
        usage: usageRes.data
      })
    } catch (error) {
      console.error('Failed to fetch reports data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, unit, icon: Icon, trend, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200 text-blue-900',
      green: 'bg-green-50 border-green-200 text-green-900',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      red: 'bg-red-50 border-red-200 text-red-900',
      purple: 'bg-purple-50 border-purple-200 text-purple-900',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900'
    }

    return (
      <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-75">{title}</p>
            <p className="text-2xl font-bold">
              {typeof value === 'number' ? value.toLocaleString() : value} {unit}
            </p>
            {trend && (
              <div className="flex items-center mt-2">
                {trend > 0 ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(trend)}%
                </span>
              </div>
            )}
          </div>
          {Icon && <Icon className="h-8 w-8 opacity-50" />}
        </div>
      </div>
    )
  }

  const SubscriberTab = () => {
    const subscriberData = data.subscriber
    
    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="মোট গ্রাহক"
            value={subscriberData.total_subscribers || 0}
            unit="জন"
            icon={UserGroupIcon}
            color="blue"
            trend={subscriberData.subscriber_growth || 0}
          />
          <StatCard
            title="সক্রিয় গ্রাহক"
            value={subscriberData.active_subscribers || 0}
            unit="জন"
            icon={CheckCircleIcon}
            color="green"
          />
          <StatCard
            title="নতুন গ্রাহক (এই মাসে)"
            value={subscriberData.new_subscribers || 0}
            unit="জন"
            icon={UsersIcon}
            color="purple"
          />
          <StatCard
            title="বন্ধ গ্রাহক"
            value={subscriberData.suspended_subscribers || 0}
            unit="জন"
            icon={ExclamationTriangleIcon}
            color="red"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subscriber Growth Chart */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">গ্রাহক বৃদ্ধির হার</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={subscriberData.growth_chart || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="subscribers" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Package Distribution */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">প্যাকেজ বিতরণ</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subscriberData.package_distribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(subscriberData.package_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  const AccountingTab = () => {
    const accountingData = data.accounting
    
    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="মাসিক আয়"
            value={accountingData.monthly_revenue || 0}
            unit="৳"
            icon={CurrencyDollarIcon}
            color="green"
            trend={accountingData.revenue_growth || 0}
          />
          <StatCard
            title="বকেয়া বিল"
            value={accountingData.pending_invoices || 0}
            unit="৳"
            icon={ClockIcon}
            color="yellow"
          />
          <StatCard
            title="আজকের আয়"
            value={accountingData.daily_revenue || 0}
            unit="৳"
            icon={BanknotesIcon}
            color="blue"
          />
          <StatCard
            title="মোট লেনদেন"
            value={accountingData.total_transactions || 0}
            unit="টি"
            icon={ChartBarIcon}
            color="purple"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">মাসিক আয়ের চার্ট</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={accountingData.revenue_chart || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">পেমেন্ট পদ্ধতি</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={accountingData.payment_methods || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  const UserTab = () => {
    const userData = data.user
    
    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="অনলাইন ব্যবহারকারী"
            value={userData.online_users || 0}
            unit="জন"
            icon={WifiIcon}
            color="green"
          />
          <StatCard
            title="আজকের লগইন"
            value={userData.daily_logins || 0}
            unit="বার"
            icon={UsersIcon}
            color="blue"
          />
          <StatCard
            title="গড় সেশন সময়"
            value={userData.avg_session_time || 0}
            unit="মিনিট"
            icon={ClockIcon}
            color="purple"
          />
          <StatCard
            title="সক্রিয় সেশন"
            value={userData.active_sessions || 0}
            unit="টি"
            icon={SignalIcon}
            color="indigo"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hourly Usage */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">ঘন্টা অনুযায়ী ব্যবহার</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userData.hourly_usage || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Device Types */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">ডিভাইসের ধরন</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userData.device_types || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(userData.device_types || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#F59E0B', '#10B981', '#3B82F6', '#EF4444'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  const ProfitAnalysisTab = () => {
    const profitData = data.profit
    
    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="মোট লাভ"
            value={profitData.total_profit || 0}
            unit="৳"
            icon={ArrowTrendingUpIcon}
            color="green"
            trend={profitData.profit_growth || 0}
          />
          <StatCard
            title="মাসিক খরচ"
            value={profitData.monthly_expenses || 0}
            unit="৳"
            icon={ArrowTrendingDownIcon}
            color="red"
          />
          <StatCard
            title="লাভের হার"
            value={profitData.profit_margin || 0}
            unit="%"
            icon={ChartBarIcon}
            color="blue"
          />
          <StatCard
            title="ROI"
            value={profitData.roi || 0}
            unit="%"
            icon={CurrencyDollarIcon}
            color="purple"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profit vs Revenue */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">লাভ বনাম আয়</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={profitData.profit_vs_revenue || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">খরচের বিভাজন</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={profitData.expense_breakdown || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(profitData.expense_breakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#EF4444', '#F59E0B', '#8B5CF6', '#10B981', '#3B82F6'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  const UsageTab = () => {
    const usageData = data.usage
    
    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="মোট ডেটা ব্যবহার"
            value={usageData.total_data_usage || 0}
            unit="GB"
            icon={SignalIcon}
            color="blue"
          />
          <StatCard
            title="গড় ব্যান্ডউইথ"
            value={usageData.avg_bandwidth || 0}
            unit="Mbps"
            icon={WifiIcon}
            color="green"
          />
          <StatCard
            title="পিক আওয়ার ব্যবহার"
            value={usageData.peak_usage || 0}
            unit="GB"
            icon={ArrowTrendingUpIcon}
            color="yellow"
          />
          <StatCard
            title="FUP লঙ্ঘন"
            value={usageData.fup_violations || 0}
            unit="টি"
            icon={ExclamationTriangleIcon}
            color="red"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Usage */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">দৈনিক ব্যবহার</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={usageData.daily_usage || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="usage" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top Users */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">শীর্ষ ব্যবহারকারী</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageData.top_users || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="username" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    switch (activeTab) {
      case 'subscriber':
        return <SubscriberTab />
      case 'accounting':
        return <AccountingTab />
      case 'user':
        return <UserTab />
      case 'profit':
        return <ProfitAnalysisTab />
      case 'usage':
        return <UsageTab />
      default:
        return <SubscriberTab />
    }
  }

  return (
    <div className="bg-white rounded-lg border">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">Reports & Statistics</h2>
        <p className="text-sm text-gray-600 mt-1">বিস্তারিত রিপোর্ট এবং পরিসংখ্যান</p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  )
}

export default ReportsStatistics