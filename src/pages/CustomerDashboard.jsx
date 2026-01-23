import { useState, useEffect } from 'react'

export default function CustomerDashboard({ admin, onLogout }) {
  const [stats, setStats] = useState({
    download: 0,
    upload: 0,
    sessions: 0,
    totalData: 0,
    quota: 100,
    used: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCustomerData()
    const interval = setInterval(fetchCustomerData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchCustomerData = async () => {
    try {
      const response = await fetch('/api/customer/dashboard')
      const data = await response.json()
      if (response.ok) {
        setStats({
          download: data.download_speed || 2.5,
          upload: data.upload_speed || 1.2,
          sessions: data.active_sessions || 1,
          totalData: data.total_data || 45.2,
          quota: data.quota_gb || 100,
          used: data.used_gb || 45.2,
        })
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const quotaPercentage = (stats.used / stats.quota) * 100

  const StatCard = ({ label, value, unit, color }) => (
    <div
      style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color: color }}>
        {value}
        {unit && <span style={{ fontSize: '14px', marginLeft: '4px' }}>{unit}</span>}
      </div>
    </div>
  )

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
          <button
            style={{
              width: '100%',
              padding: '12px 16px',
              margin: '8px 0',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            📊 My Dashboard
          </button>
          <button
            style={{
              width: '100%',
              padding: '12px 16px',
              margin: '8px 0',
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={(e) => (e.target.style.background = 'transparent')}
          >
            ⚙️ My Profile
          </button>
          <button
            style={{
              width: '100%',
              padding: '12px 16px',
              margin: '8px 0',
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={(e) => (e.target.style.background = 'transparent')}
          >
            💳 Billing
          </button>
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
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
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
          }}
        >
          <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>My Dashboard</h1>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#999', paddingTop: '40px' }}>Loading...</div>
          ) : error ? (
            <div style={{ color: '#c33', padding: '20px', background: '#fee', borderRadius: '6px' }}>
              {error}
            </div>
          ) : (
            <div style={{ maxWidth: '1200px' }}>
              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <StatCard label="Download Speed" value={stats.download.toFixed(2)} unit="Mbps" color="#667eea" />
                <StatCard label="Upload Speed" value={stats.upload.toFixed(2)} unit="Mbps" color="#764ba2" />
                <StatCard label="Active Sessions" value={stats.sessions} unit="" color="#06b6d4" />
                <StatCard label="Total Data Used" value={stats.totalData.toFixed(2)} unit="GB" color="#f59e0b" />
              </div>

              {/* Quota Section */}
              <div
                style={{
                  background: 'white',
                  padding: '30px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  marginBottom: '30px',
                }}
              >
                <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📦 Data Quota</h3>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#666' }}>Used</span>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>
                      {stats.used.toFixed(2)} GB / {stats.quota.toFixed(2)} GB
                    </span>
                  </div>
                  <div
                    style={{
                      height: '20px',
                      background: '#e0e0e0',
                      borderRadius: '10px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        background:
                          quotaPercentage > 80 ? '#ef4444' : quotaPercentage > 60 ? '#f59e0b' : '#06b6d4',
                        width: `${Math.min(quotaPercentage, 100)}%`,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                    {quotaPercentage > 80 && '⚠️ WARNING: Quota almost reached!'}
                    {quotaPercentage <= 80 && quotaPercentage > 60 && '⚡ You are using over 60% of your quota'}
                    {quotaPercentage <= 60 && '✅ Normal usage'}
                  </div>
                </div>

                {/* Remaining Days */}
                <div
                  style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: '#f0f9ff',
                    borderLeft: '4px solid #0284c7',
                    borderRadius: '4px',
                  }}
                >
                  <div style={{ fontSize: '14px', color: '#333' }}>
                    ℹ️ Your quota resets on <strong>{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    Remaining time: ~30 days
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div
                style={{
                  background: 'white',
                  padding: '30px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
              >
                <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📈 Recent Activity</h3>
                <div style={{ fontSize: '14px', color: '#999', textAlign: 'center', padding: '40px' }}>
                  No recent activity yet
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
