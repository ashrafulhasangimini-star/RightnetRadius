import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit2, Trash2, Package, 
  RefreshCw, Check, X, Zap, HardDrive
} from 'lucide-react';
import { packagesAPI } from '../lib/api';

export default function PackageManagement() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    speed: '',
    price: '',
    quota_gb: '',
    fup_enabled: false,
    fup_speed: '',
    status: 'active'
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await packagesAPI.getList();
      setPackages(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      // Mock data
      setPackages([
        { id: 1, name: 'Basic Plan', speed: '5M/5M', price: 500, quota_gb: 100, fup_enabled: true, fup_speed: '1M/1M', status: 'active', users_count: 5 },
        { id: 2, name: 'Standard Plan', speed: '10M/10M', price: 1000, quota_gb: 200, fup_enabled: true, fup_speed: '2M/2M', status: 'active', users_count: 8 },
        { id: 3, name: 'Premium Plan', speed: '20M/20M', price: 1500, quota_gb: 500, fup_enabled: true, fup_speed: '5M/5M', status: 'active', users_count: 12 },
        { id: 4, name: 'Enterprise Plan', speed: '50M/50M', price: 3000, quota_gb: 1000, fup_enabled: false, fup_speed: '10M/10M', status: 'active', users_count: 3 },
        { id: 5, name: 'Ultimate Plan', speed: '100M/100M', price: 5000, quota_gb: 2000, fup_enabled: false, fup_speed: '50M/50M', status: 'inactive', users_count: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPackage) {
      // Update existing package
      setPackages(packages.map(p => 
        p.id === editingPackage.id ? { ...p, ...formData } : p
      ));
    } else {
      // Add new package
      setPackages([...packages, { id: Date.now(), ...formData, users_count: 0 }]);
    }
    setShowModal(false);
    setEditingPackage(null);
    setFormData({
      name: '', speed: '', price: '', quota_gb: '', fup_enabled: false, fup_speed: '', status: 'active'
    });
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      speed: pkg.speed,
      price: pkg.price,
      quota_gb: pkg.quota_gb,
      fup_enabled: pkg.fup_enabled,
      fup_speed: pkg.fup_speed || '',
      status: pkg.status
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this package?')) {
      setPackages(packages.filter(p => p.id !== id));
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Inactive</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Package Management</h2>
        <button 
          onClick={() => {
            setEditingPackage(null);
            setFormData({
              name: '', speed: '', price: '', quota_gb: '', fup_enabled: false, fup_speed: '', status: 'active'
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus size={18} />
          Add New Package
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search packages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => (
          <div key={pkg.id} className="bg-white dark:bg-boxdark rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${
                    pkg.fup_enabled ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    <Package className={`w-6 h-6 ${
                      pkg.fup_enabled ? 'text-purple-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{pkg.name}</h3>
                    {getStatusBadge(pkg.status)}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Zap size={16} /> Speed
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{pkg.speed}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <HardDrive size={16} /> Data Limit
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{pkg.quota_gb} GB</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Price</span>
                  <span className="font-medium text-gray-900 dark:text-white">৳{pkg.price}/month</span>
                </div>
                {pkg.fup_enabled && (
                  <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">FUP Speed</span>
                    <span className="font-medium text-gray-900 dark:text-white">{pkg.fup_speed}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-500 dark:text-gray-400">Users</span>
                  <span className="font-medium text-gray-900 dark:text-white">{pkg.users_count}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t dark:border-gray-700">
                <button 
                  onClick={() => handleEdit(pkg)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(pkg.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPackages.length === 0 && (
        <div className="bg-white dark:bg-boxdark rounded-lg p-8 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No packages found</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-boxdark rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingPackage ? 'Edit Package' : 'Add New Package'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Premium Plan"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Speed (Up/Down)</label>
                  <input
                    type="text"
                    required
                    value={formData.speed}
                    onChange={(e) => setFormData({...formData, speed: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 10M/10M"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (৳)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="1000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Limit (GB)</label>
                  <input
                    type="number"
                    required
                    value={formData.quota_gb}
                    onChange={(e) => setFormData({...formData, quota_gb: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fup_enabled"
                  checked={formData.fup_enabled}
                  onChange={(e) => setFormData({...formData, fup_enabled: e.target.checked})}
                  className="w-4 h-4 text-primary border-gray-300 rounded"
                />
                <label htmlFor="fup_enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable FUP (Fair Usage Policy)
                </label>
              </div>
              {formData.fup_enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">FUP Speed</label>
                  <input
                    type="text"
                    value={formData.fup_speed}
                    onChange={(e) => setFormData({...formData, fup_speed: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 2M/2M"
                  />
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  {editingPackage ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
