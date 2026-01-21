import { useState, useEffect } from 'react'
import './App.css'
import LoginPage from './LoginPage'
import AdminDashboard from './AdminDashboard'

function App() {
  const [admin, setAdmin] = useState(null)
  const [users, setUsers] = useState([])
  const [packages, setPackages] = useState([])
  const [adminUsers, setAdminUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if admin already logged in
    const savedAdmin = localStorage.getItem('admin')
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin))
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (admin) {
      fetchData()
    }
  }, [admin])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Mock data
      const mockUsers = [
        { id: 1, name: 'Rajib Khan', email: 'rajib@example.com', status: 'active' },
        { id: 2, name: 'Karim Ahmed', email: 'karim@example.com', status: 'active' },
        { id: 3, name: 'Fatima Islam', email: 'fatima@example.com', status: 'inactive' },
      ]
      
      const mockPackages = [
        { id: 1, name: 'Basic Plan', speed: 5, price: 500 },
        { id: 2, name: 'Standard Plan', speed: 10, price: 1000 },
        { id: 3, name: 'Premium Plan', speed: 20, price: 1500 },
        { id: 4, name: 'Enterprise Plan', speed: 50, price: 3000 },
      ]

      setUsers(mockUsers)
      setPackages(mockPackages)
      setAdminUsers([{ id: 1, name: 'System Admin', email: 'admin@rightnet.local', role: 'admin' }])
    } catch (err) {
      setError('Failed to fetch data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>Loading...</div>
  }

  // If admin is logged in, show admin dashboard
  if (admin) {
    return <AdminDashboard admin={admin} onLogout={() => setAdmin(null)} />
  }

  // Otherwise show login page
  return <LoginPage onLogin={setAdmin} />
}

export default App
