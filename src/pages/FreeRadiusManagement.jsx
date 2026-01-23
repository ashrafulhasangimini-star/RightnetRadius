import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, CheckCircle, AlertCircle, Wifi } from 'lucide-react';

export default function FreeRadiusManagement() {
    const [nasClients, setNasClients] = useState([]);
    const [radiusUsers, setRadiusUsers] = useState([]);
    const [radiusStatus, setRadiusStatus] = useState({});
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('nas');
    const [newNas, setNewNas] = useState({
        nas_name: '',
        nas_ip: '',
        shared_secret: '',
        nas_type: 'mikrotik',
        description: ''
    });
    const [editingNas, setEditingNas] = useState(null);

    // FreeRADIUS স্ট্যাটাস লোড করুন
    useEffect(() => {
        fetchFreeRadiusStatus();
        fetchNasClients();
        fetchRadiusUsers();
    }, []);

    const fetchFreeRadiusStatus = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/freeradius/status');
            const data = await response.json();
            setRadiusStatus(data);
        } catch (error) {
            console.error('Status check failed:', error);
        }
    };

    const fetchNasClients = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/freeradius/nas-clients');
            const data = await response.json();
            setNasClients(data.clients || []);
        } catch (error) {
            console.error('Failed to fetch NAS clients:', error);
        }
        setLoading(false);
    };

    const fetchRadiusUsers = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/freeradius/users');
            const data = await response.json();
            setRadiusUsers(data.users || []);
        } catch (error) {
            console.error('Failed to fetch RADIUS users:', error);
        }
    };

    const addNasClient = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/freeradius/nas-clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newNas)
            });

            if (response.ok) {
                setNewNas({
                    nas_name: '',
                    nas_ip: '',
                    shared_secret: '',
                    nas_type: 'mikrotik',
                    description: ''
                });
                fetchNasClients();
                alert('✅ NAS ক্লায়েন্ট সফলভাবে যুক্ত হয়েছে!');
            }
        } catch (error) {
            alert('❌ NAS যোগ করতে ব্যর্থ হয়েছে');
        }
        setLoading(false);
    };

    const deleteNas = async (id) => {
        if (!confirm('এটি মুছে ফেলতে নিশ্চিত?')) return;

        try {
            const response = await fetch(`http://localhost:8000/api/freeradius/nas-clients/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchNasClients();
                alert('✅ NAS ক্লায়েন্ট মুছে ফেলা হয়েছে');
            }
        } catch (error) {
            alert('❌ মুছতে ব্যর্থ হয়েছে');
        }
    };

    const getNasTypeColor = (type) => {
        const colors = {
            mikrotik: 'from-orange-500 to-red-500',
            ubiquiti: 'from-blue-500 to-cyan-500',
            cisco: 'from-purple-500 to-indigo-500',
            generic: 'from-gray-500 to-slate-500'
        };
        return colors[type] || colors.generic;
    };

    const getNasTypeLabel = (type) => {
        const labels = {
            mikrotik: 'MikroTik/RouterOS',
            ubiquiti: 'Ubiquiti UniFi',
            cisco: 'Cisco সুইচ',
            generic: 'Generic'
        };
        return labels[type] || type;
    };

    return (
        <div className="space-y-6">
            {/* FreeRADIUS স্ট্যাটাস ক্যার্ড */}
            <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">FreeRADIUS সার্ভার</h3>
                        <div className="space-y-1">
                            <p className="text-sm opacity-90">
                                <strong>স্ট্যাটাস:</strong> {radiusStatus.status === 'online' ? '🟢 অনলাইন' : '🔴 অফলাইন'}
                            </p>
                            <p className="text-sm opacity-90">
                                <strong>Host:</strong> {radiusStatus.host || 'localhost'}:{radiusStatus.port || 1812}
                            </p>
                        </div>
                    </div>
                    <Wifi size={64} className="opacity-75" />
                </div>
            </div>

            {/* NAS এবং ইউজার ট্যাব */}
            <div className="flex space-x-2 border-b">
                <button
                    onClick={() => setActiveTab('nas')}
                    className={`px-6 py-3 font-semibold border-b-4 transition ${
                        activeTab === 'nas'
                            ? 'border-orange-500 text-orange-600 bg-orange-50'
                            : 'border-transparent text-gray-600 hover:text-orange-600'
                    }`}
                >
                    📡 NAS ক্লায়েন্ট ({nasClients.length})
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-6 py-3 font-semibold border-b-4 transition ${
                        activeTab === 'users'
                            ? 'border-blue-500 text-blue-600 bg-blue-50'
                            : 'border-transparent text-gray-600 hover:text-blue-600'
                    }`}
                >
                    👥 RADIUS ইউজার ({radiusUsers.length})
                </button>
            </div>

            {/* NAS ক্লায়েন্ট ট্যাব */}
            {activeTab === 'nas' && (
                <div className="space-y-6">
                    {/* নতুন NAS যোগ করার ফর্ম */}
                    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                            <Plus size={24} className="mr-2 text-orange-500" />
                            নতুন NAS ক্লায়েন্ট যোগ করুন
                        </h3>

                        <form onSubmit={addNasClient} className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">NAS নাম</label>
                                <input
                                    type="text"
                                    placeholder="e.g., mikrotik-main"
                                    value={newNas.nas_name}
                                    onChange={(e) => setNewNas({ ...newNas, nas_name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">NAS IP Address</label>
                                <input
                                    type="text"
                                    placeholder="192.168.1.1"
                                    value={newNas.nas_ip}
                                    onChange={(e) => setNewNas({ ...newNas, nas_ip: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">শেয়ার্ড সিক্রেট</label>
                                <input
                                    type="password"
                                    placeholder="শক্তিশালী পাসওয়ার্ড (32+ অক্ষর)"
                                    value={newNas.shared_secret}
                                    onChange={(e) => setNewNas({ ...newNas, shared_secret: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">NAS টাইপ</label>
                                <select
                                    value={newNas.nas_type}
                                    onChange={(e) => setNewNas({ ...newNas, nas_type: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="mikrotik">MikroTik/RouterOS</option>
                                    <option value="ubiquiti">Ubiquiti UniFi</option>
                                    <option value="cisco">Cisco</option>
                                    <option value="generic">Generic</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">বর্ণনা</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Main Gateway Router"
                                    value={newNas.description}
                                    onChange={(e) => setNewNas({ ...newNas, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="col-span-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50"
                            >
                                {loading ? 'যোগ করছি...' : '➕ NAS যোগ করুন'}
                            </button>
                        </form>
                    </div>

                    {/* NAS ক্লায়েন্ট তালিকা */}
                    <div className="grid gap-4">
                        {nasClients.map((nas) => (
                            <div
                                key={nas.id}
                                className={`bg-gradient-to-r ${getNasTypeColor(nas.nas_type)} rounded-lg p-5 text-white shadow-lg`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-lg font-bold mb-2">{nas.nas_name}</h4>
                                        <div className="space-y-1 text-sm opacity-90">
                                            <p><strong>IP:</strong> {nas.nas_ip}</p>
                                            <p><strong>টাইপ:</strong> {getNasTypeLabel(nas.nas_type)}</p>
                                            <p><strong>স্ট্যাটাস:</strong> {nas.status === 'active' ? '🟢 সক্রিয়' : '🔴 নিষ্ক্রিয়'}</p>
                                            {nas.description && <p><strong>বর্ণনা:</strong> {nas.description}</p>}
                                            <p><strong>শেষ হার্টবিট:</strong> {nas.last_heartbeat ? new Date(nas.last_heartbeat).toLocaleString('bn-BD') : 'কোনো'}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => deleteNas(nas.id)}
                                            className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition"
                                            title="মুছুন"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {nasClients.length === 0 && (
                            <div className="bg-gray-100 rounded-lg p-8 text-center">
                                <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-600">কোনো NAS ক্লায়েন্ট নেই। উপরের ফর্ম ব্যবহার করে যোগ করুন।</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* RADIUS ইউজার ট্যাব */}
            {activeTab === 'users' && (
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">RADIUS ইউজার</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-blue-50 text-blue-900 font-semibold">
                                <tr>
                                    <th className="px-4 py-3 text-left">ইউজারনেম</th>
                                    <th className="px-4 py-3 text-left">ইমেইল</th>
                                    <th className="px-4 py-3 text-left">স্ট্যাটাস</th>
                                    <th className="px-4 py-3 text-left">সংযুক্তি</th>
                                </tr>
                            </thead>
                            <tbody>
                                {radiusUsers.map((user) => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-blue-600">{user.username}</td>
                                        <td className="px-4 py-3 text-gray-600">{user.email || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                user.status === 'active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {user.status === 'active' ? '🟢 সক্রিয়' : '🔴 নিষ্ক্রিয়'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString('bn-BD') : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {radiusUsers.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-600">কোনো RADIUS ইউজার পাওয়া যায়নি</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* তথ্যপ্রযুক্তি বক্স */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-800">
                    <strong>💡 টিপস:</strong> NAS ক্লায়েন্ট হল RouterOS, WiFi Access Point বা অন্য নেটওয়ার্ক ডিভাইস যা RADIUS সার্ভারে অথেন্টিকেশন রিকোয়েস্ট পাঠায়।
                    সেটআপ সম্পূর্ণ করতে প্রতিটি NAS ডিভাইসে একই শেয়ার্ড সিক্রেট কনফিগ করুন।
                </p>
            </div>
        </div>
    );
}
