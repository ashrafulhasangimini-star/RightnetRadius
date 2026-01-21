import React, { useState, useEffect } from 'react';
import { Home, Wifi, Clock, AlertCircle, Settings, LogOut, Bell, User, ArrowDown, ArrowUp, Download } from 'lucide-react';
import '../styles/CustomerLayout.css';

function CustomerDashboard({ admin, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Mock user data
    setUserData({
      name: 'Rajib Khan',
      package: 'Premium Plan',
      status: 'Active',
      dataUsed: 524.5,
      dataLimit: 1024,
      billingCycle: 'Jan 1 - Jan 31, 2024',
      lastPayment: '2024-01-01',
      dueDate: '2024-02-01',
      amount: 1500,
    });
  }, []);

  const customerMenu = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'usage', label: 'Data Usage', icon: Wifi },
    { id: 'billing', label: 'Billing', icon: Clock },
    { id: 'support', label: 'Support', icon: AlertCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="customer-layout">
      {/* Sidebar */}
      <aside className={`customer-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1 className="logo">Rightnet</h1>
        </div>

        <nav className="customer-nav">
          {customerMenu.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={onLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="customer-main">
        {/* Header */}
        <header className="customer-header">
          <div className="header-left">
            <button 
              className="mobile-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h2>Customer Portal</h2>
          </div>

          <div className="header-right">
            <button className="icon-btn">
              <Bell size={20} />
              <span className="badge">2</span>
            </button>

            <div className="user-menu">
              <button 
                className="user-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="user-avatar">
                  <User size={20} />
                </div>
                <span>{userData?.name || 'Customer'}</span>
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <a href="#" className="dropdown-item">My Profile</a>
                  <a href="#" className="dropdown-item">Account Settings</a>
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
        <div className="customer-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && userData && (
            <div className="overview-content">
              <div className="welcome-section">
                <h1>Welcome, {userData.name}!</h1>
                <p>Here's your account overview</p>
              </div>

              {/* Account Status Cards */}
              <div className="status-cards-grid">
                <div className="status-card">
                  <div className="card-header">
                    <h3>Current Package</h3>
                    <span className="status-badge active">Active</span>
                  </div>
                  <div className="card-body">
                    <p className="package-name">{userData.package}</p>
                    <p className="package-details">20 Mbps Speed</p>
                    <p className="package-price">৳ 1,500/month</p>
                  </div>
                </div>

                <div className="status-card">
                  <div className="card-header">
                    <h3>Billing Information</h3>
                  </div>
                  <div className="card-body">
                    <div className="info-row">
                      <span>Due Date:</span>
                      <strong>{userData.dueDate}</strong>
                    </div>
                    <div className="info-row">
                      <span>Amount Due:</span>
                      <strong>৳ {userData.amount}</strong>
                    </div>
                    <button className="btn-primary-sm">Pay Now</button>
                  </div>
                </div>

                <div className="status-card">
                  <div className="card-header">
                    <h3>Account Status</h3>
                  </div>
                  <div className="card-body">
                    <div className="status-indicator active"></div>
                    <p className="status-text">Your account is active</p>
                    <p className="status-subtext">All services are running normally</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="actions-grid">
                  <button className="action-card">
                    <Download size={24} />
                    <span>Download Invoice</span>
                  </button>
                  <button className="action-card">
                    <Wifi size={24} />
                    <span>Change Package</span>
                  </button>
                  <button className="action-card">
                    <AlertCircle size={24} />
                    <span>Request Support</span>
                  </button>
                  <button className="action-card">
                    <Settings size={24} />
                    <span>Account Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Data Usage Tab */}
          {activeTab === 'usage' && userData && (
            <div className="usage-content">
              <h2>Data Usage</h2>
              
              <div className="usage-card">
                <div className="usage-header">
                  <h3>Current Month Usage</h3>
                  <span className="cycle-date">{userData.billingCycle}</span>
                </div>

                <div className="usage-bar-container">
                  <div className="usage-bar">
                    <div 
                      className="usage-fill"
                      style={{width: `${(userData.dataUsed / userData.dataLimit) * 100}%`}}
                    ></div>
                  </div>
                </div>

                <div className="usage-stats">
                  <div className="stat">
                    <span className="label">Used</span>
                    <span className="value">{userData.dataUsed.toFixed(1)} GB</span>
                  </div>
                  <div className="stat">
                    <span className="label">Limit</span>
                    <span className="value">{userData.dataLimit} GB</span>
                  </div>
                  <div className="stat">
                    <span className="label">Remaining</span>
                    <span className="value">{(userData.dataLimit - userData.dataUsed).toFixed(1)} GB</span>
                  </div>
                </div>
              </div>

              {/* Hourly Usage */}
              <div className="usage-chart">
                <h3>Hourly Usage</h3>
                <div className="chart-placeholder">
                  <div style={{height: '250px', background: 'linear-gradient(to top, #60a5fa, #dbeafe)', borderRadius: '8px', opacity: 0.3}} />
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="billing-content">
              <h2>Billing & Invoices</h2>

              <div className="billing-summary">
                <div className="summary-card">
                  <span className="label">Total Amount Paid</span>
                  <span className="amount">৳ 15,000</span>
                </div>
                <div className="summary-card">
                  <span className="label">Amount Due</span>
                  <span className="amount pending">৳ 1,500</span>
                </div>
                <div className="summary-card">
                  <span className="label">Next Billing Date</span>
                  <span className="date">2024-02-01</span>
                </div>
              </div>

              <div className="invoices-section">
                <h3>Recent Invoices</h3>
                <div className="invoices-list">
                  <div className="invoice-item">
                    <div className="invoice-info">
                      <span className="invoice-id">#INV-12024</span>
                      <span className="invoice-date">January 2024</span>
                    </div>
                    <div className="invoice-amount">৳ 1,500</div>
                    <div className="invoice-status paid">PAID</div>
                    <button className="btn-sm">Download</button>
                  </div>

                  <div className="invoice-item">
                    <div className="invoice-info">
                      <span className="invoice-id">#INV-12023</span>
                      <span className="invoice-date">December 2023</span>
                    </div>
                    <div className="invoice-amount">৳ 1,500</div>
                    <div className="invoice-status paid">PAID</div>
                    <button className="btn-sm">Download</button>
                  </div>

                  <div className="invoice-item">
                    <div className="invoice-info">
                      <span className="invoice-id">#INV-11023</span>
                      <span className="invoice-date">November 2023</span>
                    </div>
                    <div className="invoice-amount">৳ 1,500</div>
                    <div className="invoice-status paid">PAID</div>
                    <button className="btn-sm">Download</button>
                  </div>
                </div>
              </div>

              <div className="billing-actions">
                <button className="btn-primary">Pay Due Amount</button>
                <button className="btn-secondary">View All Invoices</button>
              </div>
            </div>
          )}

          {/* Support Tab */}
          {activeTab === 'support' && (
            <div className="support-content">
              <h2>Support & Help</h2>

              <div className="support-grid">
                <div className="support-card">
                  <h3>📞 Call Our Support Team</h3>
                  <p>Mon - Fri: 9:00 AM - 6:00 PM</p>
                  <p className="phone">+880-2-XXXX-XXXX</p>
                  <button className="btn-secondary">Call Now</button>
                </div>

                <div className="support-card">
                  <h3>💬 Live Chat</h3>
                  <p>Chat with our support team</p>
                  <p className="status">Available now</p>
                  <button className="btn-secondary">Start Chat</button>
                </div>

                <div className="support-card">
                  <h3>📧 Email Support</h3>
                  <p>Get help via email</p>
                  <p className="email">support@rightnet.local</p>
                  <button className="btn-secondary">Send Email</button>
                </div>

                <div className="support-card">
                  <h3>❓ FAQ</h3>
                  <p>Find answers to common questions</p>
                  <button className="btn-secondary">Browse FAQ</button>
                </div>
              </div>

              <div className="tickets-section">
                <h3>Your Support Tickets</h3>
                <div className="tickets-list">
                  <div className="ticket-item">
                    <span className="ticket-id">#TKT-001</span>
                    <span className="ticket-subject">Speed Issue - Connection Slow</span>
                    <span className="ticket-status resolved">RESOLVED</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="settings-content">
              <h2>Account Settings</h2>

              <div className="settings-sections">
                <div className="settings-section">
                  <h3>Personal Information</h3>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" placeholder="Rajib Khan" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" placeholder="rajib@example.com" />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" placeholder="+880-XXX-XXXXXX" />
                  </div>
                  <button className="btn-primary">Update Profile</button>
                </div>

                <div className="settings-section">
                  <h3>Security</h3>
                  <button className="btn-secondary">Change Password</button>
                  <button className="btn-secondary">Enable Two-Factor Auth</button>
                </div>

                <div className="settings-section">
                  <h3>Notifications</h3>
                  <div className="checkbox-group">
                    <label>
                      <input type="checkbox" defaultChecked /> Email notifications
                    </label>
                    <label>
                      <input type="checkbox" defaultChecked /> SMS notifications
                    </label>
                    <label>
                      <input type="checkbox" /> Marketing emails
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default CustomerDashboard;
