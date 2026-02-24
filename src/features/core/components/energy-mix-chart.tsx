'use client';

import { PieChart, Pie, Cell } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface EnergyMixChartProps {
  data: { name: string; value: number }[];
}

const COLORS: Record<string, string> = {
  eletricidade: 'hsl(217, 91%, 60%)',
  gas: 'hsl(38, 92%, 50%)',
  petroleo: 'hsl(0, 72%, 51%)',
  biomassa: 'hsl(142, 71%, 45%)',
  solar: 'hsl(48, 96%, 53%)',
  outros: 'hsl(215, 14%, 60%)',
};

const LABELS: Record<string, string> = {
  eletricidade: 'Eletricidade',
  gas: 'Gás Natural',
  petroleo: 'Petróleo',
  biomassa: 'Biomassa',
  solar: 'Solar',
  outros: 'Outros',
};

function buildChartConfig(data: { name: string; value: number }[]): ChartConfig {
  const config: ChartConfig = {};
  for (const item of data) {
    const key = item.name.toLowerCase();
    config[key] = {
      label: LABELS[key] || item.name,
      color: COLORS[key] || 'hsl(215, 14%, 60%)',
    };
  }
  return config;
}

export function EnergyMixChart({ data }: EnergyMixChartProps) {
  const chartConfig = buildChartConfig(data);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const chartData = data.map((d) => {
    const key = d.name.toLowerCase();
    return {
      ...d,
      fill: COLORS[key] || 'hsl(215, 14%, 60%)',
      percentage: total > 0 ? ((d.value / total) * 100).toFixed(1) : '0',
    };
  });

  return (
    <div>
      <ChartContainer config={chartConfig} className='mx-auto aspect-square max-h-[300px]'>
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                nameKey='name'
                formatter={(value, name) => {
                  const item = chartData.find((d) => d.name === name);
                  return `${Number(value).toLocaleString('pt-PT')} (${item?.percentage || 0}%)`;
                }}
              />
            }
          />
          <Pie
            data={chartData}
            dataKey='value'
            nameKey='name'
            cx='50%'
            cy='50%'
            innerRadius={60}
            outerRadius={110}
            paddingAngle={2}
            strokeWidth={2}
            stroke='hsl(var(--background))'
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      {/* Legend */}
      <div className='mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2'>
        {chartData.map((item) => {
          const key = item.name.toLowerCase();
          return (
            <div key={key} className='flex items-center gap-1.5 text-xs'>
              <div
                className='h-2.5 w-2.5 rounded-sm'
                style={{ backgroundColor: item.fill }}
              />
              <span className='text-muted-foreground'>
                {LABELS[key] || item.name} ({item.percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
