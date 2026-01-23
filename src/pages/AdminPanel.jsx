import { useState, useEffect } from 'react'
import FreeRadiusManagement from './FreeRadiusManagement'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('radius')
  const [systemStatus, setSystemStatus] = useState(null)
  const [config, setConfig] = useState({
    radius: {
      host: '127.0.0.1',
      port: 1812,
      secret: 'sharedsecret',
      timeout: 3,
    },
    mikrotik: {
      host: '192.168.1.1',
      port: 8728,
      username: 'admin',
      password: 'admin',
    },
    system: {
      max_users: 1000,
      default_quota_gb: 100,
      enable_audit: true,
      enable_websocket: true,
    },
  })

  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSystemStatus()
    const interval = setInterval(fetchSystemStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/admin/status')
      if (response.ok) {
        const data = await response.json()
        setSystemStatus(data)
      }
    } catch (err) {
      console.error('Error fetching status:', err)
    }
  }

  const handleConfigChange = (section, field, value) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
    setSaved(false)
  }

  const handleSaveConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      console.error('Error saving config:', err)
    } finally {
      setLoading(false)
    }
  }

  const ConfigSection = ({ title, description, fields }) => (
    <div
      style={{
        background: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        marginBottom: '20px',
      }}
    >
      <h3 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '18px' }}>{title}</h3>
      <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px' }}>{description}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {fields.map((field) => (
          <div key={field.name}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '12px', fontWeight: 'bold' }}>
              {field.label}
            </label>
            {field.type === 'checkbox' ? (
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => handleConfigChange(field.section, field.name, e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            ) : (
              <input
                type={field.type || 'text'}
                value={field.value}
                onChange={(e) => handleConfigChange(field.section, field.name, e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            )}
            {field.help && <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#999' }}>{field.help}</p>}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>
        {[
          { id: 'radius', label: '🔐 RADIUS Config', color: '#667eea' },
          { id: 'mikrotik', label: '🖥️ MikroTik Config', color: '#764ba2' },
          { id: 'system', label: '⚙️ System Settings', color: '#06b6d4' },
          { id: 'freeradius', label: '📡 FreeRADIUS', color: '#10b981' },
          { id: 'status', label: '📊 System Status', color: '#f59e0b' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              background: activeTab === tab.id ? `linear-gradient(135deg, ${tab.color} 0%, ${tab.color}dd 100%)` : '#f5f5f5',
              border: 'none',
              borderRadius: '6px 6px 0 0',
              color: activeTab === tab.id ? 'white' : '#666',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) e.target.style.background = '#efefef'
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) e.target.style.background = '#f5f5f5'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* RADIUS Config */}
      {activeTab === 'radius' && (
        <div>
          <ConfigSection
            title="🔐 RADIUS Server Configuration"
            description="Configure RADIUS server parameters for authentication"
            fields={[
              {
                section: 'radius',
                name: 'host',
                label: 'RADIUS Server Host',
                value: config.radius.host,
                help: 'IP address or hostname of RADIUS server',
              },
              {
                section: 'radius',
                name: 'port',
                label: 'RADIUS Server Port',
                value: config.radius.port,
                type: 'number',
                help: 'Default: 1812',
              },
              {
                section: 'radius',
                name: 'secret',
                label: 'Shared Secret',
                value: config.radius.secret,
                type: 'password',
                help: 'Shared secret for RADIUS authentication',
              },
              {
                section: 'radius',
                name: 'timeout',
                label: 'Timeout (seconds)',
                value: config.radius.timeout,
                type: 'number',
                help: 'Request timeout in seconds',
              },
            ]}
          />

          <button
            onClick={handleSaveConfig}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Saving...' : 'Save RADIUS Configuration'}
          </button>

          {saved && (
            <div style={{ marginTop: '10px', color: '#10b981', fontSize: '14px' }}>
              ✅ Configuration saved successfully!
            </div>
          )}
        </div>
      )}

      {/* MikroTik Config */}
      {activeTab === 'mikrotik' && (
        <div>
          <ConfigSection
            title="🖥️ MikroTik RouterOS Configuration"
            description="Configure MikroTik API connection parameters"
            fields={[
              {
                section: 'mikrotik',
                name: 'host',
                label: 'RouterOS Host',
                value: config.mikrotik.host,
                help: 'IP address of MikroTik RouterOS',
              },
              {
                section: 'mikrotik',
                name: 'port',
                label: 'API Port',
                value: config.mikrotik.port,
                type: 'number',
                help: 'Default: 8728',
              },
              {
                section: 'mikrotik',
                name: 'username',
                label: 'Username',
                value: config.mikrotik.username,
                help: 'MikroTik admin username',
              },
              {
                section: 'mikrotik',
                name: 'password',
                label: 'Password',
                value: config.mikrotik.password,
                type: 'password',
                help: 'MikroTik admin password',
              },
            ]}
          />

          <button
            onClick={handleSaveConfig}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Saving...' : 'Save MikroTik Configuration'}
          </button>

          {saved && (
            <div style={{ marginTop: '10px', color: '#10b981', fontSize: '14px' }}>
              ✅ Configuration saved successfully!
            </div>
          )}
        </div>
      )}

      {/* System Settings */}
      {activeTab === 'system' && (
        <div>
          <ConfigSection
            title="⚙️ System Settings"
            description="Configure general system parameters"
            fields={[
              {
                section: 'system',
                name: 'max_users',
                label: 'Maximum Users',
                value: config.system.max_users,
                type: 'number',
                help: 'Maximum number of users in system',
              },
              {
                section: 'system',
                name: 'default_quota_gb',
                label: 'Default Quota (GB)',
                value: config.system.default_quota_gb,
                type: 'number',
                help: 'Default data quota for new users',
              },
              {
                section: 'system',
                name: 'enable_audit',
                label: 'Enable Audit Logging',
                value: config.system.enable_audit,
                type: 'checkbox',
                help: 'Log all system activities',
              },
              {
                section: 'system',
                name: 'enable_websocket',
                label: 'Enable WebSocket',
                value: config.system.enable_websocket,
                type: 'checkbox',
                help: 'Enable real-time updates via WebSocket',
              },
            ]}
          />

          <button
            onClick={handleSaveConfig}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Saving...' : 'Save System Settings'}
          </button>

          {saved && (
            <div style={{ marginTop: '10px', color: '#10b981', fontSize: '14px' }}>
              ✅ Configuration saved successfully!
            </div>
          )}
        </div>
      )}

      {/* FreeRADIUS Management */}
      {activeTab === 'freeradius' && (
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <FreeRadiusManagement />
        </div>
      )}

      {/* System Status */}
      {activeTab === 'status' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '18px' }}>🔐 RADIUS Server</h4>
              <span style={{ background: '#10b981', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>ONLINE</span>
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '8px', marginTop: '8px' }}>
                <span style={{ opacity: 0.9 }}>Requests:</span> <span style={{ fontWeight: 'bold' }}>1,234</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '8px', marginTop: '8px' }}>
                <span style={{ opacity: 0.9 }}>Uptime:</span> <span style={{ fontWeight: 'bold' }}>24h 30m</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', color: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(6, 182, 212, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '18px' }}>🖥️ MikroTik API</h4>
              <span style={{ background: '#10b981', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>ONLINE</span>
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '8px', marginTop: '8px' }}>
                <span style={{ opacity: 0.9 }}>Users:</span> <span style={{ fontWeight: 'bold' }}>456</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '8px', marginTop: '8px' }}>
                <span style={{ opacity: 0.9 }}>Sessions:</span> <span style={{ fontWeight: 'bold' }}>389</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '18px' }}>💾 Database</h4>
              <span style={{ background: '#10b981', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>ONLINE</span>
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '8px', marginTop: '8px' }}>
                <span style={{ opacity: 0.9 }}>Tables:</span> <span style={{ fontWeight: 'bold' }}>12</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '8px', marginTop: '8px' }}>
                <span style={{ opacity: 0.9 }}>Size:</span> <span style={{ fontWeight: 'bold' }}>250 MB</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '18px' }}>⚡ WebSocket</h4>
              <span style={{ background: '#10b981', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>ONLINE</span>
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '8px', marginTop: '8px' }}>
                <span style={{ opacity: 0.9 }}>Clients:</span> <span style={{ fontWeight: 'bold' }}>23</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '8px', marginTop: '8px' }}>
                <span style={{ opacity: 0.9 }}>Messages/s:</span> <span style={{ fontWeight: 'bold' }}>1,245</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
