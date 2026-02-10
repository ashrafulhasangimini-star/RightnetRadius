import React, { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import axios from 'axios'

export default function OnlineUsersChart({ interval = 10000 }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/admin/online-users-history')
        setData(response.data)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch online users data:', error)
        setLoading(false)
      }
    }

    fetchData()
    const intervalId = setInterval(fetchData, interval)

    return () => clearInterval(intervalId)
  }, [interval])

  if (loading) {
    return (
      <div className="card">
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Online Users (Live)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="time" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
            labelStyle={{ color: '#f3f4f6' }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="Online Users"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
