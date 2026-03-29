'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface EmissionsVectorData {
  name: string;
  value: number;
}

const COLORS = ['#f59e0b', '#3b82f6', '#ef4444'];

export function EmissionsByVectorChart({ data }: { data: EmissionsVectorData[] }) {
  if (!data.length) return <p className='text-sm text-muted-foreground'>Sem dados</p>;

  return (
    <ResponsiveContainer width='100%' height={300}>
      <PieChart>
        <Pie
          data={data}
          cx='50%'
          cy='50%'
          innerRadius={60}
          outerRadius={100}
          dataKey='value'
          nameKey='name'
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => `${v.toLocaleString('pt-PT')} tCO₂e`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
