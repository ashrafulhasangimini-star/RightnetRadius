import React, { useState } from 'react';
import { Menu, X, LogOut, User, Bell, Settings, BarChart3, Users, Package, CreditCard, FileText, Wifi, Activity } from 'lucide-react';
import '../styles/AdminLayout.css';

function AdminLayout({ admin, children, activeTab, setActiveTab, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'sessions', label: 'Sessions', icon: Wifi },
    { id: 'bandwidth', label: 'Bandwidth', icon: Activity },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1 className="logo">RightnetRadius</h1>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={onLogout}>
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${!sidebarOpen ? 'expanded' : ''}`}>
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <button 
              className="mobile-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="header-right">
            <button className="icon-btn">
              <Bell size={20} />
              <span className="badge">3</span>
            </button>

            <button className="icon-btn">
              <Settings size={20} />
            </button>

            <div className="user-menu">
              <button 
                className="user-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="user-avatar">
                  <User size={20} />
                </div>
                <span>{admin?.name || 'Admin'}</span>
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <a href="#" className="dropdown-item">Profile</a>
                  <a href="#" className="dropdown-item">Settings</a>
                  <hr className="dropdown-divider" />
                  <button 
                    className="dropdown-item logout"
                    onClick={onLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
