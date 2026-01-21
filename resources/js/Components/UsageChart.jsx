import React, { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import axios from 'axios'

export default function UsageChart({ userId, timeframe = 'daily' }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/users/${userId}/usage`, {
          params: { timeframe }
        })
        setData(response.data)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch usage data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, timeframe])

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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage ({timeframe})</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" />
          <YAxis stroke="#6b7280" label={{ value: 'GB', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
            labelStyle={{ color: '#f3f4f6' }}
          />
          <Legend />
          <Bar dataKey="download" fill="#3b82f6" name="Download" />
          <Bar dataKey="upload" fill="#10b981" name="Upload" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
