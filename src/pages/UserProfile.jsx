import React, { useState } from 'react';
import { 
  User, Camera, Edit2, Save, X, Mail, Phone, 
  Lock, Shield, Bell, Eye, EyeOff, Home, CreditCard,
  Wifi, Router
} from 'lucide-react';

export default function UserProfile({ user, onClose }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.avatar || null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || 'User Name',
    username: user?.username || 'user',
    email: user?.email || 'user@example.com',
    phone: user?.phone || '+880 1712 345678',
    address: user?.address || '123, User Road, Dhaka',
    package: user?.package || 'Premium Plan',
    routerIp: user?.routerIp || '192.168.1.1',
    publicIp: user?.publicIp || '103.45.67.89',
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
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters!');
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
    { id: 'account', label: 'My Account', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-boxdark rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">My Profile</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-800 p-4">
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg mx-auto">
                  {previewImage || profileImage ? (
                    <img src={previewImage || profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 shadow-lg">
                    <Camera size={18} />
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
              <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{formData.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{formData.username}</p>
              <div className="mt-2 inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <Wifi size={14} className="mr-1" /> Active
              </div>
            </div>

            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition ${
                      activeTab === tab.id ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                      <Edit2 size={16} /> Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => { setIsEditing(false); setPreviewImage(null); }} className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50">
                        <X size={16} /> Cancel
                      </button>
                      <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
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
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white ${isEditing ? 'border-gray-300 dark:border-gray-600' : 'border-transparent'}`}
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
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white ${isEditing ? 'border-gray-300 dark:border-gray-600' : 'border-transparent'}`}
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
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white ${isEditing ? 'border-gray-300 dark:border-gray-600' : 'border-transparent'}`}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <div className="relative">
                      <Home className="absolute left-3 top-3 text-gray-400" size={18} />
                      <textarea
                        disabled={!isEditing}
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        rows={3}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white ${isEditing ? 'border-gray-300 dark:border-gray-600' : 'border-transparent'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Information</h3>
                
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-white">
                  <p className="opacity-90">Current Package</p>
                  <p className="text-2xl font-bold">{formData.package}</p>
                  <p className="opacity-90 mt-1">৳1,500/month • 500 GB</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Wifi className="w-6 h-6 text-primary" />
                      <h4 className="font-medium text-gray-900 dark:text-white">Public IP</h4>
                    </div>
                    <p className="text-2xl font-mono text-gray-900 dark:text-white">{formData.publicIp}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Router className="w-6 h-6 text-primary" />
                      <h4 className="font-medium text-gray-900 dark:text-white">Router IP</h4>
                    </div>
                    <p className="text-2xl font-mono text-gray-900 dark:text-white">{formData.routerIp}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h3>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Password</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last changed: 30 days ago</p>
                    </div>
                    <button onClick={() => setShowPasswordModal(true)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Data Usage Alerts', desc: 'Get notified when approaching data limit', enabled: true },
                    { title: 'Payment Reminders', desc: 'Receive payment due reminders', enabled: true },
                    { title: 'Service Updates', desc: 'Service maintenance and updates', enabled: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-boxdark rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                <input
                  type={passwordData.showCurrent ? 'text' : 'password'}
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input
                  type={passwordData.showNew ? 'text' : 'password'}
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
