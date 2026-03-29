'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface YearEmission {
  year: number;
  electricity_tco2: number;
  gas_tco2: number;
  oil_tco2: number;
  total_tco2: number;
}

export function EmissionsHistoricalChart({ data }: { data: YearEmission[] }) {
  if (!data.length) return <p className='text-sm text-muted-foreground'>Sem dados</p>;

  return (
    <ResponsiveContainer width='100%' height={350}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
        <XAxis dataKey='year' className='text-xs' />
        <YAxis className='text-xs' tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(value: number, name: string) => [
            `${value.toLocaleString('pt-PT')} tCO₂e`,
            name,
          ]}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Line type='monotone' dataKey='total_tco2' name='Total' stroke='#ef4444' strokeWidth={2} dot={{ r: 3 }} />
        <Line type='monotone' dataKey='electricity_tco2' name='Eletricidade' stroke='#f59e0b' strokeWidth={1} dot={false} />
        <Line type='monotone' dataKey='gas_tco2' name='Gás Natural' stroke='#3b82f6' strokeWidth={1} dot={false} />
        <Line type='monotone' dataKey='oil_tco2' name='Petróleo' stroke='#8b5cf6' strokeWidth={1} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
