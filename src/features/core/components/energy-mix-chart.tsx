'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface EnergyMixChartProps {
  data: { name: string; value: number | string }[];
}

const PALETTE: { key: string; label: string; color: string }[] = [
  { key: 'eletricidade', label: 'Eletricidade',  color: 'hsl(217, 91%, 60%)' },
  { key: 'gas',         label: 'Gás Natural',    color: 'hsl(38, 92%, 50%)'  },
  { key: 'petroleo',    label: 'Petróleo',        color: 'hsl(0, 72%, 51%)'   },
  { key: 'biomassa',    label: 'Biomassa',        color: 'hsl(142, 71%, 45%)' },
  { key: 'solar',       label: 'Solar',           color: 'hsl(48, 96%, 53%)'  },
  { key: 'renovavel',   label: 'Renovável',       color: 'hsl(166, 60%, 45%)' },
  { key: 'outros',      label: 'Outros',          color: 'hsl(215, 14%, 60%)' },
];

const FALLBACK_COLORS = [
  'hsl(217,91%,60%)', 'hsl(38,92%,50%)', 'hsl(0,72%,51%)',
  'hsl(142,71%,45%)', 'hsl(48,96%,53%)', 'hsl(166,60%,45%)', 'hsl(215,14%,60%)',
];

function resolveEntry(name: string, idx: number): { label: string; color: string } {
  const normalized = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const match = PALETTE.find((p) => normalized.includes(p.key));
  return match
    ? { label: match.label, color: match.color }
    : { label: name, color: FALLBACK_COLORS[idx % FALLBACK_COLORS.length] };
}

interface CustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

const RADIAN = Math.PI / 180;
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: CustomLabelProps) {
  if (percent < 0.03) return null; // skip tiny slices
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill='white'
      textAnchor='middle'
      dominantBaseline='central'
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
}

export function EnergyMixChart({ data }: EnergyMixChartProps) {
  // Ensure values are numbers — PostgreSQL COUNT(*) comes back as strings
  const parsed = data.map((d, idx) => {
    const { label, color } = resolveEntry(d.name, idx);
    return { name: d.name, label, color, value: Number(d.value) };
  });

  const total = parsed.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <p className='py-12 text-center text-sm text-muted-foreground'>
        Sem dados disponíveis
      </p>
    );
  }

  return (
    <div className='space-y-2'>
      <ResponsiveContainer width='100%' height={280}>
        <PieChart>
          <Pie
            data={parsed}
            dataKey='value'
            nameKey='label'
            cx='50%'
            cy='50%'
            innerRadius={60}
            outerRadius={105}
            paddingAngle={2}
            strokeWidth={2}
            stroke='hsl(var(--background))'
            labelLine={false}
            label={(props) => <CustomLabel {...props} />}
          >
            {parsed.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${Number(value).toLocaleString('pt-PT')} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`,
              name,
            ]}
            contentStyle={{
              fontSize: 12,
              borderRadius: '6px',
              border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
            }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Total callout */}
      <p className='text-center text-xs text-muted-foreground'>
        Total: <span className='font-semibold text-foreground'>{total.toLocaleString('pt-PT')}</span> registos
      </p>
    </div>
  );
}
