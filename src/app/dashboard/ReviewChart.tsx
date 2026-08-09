// src/app/dashboard/ReviewChart.tsx
'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface ChartData {
  label: string
  jumlah: number
}

export default function ReviewChart({ data }: { data: ChartData[] }) {
  return (
    // height angka, BUKAN "100%" — mencegah bug rerender margin.
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorNavy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0f172a" stopOpacity={0.14} />
            <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          dy={10}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          allowDecimals={false}
        />

        <Tooltip
          cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
          contentStyle={{
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px 0 rgb(15 23 42 / 0.08)',
            fontSize: 12,
            padding: '6px 10px',
          }}
          labelStyle={{ color: '#64748b', marginBottom: 2 }}
          itemStyle={{ color: '#0f172a' }}
          formatter={(value: number) => [`${value} soal`, 'Review']}
        />

        <Area
          type="monotone"
          dataKey="jumlah"
          stroke="#0f172a"              // navy, bukan biru cerah
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorNavy)"
          activeDot={{ r: 5, fill: '#0f172a', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}