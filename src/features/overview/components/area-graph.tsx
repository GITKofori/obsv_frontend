'use client';

import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { useDashboard } from '@/app/dashboard/overview/DashboardProvider';
import { useMemo } from 'react';
const chartData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 }
];

const chartConfig = {
  Alta: {
    label: 'Alta',
    color: 'hsl(var(--chart-1))'
  },
  Baixa: {
    label: 'Baixa',
    color: 'hsl(var(--chart-2))'
  },
  Autoconsumo: {
    label: 'Autoconsumo',
    color: 'hsl(var(--chart-3))'
  }
} satisfies ChartConfig;

export function AreaGraph() {
  const dashboard = useDashboard();
  const unprocessedData = dashboard.valueEleByYear;

  const chartData = useMemo(
    () =>
      Object.values(
        unprocessedData?.reduce((acc, { name, year, value }) => {
          if (!acc[year]) {
            acc[year] = { year };
          }
          acc[year][name] = value;
          return acc;
        }, {})
      ),
    [unprocessedData]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados Elétricos</CardTitle>
        <CardDescription>
          Visualização da comparação entre Alta, Baixo, Autoconsumo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[310px] w-full'
        >
          <AreaChart
            accessibilityLayer
            data={chartData || []}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='year'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='dot' />}
            />
            <Area
              dataKey='Alta'
              type='natural'
              fill='var(--color-Alta)'
              fillOpacity={0.4}
              stroke='var(--color-Alta)'
              stackId='a'
            />
            <Area
              dataKey='Baixa'
              type='natural'
              fill='var(--color-Baixa)'
              fillOpacity={0.4}
              stroke='var(--color-Baixa)'
              stackId='a'
            />
            <Area
              dataKey='Autoconsumo'
              type='natural'
              fill='var(--color-Autoconsumo)'
              fillOpacity={0.4}
              stroke='var(--color-Autoconsumo)'
              stackId='a'
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
