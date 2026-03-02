'use client';

import { cn, parseHardwareTimestamp } from '@/lib/utils';
import type { LeituraT1 } from 'types/pmac';

interface VibrationDisplayProps {
  data: LeituraT1 | null;
}

function AxisBar({ label, value }: { label: string; value: number }) {
  // Clamp to ±2g for display purposes
  const clamped = Math.max(-2, Math.min(2, value));
  const percentage = ((clamped + 2) / 4) * 100; // map [-2,2] → [0,100]
  const isHigh = Math.abs(value) > 1.0;

  return (
    <div className='space-y-1'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-semibold text-muted-foreground'>{label}</span>
        <span
          className={cn(
            'text-xs font-mono tabular-nums',
            isHigh ? 'text-amber-500 font-bold' : 'text-foreground'
          )}
        >
          {value.toFixed(3)} g
        </span>
      </div>
      <div className='relative h-2 rounded-full bg-muted overflow-hidden'>
        {/* Center line */}
        <div className='absolute left-1/2 top-0 h-full w-px bg-border z-10' />
        {/* Value bar from center */}
        <div
          className={cn(
            'absolute top-0 h-full transition-all duration-200',
            isHigh ? 'bg-amber-400' : 'bg-primary'
          )}
          style={{
            left: clamped >= 0 ? '50%' : `${percentage}%`,
            width: `${Math.abs(clamped / 4) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

export function VibrationDisplay({ data }: VibrationDisplayProps) {
  const x = data ? parseFloat(String(data.solo_vibracao_x)) : 0;
  const y = data ? parseFloat(String(data.solo_vibracao_y)) : 0;
  const z = data ? parseFloat(String(data.solo_vibracao_z)) : 0;
  const rain = data ? parseInt(String(data.solo_presenca_chuva), 10) : 0;
  const hasData = data !== null;

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between px-1'>
        <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
          Vibração (por segundo)
        </p>
        <div className='flex items-center gap-1.5'>
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              hasData ? 'bg-green-500 animate-pulse' : 'bg-muted'
            )}
          />
          <span className='text-[10px] text-muted-foreground'>
            {data?.Timestamp
              ? (parseHardwareTimestamp(data.Timestamp) ?? new Date()).toLocaleTimeString('pt-PT', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
              : 'Sem dados'}
          </span>
        </div>
      </div>

      {hasData ? (
        <div className='space-y-2 px-1'>
          <AxisBar label='Eixo X' value={isNaN(x) ? 0 : x} />
          <AxisBar label='Eixo Y' value={isNaN(y) ? 0 : y} />
          <AxisBar label='Eixo Z' value={isNaN(z) ? 0 : z} />

          <div className='flex items-center justify-between rounded-md bg-muted/40 px-3 py-1.5'>
            <span className='text-sm text-muted-foreground'>Presença de Chuva</span>
            <span
              className={cn(
                'text-sm font-semibold',
                rain === 1 ? 'text-blue-500' : 'text-foreground'
              )}
            >
              {rain === 1 ? '🌧 Sim' : 'Não'}
            </span>
          </div>
        </div>
      ) : (
        <p className='px-1 text-sm text-muted-foreground'>
          A aguardar dados de vibração...
        </p>
      )}
    </div>
  );
}
