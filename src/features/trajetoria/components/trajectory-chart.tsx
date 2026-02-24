'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from 'recharts';

interface TrajectoryChartProps {
  emissoes2005: number;
}

export function TrajectoryChart({ emissoes2005 }: TrajectoryChartProps) {
  // Generate trajectory data points
  const base = emissoes2005 || 280000;
  const data = [
    { year: '2005', real: base, meta: base },
    { year: '2010', real: Math.round(base * 0.95), meta: Math.round(base * 0.9) },
    { year: '2015', real: Math.round(base * 0.9), meta: Math.round(base * 0.8) },
    { year: '2019', real: Math.round(base * 0.83), meta: Math.round(base * 0.7) },
    { year: '2024', real: Math.round(base * 0.7), meta: Math.round(base * 0.57) },
    { year: '2030', real: null, meta: Math.round(base * 0.32) },
    { year: '2040', real: null, meta: Math.round(base * 0.12) },
    { year: '2050', real: null, meta: Math.round(base * 0.05) },
  ];

  return (
    <ResponsiveContainer width='100%' height={400}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
        <XAxis dataKey='year' className='text-xs' />
        <YAxis
          className='text-xs'
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value: number) => [
            `${value?.toLocaleString('pt-PT')} tCO2e`,
          ]}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Line
          type='monotone'
          dataKey='real'
          name='Trajetória Real'
          stroke='#10b981'
          strokeWidth={3}
          dot={{ r: 5, fill: '#10b981' }}
          connectNulls={false}
        />
        <Line
          type='monotone'
          dataKey='meta'
          name='Meta Planeada (PMAC)'
          stroke='#94a3b8'
          strokeWidth={2}
          strokeDasharray='10 5'
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
