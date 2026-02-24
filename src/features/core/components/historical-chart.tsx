'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface HistoricalChartProps {
  data: { year: number; name: string; value: number }[];
}

const LINE_COLORS: Record<string, string> = {
  eletricidade: 'hsl(217, 91%, 60%)',
  gas: 'hsl(38, 92%, 50%)',
  petroleo: 'hsl(0, 72%, 51%)',
  biomassa: 'hsl(142, 71%, 45%)',
  solar: 'hsl(48, 96%, 53%)',
  outros: 'hsl(215, 14%, 60%)',
};

const LINE_LABELS: Record<string, string> = {
  eletricidade: 'Eletricidade',
  gas: 'Gás Natural',
  petroleo: 'Petróleo',
  biomassa: 'Biomassa',
  solar: 'Solar',
  outros: 'Outros',
};

export function HistoricalChart({ data }: HistoricalChartProps) {
  // Pivot data: group by year, each energy type becomes a column
  const yearMap = new Map<number, Record<string, number>>();
  const energyTypes = new Set<string>();

  for (const item of data) {
    if (item.year < 2005) continue;
    const key = item.name.toLowerCase();
    energyTypes.add(key);
    if (!yearMap.has(item.year)) {
      yearMap.set(item.year, { year: item.year });
    }
    yearMap.get(item.year)![key] = item.value;
  }

  const chartData = Array.from(yearMap.values()).sort(
    (a, b) => a.year - b.year
  );
  const types = Array.from(energyTypes);

  const chartConfig: ChartConfig = {};
  for (const type of types) {
    chartConfig[type] = {
      label: LINE_LABELS[type] || type,
      color: LINE_COLORS[type] || 'hsl(215, 14%, 60%)',
    };
  }

  return (
    <ChartContainer config={chartConfig} className='min-h-[350px] w-full'>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
        <XAxis dataKey='year' className='text-xs' />
        <YAxis
          className='text-xs'
          tickFormatter={(value) =>
            value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`
          }
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend />
        {types.map((type) => (
          <Line
            key={type}
            type='monotone'
            dataKey={type}
            name={LINE_LABELS[type] || type}
            stroke={LINE_COLORS[type] || 'hsl(215, 14%, 60%)'}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
