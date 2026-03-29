'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SectorEmission {
  sector: string;
  tco2: number;
}

export function EmissionsBySectorChart({ data }: { data: SectorEmission[] }) {
  if (!data.length) return <p className='text-sm text-muted-foreground'>Sem dados</p>;

  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart data={data} layout='vertical' margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
        <XAxis type='number' tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} className='text-xs' />
        <YAxis type='category' dataKey='sector' width={150} className='text-xs' />
        <Tooltip formatter={(v: number) => `${v.toLocaleString('pt-PT')} tCO₂e`} />
        <Bar dataKey='tco2' fill='#ef4444' radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
