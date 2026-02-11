import React, { useState } from 'react';
import { 
  CreditCard, DollarSign, RefreshCw, CheckCircle, XCircle,
  Search, Filter, Download, Calendar, Wallet, Banknote,
  ArrowUpRight, ArrowDownRight, History, Building
} from 'lucide-react';

export default function RechargePayment() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock transactions
  const transactions = [
    { id: 1, username: 'rajib', name: 'Rajib Khan', amount: 1500, method: 'bKash', type: 'recharge', status: 'completed', date: '2024-02-10 10:30 AM', transaction_id: 'TXN001234' },
    { id: 2, username: 'karim', name: 'Karim Ahmed', amount: 1000, method: 'Nagad', type: 'recharge', status: 'completed', date: '2024-02-10 09:15 AM', transaction_id: 'TXN001233' },
    { id: 3, username: 'fatima', name: 'Fatima Islam', amount: 500, method: 'Bank', type: 'recharge', status: 'pending', date: '2024-02-10 08:45 AM', transaction_id: 'TXN001232' },
    { id: 4, username: 'hossain', name: 'Hossain Ali', amount: 3000, method: 'bKash', type: 'recharge', status: 'completed', date: '2024-02-09 04:20 PM', transaction_id: 'TXN001231' },
    { id: 5, username: 'sultana', name: 'Sultana Begum', amount: 1500, method: 'Nagad', type: 'recharge', status: 'failed', date: '2024-02-09 02:10 PM', transaction_id: 'TXN001230' },
  ];

  const stats = {
    today_recharge: 4500,
    today_count: 12,
    pending: 500,
    failed: 1500,
    monthly_total: 125000,
    monthly_count: 85
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'completed') return matchesSearch && tx.status === 'completed';
    if (activeTab === 'pending') return matchesSearch && tx.status === 'pending';
    if (activeTab === 'failed') return matchesSearch && tx.status === 'failed';
    return matchesSearch;
  });

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1">
        <CheckCircle size={12} /> Completed
      </span>;
    }
    if (status === 'pending') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
        <RefreshCw size={12} /> Pending
      </span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center gap-1">
      <XCircle size={12} /> Failed
    </span>;
  };

  const getMethodIcon = (method) => {
    if (method === 'bKash') return <span className="text-pink-500 font-bold">bKash</span>;
    if (method === 'Nagad') return <span className="text-orange-500 font-bold">Nagad</span>;
    return <span className="text-blue-500 font-bold">{method}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recharge & Payment</h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Today's Recharge</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">৳{stats.today_recharge.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Transactions Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.today_count}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <RefreshCw className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">৳{stats.pending.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">৳{stats.failed.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="opacity-90">Monthly Total Revenue</p>
            <p className="text-3xl font-bold">৳{stats.monthly_total.toLocaleString()}</p>
            <p className="opacity-90 mt-1">{stats.monthly_count} transactions this month</p>
          </div>
          <div className="hidden md:block">
            <CreditCard className="w-16 h-16 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'all' 
                ? 'bg-primary text-white' 
                : 'border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'completed' 
                ? 'bg-primary text-white' 
                : 'border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'pending' 
                ? 'bg-primary text-white' 
                : 'border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab('failed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'failed' 
                ? 'bg-primary text-white' 
                : 'border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            }`}
          >
            Failed
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Transaction ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{tx.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">@{tx.username}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-semibold text-green-600">৳{tx.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-4">
                    {getMethodIcon(tx.method)}
                  </td>
                  <td className="px-4 py-4">
                    {getStatusBadge(tx.status)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {tx.transaction_id}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {tx.date}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
