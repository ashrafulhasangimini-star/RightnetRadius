import React, { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import axios from 'axios'

export default function BandwidthChart({ userId, interval = 5000 }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/users/${userId}/bandwidth-history`)
        setData(response.data)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch bandwidth data:', error)
        setLoading(false)
      }
    }

    fetchData()
    const intervalId = setInterval(fetchData, interval)

    return () => clearInterval(intervalId)
  }, [userId, interval])

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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Bandwidth Usage</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="time" stroke="#6b7280" />
          <YAxis stroke="#6b7280" label={{ value: 'Mbps', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
            labelStyle={{ color: '#f3f4f6' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="download"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Download"
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="upload"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            name="Upload"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
