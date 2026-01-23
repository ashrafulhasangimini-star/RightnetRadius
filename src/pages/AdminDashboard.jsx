import { useState } from 'react'
import Dashboard from './Dashboard'
import Users from './Users'
import AuditLogs from './AuditLogs'
import AdminPanel from './AdminPanel'

export default function AdminDashboard({ admin, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'users':
        return <Users />
      case 'audit':
        return <AuditLogs />
      case 'admin':
        return <AdminPanel />
      default:
        return <Dashboard />
    }
  }

  const menuItems = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'users', label: '👥 Users', icon: '👥' },
    { id: 'audit', label: '📋 Audit Logs', icon: '📋' },
    { id: 'admin', label: '⚙️ Admin Panel', icon: '⚙️' },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f5f7fa' }}>
      {/* Sidebar */}
      <div
        style={{
          width: '264px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          color: 'white',
        }}
      >
        <h2 style={{ margin: '0 0 30px 0', fontSize: '20px', fontWeight: 'bold' }}>
          🌐 RightnetRadius
        </h2>

        <nav style={{ flex: 1 }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                padding: '12px 16px',
                margin: '8px 0',
                background: activeTab === item.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px',
                fontWeight: activeTab === item.id ? 'bold' : 'normal',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) =>
                (e.target.style.background = activeTab === item.id ? 'rgba(255,255,255,0.2)' : 'transparent')
              }
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
          <div style={{ fontSize: '12px', marginBottom: '12px' }}>
            👤 {admin.name || admin.username}
          </div>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.3)')}
            onMouseLeave={(e) => (e.target.style.background = 'rgba(255,255,255,0.2)')}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Bar */}
        <div
          style={{
            padding: '20px',
            background: 'white',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
            {menuItems.find((item) => item.id === activeTab)?.label || 'Dashboard'}
          </h1>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
