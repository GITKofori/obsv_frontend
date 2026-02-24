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

export function SetorChart({ data }: SetorChartProps) {
  if (!data.length) {
    return (
      <p className='text-sm text-muted-foreground py-8 text-center'>
        Sem dados de setores disponíveis.
      </p>
    );
  }

  return (
    <ChartContainer config={chartConfig} className='aspect-[4/3] w-full'>
      <BarChart data={data} layout='vertical' margin={{ left: 8, right: 8 }}>
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
