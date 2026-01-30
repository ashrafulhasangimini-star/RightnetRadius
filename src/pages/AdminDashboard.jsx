import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Wifi
} from 'lucide-react';

// Import pages
import Dashboard from './Dashboard';
import UsersPage from './Users';
import AuditLogs from './AuditLogs';

export default function AdminDashboard({ admin, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const renderContent = () => {
    console.log('Rendering content for tab:', activeTab);
    
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UsersPage />;
      case 'audit':
        return <AuditLogs />;
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">Settings</h2>
            <p className="text-body">Settings page coming soon...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-9998 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
          <a href="/" className="flex items-center gap-3">
            <Wifi className="text-primary" size={32} />
            <span className="text-xl font-bold text-white">RightnetRadius</span>
          </a>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="block lg:hidden"
          >
            <X className="text-white" size={24} />
          </button>
        </div>

        {/* Sidebar Menu */}
        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
            <div>
              <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">MENU</h3>

              <ul className="mb-6 flex flex-col gap-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          console.log('Menu clicked:', item.id);
                          setActiveTab(item.id);
                          // Close sidebar on mobile after click
                          if (window.innerWidth < 1024) {
                            setSidebarOpen(false);
                          }
                        }}
                        className={`group relative flex w-full items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                          activeTab === item.id && 'bg-graydark dark:bg-meta-4'
                        }`}
                      >
                        <Icon size={18} />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        </div>

        {/* User Profile Section */}
        <div className="mt-auto border-t border-strokedark px-6 py-4">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex w-full items-center gap-3 rounded-sm py-2 px-3 hover:bg-graydark dark:hover:bg-meta-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold">
                {admin?.name?.[0] || admin?.username?.[0] || 'A'}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white">{admin?.name || admin?.username || 'Admin'}</p>
                <p className="text-xs text-bodydark2">{admin?.email || 'Administrator'}</p>
              </div>
              <ChevronDown
                className={`text-bodydark2 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                size={20}
              />
            </button>

            {/* User Dropdown */}
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 rounded-sm border border-strokedark bg-boxdark shadow-default">
                <button
                  onClick={() => {
                    console.log('Logout clicked');
                    onLogout();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-bodydark1 hover:bg-graydark"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="relative flex flex-1 flex-col lg:ml-72.5">
        {/* Header */}
        <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
          <div className="flex flex-grow items-center justify-between py-4 px-4 shadow-2 md:px-6 2xl:px-11">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
              >
                <Menu size={24} />
              </button>
              
              <h1 className="text-title-md2 font-semibold text-black dark:text-white">
                {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-black dark:text-white">
                  {admin?.name || admin?.username || 'Admin'}
                </p>
                <p className="text-xs text-body">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 w-full">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
