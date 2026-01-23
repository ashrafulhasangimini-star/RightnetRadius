import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Edit2, Trash2, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/FormElements';
import { Badge, StatusBadge } from '../components/ui/Badge';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    package: 'basic',
    bandwidth: '5M',
    password: '',
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
      
      // Mock data for demonstration
      setUsers([
        { id: 1, username: 'rajib.khan', email: 'rajib@example.com', package: 'Premium', bandwidth: '10M', status: 'active', quota_used: 45.2, created_at: '2024-01-15' },
        { id: 2, username: 'karim.ahmed', email: 'karim@example.com', package: 'Standard', bandwidth: '5M', status: 'active', quota_used: 67.8, created_at: '2024-01-10' },
        { id: 3, username: 'fatima.islam', email: 'fatima@example.com', package: 'Basic', bandwidth: '2M', status: 'inactive', quota_used: 12.3, created_at: '2024-01-05' },
        { id: 4, username: 'ali.hassan', email: 'ali@example.com', package: 'Premium', bandwidth: '20M', status: 'active', quota_used: 89.5, created_at: '2024-01-20' },
        { id: 5, username: 'noor.aman', email: 'noor@example.com', package: 'Standard', bandwidth: '5M', status: 'suspended', quota_used: 100, created_at: '2024-01-08' },
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
        setFormData({ username: '', email: '', package: 'basic', bandwidth: '5M', password: '' });
        setShowForm(false);
        fetchUsers();
        alert('User added successfully!');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchUsers();
        alert('User deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getQuotaColor = (quotaUsed) => {
    if (quotaUsed >= 90) return 'text-danger';
    if (quotaUsed >= 70) return 'text-warning';
    return 'text-success';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            User Management
          </h2>
          <p className="text-body mt-1">Manage all system users and their access</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <UserPlus size={20} />
          Add New User
        </Button>
      </div>

      {/* Add User Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New User</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <Select
                  label="Package"
                  value={formData.package}
                  onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                  options={[
                    { value: 'basic', label: 'Basic - 2M' },
                    { value: 'standard', label: 'Standard - 5M' },
                    { value: 'premium', label: 'Premium - 10M' },
                  ]}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Input
                icon={Search}
                placeholder="Search users by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'suspended', label: 'Suspended' },
              ]}
              className="w-full sm:w-48"
            />
          </div>
        </CardBody>
      </Card>

      {/* Users Table */}
      <Card padding={false}>
        <div className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Bandwidth</TableHead>
                <TableHead>Quota Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="text-black dark:text-white font-medium">
                          {user.username}
                        </p>
                        <p className="text-sm text-body">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="primary">{user.package}</Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-body">{user.bandwidth}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-24 h-2 bg-gray-2 rounded-full overflow-hidden dark:bg-meta-4">
                          <div
                            className={`h-full ${
                              user.quota_used >= 90 ? 'bg-danger' :
                              user.quota_used >= 70 ? 'bg-warning' : 'bg-success'
                            }`}
                            style={{ width: `${user.quota_used}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${getQuotaColor(user.quota_used)}`}>
                          {user.quota_used}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.status} />
                    </TableCell>
                    <TableCell>
                      <p className="text-body text-sm">{user.created_at}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowViewModal(true);
                          }}
                          className="hover:text-primary"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className={`hover:${user.status === 'active' ? 'text-danger' : 'text-success'}`}
                          title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {user.status === 'active' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                        </button>
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="hover:text-warning"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="hover:text-danger"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <p className="text-body py-8">No users found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Details</CardTitle>
                <button onClick={() => setShowViewModal(false)}>
                  <XCircle size={24} />
                </button>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-body">Username</p>
                  <p className="font-medium text-black dark:text-white">{selectedUser.username}</p>
                </div>
                <div>
                  <p className="text-sm text-body">Email</p>
                  <p className="font-medium text-black dark:text-white">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-body">Package</p>
                  <Badge variant="primary">{selectedUser.package}</Badge>
                </div>
                <div>
                  <p className="text-sm text-body">Status</p>
                  <StatusBadge status={selectedUser.status} />
                </div>
                <div>
                  <p className="text-sm text-body">Bandwidth</p>
                  <p className="font-medium text-black dark:text-white">{selectedUser.bandwidth}</p>
                </div>
                <div>
                  <p className="text-sm text-body">Quota Used</p>
                  <p className={`font-medium ${getQuotaColor(selectedUser.quota_used)}`}>
                    {selectedUser.quota_used}%
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Users;
