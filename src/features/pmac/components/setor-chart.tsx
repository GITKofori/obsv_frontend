'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

interface SetorChartProps {
  data: { setor: string; total_medidas: number }[];
}

const chartConfig = {
  total_medidas: {
    label: 'Total Medidas',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const ALL_SECTORS = ['Energia', 'Transportes', 'Resíduos', 'Água', 'Agroflorestal', 'Saúde', 'Proteção Civil'];

export function SetorChart({ data }: SetorChartProps) {
  const countBySetor: Record<string, number> = {};
  for (const d of data) countBySetor[d.setor] = d.total_medidas;

  const chartData = ALL_SECTORS.map(s => ({
    setor: s,
    total_medidas: countBySetor[s] ?? 0,
  }));

  return (
    <ChartContainer config={chartConfig} className='aspect-[4/3] w-full'>
      <BarChart data={chartData} layout='vertical' margin={{ left: 8, right: 8 }}>
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey='setor'
          type='category'
          tickLine={false}
          axisLine={false}
          width={100}
          tick={{ fontSize: 11 }}
        />
        <XAxis type='number' hide />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey='total_medidas'
          fill='var(--color-total_medidas)'
          radius={[0, 4, 4, 0]}
          barSize={18}
        />
      </BarChart>
    </ChartContainer>
  );
}
