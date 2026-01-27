import { useState, useEffect } from 'react'
import './App.css'

// Simple Login Component
function SimpleLogin({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Simple authentication for testing
    if (username && password) {
      const userData = {
        username: username,
        name: username,
        email: username + '@example.com'
      }
      
      // Determine role based on username
      const role = username.toLowerCase() === 'admin' ? 'admin' : 'customer'
      onLogin(userData, role)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ marginBottom: '10px', color: '#333' }}>🌐 RightnetRadius</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>ISP Management System</p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username (admin or any name)"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter any password"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
          Use "admin" for admin panel or any other name for customer panel
        </p>
      </div>
    </div>
  )
}

// Simple Admin Dashboard
function SimpleAdminDashboard({ admin, onLogout }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px'
      }}>
        <h1>🌐 RightnetRadius - Admin Panel</h1>
        <p>Welcome, {admin.name}!</p>
        <button
          onClick={onLogout}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ padding: '20px' }}>
        <h2>Dashboard</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#667eea' }}>Total Users</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>150</p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#10b981' }}>Active Sessions</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>98</p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#f59e0b' }}>Bandwidth</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>45 Mbps</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple Customer Dashboard
function SimpleCustomerDashboard({ admin, onLogout }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px'
      }}>
        <h1>🌐 RightnetRadius - Customer Panel</h1>
        <p>Welcome, {admin.name}!</p>
        <button
          onClick={onLogout}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ padding: '20px' }}>
        <h2>My Dashboard</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#667eea' }}>Download Speed</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>5.2 Mbps</p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#10b981' }}>Upload Speed</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>2.8 Mbps</p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#f59e0b' }}>Data Used</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>45 GB</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedUserType = localStorage.getItem('userType')
    if (savedUser && savedUserType) {
      try {
        setUser(JSON.parse(savedUser))
        setUserType(savedUserType)
      } catch (e) {
        console.error('Error parsing saved user:', e)
        localStorage.clear()
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData, role) => {
    const loginData = { ...userData, role }
    localStorage.setItem('user', JSON.stringify(loginData))
    localStorage.setItem('userType', role)
    setUser(loginData)
    setUserType(role)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    localStorage.removeItem('token')
    setUser(null)
    setUserType(null)
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '1.5rem',
        color: '#666'
      }}>
        Loading...
      </div>
    )
  }

  if (!user || !userType) {
    return <SimpleLogin onLogin={handleLogin} />
  }

  if (userType === 'admin') {
    return <SimpleAdminDashboard admin={user} onLogout={handleLogout} />
  }

  return <SimpleCustomerDashboard admin={user} onLogout={handleLogout} />
}

export default App
