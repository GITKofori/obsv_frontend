'use client';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b'];

export function EnergyMixChart({ data }: { data: { name: string; value: number }[] }) {
  if (!data.length) return <p className='text-sm text-muted-foreground py-12 text-center'>Sem dados</p>;
  return (
    <ResponsiveContainer width='100%' height={280}>
      <PieChart>
        <Pie data={data} dataKey='value' nameKey='name' cx='50%' cy='50%' outerRadius={100}
             label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v: number) => [`${v.toLocaleString('pt-PT')} MWh`]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
