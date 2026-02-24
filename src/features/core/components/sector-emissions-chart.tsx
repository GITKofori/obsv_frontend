'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface SectorEmissionsChartProps {
  data: { name: string; value: number }[];
}

const SECTOR_COLORS: Record<string, string> = {
  doméstico: 'hsl(217, 91%, 60%)',
  domest: 'hsl(217, 91%, 60%)',
  serviços: 'hsl(142, 71%, 45%)',
  servicos: 'hsl(142, 71%, 45%)',
  indústria: 'hsl(38, 92%, 50%)',
  industria: 'hsl(38, 92%, 50%)',
  transportes: 'hsl(0, 72%, 51%)',
  agricultura: 'hsl(84, 60%, 45%)',
  agric: 'hsl(84, 60%, 45%)',
  total: 'hsl(215, 14%, 60%)',
};

function colorForName(name: string): string {
  const key = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [pattern, color] of Object.entries(SECTOR_COLORS)) {
    if (key.includes(pattern)) return color;
  }
  return 'hsl(215, 14%, 60%)';
}

const chartConfig: ChartConfig = {
  value: {
    label: 'Valor médio',
  },
};

export function SectorEmissionsChart({ data }: SectorEmissionsChartProps) {
  if (!data.length) {
    return (
      <p className='text-sm text-muted-foreground py-12 text-center'>
        Sem dados disponíveis
      </p>
    );
  }

  return (
    <ChartContainer config={chartConfig} className='min-h-[300px] w-full'>
      <BarChart
        data={data}
        layout='vertical'
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray='3 3' horizontal={false} className='stroke-muted' />
        <XAxis
          type='number'
          className='text-xs'
          tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
        />
        <YAxis
          type='category'
          dataKey='name'
          className='text-xs'
          width={100}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip
          content={<ChartTooltipContent formatter={(value) => Number(value).toLocaleString('pt-PT')} />}
        />
        <Bar dataKey='value' radius={[0, 4, 4, 0]} barSize={28}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={colorForName(entry.name)} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
