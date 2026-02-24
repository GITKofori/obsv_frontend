'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, AlertTriangle, Clock } from 'lucide-react';
import { SensorIoT } from 'types/pmac';

interface IoTStatusProps {
  sensores: SensorIoT[];
  alertas: SensorIoT[];
}

export function IoTStatus({ sensores, alertas }: IoTStatusProps) {
  const activeCount = sensores.length;
  const alertCount = alertas.length;

  // Find the most recent communication time
  const lastCommunication = sensores.reduce<string | null>((latest, sensor) => {
    if (!latest) return sensor.ultima_leitura;
    return sensor.ultima_leitura > latest ? sensor.ultima_leitura : latest;
  }, null);

  const formattedTime = lastCommunication
    ? new Date(lastCommunication).toLocaleString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Sem dados';

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-base'>
          <Wifi className='h-4 w-4' />
          Estado da Rede IoT
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Summary stats */}
        <div className='grid grid-cols-3 gap-4'>
          <div className='text-center'>
            <p className='text-2xl font-black text-primary'>{activeCount}</p>
            <p className='text-[10px] font-bold uppercase tracking-tight text-muted-foreground'>
              Sensores Ativos
            </p>
          </div>
          <div className='text-center'>
            <p className='text-2xl font-black text-red-500'>{alertCount}</p>
            <p className='text-[10px] font-bold uppercase tracking-tight text-muted-foreground'>
              Em Alerta
            </p>
          </div>
          <div className='text-center'>
            <Clock className='mx-auto h-5 w-5 text-muted-foreground' />
            <p className='mt-1 text-[10px] font-bold text-muted-foreground'>
              {formattedTime}
            </p>
          </div>
        </div>

        {/* Alert log */}
        {alertas.length > 0 && (
          <div className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-tight text-muted-foreground'>
              Registo de Alertas
            </p>
            <div className='max-h-48 space-y-2 overflow-y-auto'>
              {alertas.map((sensor) => (
                <div
                  key={sensor.id}
                  className='flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 dark:border-red-800 dark:bg-red-950'
                >
                  <AlertTriangle className='h-3.5 w-3.5 shrink-0 text-red-500' />
                  <div className='flex-1 min-w-0'>
                    <p className='truncate text-xs font-semibold text-red-800 dark:text-red-200'>
                      {sensor.tipo_sensor} - {sensor.municipio_nome}
                    </p>
                    <p className='text-[10px] text-red-600 dark:text-red-300'>
                      Valor: {sensor.ultimo_valor} | Limiar: {sensor.limiar_alerta}
                    </p>
                  </div>
                  <Badge
                    variant='secondary'
                    className='shrink-0 bg-red-100 text-[10px] text-red-800 dark:bg-red-900 dark:text-red-200'
                  >
                    {new Date(sensor.ultima_leitura).toLocaleTimeString('pt-PT', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {alertas.length === 0 && (
          <p className='text-center text-sm text-muted-foreground py-4'>
            Todos os sensores dentro dos limiares normais.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
