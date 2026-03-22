'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SectorEmissionsChart({ data }: { data: { sector: string; mwh: number }[] }) {
  if (!data.length) return <p className='text-sm text-muted-foreground py-12 text-center'>Sem dados</p>;
  const top10 = data.slice(0, 10);
  return (
    <ResponsiveContainer width='100%' height={280}>
      <BarChart data={top10} layout='vertical' margin={{ left: 20, right: 20 }}>
        <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
        <XAxis type='number' tickFormatter={(v: number) => `${(v/1000).toFixed(0)}k`} className='text-xs' />
        <YAxis type='category' dataKey='sector' width={160} className='text-xs' tick={{ fontSize: 10 }} />
        <Tooltip formatter={(v: number) => [`${v.toLocaleString('pt-PT')} MWh`]} />
        <Bar dataKey='mwh' name='MWh' fill='#6366f1' radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
