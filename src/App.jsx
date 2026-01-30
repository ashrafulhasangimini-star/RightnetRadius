import { useState, useEffect } from 'react'
import './App.css'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import CustomerDashboard from './pages/CustomerDashboard'

function App() {
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('App mounted, checking saved session...')
    
    // Check for existing session
    const savedUser = localStorage.getItem('user')
    const savedUserType = localStorage.getItem('userType')
    const savedToken = localStorage.getItem('token')
    
    console.log('Saved user:', savedUser)
    console.log('Saved userType:', savedUserType)
    console.log('Saved token:', savedToken)
    
    if (savedUser && savedUserType && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser)
        console.log('Parsed user:', parsedUser)
        setUser(parsedUser)
        setUserType(savedUserType)
      } catch (e) {
        console.error('Error parsing saved user:', e)
        // Clear corrupted data
        localStorage.clear()
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData, role) => {
    console.log('=== LOGIN HANDLER ===')
    console.log('User data:', userData)
    console.log('Role:', role)
    
    const loginData = { 
      ...userData, 
      role: role || userData.role || 'customer' 
    }
    
    console.log('Saving login data:', loginData)
    
    localStorage.setItem('user', JSON.stringify(loginData))
    localStorage.setItem('userType', role || userData.role || 'customer')
    if (userData.token) {
      localStorage.setItem('token', userData.token)
    }
    
    setUser(loginData)
    setUserType(role || userData.role || 'customer')
    
    console.log('Login complete, user state updated')
    console.log('Current userType:', role || userData.role || 'customer')
  }

  const handleLogout = () => {
    console.log('=== LOGOUT HANDLER ===')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    localStorage.removeItem('token')
    setUser(null)
    setUserType(null)
    console.log('Logout complete')
  }

  console.log('=== APP RENDER ===')
  console.log('Loading:', loading)
  console.log('User:', user)
  console.log('UserType:', userType)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-whiten dark:bg-boxdark-2">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-body">Loading Application...</p>
        </div>
      </div>
    )
  }

  if (!user || !userType) {
    console.log('Showing LoginPage')
    return <LoginPage onLogin={handleLogin} />
  }

  if (userType === 'admin') {
    console.log('Showing AdminDashboard')
    return <AdminDashboard admin={user} onLogout={handleLogout} />
  }

  console.log('Showing CustomerDashboard')
  return <CustomerDashboard admin={user} onLogout={handleLogout} />
}

export default App
