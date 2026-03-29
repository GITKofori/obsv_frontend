'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface GeeYearPoint {
  year: number;
  total_tco2: number;
}

interface TrajectoryChartProps {
  baseline2005: number;
  municipioBaseline2005: number | null;
  geeByYear: GeeYearPoint[];
}

export function TrajectoryChart({ baseline2005, municipioBaseline2005, geeByYear }: TrajectoryChartProps) {
  // Use municipality-specific baseline if available, otherwise regional
  const base = municipioBaseline2005 && municipioBaseline2005 > 0
    ? municipioBaseline2005
    : (baseline2005 > 0 ? baseline2005 : 280000);

  // Real trajectory from backend (already uses year-aware emission factors)
  const realPoints: Record<string, number> = {};
  for (const pt of geeByYear) {
    realPoints[String(pt.year)] = pt.total_tco2;
  }

  // PMAC milestones: -55% by 2030, -65%/-75% by 2040, -90% by 2050
  const milestoneYears = [
    { year: 2005, conservative: base, ambitious: base },
    { year: 2030, conservative: Math.round(base * 0.45), ambitious: Math.round(base * 0.45) },
    { year: 2040, conservative: Math.round(base * 0.35), ambitious: Math.round(base * 0.25) },
    { year: 2050, conservative: Math.round(base * 0.10), ambitious: Math.round(base * 0.10) },
  ];

  // Combine real data years + milestone years into a single timeline
  const allYears = new Set<number>();
  geeByYear.forEach(pt => allYears.add(pt.year));
  milestoneYears.forEach(m => allYears.add(m.year));

  const data = [...allYears].sort((a, b) => a - b).map(year => {
    const milestone = milestoneYears.find(m => m.year === year);
    return {
      year: String(year),
      real: realPoints[String(year)] ?? null,
      meta_conservative: milestone?.conservative ?? null,
      meta_ambitious: milestone?.ambitious ?? null,
    };
  });

  return (
    <ResponsiveContainer width='100%' height={400}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
        <XAxis dataKey='year' className='text-xs' />
        <YAxis className='text-xs' tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(value: number, name: string) => [
            value != null ? `${value.toLocaleString('pt-PT')} tCO₂e` : '—',
            name,
          ]}
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
          type='monotone' dataKey='meta_conservative' name='Meta PMAC (-65% em 2040)'
          stroke='#94a3b8' strokeWidth={2} strokeDasharray='10 5'
          dot={{ r: 3 }} connectNulls
        />
        <Line
          type='monotone' dataKey='meta_ambitious' name='Meta PMAC (-75% em 2040)'
          stroke='#64748b' strokeWidth={2} strokeDasharray='5 3'
          dot={{ r: 3 }} connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
