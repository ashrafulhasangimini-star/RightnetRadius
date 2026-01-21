import { useState, useEffect } from 'react'
import './AdminDashboard.css'

function AdminDashboard({ admin, onLogout }) {
  const [users, setUsers] = useState([])
  const [packages, setPackages] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    // Mock data
    setUsers([
      { id: 1, name: 'Rajib Khan', email: 'rajib@example.com', package: 'Standard', status: 'active', joinedDate: '2025-12-15' },
      { id: 2, name: 'Karim Ahmed', email: 'karim@example.com', package: 'Premium', status: 'active', joinedDate: '2025-12-10' },
      { id: 3, name: 'Fatima Islam', email: 'fatima@example.com', package: 'Basic', status: 'inactive', joinedDate: '2025-11-20' },
    ])

    setPackages([
      { id: 1, name: 'Basic Plan', speed: 5, price: 500, users: 45 },
      { id: 2, name: 'Standard Plan', speed: 10, price: 1000, users: 120 },
      { id: 3, name: 'Premium Plan', speed: 20, price: 1500, users: 85 },
      { id: 4, name: 'Enterprise Plan', speed: 50, price: 3000, users: 12 },
    ])
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    onLogout()
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <h1>RightnetRadius Admin</h1>
        </div>
        <div className="header-right">
          <span className="admin-name">{admin.name}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
          <button 
            className={`nav-item ${activeTab === 'packages' ? 'active' : ''}`}
            onClick={() => setActiveTab('packages')}
          >
            📦 Packages
          </button>
          <button 
            className={`nav-item ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
          >
            💳 Billing
          </button>
          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            📈 Reports
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <h2>Dashboard</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{users.length}</h3>
                <p>Total Users</p>
              </div>
              <div className="stat-card">
                <h3>{users.filter(u => u.status === 'active').length}</h3>
                <p>Active Users</p>
              </div>
              <div className="stat-card">
                <h3>{packages.length}</h3>
                <p>Packages</p>
              </div>
              <div className="stat-card">
                <h3>Tk 12,50,000</h3>
                <p>Monthly Revenue</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="tab-content">
            <h2>Users Management</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Package</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.package}</td>
                    <td><span className={`badge ${user.status}`}>{user.status}</span></td>
                    <td>{user.joinedDate}</td>
                    <td>
                      <button className="action-btn">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div className="tab-content">
            <h2>Internet Packages</h2>
            <div className="packages-grid">
              {packages.map(pkg => (
                <div key={pkg.id} className="package-card">
                  <h3>{pkg.name}</h3>
                  <p className="speed">{pkg.speed} Mbps</p>
                  <p className="price">Tk {pkg.price}</p>
                  <p className="users">{pkg.users} users</p>
                  <button className="edit-btn">Edit Package</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="tab-content">
            <h2>Billing Management</h2>
            <div className="billing-stats">
              <div className="billing-card">
                <h4>Monthly Revenue</h4>
                <p className="big-number">Tk 12,50,000</p>
              </div>
              <div className="billing-card">
                <h4>Pending Invoices</h4>
                <p className="big-number">15</p>
              </div>
              <div className="billing-card">
                <h4>Outstanding Amount</h4>
                <p className="big-number">Tk 1,85,000</p>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="tab-content">
            <h2>Reports</h2>
            <div className="reports-list">
              <div className="report-item">
                <h4>User Growth Report</h4>
                <p>Monthly user acquisition and churn statistics</p>
              </div>
              <div className="report-item">
                <h4>Revenue Report</h4>
                <p>Detailed revenue breakdown by package and payment method</p>
              </div>
              <div className="report-item">
                <h4>Network Performance</h4>
                <p>Bandwidth usage and network statistics</p>
              </div>
              <div className="report-item">
                <h4>Support Tickets</h4>
                <p>Customer support and complaint statistics</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
