import { useState } from 'react'
import './LoginPage.css'

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('admin@rightnet.local')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginType, setLoginType] = useState('admin') // 'admin' or 'customer'

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Mock admin authentication
    if (loginType === 'admin') {
      if (email === 'admin@rightnet.local' && password === 'password') {
        const adminData = {
          id: 1,
          name: 'System Admin',
          email: 'admin@rightnet.local',
          token: 'admin-token-' + Date.now(),
        }
        onLogin(adminData, 'admin')
      } else {
        setError('Invalid admin credentials')
        setLoading(false)
      }
    } 
    // Mock customer authentication
    else if (loginType === 'customer') {
      if (email === 'customer@example.com' && password === 'password') {
        const customerData = {
          id: 100,
          name: 'Rajib Khan',
          email: 'customer@example.com',
          token: 'customer-token-' + Date.now(),
        }
        onLogin(customerData, 'customer')
      } else {
        setError('Invalid customer credentials')
        setLoading(false)
      }
    }
  }

  const handleTabChange = (type) => {
    setLoginType(type)
    setError('')
    if (type === 'admin') {
      setEmail('admin@rightnet.local')
      setPassword('password')
    } else {
      setEmail('customer@example.com')
      setPassword('password')
    }
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