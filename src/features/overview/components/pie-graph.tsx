'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';

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

const getRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
};

export function PieGraph() {
  const dashboard = useDashboard();

  const chartData = dashboard.dadosPetroliferos;
  if (!chartData) return null;

  const uniqueTipos = chartData
    ? [...new Set(chartData.map((item) => item.tipo))]
    : [];

  const chartConfig = uniqueTipos.reduce((config, tipo) => {
    config[tipo] = {
      label: tipo.charAt(0).toUpperCase() + tipo.slice(1),
      color: getRandomColor()
    };
    return config;
  }, {});

  for (let i = 0; i < chartData.length; i++) {
    chartData[i].consumidores = +chartData[i].consumidores;
  }

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Dados Petrolíferos</CardTitle>
        <CardDescription>Até ao momento</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[360px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData || []}
              dataKey='consumidores'
              nameKey='tipo'
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          24
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground'
                        >
                          Tipos
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
