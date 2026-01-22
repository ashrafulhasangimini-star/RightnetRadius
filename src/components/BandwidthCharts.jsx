import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export function BandwidthChart({ data = [] }) {
  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis label={{ value: 'Mbps', angle: -90, position: 'insideLeft' }} />
          <Tooltip 
            formatter={(value) => value.toFixed(2)}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="download" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#downloadGradient)" 
            name="Download"
          />
          <Area 
            type="monotone" 
            dataKey="upload" 
            stroke="#10b981" 
            fillOpacity={1} 
            fill="url(#uploadGradient)" 
            name="Upload"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopUsersChart({ data = [] }) {
  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="username" />
          <YAxis label={{ value: 'GB', angle: -90, position: 'insideLeft' }} />
          <Tooltip 
            formatter={(value) => value.toFixed(2)}
            labelFormatter={(label) => `User: ${label}`}
          />
          <Legend />
          <Bar dataKey="usage" fill="#3b82f6" name="Data Used (GB)" />
          <Bar dataKey="remaining" fill="#10b981" name="Remaining (GB)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function QuotaChart({ username, used, quota }) {
  const data = [
    { name: 'Used', value: used, fill: '#ef4444' },
    { name: 'Remaining', value: Math.max(0, quota - used), fill: '#10b981' }
  ];

  return (
    <div className="chart-wrapper">
      <h3>{username} - Data Quota</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, percent }) => `${name}: ${value.toFixed(2)}GB (${(percent * 100).toFixed(1)}%)`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => value.toFixed(2)} />
        </PieChart>
      </ResponsiveContainer>
      <div className="quota-info">
        <p>Total Quota: {quota} GB</p>
        <p>Used: {used.toFixed(2)} GB ({((used / quota) * 100).toFixed(1)}%)</p>
        <p>Remaining: {(quota - used).toFixed(2)} GB</p>
      </div>
    </div>
  );
}

export function HourlyBandwidthChart({ data = [] }) {
  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="hour" 
            label={{ value: 'Hour', position: 'insideBottomRight', offset: -5 }}
          />
          <YAxis label={{ value: 'Total Bandwidth (Mbps)', angle: -90, position: 'insideLeft' }} />
          <Tooltip 
            formatter={(value) => value.toFixed(2)}
            labelFormatter={(label) => `${label}:00`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="bandwidth" 
            stroke="#3b82f6" 
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="Bandwidth Usage"
          />
          <Line 
            type="monotone" 
            dataKey="peak" 
            stroke="#ef4444" 
            dot={{ fill: '#ef4444', r: 3 }}
            name="Peak"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SessionsChart({ data = [] }) {
  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis label={{ value: 'Sessions', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="active" stackId="a" fill="#10b981" name="Active" />
          <Bar dataKey="completed" stackId="a" fill="#06b6d4" name="Completed" />
          <Bar dataKey="failed" stackId="a" fill="#ef4444" name="Failed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BandwidthChart;
