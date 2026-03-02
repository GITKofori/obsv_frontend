'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SectorEmissionsChartProps {
  data: { name: string; value: number | string; record_count?: number }[];
}

const SECTOR_COLORS: { pattern: string; color: string }[] = [
  { pattern: 'domést',    color: 'hsl(217, 91%, 60%)' },
  { pattern: 'domest',    color: 'hsl(217, 91%, 60%)' },
  { pattern: 'não domés', color: 'hsl(38, 92%, 50%)'  },
  { pattern: 'nao domes', color: 'hsl(38, 92%, 50%)'  },
  { pattern: 'agricult',  color: 'hsl(142, 71%, 45%)' },
  { pattern: 'industri',  color: 'hsl(48, 96%, 53%)'  },
  { pattern: 'indústr',   color: 'hsl(48, 96%, 53%)'  },
  { pattern: 'transport', color: 'hsl(0, 72%, 51%)'   },
  { pattern: 'serviç',    color: 'hsl(166, 60%, 45%)' },
  { pattern: 'servic',    color: 'hsl(166, 60%, 45%)' },
];

const FALLBACK_COLORS = [
  'hsl(217,91%,60%)', 'hsl(38,92%,50%)', 'hsl(142,71%,45%)',
  'hsl(0,72%,51%)',   'hsl(48,96%,53%)', 'hsl(166,60%,45%)',
  'hsl(260,60%,55%)', 'hsl(320,60%,55%)',
];

function colorForName(name: string, idx: number): string {
  const normalized = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const match = SECTOR_COLORS.find((s) => normalized.includes(s.pattern));
  return match ? match.color : FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
}

// Truncate very long labels for the Y-axis tick
function truncate(str: string, max = 28): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

const MAX_ITEMS = 15; // show top N sectors only

export function SectorEmissionsChart({ data }: SectorEmissionsChartProps) {
  if (!data.length) {
    return (
      <p className='py-12 text-center text-sm text-muted-foreground'>
        Sem dados disponíveis
      </p>
    );
  }

  // Sort by value desc, take top N, ensure values are numbers
  const prepared = data
    .map((d) => ({ ...d, value: Number(d.value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, MAX_ITEMS)
    .map((d) => ({ ...d, shortName: truncate(d.name) }));

  const barHeight = 32;
  const chartHeight = prepared.length * barHeight + 40;

  return (
    <div>
      {data.length > MAX_ITEMS && (
        <p className='mb-2 text-right text-xs text-muted-foreground'>
          Top {MAX_ITEMS} de {data.length} setores
        </p>
      )}
      <ResponsiveContainer width='100%' height={chartHeight}>
        <BarChart
          data={prepared}
          layout='vertical'
          margin={{ top: 0, right: 16, left: 4, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray='3 3' horizontal={false} stroke='hsl(var(--border))' />
          <XAxis
            type='number'
            tick={{ fontSize: 11 }}
            tickFormatter={(v) =>
              v >= 1_000_000
                ? `${(v / 1_000_000).toFixed(1)}M`
                : v >= 1000
                  ? `${(v / 1000).toFixed(0)}k`
                  : `${v}`
            }
            tickLine={false}
          />
          <YAxis
            type='category'
            dataKey='shortName'
            width={180}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: number, _name: string, props) => [
              Number(value).toLocaleString('pt-PT'),
              props.payload?.name ?? _name,
            ]}
            contentStyle={{
              fontSize: 12,
              borderRadius: '6px',
              border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              maxWidth: 280,
            }}
            labelStyle={{ fontWeight: 600 }}
          />
          <Bar dataKey='value' radius={[0, 4, 4, 0]} barSize={20}>
            {prepared.map((entry, idx) => (
              <Cell key={entry.name} fill={colorForName(entry.name, idx)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
