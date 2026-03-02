'use client';

import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

interface IoTStatusProps {
  mqttConnected: boolean;
  sseConnected: boolean;
  activeAlertsCount?: number;
}

export function IoTStatus({
  mqttConnected,
  sseConnected,
  activeAlertsCount = 0,
}: IoTStatusProps) {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Badge
        variant={sseConnected ? 'default' : 'secondary'}
        className='flex items-center gap-1.5'
      >
        {sseConnected ? (
          <Wifi className='h-3 w-3' />
        ) : (
          <WifiOff className='h-3 w-3' />
        )}
        Stream {sseConnected ? 'Ativo' : 'Desligado'}
      </Badge>

      <Badge
        variant={mqttConnected ? 'default' : 'destructive'}
        className='flex items-center gap-1.5'
      >
        <span
          className={`h-2 w-2 rounded-full ${
            mqttConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          }`}
        />
        MQTT {mqttConnected ? 'Ligado' : 'Desligado'}
      </Badge>

      {activeAlertsCount > 0 && (
        <Badge variant='destructive' className='flex items-center gap-1.5'>
          <span className='h-2 w-2 rounded-full bg-red-200 animate-pulse' />
          {activeAlertsCount} alerta{activeAlertsCount !== 1 ? 's' : ''} ativo
          {activeAlertsCount !== 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
}
