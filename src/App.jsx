import { useState, useEffect } from 'react'
import './App.css'
import LoginPage from './LoginPage'
import AdminDashboard from './components/AdminDashboard'
import CustomerDashboard from './components/CustomerDashboard'

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
    return <LoginPage onLogin={handleLogin} />
  }

  if (userType === 'admin') {
    return <AdminDashboard admin={user} onLogout={handleLogout} />
  }

  return <CustomerDashboard admin={user} onLogout={handleLogout} />
}

export default App
