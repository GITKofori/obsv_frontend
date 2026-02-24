'use client';

import { AlertTriangle } from 'lucide-react';
import { SensorIoT } from 'types/pmac';

interface AlertBannerProps {
  alertas: SensorIoT[];
}

export function AlertBanner({ alertas }: AlertBannerProps) {
  if (alertas.length === 0) return null;

  return (
    <div className='animate-pulse rounded-lg bg-red-600 px-4 py-3 text-white shadow-lg'>
      <div className='flex items-center gap-3'>
        <AlertTriangle className='h-6 w-6 shrink-0' />
        <div className='flex-1'>
          <p className='text-sm font-bold uppercase tracking-wide'>
            {alertas.length === 1
              ? '1 Alerta Critico Ativo'
              : `${alertas.length} Alertas Criticos Ativos`}
          </p>
          <div className='mt-1 space-y-1'>
            {alertas.map((sensor) => (
              <p key={sensor.id} className='text-xs text-red-100'>
                <span className='font-semibold'>{sensor.id}</span> -{' '}
                {sensor.tipo_sensor}: {sensor.ultimo_valor}{' '}
                <span className='text-red-200'>
                  (limiar: {sensor.limiar_alerta})
                </span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
