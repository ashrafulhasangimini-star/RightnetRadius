import { useState, useEffect } from 'react'

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 10000)
    return () => clearInterval(interval)
  }, [filter])

  const fetchLogs = async () => {
    try {
      const url = new URL('/api/audit/logs', window.location.origin)
      if (filter !== 'all') {
        url.searchParams.append('action', filter)
      }
      const response = await fetch(url)
      const data = await response.json()
      if (response.ok) {
        setLogs(Array.isArray(data) ? data : data.logs || [])
      }
    } catch (err) {
      console.error('Error fetching logs:', err)
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action) => {
    const colors = {
      auth: '#667eea',
      login: '#06b6d4',
      logout: '#f59e0b',
      bandwidth_limit: '#ec4899',
      user_block: '#ef4444',
      user_unblock: '#10b981',
      disconnect: '#f97316',
      authentication_failed: '#dc2626',
      quota_breach: '#ea580c',
    }
    return colors[action] || '#666'
  }

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === 'all' || log.action === filter
    const matchesSearch =
      searchTerm === '' ||
      log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#666', fontWeight: 'bold', fontSize: '14px' }}>
              Filter by Action
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            >
              <option value="all">All Actions</option>
              <option value="auth">Authentication</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="bandwidth_limit">Bandwidth Limit</option>
              <option value="user_block">User Block</option>
              <option value="user_unblock">User Unblock</option>
              <option value="disconnect">Disconnect</option>
              <option value="quota_breach">Quota Breach</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#666', fontWeight: 'bold', fontSize: '14px' }}>
              Search
            </label>
            <input
              type="text"
              placeholder="Search by username or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>Loading logs...</div>
      ) : filteredLogs.length === 0 ? (
        <div
          style={{
            background: 'white',
            padding: '40px',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#999',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          No audit logs found
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e0e0e0' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#666' }}>
                  Timestamp
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#666' }}>
                  User
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#666' }}>
                  Action
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#666' }}>
                  IP Address
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#666' }}>
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#666' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#333', fontWeight: '500' }}>
                    {log.username || 'System'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        background: getActionColor(log.action),
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#666' }}>
                    {log.ip_address || '-'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#666', maxWidth: '300px', whiteSpace: 'normal' }}>
                    {log.details ? (
                      typeof log.details === 'string' ? (
                        log.details
                      ) : (
                        JSON.stringify(log.details).substring(0, 100) + '...'
                      )
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats Footer */}
      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div
          style={{
            background: 'white',
            padding: '16px',
            borderRadius: '6px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>{filteredLogs.length}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Total Logs</div>
        </div>
      </div>
    </div>
  )
}
