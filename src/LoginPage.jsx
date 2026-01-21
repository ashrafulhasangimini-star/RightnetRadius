import { useState } from 'react'
import './LoginPage.css'

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('admin@rightnet.local')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Mock login - in real app this would call your API
    try {
      if (email === 'admin@rightnet.local' && password === 'password') {
        const adminData = {
          id: 1,
          name: 'System Admin',
          email: 'admin@rightnet.local',
          role: 'admin',
          token: 'mock-jwt-token-' + Date.now(),
        }
        localStorage.setItem('admin', JSON.stringify(adminData))
        onLogin(adminData)
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      setError('Login failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">RightnetRadius</h1>
        <p className="login-subtitle">Admin Panel</p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-info">
          <p><strong>Demo Credentials:</strong></p>
          <p>Email: admin@rightnet.local</p>
          <p>Password: password</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
