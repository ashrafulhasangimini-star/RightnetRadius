import React, { useState, useEffect } from 'react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    package: 'basic',
    bandwidth: '5M',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      // Mock data
      setUsers([
        { id: 1, username: 'rajib.khan', email: 'rajib@example.com', package: 'Premium', bandwidth: '10M', status: 'active', quota_used: 45.2 },
        { id: 2, username: 'karim.ahmed', email: 'karim@example.com', package: 'Standard', bandwidth: '5M', status: 'active', quota_used: 67.8 },
        { id: 3, username: 'fatima.islam', email: 'fatima@example.com', package: 'Basic', bandwidth: '2M', status: 'inactive', quota_used: 12.3 },
        { id: 4, username: 'ali.hassan', email: 'ali@example.com', package: 'Premium', bandwidth: '20M', status: 'active', quota_used: 89.5 },
        { id: 5, username: 'noor.aman', email: 'noor@example.com', package: 'Standard', bandwidth: '5M', status: 'blocked', quota_used: 100 },
      ]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ username: '', email: '', package: 'basic', bandwidth: '5M' });
        setShowForm(false);
        fetchUsers();
        alert('User added successfully!');
      }
    } catch (error) {
      alert('Error adding user: ' + error.message);
    }
  };

  const handleDisconnect = async (username) => {
    if (!confirm(`Disconnect ${username}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/bandwidth/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });
      alert(`${username} disconnected`);
      fetchUsers();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleBlockUser = async (username) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/bandwidth/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });
      alert(`${username} blocked`);
      fetchUsers();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading users...</div>;
  }

  return (
    <div className="p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600 mt-1">{users.length} users in system</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Add User
          </button>
        </div>

        {/* Add User Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={formData.package}
                  onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
                <input
                  type="text"
                  placeholder="Bandwidth (e.g., 5M)"
                  value={formData.bandwidth}
                  onChange={(e) => setFormData({ ...formData, bandwidth: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Username</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Package</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Bandwidth</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Quota Used</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {user.package}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.bandwidth}</td>
                  <td className="px-6 py-4">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${user.quota_used}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 mt-1 block">{user.quota_used.toFixed(1)}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'blocked' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDisconnect(user.username)}
                        className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                        title="Disconnect user"
                      >
                        Disconnect
                      </button>
                      <button
                        onClick={() => handleBlockUser(user.username)}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                        title="Block user"
                      >
                        {user.status === 'blocked' ? 'Unblock' : 'Block'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
