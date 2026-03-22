'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface YearPoint {
  year: number;
  electricity_mwh: number | null;
  gas_mwh: number | null;
  oil_mwh: number | null;
}

export function HistoricalChart({ data }: { data: YearPoint[] }) {
  if (!data.length) return <p className='text-sm text-muted-foreground py-12 text-center'>Sem dados</p>;
  return (
    <ResponsiveContainer width='100%' height={320}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
        <XAxis dataKey='year' className='text-xs' />
        <YAxis tickFormatter={(v: number) => `${(v/1000).toFixed(0)}k`} className='text-xs' />
        <Tooltip formatter={(v: number) => [`${v?.toLocaleString('pt-PT')} MWh`]} />
        <Legend />
        <Line type='monotone' dataKey='electricity_mwh' name='Eletricidade' stroke='#6366f1' strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
        <Line type='monotone' dataKey='gas_mwh'         name='Gás Natural'  stroke='#10b981' strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
        <Line type='monotone' dataKey='oil_mwh'         name='Petróleo'     stroke='#f59e0b' strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
