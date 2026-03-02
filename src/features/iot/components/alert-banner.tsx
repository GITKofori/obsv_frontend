'use client';

import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SSEAlertaEvent } from 'types/pmac';
import { FIELD_META, PARCELA_LABELS } from '../constants';

interface AlertBannerProps {
  alerts: SSEAlertaEvent[];
  onClear: () => void;
}

export function AlertBanner({ alerts, onClear }: AlertBannerProps) {
  if (alerts.length === 0) return null;

  const latest = alerts[0];
  const fieldLabel = FIELD_META[latest.campo]?.label ?? latest.campo;
  const unit = FIELD_META[latest.campo]?.unit ?? '';
  const parcelaLabel = PARCELA_LABELS[latest.parcela] ?? latest.parcela;

  return (
    <div className='rounded-lg bg-red-600 px-4 py-3 text-white shadow-lg'>
      <div className='flex items-start gap-3'>
        <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 animate-pulse' />
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-bold uppercase tracking-wide'>
            {alerts.length === 1
              ? '1 Alerta Ativo'
              : `${alerts.length} Alertas Ativos`}
          </p>
          <p className='mt-0.5 text-xs text-red-100'>
            <span className='font-semibold'>{latest.regra.nome}</span> —{' '}
            {fieldLabel} em {parcelaLabel}: {latest.valor_medido.toFixed(2)}
            {unit && ` ${unit}`} {latest.operador} {latest.valor_threshold}
            {unit && ` ${unit}`}
          </p>
          {alerts.length > 1 && (
            <p className='mt-0.5 text-xs text-red-200'>
              + {alerts.length - 1} alerta{alerts.length > 2 ? 's' : ''}{' '}
              anterior{alerts.length > 2 ? 'es' : ''}
            </p>
          )}
        </div>
        <Button
          size='icon'
          variant='ghost'
          className='h-6 w-6 shrink-0 text-red-200 hover:bg-red-500 hover:text-white'
          onClick={onClear}
        >
          <X className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
