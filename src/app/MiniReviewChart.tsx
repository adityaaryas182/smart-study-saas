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
              offset="0%"
              stopColor="#4F46E5"
              stopOpacity={0.28}
            />

            <stop
              offset="55%"
              stopColor="#6366F1"
              stopOpacity={0.09}
            />

            <stop
              offset="100%"
              stopColor="#4F46E5"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#E2E8F0"
        />

        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 11,
            fill: '#94A3B8',
          }}
          dy={8}
        />

        <Tooltip
          cursor={{
            stroke: '#C7D2FE',
            strokeWidth: 1,
            strokeDasharray: '4 4',
          }}
          contentStyle={{
            borderRadius: '10px',
            border:
              '1px solid #E2E8F0',
            boxShadow:
              '0 8px 24px rgb(15 23 42 / 0.08)',
            fontSize: 12,
            padding: '7px 10px',
          }}
          labelStyle={{
            color: '#64748B',
            marginBottom: 2,
          }}
          itemStyle={{
            color: '#4F46E5',
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
          strokeWidth={2.25}
          fill="url(#miniReviewGradient)"
          fillOpacity={1}
          activeDot={{
            r: 4,
            fill: '#4F46E5',
            stroke: '#FFFFFF',
            strokeWidth: 2,
          }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}