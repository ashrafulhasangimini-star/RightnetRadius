import React from 'react'

export default function StatCard({ label, value, unit, trend, icon: Icon }) {
  const isPositive = trend >= 0
  
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{unit}</p>
          </div>
          {trend !== undefined && (
            <p className={`mt-2 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-lg bg-blue-100">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        )}
      </div>
    </div>
  )
}
