'use client';

import { cn, parseHardwareTimestamp } from '@/lib/utils';
import { FIELD_META } from '../constants';
import type { FieldMeta } from '../constants';

interface MetricValueProps {
  campo: string;
  value: number | string | null | undefined;
}

function MetricValue({ campo, value }: MetricValueProps) {
  const meta: FieldMeta | undefined = FIELD_META[campo];
  const label = meta?.label ?? campo;
  const unit = meta?.unit ?? '';
  const decimals = meta?.decimals ?? 2;

  const numValue = value !== null && value !== undefined ? parseFloat(String(value)) : null;
  const isAlert =
    numValue !== null &&
    ((meta?.alertHigh !== undefined && numValue > meta.alertHigh) ||
      (meta?.alertLow !== undefined && numValue < meta.alertLow));

  const displayValue =
    numValue !== null && !isNaN(numValue)
      ? numValue.toFixed(decimals)
      : '—';

  // Special case for presença de chuva (binary)
  const isBinary = campo === 'solo_presenca_chuva';
  const binaryLabel = isBinary
    ? numValue === 1
      ? 'Sim'
      : numValue === 0
        ? 'Não'
        : '—'
    : null;

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-md px-3 py-1.5 text-sm',
        isAlert
          ? 'bg-red-50 dark:bg-red-950/30'
          : 'hover:bg-muted/40'
      )}
    >
      <span className='text-muted-foreground truncate mr-2'>{label}</span>
      <span
        className={cn(
          'font-semibold tabular-nums shrink-0',
          isAlert ? 'text-red-600 dark:text-red-400' : 'text-foreground'
        )}
      >
        {isBinary ? binaryLabel : `${displayValue}${unit ? ` ${unit}` : ''}`}
        {isAlert && (
          <span className='ml-1 text-xs text-red-500'>⚠</span>
        )}
      </span>
    </div>
  );
}

interface MetricGroupProps {
  title: string;
  fields: string[];
  data: Record<string, number | string> | null;
  timestamp?: string | null;
}

export function MetricGroup({ title, fields, data, timestamp }: MetricGroupProps) {
  return (
    <div className='space-y-1'>
      <div className='flex items-center justify-between px-1 mb-1'>
        <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
          {title}
        </p>
        {timestamp && (
          <p className='text-[10px] text-muted-foreground'>
            {(parseHardwareTimestamp(timestamp) ?? new Date()).toLocaleTimeString('pt-PT', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
      {fields.map((campo) => (
        <MetricValue
          key={campo}
          campo={campo}
          value={data ? (data as Record<string, unknown>)[campo] as number | string | null : null}
        />
      ))}
    </div>
  );
}
