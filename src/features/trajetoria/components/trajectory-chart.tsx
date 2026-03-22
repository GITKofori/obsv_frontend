'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface YearPoint {
  year: number;
  electricity_mwh: number | null;
  gas_mwh: number | null;
  oil_mwh: number | null;
}

interface TrajectoryChartProps {
  baseline2005: number;
  energyByYear: YearPoint[];
}

const ELECTRICITY_EF = 0.255;
const GAS_EF = 0.202;
const OIL_EF = 0.267;

function yearToTco2(pt: YearPoint): number {
  return Math.round(
    (pt.electricity_mwh ?? 0) * ELECTRICITY_EF +
    (pt.gas_mwh ?? 0) * GAS_EF +
    (pt.oil_mwh ?? 0) * OIL_EF
  );
}

export function TrajectoryChart({ baseline2005, energyByYear }: TrajectoryChartProps) {
  const base = baseline2005 > 0 ? baseline2005 : 280000;

  // Real trajectory: one point per year we have data
  const realPoints: Record<string, number | null> = {};
  for (const pt of energyByYear) {
    realPoints[String(pt.year)] = yearToTco2(pt);
  }

  // Meta line: PMAC planned reduction milestones
  const data = [
    { year: '2005', real: base,                       meta: base },
    { year: '2010', real: realPoints['2010'] ?? null, meta: Math.round(base * 0.9) },
    { year: '2015', real: realPoints['2015'] ?? null, meta: Math.round(base * 0.8) },
    { year: '2019', real: realPoints['2019'] ?? null, meta: Math.round(base * 0.7) },
    { year: '2023', real: realPoints['2023'] ?? null, meta: Math.round(base * 0.57) },
    { year: '2030', real: null,                       meta: Math.round(base * 0.32) },
    { year: '2040', real: null,                       meta: Math.round(base * 0.12) },
    { year: '2050', real: null,                       meta: Math.round(base * 0.05) },
  ];

  return (
    <ResponsiveContainer width='100%' height={400}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
        <XAxis dataKey='year' className='text-xs' />
        <YAxis className='text-xs' tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(value: number) => [`${value?.toLocaleString('pt-PT')} tCO2e`]}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Line
          type='monotone' dataKey='real' name='Trajetória Real'
          stroke='#10b981' strokeWidth={3}
          dot={{ r: 5, fill: '#10b981' }} connectNulls={false}
        />
        <Line
          type='monotone' dataKey='meta' name='Meta Planeada (PMAC)'
          stroke='#94a3b8' strokeWidth={2} strokeDasharray='10 5'
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
