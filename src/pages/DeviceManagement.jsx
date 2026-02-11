import React, { useState } from 'react';
import { 
  Router, Plus, Edit2, Trash2, RefreshCw, 
  CheckCircle, XCircle, Activity, Wifi, Search,
  Cpu, HardDrive, Network, Zap
} from 'lucide-react';

export default function DeviceManagement() {
  const [devices, setDevices] = useState([
    { id: 1, name: 'OLT-Main', ip: '10.0.0.1', type: 'olt', model: 'Huawei MA5800', location: 'Head Office', status: 'active', ports: 16, uptime: '45d 12h', last_maintenance: '2024-01-15' },
    { id: 2, name: 'OLT-Backup', ip: '10.0.0.2', type: 'olt', model: 'ZTE C320', location: 'Head Office', status: 'active', ports: 8, uptime: '45d 12h', last_maintenance: '2024-01-15' },
    { id: 3, name: 'SW-Core-1', ip: '192.168.1.2', type: 'switch', model: 'Cisco Catalyst 2960', location: 'Server Room', status: 'active', ports: 48, uptime: '30d 8h', last_maintenance: '2024-02-01' },
    { id: 4, name: 'SW-Access-F1', ip: '192.168.2.1', type: 'switch', model: 'MikroTik CRS326', location: 'Floor 1', status: 'active', ports: 24, uptime: '15d 4h', last_maintenance: '2024-02-05' },
    { id: 5, name: 'AP-Lobby', ip: '192.168.3.1', type: 'ap', model: 'Ubiquiti UniFi AP AC', location: 'Main Lobby', status: 'active', ports: 1, uptime: '20d 6h', last_maintenance: '2024-01-28' },
    { id: 6, name: 'AP-Floor2', ip: '192.168.3.2', type: 'ap', model: 'Ubiquiti UniFi AP AC', location: 'Floor 2', status: 'inactive', ports: 1, uptime: '0d 0h', last_maintenance: '2024-01-28' },
    { id: 7, name: 'Router-GW', ip: '192.168.1.1', type: 'router', model: 'MikroTik CCR2004', location: 'Head Office', status: 'active', ports: 8, uptime: '45d 12h', last_maintenance: '2024-01-10' },
    { id: 8, name: 'FW-Main', ip: '192.168.0.1', type: 'firewall', model: 'MikroTik CCR2004', location: 'Head Office', status: 'active', ports: 8, uptime: '45d 12h', last_maintenance: '2024-01-10' },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [formData, setFormData] = useState({
    name: '', ip: '', type: 'router', model: '', location: '', status: 'active'
  });

  const filteredDevices = devices.filter(device => {
    const matchesSearch = 
      device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.ip?.includes(searchTerm) ||
      device.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && device.type === filterType;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingDevice) {
      setDevices(devices.map(d => d.id === editingDevice.id ? { ...d, ...formData } : d));
    } else {
      setDevices([...devices, { id: Date.now(), ...formData, ports: 1, uptime: '0d 0h', last_maintenance: new Date().toISOString().split('T')[0] }]);
    }
    setShowModal(false);
    setEditingDevice(null);
    setFormData({ name: '', ip: '', type: 'router', model: '', location: '', status: 'active' });
  };

  const handleEdit = (device) => {
    setEditingDevice(device);
    setFormData({
      name: device.name,
      ip: device.ip,
      type: device.type,
      model: device.model,
      location: device.location,
      status: device.status
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this device?')) {
      setDevices(devices.filter(d => d.id !== id));
    }
  };

  const handleReboot = (device) => {
    if (confirm(`Are you sure you want to reboot ${device.name}?`)) {
      alert(`Reboot command sent to ${device.name}`);
    }
  };

  const handleTest = (device) => {
    alert(`Testing connection to ${device.name}...`);
  };

  const getTypeIcon = (type) => {
    const icons = {
      router: <Router size={24} />,
      switch: <Network size={24} />,
      ap: <Wifi size={24} />,
      olt: <HardDrive size={24} />,
      firewall: <Zap size={24} />
    };
    return icons[type] || <Cpu size={24} />;
  };

  const getTypeColor = (type) => {
    const colors = {
      router: 'from-blue-500 to-cyan-500',
      switch: 'from-purple-500 to-indigo-500',
      ap: 'from-green-500 to-emerald-500',
      olt: 'from-orange-500 to-red-500',
      firewall: 'from-red-500 to-pink-500'
    };
    return colors[type] || 'from-gray-500 to-slate-500';
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1">
        <CheckCircle size={12} /> Online
      </span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center gap-1">
      <XCircle size={12} /> Offline
    </span>;
  };

  const deviceTypes = [
    { value: 'router', label: 'Router' },
    { value: 'switch', label: 'Switch' },
    { value: 'ap', label: 'Access Point' },
    { value: 'olt', label: 'OLT' },
    { value: 'firewall', label: 'Firewall' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Device Management</h2>
        <button 
          onClick={() => {
            setEditingDevice(null);
            setFormData({ name: '', ip: '', type: 'router', model: '', location: '', status: 'active' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus size={18} />
          Add New Device
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Router className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Devices</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{devices.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{devices.filter(d => d.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Offline</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{devices.filter(d => d.status !== 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Routers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{devices.filter(d => d.type === 'router').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Types</option>
          {deviceTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevices.map((device) => (
          <div key={device.id} className={`bg-gradient-to-r ${getTypeColor(device.type)} rounded-lg p-6 text-white shadow-lg`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  {getTypeIcon(device.type)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{device.name}</h3>
                  <p className="text-sm opacity-80">{device.model}</p>
                </div>
              </div>
              {getStatusBadge(device.status)}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm opacity-80">IP Address:</span>
                <span className="font-mono text-sm">{device.ip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm opacity-80">Location:</span>
                <span className="text-sm">{device.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm opacity-80">Ports:</span>
                <span className="text-sm">{device.ports}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm opacity-80">Uptime:</span>
                <span className="text-sm">{device.uptime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm opacity-80">Last Maintenance:</span>
                <span className="text-sm">{device.last_maintenance}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-white/20">
              <button 
                onClick={() => handleTest(device)}
                className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm flex items-center justify-center gap-1"
              >
                <Activity size={14} /> Test
              </button>
              <button 
                onClick={() => handleEdit(device)}
                className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm flex items-center justify-center gap-1"
              >
                <Edit2 size={14} /> Edit
              </button>
              <button 
                onClick={() => handleReboot(device)}
                className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm flex items-center justify-center gap-1"
              >
                <RefreshCw size={14} /> Reboot
              </button>
              <button 
                onClick={() => handleDelete(device.id)}
                className="px-3 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDevices.length === 0 && (
        <div className="bg-white dark:bg-boxdark rounded-lg p-8 text-center">
          <Router className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No devices found</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-boxdark rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingDevice ? 'Edit Device' : 'Add New Device'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Router-Main"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IP Address</label>
                <input
                  type="text"
                  required
                  value={formData.ip}
                  onChange={(e) => setFormData({...formData, ip: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono"
                  placeholder="192.168.1.1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    {deviceTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., MikroTik CCR2004"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Head Office"
                />
              </div>
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
                  {editingDevice ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
