'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, FileEdit } from 'lucide-react';
import { Indicador } from 'types/pmac';
import { ReportModal } from './report-modal';

interface IndicadorRowProps {
  indicador: Indicador;
}

function getScenario(indicador: Indicador): 'A' | 'B' | 'C' {
  if (indicador.meta_alvo == null) return 'C';
  if (indicador.tipo_meta === 'Marcos') return 'B';
  return 'A';
}

const SCENARIO_LABELS: Record<string, { label: string; className: string }> = {
  A: {
    label: 'Contador',
    className:
      'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  B: {
    label: 'Marcos',
    className:
      'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
  },
  C: {
    label: 'Meta a Definir',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  },
};

export function IndicadorRow({ indicador }: IndicadorRowProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const scenario = getScenario(indicador);
  const scenarioInfo = SCENARIO_LABELS[scenario];

  const progress =
    indicador.meta_alvo != null && indicador.meta_alvo > 0
      ? Math.min(
          100,
          Math.round(
            ((indicador.valor_acumulado ?? 0) / indicador.meta_alvo) * 100
          )
        )
      : null;

  return (
    <>
      <div className='flex flex-col gap-2 rounded-lg border bg-background p-4 sm:flex-row sm:items-center sm:gap-4'>
        {/* Info section */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='font-medium text-sm'>{indicador.nome}</span>
            <Badge variant='secondary' className={scenarioInfo.className}>
              {scenarioInfo.label}
            </Badge>
            {indicador.unidade && (
              <span className='text-xs text-muted-foreground'>
                ({indicador.unidade})
              </span>
            )}
          </div>

          {/* Progress bar for scenarios A/B */}
          {progress != null && (
            <div className='mt-2 flex items-center gap-3'>
              <Progress value={progress} className='h-2 flex-1' />
              <span className='text-xs font-semibold tabular-nums w-12 text-right'>
                {progress}%
              </span>
              <span className='text-xs text-muted-foreground'>
                {indicador.valor_acumulado?.toLocaleString('pt-PT') ?? 0}
                {' / '}
                {indicador.meta_alvo!.toLocaleString('pt-PT')}
              </span>
            </div>
          )}

          {/* Scenario C warning */}
          {scenario === 'C' && (
            <div className='mt-2 flex items-center gap-2 text-amber-600 dark:text-amber-400'>
              <AlertTriangle className='h-3.5 w-3.5' />
              <span className='text-xs font-medium'>
                Meta a Definir — requer proposta de meta alvo
              </span>
            </div>
          )}

          {indicador.ultimo_registo && (
            <p className='text-[10px] text-muted-foreground mt-1'>
              Último registo:{' '}
              {new Date(indicador.ultimo_registo).toLocaleDateString('pt-PT')}
            </p>
          )}
        </div>

        {/* Action button */}
        <Button
          variant='outline'
          size='sm'
          className='shrink-0'
          onClick={() => setModalOpen(true)}
        >
          <FileEdit className='mr-1.5 h-3.5 w-3.5' />
          Atualizar Reporte
        </Button>
      </div>

      <ReportModal
        indicador={indicador}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
