import { useState } from 'react'

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState('admin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Demo credentials validation
      const validCredentials = {
        admin: { password: 'password', email: 'admin@rightnetradius.local' },
        user1: { password: 'password', email: 'user1@example.com' },
        user2: { password: 'password', email: 'user2@example.com' },
        user3: { password: 'password', email: 'user3@example.com' },
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Check credentials
      if (!validCredentials[username] || validCredentials[username].password !== password) {
        setError('Invalid credentials. Try admin/password or user1/password')
        setLoading(false)
        return
      }

      // Successful login
      onLogin(
        {
          id: Math.random(),
          username: username,
          email: validCredentials[username].email,
          name: username.charAt(0).toUpperCase() + username.slice(1),
        },
        userType
      )
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          padding: '40px',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px', fontSize: '28px' }}>
          🌐 RightnetRadius
        </h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
          ISP Management & RADIUS Server
        </p>

        {error && (
          <div style={{
            background: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 'bold' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 'bold' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 'bold' }}>
              Login As
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            >
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#999' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s',
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '6px', fontSize: '12px' }}>
          <p style={{ margin: '5px 0', color: '#666' }}>
            <strong>Demo Credentials:</strong>
          </p>
          <p style={{ margin: '5px 0', color: '#666' }}>
            Admin: admin / password
          </p>
          <p style={{ margin: '5px 0', color: '#666' }}>
            Customer: user1 / password
          </p>
        </div>
      </div>
    </div>
  )
}
