import { useState } from 'react'
import './LoginPage.css'
import api from './lib/api'

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginType, setLoginType] = useState('admin') // 'admin' or 'customer'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // DEMO MODE: Direct login without API for testing
    const demoUser = {
      id: 1,
      username: email,
      name: email === 'admin' ? 'System Admin' : 'Test User',
      email: email + '@example.com',
      status: 'active'
    }
    
    const demoToken = 'demo-token-' + Date.now()
    const userType = loginType
    
    console.log('Demo login for:', demoUser.username, 'as', userType)
    
    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(demoUser))
    localStorage.setItem('userType', userType)
    localStorage.setItem('token', demoToken)
    
    onLogin(demoUser, userType)
  }

  const handleTabChange = (type) => {
    setLoginType(type)
    setError('')
    setEmail('')
    setPassword('')
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">RightnetRadius</h1>
        <p className="login-subtitle">ISP Management System</p>

        {/* Tab Buttons */}
        <div className="login-tabs">
          <button 
            className={`tab-btn ${loginType === 'admin' ? 'active' : ''}`}
            onClick={() => handleTabChange('admin')}
          >
            👤 Admin Login
          </button>
          <button 
            className={`tab-btn ${loginType === 'customer' ? 'active' : ''}`}
            onClick={() => handleTabChange('customer')}
          >
            👥 Customer Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : `${loginType === 'admin' ? 'Admin' : 'Customer'} Login`}
          </button>
        </form>

        <div className="demo-credentials">
          <p><strong>📝 Demo Credentials:</strong></p>
          {loginType === 'admin' ? (
            <>
              <p>Email: <code>admin@rightnet.local</code></p>
              <p>Password: <code>password</code></p>
              <p className="demo-note">Admin dashboard with full management features</p>
            </>
          ) : (
            <>
              <p>Email: <code>customer@example.com</code></p>
              <p>Password: <code>password</code></p>
              <p className="demo-note">Customer portal with billing & support</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginPage