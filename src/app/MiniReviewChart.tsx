// src/app/MiniReviewChart.tsx

'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts'

interface ChartData {
  label: string
  jumlah: number
}

export default function MiniReviewChart({
  data,
}: {
  data: ChartData[]
}) {
  return (
    <ResponsiveContainer
      width="100%"
      height={170}
    >
      <AreaChart
        data={data}
        margin={{
          top: 8,
          right: 4,
          left: 4,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient
            id="miniReviewGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="5%"
              stopColor="#4F46E5"
              stopOpacity={0.16}
            />

            <stop
              offset="95%"
              stopColor="#4F46E5"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#e2e8f0"
        />

        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 11,
            fill: '#94a3b8',
          }}
          dy={8}
        />

        <Tooltip
          cursor={{
            stroke: '#c7d2fe',
            strokeWidth: 1,
            strokeDasharray: '4 4',
          }}
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow:
              '0 4px 12px rgb(15 23 42 / 0.08)',
            fontSize: 12,
            padding: '6px 10px',
          }}
          labelStyle={{
            color: '#64748b',
            marginBottom: 2,
          }}
          itemStyle={{
            color: '#4f46e5',
          }}
          formatter={(value) => [
            `${Number(value ?? 0)} soal`,
            'Review',
          ]}
        />

        <Area
          type="monotone"
          dataKey="jumlah"
          stroke="#4F46E5"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#miniReviewGradient)"
          activeDot={{
            r: 4,
            fill: '#4F46E5',
            stroke: '#ffffff',
            strokeWidth: 2,
          }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}