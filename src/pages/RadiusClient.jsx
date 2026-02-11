import React, { useState, useEffect } from 'react';
import { 
  Server, Plus, Edit2, Trash2, Globe, RefreshCw, 
  CheckCircle, XCircle, Activity, Wifi, Search
} from 'lucide-react';
import { radiusAPI } from '../lib/api';

export default function RadiusClient() {
  const [nasClients, setNasClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    nas_name: '',
    nas_ip: '',
    shared_secret: '',
    nas_type: 'mikrotik',
    description: '',
    status: 'active'
  });

  useEffect(() => {
    fetchNasClients();
  }, []);

  const fetchNasClients = async () => {
    try {
      setLoading(true);
      const response = await radiusAPI.getNasClients();
      setNasClients(response.data || []);
    } catch (error) {
      console.error('Error fetching NAS clients:', error);
      // Mock data
      setNasClients([
        { id: 1, nas_name: 'mikrotik-main', nas_ip: '192.168.1.1', nas_type: 'mikrotik', shared_secret: '********', description: 'Main Gateway Router', status: 'active', last_heartbeat: new Date().toISOString(), uptime: '15d 4h 30m' },
        { id: 2, nas_name: 'ubiquiti-ap', nas_ip: '192.168.2.1', nas_type: 'ubiquiti', shared_secret: '********', description: 'Office WiFi AP', status: 'active', last_heartbeat: new Date().toISOString(), uptime: '5d 12h 15m' },
        { id: 3, nas_name: 'cisco-switch', nas_ip: '192.168.3.1', nas_type: 'cisco', shared_secret: '********', description: 'Core Switch', status: 'inactive', last_heartbeat: '2024-02-09T10:00:00Z', uptime: '0d 0h 0m' },
        { id: 4, nas_name: 'olt-1', nas_ip: '10.0.0.1', nas_type: 'generic', shared_secret: '********', description: 'OLT Device', status: 'active', last_heartbeat: new Date().toISOString(), uptime: '30d 8h 45m' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = nasClients.filter(client =>
    client.nas_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.nas_ip?.includes(searchTerm) ||
    client.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingClient) {
      setNasClients(nasClients.map(c => 
        c.id === editingClient.id ? { ...c, ...formData } : c
      ));
    } else {
      setNasClients([...nasClients, { id: Date.now(), ...formData, last_heartbeat: new Date().toISOString(), uptime: '0d 0h 0m' }]);
    }
    setShowModal(false);
    setEditingClient(null);
    setFormData({ nas_name: '', nas_ip: '', shared_secret: '', nas_type: 'mikrotik', description: '', status: 'active' });
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      nas_name: client.nas_name,
      nas_ip: client.nas_ip,
      shared_secret: '',
      nas_type: client.nas_type,
      description: client.description,
      status: client.status
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this NAS client?')) {
      setNasClients(nasClients.filter(c => c.id !== id));
    }
  };

  const handleTest = (client) => {
    alert(`Testing connection to ${client.nas_name}...`);
  };

  const handleReboot = (client) => {
    if (confirm(`Are you sure you want to reboot ${client.nas_name}?`)) {
      alert(`Reboot command sent to ${client.nas_name}`);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      mikrotik: 'from-orange-500 to-red-500',
      ubiquiti: 'from-blue-500 to-cyan-500',
      cisco: 'from-purple-500 to-indigo-500',
      generic: 'from-gray-500 to-slate-500'
    };
    return colors[type] || colors.generic;
  };

  const getTypeLabel = (type) => {
    const labels = {
      mikrotik: 'MikroTik',
      ubiquiti: 'Ubiquiti',
      cisco: 'Cisco',
      generic: 'Generic'
    };
    return labels[type] || type;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">RADIUS Clients</h2>
        <button 
          onClick={() => {
            setEditingClient(null);
            setFormData({ nas_name: '', nas_ip: '', shared_secret: '', nas_type: 'mikrotik', description: '', status: 'active' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus size={18} />
          Add New Client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{nasClients.length}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{nasClients.filter(c => c.status === 'active').length}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{nasClients.filter(c => c.status !== 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Connections Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1,250</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div key={client.id} className={`bg-gradient-to-r ${getTypeColor(client.nas_type)} rounded-lg p-6 text-white shadow-lg`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Globe className="w-8 h-8 opacity-80" />
                <div>
                  <h3 className="font-bold text-lg">{client.nas_name}</h3>
                  <p className="text-sm opacity-80">{getTypeLabel(client.nas_type)}</p>
                </div>
              </div>
              {getStatusBadge(client.status)}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm opacity-80">IP Address:</span>
                <span className="font-mono text-sm">{client.nas_ip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm opacity-80">Uptime:</span>
                <span className="text-sm">{client.uptime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm opacity-80">Last Heartbeat:</span>
                <span className="text-sm">{new Date(client.last_heartbeat).toLocaleString()}</span>
              </div>
              {client.description && (
                <div>
                  <span className="text-sm opacity-80">Description:</span>
                  <p className="text-sm">{client.description}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t border-white/20">
              <button 
                onClick={() => handleTest(client)}
                className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm flex items-center justify-center gap-1"
              >
                <Activity size={14} /> Test
              </button>
              <button 
                onClick={() => handleEdit(client)}
                className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm flex items-center justify-center gap-1"
              >
                <Edit2 size={14} /> Edit
              </button>
              <button 
                onClick={() => handleReboot(client)}
                className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm flex items-center justify-center gap-1"
              >
                <RefreshCw size={14} /> Reboot
              </button>
              <button 
                onClick={() => handleDelete(client.id)}
                className="px-3 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="bg-white dark:bg-boxdark rounded-lg p-8 text-center">
          <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No RADIUS clients found</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-boxdark rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingClient ? 'Edit RADIUS Client' : 'Add New RADIUS Client'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Name</label>
                <input
                  type="text"
                  required
                  value={formData.nas_name}
                  onChange={(e) => setFormData({...formData, nas_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., mikrotik-main"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IP Address</label>
                <input
                  type="text"
                  required
                  value={formData.nas_ip}
                  onChange={(e) => setFormData({...formData, nas_ip: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono"
                  placeholder="192.168.1.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shared Secret</label>
                <input
                  type="password"
                  required={!editingClient}
                  value={formData.shared_secret}
                  onChange={(e) => setFormData({...formData, shared_secret: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder={editingClient ? 'Leave blank to keep current' : 'Strong password'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device Type</label>
                <select
                  value={formData.nas_type}
                  onChange={(e) => setFormData({...formData, nas_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="mikrotik">MikroTik/RouterOS</option>
                  <option value="ubiquiti">Ubiquiti UniFi</option>
                  <option value="cisco">Cisco</option>
                  <option value="generic">Generic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Main Gateway Router"
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
                  {editingClient ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
