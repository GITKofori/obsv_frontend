'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin } from 'lucide-react';
import type { ParcelaState } from 'types/pmac';
import { MetricGroup } from './metric-group';
import { VibrationDisplay } from './vibration-display';
import { HistoryChart } from './history-chart';

// Fields by group for t2 ar+solo parcelas (point1, point2)
const AR_FIELDS = [
  'ar_temperatura',
  'ar_humidade',
  'ar_co2',
  'ar_indice_uv',
  'ar_intensidade_uv',
  'ar_luz_solar',
  'ar_pressao_atmosferica',
];

const SOLO_FIELDS = [
  'solo_temperatura',
  'solo_humidade',
  'solo_ph',
  'solo_condutividade',
  'solo_azoto',
  'solo_fosforo',
  'solo_potassio',
  'solo_quantidade_chuva',
];

const AGUA_FIELDS = [
  'agua_nivel',
  'agua_ph',
  'agua_cloro_residual',
  'agua_turvacao',
];

interface ParcelaCardProps {
  label: string;
  parcela: string;
  state: ParcelaState;
  hasT1?: boolean;
  isWater?: boolean;
}

export function ParcelaCard({
  label,
  parcela,
  state,
  hasT1 = false,
  isWater = false,
}: ParcelaCardProps) {
  const t2Data = state.t2 ? (state.t2 as unknown as Record<string, number | string>) : null;
  const t2Timestamp = t2Data?.Timestamp as string | undefined;

  return (
    <Card className='flex flex-col'>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-base font-semibold'>
          <MapPin className='h-4 w-4 text-primary shrink-0' />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className='flex-1 space-y-4'>
        {/* Per-second vibration display */}
        {hasT1 && (
          <>
            <VibrationDisplay data={state.t1} />
            <Separator />
          </>
        )}

        {/* 30-min metric groups */}
        {!isWater ? (
          <>
            <MetricGroup
              title='Ar'
              fields={AR_FIELDS}
              data={t2Data}
              timestamp={t2Timestamp}
            />
            <Separator />
            <MetricGroup
              title='Solo'
              fields={SOLO_FIELDS}
              data={t2Data}
              timestamp={t2Timestamp}
            />
          </>
        ) : (
          <MetricGroup
            title='Água'
            fields={AGUA_FIELDS}
            data={t2Data}
            timestamp={t2Timestamp}
          />
        )}

        {!t2Data && (
          <p className='text-center text-sm text-muted-foreground py-4'>
            A aguardar leituras de 30 minutos...
          </p>
        )}

        <Separator />

        {/* 7-day history chart */}
        <HistoryChart
          parcela={parcela}
          topico='t2'
        />
      </CardContent>
    </Card>
  );
}
