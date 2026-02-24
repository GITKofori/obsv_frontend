'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SensorIoT } from 'types/pmac';

interface SensorGaugeProps {
  sensor: SensorIoT;
}

function getGaugeColor(value: number, threshold: number): string {
  if (value >= threshold) return '#ef4444'; // red
  if (value >= threshold * 0.8) return '#f59e0b'; // amber
  return '#22c55e'; // green
}

function getStatusLabel(value: number, threshold: number): string {
  if (value >= threshold) return 'Alerta';
  if (value >= threshold * 0.8) return 'Atenção';
  return 'Normal';
}

function getStatusBadgeClass(value: number, threshold: number): string {
  if (value >= threshold)
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  if (value >= threshold * 0.8)
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
  return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
}

export function SensorGauge({ sensor }: SensorGaugeProps) {
  const { ultimo_valor, limiar_alerta, tipo_sensor, id, municipio_nome } =
    sensor;
  const color = getGaugeColor(ultimo_valor, limiar_alerta);
  const status = getStatusLabel(ultimo_valor, limiar_alerta);
  const badgeClass = getStatusBadgeClass(ultimo_valor, limiar_alerta);

  // Gauge data: value portion + remaining portion
  const maxValue = limiar_alerta * 1.5;
  const clampedValue = Math.min(ultimo_valor, maxValue);
  const remaining = maxValue - clampedValue;

  const gaugeData = [
    { name: 'value', value: clampedValue },
    { name: 'remaining', value: remaining },
  ];

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          {tipo_sensor}
        </CardTitle>
        <Badge variant='secondary' className={`text-[10px] font-semibold ${badgeClass}`}>
          {status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col items-center'>
          <ResponsiveContainer width='100%' height={120}>
            <PieChart>
              <Pie
                data={gaugeData}
                cx='50%'
                cy='90%'
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={80}
                dataKey='value'
                stroke='none'
              >
                <Cell fill={color} />
                <Cell fill='hsl(var(--muted))' />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className='-mt-6 text-center'>
            <span className='text-2xl font-black' style={{ color }}>
              {ultimo_valor}
            </span>
            <span className='ml-1 text-xs text-muted-foreground'>
              / {limiar_alerta}
            </span>
          </div>
          <div className='mt-2 flex flex-col items-center gap-0.5'>
            <code className='font-mono text-[10px] text-muted-foreground'>
              {id}
            </code>
            <span className='text-[10px] text-muted-foreground'>
              {municipio_nome}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
