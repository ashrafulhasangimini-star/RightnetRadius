import React, { useState } from 'react';
import { 
  User, Camera, Edit2, Save, X, Mail, Phone, 
  Lock, Shield, Bell, Eye, EyeOff, Building
} from 'lucide-react';

export default function AdminProfile({ admin, onClose }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileImage, setProfileImage] = useState(admin?.avatar || null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [formData, setFormData] = useState({
    name: admin?.name || 'Admin User',
    username: admin?.username || 'admin',
    email: admin?.email || 'admin@rightnet.local',
    phone: admin?.phone || '+880 1712 345678',
    role: admin?.role || 'Super Admin',
    organization: admin?.organization || 'Rightnet ISP',
    address: admin?.address || '123, Main Road, Dhaka',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrent: false,
    showNew: false
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (previewImage) {
      setProfileImage(previewImage);
    }
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters!');
      return;
    }
    alert('Password changed successfully!');
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      showCurrent: false,
      showNew: false
    });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-boxdark rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Admin Profile</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-800 p-4">
            {/* Profile Image */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg mx-auto">
                  {previewImage || profileImage ? (
                    <img 
                      src={previewImage || profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 shadow-lg">
                    <Camera size={18} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{formData.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{formData.role}</p>
            </div>

            {/* Tabs */}
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      <Edit2 size={16} /> Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setPreviewImage(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                      >
                        <X size={16} /> Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                      >
                        <Save size={16} /> Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white ${
                          isEditing ? 'border-gray-300 dark:border-gray-600' : 'border-transparent'
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white ${
                          isEditing ? 'border-gray-300 dark:border-gray-600' : 'border-transparent'
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        disabled={!isEditing}
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white ${
                          isEditing ? 'border-gray-300 dark:border-gray-600' : 'border-transparent'
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        disabled={!isEditing}
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white ${
                          isEditing ? 'border-gray-300 dark:border-gray-600' : 'border-transparent'
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.organization}
                        onChange={(e) => setFormData({...formData, organization: e.target.value})}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white ${
                          isEditing ? 'border-gray-300 dark:border-gray-600' : 'border-transparent'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <textarea
                      disabled={!isEditing}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      rows={3}
                      className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white ${
                        isEditing ? 'border-gray-300 dark:border-gray-600' : 'border-transparent'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h3>
                
                {/* Password Change */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Password</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last changed: 30 days ago</p>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      Change Password
                    </button>
                  </div>
                </div>

                {/* Two Factor Authentication */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
                    </div>
                    <button className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10">
                      Enable
                    </button>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Active Sessions</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Current Session</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Chrome on Windows • Dhaka, Bangladesh</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h3>
                
                <div className="space-y-4">
                  {[
                    { title: 'User Registrations', description: 'Get notified when new users register', enabled: true },
                    { title: 'Payment Alerts', description: 'Receive alerts for payments and transactions', enabled: true },
                    { title: 'System Updates', description: 'Get notified about system updates', enabled: false },
                    { title: 'Security Alerts', description: 'Important security notifications', enabled: true },
                    { title: 'Daily Reports', description: 'Daily summary of activities', enabled: false },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-boxdark rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={passwordData.showCurrent ? 'text' : 'password'}
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordData({...passwordData, showCurrent: !passwordData.showCurrent})}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {passwordData.showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={passwordData.showNew ? 'text' : 'password'}
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordData({...passwordData, showNew: !passwordData.showNew})}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {passwordData.showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
